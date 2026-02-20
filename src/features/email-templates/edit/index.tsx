import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useConfig } from "@providers/config-provider";
import { useLayout } from "@providers/layout-provider";
import { useCoreModuleNavigation, useNotificationsService, useSaveShortcut } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { useRequestContext } from "@providers/request-provider";
import {
  EmailTemplateDetailsDto,
  EmailTemplateEditRequest,
  EmailTemplateConvertFormatRequest,
  EmailTemplateGenerationRequest,
  HttpResponse,
  ProblemDetails,
} from "@lib/network/swagger-client";
import { FormikHelpers, useFormik } from "formik";
import { EmailTemplateEditValidationScheme } from "./validation";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ModuleWrapper } from "@components/module-wrapper";
import { emailTemplateFormBreadcrumbLinks } from "../constants";
import { EmailTemplateEditContainer } from "./index.styled";
import {
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton,
  Collapse,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Backdrop,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import useLocalStorage from "use-local-storage";
import { EmailTemplateEditProps } from "./types";
import { LanguageSelect } from "@components/language-select";
import { EmailGroupAutocomplete } from "@components/email-group-autocomplete";
import { execSubmitWithToast } from "utils/formik-helper";
import { CoreModule } from "@lib/router";
import {
  Save,
  XCircle,
  X,
  Trash2,
  Copy,
  Languages,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
} from "lucide-react";
import { GrapesEmailEditor } from "@components/grapes-email-editor";
import { HtmlVisualEditor } from "@components/html-visual-editor";
import { TemplatePreview, detectFormat, normalizePlaceholders } from "@components/mjml-preview";
import MonacoEditor, { DiffEditor as MonacoDiffEditor } from "@monaco-editor/react";
import { TranslateDialog, TranslationType } from "@components/translate-dialog";
import { AIEditDialog } from "@components/ai-edit-dialog";
import { UnifiedAIProgress } from "@components/unified-ai-progress";
import { AIEmailDraftDialog } from "@components/ai-email-draft-dialog";
import ContentLanguageSwitcher, { LanguageHighlights } from "@components/content-language-switcher";
import { EmailTemplateChangeLog } from "./email-template-change-log";

/**
 * Wrapper around MonacoDiffEditor that prevents the
 * "TextModel got disposed before DiffEditorWidget model got reset" error.
 *
 * Root cause: @monaco-editor/react disposes text models BEFORE the
 * diff editor widget. We pass keepCurrentOriginalModel / keepCurrentModifiedModel
 * so the library skips model disposal, and monkey-patch editor.dispose()
 * to detach + dispose models in the correct order.
 */
const SafeDiffEditor = ({
  onModifiedChange,
  ...props
}: React.ComponentProps<typeof MonacoDiffEditor> & {
  onModifiedChange?: (value: string) => void;
}) => {
  const handleMount = useCallback<
    NonNullable<React.ComponentProps<typeof MonacoDiffEditor>["onMount"]>
  >(
    (editor, monaco) => {
      const origDispose = editor.dispose.bind(editor);
      editor.dispose = () => {
        try {
          const model = editor.getModel();
          // Detach models from widget first
          editor.setModel({
            original: null as never,
            modified: null as never,
          });
          // Now safe to dispose the detached models
          model?.original?.dispose();
          model?.modified?.dispose();
        } catch {
          // best-effort
        }
        origDispose();
      };

      if (onModifiedChange) {
        const modifiedEditor = editor.getModifiedEditor();
        modifiedEditor.onDidChangeModelContent(() => {
          onModifiedChange(modifiedEditor.getValue());
        });
      }
      props.onMount?.(editor, monaco);
    },
    [onModifiedChange]
  );

  return (
    <MonacoDiffEditor
      {...props}
      keepCurrentOriginalModel
      keepCurrentModifiedModel
      onMount={handleMount}
    />
  );
};

const METADATA_COLLAPSED_KEY = "emailTemplate-metadata-collapsed";

export const EmailTemplateEdit = ({ readonly }: EmailTemplateEditProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { config } = useConfig();
  const { setFullWidth } = useLayout();
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const { client } = useRequestContext();
  const handleNavigation = useCoreModuleNavigation();
  const {
    id,
    sourceId: routeSourceId,
    targetLanguage: routeTargetLanguage,
    type: routeType,
  } = useParams();

  const hasAIAssistance = config?.capabilities?.includes("AIAssistance") || false;
  const hasMultipleLanguages = (config?.languages?.length || 0) > 1;

  // Full-width layout
  useEffect(() => {
    setFullWidth(true);
    return () => setFullWidth(false);
  }, [setFullWidth]);

  // Determine modes
  const isAIDraftRoute = location.pathname.includes("/ai-draft");
  const isTranslationMode = !!routeTargetLanguage;
  const isDuplicateMode = !!routeSourceId && !id && !isTranslationMode;
  const isCreateMode = !id && !isDuplicateMode && !isAIDraftRoute && !isTranslationMode;

  // UI state
  const [activeTab, setActiveTab] = useState<"editor" | "settings" | "changelog">("editor");
  const [editorMode, setEditorMode] = useState<"visual" | "source" | "preview" | "diff">("visual");
  const originalBodyRef = useRef<string>("");
  const monacoEditorRef = useRef<
    Parameters<NonNullable<React.ComponentProps<typeof MonacoEditor>["onMount"]>>[0] | null
  >(null);
  const [metadataCollapsed, setMetadataCollapsed] = useLocalStorage(METADATA_COLLAPSED_KEY, false);
  const [localMetaCollapsed, setLocalMetaCollapsed] = useState(false);
  const isCollapsed = isCreateMode ? localMetaCollapsed : metadataCollapsed;
  const setIsCollapsed = (v: boolean) => {
    if (isCreateMode) setLocalMetaCollapsed(v);
    else setMetadataCollapsed(v);
  };

  // Dialog state
  const [translateDialogOpen, setTranslateDialogOpen] = useState(false);
  const [aiEditDialogOpen, setAiEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [aiProgressOpen, setAiProgressOpen] = useState(false);
  const [aiProgressType, setAiProgressType] = useState<"content" | "translation" | "edit">("edit");
  const [aiProgressProps, setAiProgressProps] = useState<Record<string, unknown>>({});
  const [aiOperationComplete, setAiOperationComplete] = useState(false);

  // Translations state
  const [preloadedTranslations, setPreloadedTranslations] = useState<
    EmailTemplateDetailsDto[] | undefined
  >();

  // Track email group display name for collapsed badge
  const [emailGroupDisplayName, setEmailGroupDisplayName] = useState<string>("");

  const [wasModified, setWasModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveModeRef = useRef<"stay" | "close">("close");

  // Template format: Html or Mjml
  const [selectedFormat, setSelectedFormat] = useState<"Html" | "Mjml">("Html");
  const [isConverting, setIsConverting] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [aiDraftDialogOpen, setAiDraftDialogOpen] = useState(false);
  const [aiDraftError, setAiDraftError] = useState<string | null>(null);
  const [aiDraftLoading, setAiDraftLoading] = useState(false);

  // Form
  const submitFunc = async (
    values: EmailTemplateDetailsDto,
    helpers: FormikHelpers<EmailTemplateDetailsDto>
  ) => {
    setIsSaving(true);
    try {
      let response: HttpResponse<EmailTemplateDetailsDto, void | ProblemDetails>;
      if (id === undefined) {
        response = await client.api.emailTemplatesCreate(values);
      } else {
        response = await client.api.emailTemplatesPartialUpdate(Number(id), values);
      }
      setWasModified(false);
      helpers.setValues(response.data);
      helpers.setSubmitting(false);
      if (saveModeRef.current === "close") {
        handleNavigation(CoreModule.emailTemplates);
      }
      saveModeRef.current = "close";
    } finally {
      setIsSaving(false);
    }
  };

  const submit = async (
    values: EmailTemplateDetailsDto,
    helpers: FormikHelpers<EmailTemplateDetailsDto>
  ) => {
    execSubmitWithToast<EmailTemplateDetailsDto>(
      values,
      helpers,
      submitFunc,
      notificationsService,
      showErrorModal,
      "email template"
    );
  };

  const formik = useFormik<EmailTemplateDetailsDto>({
    validationSchema: toFormikValidationSchema(EmailTemplateEditValidationScheme),
    initialValues: {
      name: "",
      fromEmail: "",
      fromName: "",
      subject: "",
      language: "",
      bodyTemplate: "",
      emailGroupId: 0,
    } as EmailTemplateDetailsDto,
    onSubmit: submit,
    validateOnChange: false,
  });

  const handleSaveStay = () => {
    saveModeRef.current = "stay";
    formik.submitForm();
  };
  const handleSaveAndClose = () => {
    saveModeRef.current = "close";
    formik.submitForm();
  };

  useSaveShortcut(handleSaveStay, !readonly && !formik.isSubmitting);

  // Detect template format (Html vs Mjml) from content or API field
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiFormat = (formik.values as any).format as string | undefined;
  const templateFormat = useMemo(
    () => detectFormat(formik.values.bodyTemplate || "", apiFormat),
    [formik.values.bodyTemplate, apiFormat]
  );

  // Set default language for new templates
  useEffect(() => {
    if (isCreateMode && config?.defaultLanguage && !formik.values.language) {
      formik.setFieldValue("language", config.defaultLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateMode, config?.defaultLanguage]);

  const valueUpdate = (event: React.SyntheticEvent<Element, Event>) => {
    setWasModified(true);
    formik.handleChange(event);
  };

  const autoCompleteValueUpdate = <T,>(field: string, value: T): void => {
    setWasModified(true);
    formik.setFieldValue(field, value);
  };

  // Load existing template
  useEffect(() => {
    if (!id || isDuplicateMode || isTranslationMode) return;
    const load = async () => {
      try {
        const resp = await client.api.emailTemplatesDetail(Number(id));
        const rawBody = resp.data.bodyTemplate || "";
        const normalizedBody = normalizePlaceholders(rawBody);
        if (normalizedBody !== rawBody) {
          resp.data.bodyTemplate = normalizedBody;
        }
        await formik.setValues(resp.data);
        originalBodyRef.current = rawBody;
        const body = normalizedBody;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiFmt = (resp.data as any).format;
        setSelectedFormat(detectFormat(body, apiFmt));
        if (resp.data.emailGroup?.name) {
          setEmailGroupDisplayName(resp.data.emailGroup.name);
        }
        // Load translations
        try {
          const tr = await client.api.emailTemplatesTranslationsList(Number(id));
          setPreloadedTranslations(tr.data);
        } catch {
          setPreloadedTranslations(undefined);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, id, isDuplicateMode, isTranslationMode]);

  // Duplicate mode
  useEffect(() => {
    if (!routeSourceId || !isDuplicateMode) return;
    const load = async () => {
      try {
        const resp = await client.api.emailTemplatesDetail(Number(routeSourceId));
        const data = { ...resp.data };
        delete (data as Record<string, unknown>).id;
        data.name = `${data.name} (Copy)`;
        data.translationKey = null;
        data.bodyTemplate = normalizePlaceholders(data.bodyTemplate || "");
        await formik.setValues(data);
        const body = data.bodyTemplate;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiFmt = (resp.data as any).format;
        setSelectedFormat(detectFormat(body, apiFmt));
        if (resp.data.emailGroup?.name) {
          setEmailGroupDisplayName(resp.data.emailGroup.name);
        }
        setWasModified(true);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeSourceId, isDuplicateMode]);

  // Handle translation routes
  useEffect(() => {
    if (!routeSourceId || !routeTargetLanguage) return;
    if (id) return;

    const translationType = routeType as TranslationType | undefined;

    // If type is missing, open translate dialog for user to choose
    if (!translationType) {
      setTranslateDialogOpen(true);
      return;
    }

    const handleTranslationRoute = async () => {
      if (translationType === "AITranslation") {
        setAiProgressType("translation");
        setAiOperationComplete(false);
        setAiProgressProps({ targetLanguage: routeTargetLanguage });
        setAiProgressOpen(true);
        try {
          const resp = await client.api.emailTemplatesAiTranslationDraftDetail(
            Number(routeSourceId),
            routeTargetLanguage,
            {
              emailGroupId: formik.values.emailGroupId,
            }
          );
          setAiOperationComplete(true);
          const body = normalizePlaceholders(resp.data.bodyTemplate || "");
          resp.data.bodyTemplate = body;
          delete (resp.data as unknown as Record<string, unknown>).id;
          await formik.setValues(resp.data);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const apiFmt = (resp.data as any).format;
          setSelectedFormat(detectFormat(body, apiFmt));
          setWasModified(true);
          if (resp.data.emailGroup?.name) {
            setEmailGroupDisplayName(resp.data.emailGroup.name);
          }
          setTimeout(() => {
            setAiProgressOpen(false);
            setAiOperationComplete(false);
          }, 500);
        } catch {
          setAiProgressOpen(false);
          notificationsService.error("AI translation failed");
        }
      } else {
        try {
          const transformer = translationType === "KeepOriginal" ? "KeepOriginal" : "EmptyCopy";
          const resp = await client.api.emailTemplatesTranslationDraftDetail(
            Number(routeSourceId),
            routeTargetLanguage,
            { transformer }
          );
          const body = normalizePlaceholders(resp.data.bodyTemplate || "");
          resp.data.bodyTemplate = body;
          delete (resp.data as unknown as Record<string, unknown>).id;
          await formik.setValues(resp.data);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const apiFmt = (resp.data as any).format;
          setSelectedFormat(detectFormat(body, apiFmt));
          setWasModified(true);
          if (resp.data.emailGroup?.name) {
            setEmailGroupDisplayName(resp.data.emailGroup.name);
          }
        } catch {
          notificationsService.error("Translation failed");
        }
      }
    };
    handleTranslationRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeSourceId, routeTargetLanguage, routeType, id]);

  // Handlers
  const handleDelete = async () => {
    if (!id) return;
    try {
      await client.api.emailTemplatesDelete(Number(id));
      notificationsService.success("Email template deleted successfully");
      handleNavigation(CoreModule.emailTemplates);
    } catch {
      notificationsService.error("Failed to delete email template");
    }
  };

  const handleDuplicate = () => {
    if (!id) return;
    navigate(`/email-templates/${id}/duplicate`);
  };

  const handleTranslateConfirm = async (
    targetLanguage: string,
    translationType: TranslationType
  ) => {
    if (!id && !routeSourceId) return;
    setTranslateDialogOpen(false);
    const sourceId = id || routeSourceId;
    navigate(`/email-templates/${sourceId}/translate/${targetLanguage}/${translationType}`);
  };

  const handleAIEdit = async (
    prompt: string,
    _wordCount?: number | null,
    _characterCount?: number | null,
    _tokenEstimation?: unknown,
    _requiredMediaPaths?: string[],
    templateVariables?: Record<string, string>
  ) => {
    setAiEditDialogOpen(false);
    setAiProgressType("edit");
    setAiOperationComplete(false);
    setAiProgressProps({
      contentTitle: formik.values.name || "Untitled",
    });
    setAiProgressOpen(true);

    try {
      const request: EmailTemplateEditRequest = {
        name: formik.values.name,
        subject: formik.values.subject,
        bodyTemplate: formik.values.bodyTemplate,
        fromEmail: formik.values.fromEmail,
        fromName: formik.values.fromName,
        language: formik.values.language,
        emailGroupId: formik.values.emailGroupId,
        prompt,
        referenceEmailTemplateId: id ? Number(id) : undefined,
        templateVariables: templateVariables ?? undefined,
      };
      const resp = await client.api.emailTemplatesAiEditCreate(request);
      setAiOperationComplete(true);
      await formik.setValues(resp.data);
      setWasModified(true);
      setTimeout(() => {
        setAiProgressOpen(false);
        setAiOperationComplete(false);
      }, 500);
    } catch {
      setAiProgressOpen(false);
      notificationsService.error("AI edit failed");
      setAiEditDialogOpen(true);
    }
  };

  const handleLanguageChange = (language: string, translationId?: number) => {
    if (translationId) {
      navigate(`/email-templates/${translationId}/edit`);
    } else {
      formik.setFieldValue("language", language);
      setWasModified(true);
    }
  };

  const handleCreateTranslation = (targetLanguage: string) => {
    if (!id) {
      formik.setFieldValue("language", targetLanguage);
      setWasModified(true);
      return;
    }
    navigate(`/email-templates/${id}/translate/${targetLanguage}`);
  };

  const convertTargetFormat: "Html" | "Mjml" = selectedFormat === "Html" ? "Mjml" : "Html";

  /** Convert format for saved records via API */
  const handleConvertFormat = async () => {
    setConvertDialogOpen(false);
    const body = formik.values.bodyTemplate || "";
    if (!body.trim()) {
      notificationsService.error("No body content to convert");
      return;
    }
    setIsConverting(true);
    setAiProgressType("edit");
    setAiOperationComplete(false);
    setAiProgressProps({ contentTitle: "Format Conversion" });
    setAiProgressOpen(true);
    try {
      const req: EmailTemplateConvertFormatRequest = {
        bodyTemplate: body,
        currentFormat: selectedFormat,
        targetFormat: convertTargetFormat,
      };
      const resp = await client.api.emailTemplatesConvertFormatCreate(req);
      setAiOperationComplete(true);
      if (resp.data.bodyTemplate) {
        formik.setFieldValue("bodyTemplate", resp.data.bodyTemplate);
      }
      const fmt = resp.data.format || convertTargetFormat;
      setSelectedFormat(fmt);
      formik.setFieldValue("format", fmt);
      setWasModified(true);
      setTimeout(() => {
        setAiProgressOpen(false);
        setAiOperationComplete(false);
        notificationsService.success(`Converted to ${fmt} successfully`);
      }, 500);
    } catch {
      setAiProgressOpen(false);
      notificationsService.error("Format conversion failed");
    } finally {
      setIsConverting(false);
    }
  };

  /** Create with AI handler */
  const handleAIDraftCreate = async (
    language: string,
    emailGroupId: number,
    prompt: string,
    format: "Html" | "Mjml",
    referenceTemplateId?: number | null,
    templateVariables?: Record<string, string>,
    wordCount?: number | null,
    characterCount?: number | null
  ) => {
    setAiDraftError(null);
    setAiDraftLoading(true);
    setAiDraftDialogOpen(false);
    setAiProgressType("content");
    setAiOperationComplete(false);
    setAiProgressProps({});
    setAiProgressOpen(true);
    try {
      let enrichedPrompt = prompt;
      if (wordCount) {
        enrichedPrompt += `\nOutput length limit: approximately ${wordCount} words.`;
      } else if (characterCount) {
        enrichedPrompt += `\nOutput length limit: approximately ${characterCount} characters.`;
      }
      const req: EmailTemplateGenerationRequest = {
        language,
        emailGroupId,
        prompt: enrichedPrompt,
        format,
        referenceEmailTemplateId: referenceTemplateId ?? undefined,
        templateVariables: templateVariables ?? undefined,
      };
      const resp = await client.api.emailTemplatesAiDraftCreate(req);
      setAiOperationComplete(true);
      const body = normalizePlaceholders(resp.data.bodyTemplate || "");
      resp.data.bodyTemplate = body;
      await formik.setValues(resp.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiFmt = (resp.data as any).format as string | undefined;
      setSelectedFormat(detectFormat(body, apiFmt));
      setWasModified(true);
      setTimeout(() => {
        setAiProgressOpen(false);
        setAiOperationComplete(false);
        navigate("/email-templates/new", { replace: true });
      }, 500);
    } catch {
      setAiProgressOpen(false);
      setAiDraftError("AI draft generation failed. Please try again.");
      setAiDraftDialogOpen(true);
    } finally {
      setAiDraftLoading(false);
    }
  };

  // Auto-open AI draft dialog when on /ai-draft route
  useEffect(() => {
    if (isAIDraftRoute) {
      setAiDraftDialogOpen(true);
    }
  }, [isAIDraftRoute]);

  const editorHeight = isCollapsed ? "calc(100vh - 302px)" : "calc(100vh - 317px)";

  return (
    <form onSubmit={formik.handleSubmit}>
      <ModuleWrapper
        breadcrumbs={emailTemplateFormBreadcrumbLinks}
        currentBreadcrumb={formik.values.name}
        isForm={true}
        actionButtons={
          <Box
            sx={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {/* Left: Delete, Duplicate, Translate, AI */}
            <Box sx={{ pl: { sm: 4 } }}>
              {!isCreateMode && !isDuplicateMode && !readonly && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Trash2 />}
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={formik.isSubmitting}
                  size="medium"
                  sx={{ mr: 2 }}
                >
                  Delete
                </Button>
              )}
              {!isCreateMode && !isDuplicateMode && !readonly && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Copy />}
                  onClick={handleDuplicate}
                  disabled={formik.isSubmitting}
                  size="medium"
                  sx={{ mr: 2 }}
                >
                  Duplicate
                </Button>
              )}
              {hasMultipleLanguages && !isCreateMode && !isDuplicateMode && !readonly && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Languages />}
                  onClick={() => setTranslateDialogOpen(true)}
                  disabled={formik.isSubmitting}
                  size="medium"
                  sx={{ mr: 2 }}
                >
                  Translate
                </Button>
              )}
              {hasAIAssistance && !readonly && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Sparkles />}
                  onClick={() => setAiEditDialogOpen(true)}
                  disabled={formik.isSubmitting}
                  size="medium"
                  sx={{ mr: 2 }}
                >
                  Edit with AI
                </Button>
              )}
              {hasAIAssistance && !!id && !readonly && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<ArrowRightLeft size={16} />}
                  onClick={() => setConvertDialogOpen(true)}
                  disabled={isConverting || formik.isSubmitting}
                  size="medium"
                >
                  Convert Format
                </Button>
              )}
            </Box>

            {/* Right: Cancel, Save, Save+Close */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                pr: { sm: 4 },
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleNavigation(CoreModule.emailTemplates)}
                disabled={formik.isSubmitting}
                startIcon={<XCircle />}
                size="medium"
              >
                Cancel
              </Button>
              {!readonly && (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    disabled={!wasModified || formik.isSubmitting}
                    startIcon={isSaving ? <CircularProgress size={16} /> : <Save />}
                    size="medium"
                    onClick={handleSaveStay}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!wasModified || formik.isSubmitting}
                    startIcon={isSaving ? <CircularProgress size={16} /> : <Save />}
                    size="medium"
                    onClick={handleSaveAndClose}
                  >
                    {isSaving ? "Saving..." : "Save and Close"}
                  </Button>
                </>
              )}
            </Box>
          </Box>
        }
      >
        <EmailTemplateEditContainer>
          <Card
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                height: "100%",
              }}
            >
              {/* Collapsible Metadata */}
              <Box sx={{ mb: 2 }}>
                {/* Collapsed Header */}
                {isCollapsed && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "grey.50",
                      cursor: "pointer",
                    }}
                    onClick={() => setIsCollapsed(false)}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      {/* Name, Subject and Group badge */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          minWidth: 0,
                        }}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formik.values.name || "Untitled"}
                            {formik.values.subject && (
                              <Typography
                                component="span"
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  fontWeight: 400,
                                  ml: 1,
                                }}
                              >
                                - {formik.values.subject}
                              </Typography>
                            )}
                          </Typography>
                        </Box>

                        {/* Email Group badge */}
                        {emailGroupDisplayName && (
                          <Box
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              bgcolor: "primary.main",
                              color: "primary.contrastText",
                              borderRadius: 2,
                              fontSize: "0.6875rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              flexShrink: 0,
                            }}
                          >
                            {emailGroupDisplayName}
                          </Box>
                        )}
                      </Box>

                      {/* Language Highlights */}
                      {hasMultipleLanguages && id && !isCreateMode && !isDuplicateMode && (
                        <LanguageHighlights
                          contentId={Number(id)}
                          currentLanguage={formik.values.language || ""}
                          onLanguageChange={handleLanguageChange}
                          onCreateTranslation={handleCreateTranslation}
                          preloadedTranslations={preloadedTranslations as never}
                          contentType="emailTemplate"
                          linkTranslationSearchText={formik.values.name}
                        />
                      )}
                    </Box>
                    <IconButton size="small">
                      <ChevronDown size={20} />
                    </IconButton>
                  </Box>
                )}

                {/* Expanded Header */}
                {!isCollapsed && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    {/* Left: Language Switcher */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {hasMultipleLanguages && id && !isCreateMode && !isDuplicateMode && (
                        <ContentLanguageSwitcher
                          contentId={Number(id)}
                          currentLanguage={formik.values.language || ""}
                          onLanguageChange={handleLanguageChange}
                          onCreateTranslation={handleCreateTranslation}
                          compact={true}
                          preloadedTranslations={preloadedTranslations as never}
                          contentType="emailTemplate"
                          linkTranslationSearchText={formik.values.name}
                        />
                      )}
                    </Box>

                    {/* Right: Collapse button */}
                    <IconButton
                      size="small"
                      onClick={() => setIsCollapsed(true)}
                      sx={{ color: "text.secondary" }}
                    >
                      <ChevronUp size={20} />
                    </IconButton>
                  </Box>
                )}

                {/* Collapsible Content: Subject + Group + Format */}
                <Collapse in={!isCollapsed}>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <TextField
                        disabled={readonly}
                        label="Subject"
                        name="subject"
                        value={formik.values.subject}
                        error={formik.touched.subject && Boolean(formik.errors.subject)}
                        helperText={formik.touched.subject && formik.errors.subject}
                        placeholder="Enter subject"
                        variant="outlined"
                        onChange={valueUpdate}
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <EmailGroupAutocomplete
                        disabled={readonly}
                        label="Email Group"
                        value={formik.values.emailGroupId}
                        error={formik.touched.emailGroupId && Boolean(formik.errors.emailGroupId)}
                        helperText={formik.touched.emailGroupId && formik.errors.emailGroupId}
                        placeholder="Select group"
                        onChange={(value) => {
                          setWasModified(true);
                          formik.setFieldValue("emailGroupId", value);
                        }}
                        onChangeWithLabel={(_, label) => {
                          setEmailGroupDisplayName(label);
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <FormControl fullWidth>
                        <InputLabel>Format</InputLabel>
                        <Select
                          value={selectedFormat}
                          label="Format"
                          disabled={readonly || !!id}
                          onChange={(e: SelectChangeEvent) => {
                            type Fmt = "Html" | "Mjml";
                            const fmt = e.target.value as Fmt;
                            setSelectedFormat(fmt);
                            formik.setFieldValue("format", fmt);
                            formik.setFieldValue("bodyTemplate", "");
                            setWasModified(true);
                          }}
                        >
                          <MenuItem value="Html">HTML</MenuItem>
                          <MenuItem value="Mjml">MJML</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Collapse>
              </Box>

              {/* Tabs + Visual/Source toggle */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1,
                  ...(isCollapsed && {
                    bgcolor: "grey.50",
                    borderRadius: 1,
                    p: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }),
                }}
              >
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ minHeight: 36 }}>
                  <Tab label="Editor" value="editor" />
                  <Tab label="Settings" value="settings" />
                  {!isCreateMode && id && <Tab label="Change Log" value="changelog" />}
                </Tabs>
                <Box sx={{ flex: 1 }} />
                {activeTab === "editor" && (
                  <Tabs
                    value={editorMode}
                    onChange={(_, v) => setEditorMode(v)}
                    sx={{ minHeight: 36 }}
                  >
                    <Tab label="Visual" value="visual" sx={{ minHeight: 36 }} />
                    <Tab label="Source" value="source" sx={{ minHeight: 36 }} />
                    <Tab label="Preview" value="preview" sx={{ minHeight: 36 }} />
                    <Tab label="Diff" value="diff" sx={{ minHeight: 36 }} />
                  </Tabs>
                )}
              </Box>

              {/* Tab Content */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                }}
              >
                {activeTab === "editor" && (
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      minHeight: 0,
                    }}
                  >
                    {selectedFormat === "Mjml" && (
                      <Box
                        sx={{
                          display: editorMode === "visual" ? "block" : "none",
                        }}
                      >
                        <GrapesEmailEditor
                          value={formik.values.bodyTemplate || ""}
                          onChange={(mjml) => {
                            setWasModified(true);
                            formik.setFieldValue("bodyTemplate", mjml);
                          }}
                          disabled={readonly}
                          height={editorHeight}
                        />
                      </Box>
                    )}
                    {selectedFormat !== "Mjml" && (
                      <Box
                        sx={{
                          display: editorMode === "visual" ? "block" : "none",
                        }}
                      >
                        <HtmlVisualEditor
                          value={formik.values.bodyTemplate || ""}
                          onChange={(html: string) => {
                            setWasModified(true);
                            formik.setFieldValue("bodyTemplate", html);
                          }}
                          disabled={readonly}
                          height={editorHeight}
                        />
                      </Box>
                    )}
                    <Box
                      sx={{
                        display: editorMode === "source" ? "block" : "none",
                      }}
                    >
                      <MonacoEditor
                        height={editorHeight}
                        defaultLanguage={templateFormat === "Mjml" ? "xml" : "html"}
                        value={formik.values.bodyTemplate || ""}
                        onMount={(editor) => {
                          monacoEditorRef.current = editor;
                          setTimeout(() => {
                            editor.getAction("editor.action.formatDocument")?.run();
                          }, 100);
                        }}
                        onChange={(value) => {
                          setWasModified(true);
                          formik.setFieldValue("bodyTemplate", value || "");
                        }}
                        options={{
                          readOnly: !!readonly,
                          minimap: { enabled: false },
                          lineNumbers: "on",
                          scrollBeyondLastLine: false,
                          wordWrap: "on",
                          formatOnPaste: true,
                        }}
                      />
                    </Box>
                    {editorMode === "diff" && (
                      <SafeDiffEditor
                        height={editorHeight}
                        language={templateFormat === "Mjml" ? "xml" : "html"}
                        original={originalBodyRef.current}
                        modified={formik.values.bodyTemplate || ""}
                        onModifiedChange={(val) => {
                          setWasModified(true);
                          formik.setFieldValue("bodyTemplate", val);
                        }}
                        options={{
                          readOnly: !!readonly,
                          renderSideBySide: true,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          wordWrap: "on",
                          originalEditable: false,
                        }}
                      />
                    )}
                    {editorMode === "preview" && (
                      <TemplatePreview
                        source={formik.values.bodyTemplate || ""}
                        format={templateFormat}
                        height={editorHeight}
                      />
                    )}
                  </Box>
                )}

                {activeTab === "changelog" && !isCreateMode && id && (
                  <EmailTemplateChangeLog templateId={id} />
                )}

                {activeTab === "settings" && (
                  <Grid container spacing={6} sx={{ mt: 2 }}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        disabled={readonly}
                        label="Name"
                        name="name"
                        value={formik.values.name}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                        placeholder="Enter name"
                        variant="outlined"
                        onChange={valueUpdate}
                        fullWidth
                      />
                    </Grid>
                    {hasMultipleLanguages && (
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <LanguageSelect
                          value={formik.values.language}
                          onChange={(val) => autoCompleteValueUpdate("language", val)}
                          label="Language"
                          error={formik.touched.language && Boolean(formik.errors.language)}
                          helperText={formik.touched.language && formik.errors.language}
                          name="language"
                          disabled={readonly}
                        />
                      </Grid>
                    )}
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        disabled={readonly}
                        label="Sender Email"
                        name="fromEmail"
                        value={formik.values.fromEmail}
                        error={formik.touched.fromEmail && Boolean(formik.errors.fromEmail)}
                        helperText={formik.touched.fromEmail && formik.errors.fromEmail}
                        placeholder="Enter sender email"
                        variant="outlined"
                        onChange={valueUpdate}
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        disabled={readonly}
                        label="Sender Name"
                        name="fromName"
                        value={formik.values.fromName}
                        error={formik.touched.fromName && Boolean(formik.errors.fromName)}
                        helperText={formik.touched.fromName && formik.errors.fromName}
                        placeholder="Enter sender name"
                        variant="outlined"
                        onChange={valueUpdate}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                )}
              </Box>
            </CardContent>
          </Card>
        </EmailTemplateEditContainer>
      </ModuleWrapper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Email Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this email template? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setDeleteDialogOpen(false);
              await handleDelete();
            }}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Translate Dialog */}
      {hasMultipleLanguages && (
        <TranslateDialog
          open={translateDialogOpen}
          onClose={() => setTranslateDialogOpen(false)}
          onTranslate={handleTranslateConfirm}
          originalLanguage={formik.values.language}
          originalTitle={formik.values.name}
          preselectedLanguage={routeTargetLanguage}
        />
      )}

      {/* AI Edit Dialog */}
      {hasAIAssistance && (
        <AIEditDialog
          open={aiEditDialogOpen}
          onClose={() => setAiEditDialogOpen(false)}
          onEdit={handleAIEdit}
          contentTitle={formik.values.name || "Untitled"}
          currentContent={formik.values}
          variant="email-template"
        />
      )}

      {/* AI Progress */}
      <UnifiedAIProgress
        open={aiProgressOpen}
        type={aiProgressType}
        isComplete={aiOperationComplete}
        contentTitle={(aiProgressProps.contentTitle as string) || undefined}
        targetLanguage={(aiProgressProps.targetLanguage as string) || undefined}
      />

      {/* Convert Format Confirmation Dialog */}
      <Dialog
        open={convertDialogOpen}
        onClose={() => setConvertDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            overflow: "visible",
          },
        }}
      >
        <Backdrop
          open={convertDialogOpen}
          sx={{
            zIndex: -1,
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
        />
        <DialogTitle
          sx={{
            pb: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <ArrowRightLeft size={20} />
            </Box>
            <Box>
              <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                Convert to {convertTargetFormat === "Mjml" ? "MJML" : "HTML"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.875rem" }}>
                AI-powered format conversion
              </Typography>
            </Box>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setConvertDialogOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
              bgcolor: "rgba(255, 255, 255, 0.1)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
            }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 3, mb: 2, lineHeight: 1.6, mx: 2 }}
          >
            {selectedFormat === "Html" ? (
              <>
                Converting from <strong>HTML</strong> to <strong>MJML</strong> will use AI to
                rebuild the layout using MJML components that best match your current design.
                Complex CSS or custom HTML structures may be simplified to fit MJML&apos;s component
                model.
              </>
            ) : (
              <>
                Converting from <strong>MJML</strong> to <strong>HTML</strong> will render the MJML
                into its final HTML output. The result is static HTML that can no longer be edited
                with the MJML visual editor.
              </>
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6, mx: 2 }}>
            All template tokens (e.g. {"{{ variable }}"}) will be preserved.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, pt: 2, gap: 2 }}>
          <Button
            onClick={() => setConvertDialogOpen(false)}
            color="inherit"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConvertFormat}
            variant="contained"
            startIcon={<ArrowRightLeft size={16} />}
            sx={{
              minWidth: 160,
              fontWeight: 600,
              px: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #694d90 100%)",
              },
            }}
          >
            Convert
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Draft Dialog */}
      <AIEmailDraftDialog
        open={aiDraftDialogOpen}
        onClose={() => {
          setAiDraftDialogOpen(false);
          if (isAIDraftRoute) {
            navigate("/email-templates", { replace: true });
          }
        }}
        onCreate={handleAIDraftCreate}
        isLoading={aiDraftLoading}
        error={aiDraftError}
        onErrorClear={() => setAiDraftError(null)}
      />
    </form>
  );
};
