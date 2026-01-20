import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useConfig } from "@providers/config-provider";
import { useLayout } from "@providers/layout-provider";
import { useUserInfo } from "@providers/user-provider";
import { useCoreModuleNavigation, useNotificationsService, useSaveShortcut } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { useRequestContext } from "@providers/request-provider";
import {
  EmailTemplateDetailsDto,
  EmailTemplateEditRequest,
  EmailTemplateGenerationRequest,
  HttpResponse,
  ProblemDetails,
} from "@lib/network/swagger-client";
import { FormikHelpers, useFormik } from "formik";
import { EmailTemplateEditValidationScheme } from "./validation";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ModuleWrapper } from "@components/module-wrapper";
import { emailTemplateFormBreadcrumbLinks, emailTemplateGroupFilterStorageKey } from "../constants";
import { useGlobalLanguageFilter } from "@providers/global-language-filter-provider";
import { EmailTemplateEditContainer } from "./index.styled";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import useLocalStorage from "use-local-storage";
import { EmailTemplateEditProps } from "./types";
import { LanguageSelect } from "@components/language-select";
import { EmailGroupAutocomplete } from "@components/email-group-autocomplete";
import { RemoteAutocomplete } from "@components/remote-autocomplete";
import { RemoteValues } from "@components/remote-autocomplete/types";
import { execSubmitWithToast } from "utils/formik-helper";
import { CoreModule } from "@lib/router";
import {
  Save,
  XCircle,
  Trash2,
  Copy,
  Languages,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Plus,
  FolderOpen,
} from "lucide-react";
import { ImageSelectionDialog } from "@components/image-selection-dialog/image-selection-dialog";
import { HtmlVisualEditor } from "@components/html-visual-editor";
import { TemplatePreview, normalizePlaceholders } from "@components/template-preview";
import MonacoEditor, { DiffEditor as MonacoDiffEditor, loader } from "@monaco-editor/react";
import { TranslateDialog, TranslationType } from "@components/translate-dialog";
import { AIEditDialog } from "@components/ai-edit-dialog";
import { UnifiedAIProgress } from "@components/unified-ai-progress";
import { getEmailOutputChars, charsToTokens } from "@utils/ai-token-estimation";
import { AIEmailDraftDialog } from "@components/ai-email-draft-dialog";
import ContentLanguageSwitcher, { LanguageHighlights } from "@components/content-language-switcher";
import { EmailTemplateChangeLog } from "./email-template-change-log";
import {
  EMAIL_TEMPLATE_CATEGORY_OPTIONS,
  EmailTemplateCategory,
  getEmailTemplateCategoryNote,
} from "@utils/email-template-category";
import { showApiError } from "@utils/api-error-parser";

/**
 * Pin Monaco to 0.52.0 to avoid the "InstantiationService has been
 * disposed" regression shipped in 0.55.x.
 */
loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs",
  },
});

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
  modified,
  ...props
}: React.ComponentProps<typeof MonacoDiffEditor> & {
  onModifiedChange?: (value: string) => void;
}) => {
  const modifiedEditorRef = useRef<ReturnType<
    Parameters<
      NonNullable<React.ComponentProps<typeof MonacoDiffEditor>["onMount"]>
    >[0]["getModifiedEditor"]
  > | null>(null);

  // Freeze the initial `modified` value so the underlying DiffEditor
  // does NOT re-apply it on every render (which would reset the cursor
  // and cause "Illegal value for lineNumber" errors).
  // All subsequent syncs go through our controlled useEffect below.
  const initialModifiedRef = useRef(modified);

  // Sync external value changes (AI edit, data load, etc.) into the
  // modified editor without resetting cursor while the user is typing.
  useEffect(() => {
    const editor = modifiedEditorRef.current;
    if (!editor || editor.hasTextFocus()) return;
    const current = editor.getValue();
    if (current !== (modified ?? "")) {
      editor.setValue(modified ?? "");
    }
  }, [modified]);

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

      const modifiedEditor = editor.getModifiedEditor();
      modifiedEditorRef.current = modifiedEditor;

      if (onModifiedChange) {
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
      modified={initialModifiedRef.current}
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
  const { selectedLanguage: globalLanguage, isLanguageFilterActive } = useGlobalLanguageFilter();
  const userInfo = useUserInfo();
  const [storedGroupId] = useLocalStorage<number | "">(emailTemplateGroupFilterStorageKey, "");

  // Full-width layout
  useEffect(() => {
    setFullWidth(true);
    return () => setFullWidth(false);
  }, [setFullWidth]);

  // Determine modes
  const prefillData = location.state?.prefill as
    | {
        language?: string;
        subject?: string;
        emailGroupId?: number;
        name?: string;
        fromName?: string;
        fromEmail?: string;
        category?: EmailTemplateCategory;
      }
    | undefined;
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
  const [aiEditPrompt, setAiEditPrompt] = useState("");
  const [aiEditTemplateVars, setAiEditTemplateVars] = useState<
    Record<string, string> | undefined
  >();
  const [aiEditError, setAiEditError] = useState<string | null>(null);
  const [aiErrorDetails, setAiErrorDetails] = useState<string[]>([]);
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

  const [aiDraftDialogOpen, setAiDraftDialogOpen] = useState(false);
  const [aiDraftError, setAiDraftError] = useState<string | null>(null);
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [aiDraftPrompt, setAiDraftPrompt] = useState("");
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);

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

      // After creating a new template, navigate to its edit URL
      if (id === undefined && response.data.id) {
        navigate(`/email-templates/${response.data.id}/edit`, {
          replace: true,
        });
      }

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
    await execSubmitWithToast<EmailTemplateDetailsDto>(
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
      category: "General",
      attachments: [],
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

  // Sync external bodyTemplate changes (AI edit, data load, etc.) into
  // the Monaco editor without resetting cursor on every keystroke.
  // When the editor has focus the user is actively typing — skip sync
  // to avoid cursor jumps from the async formik state lag.
  useEffect(() => {
    const editor = monacoEditorRef.current;
    if (!editor || editor.hasTextFocus()) return;
    const formikValue = formik.values.bodyTemplate || "";
    if (editor.getValue() !== formikValue) {
      editor.setValue(formikValue);
    }
  }, [formik.values.bodyTemplate]);

  // Set defaults for new templates (create or AI draft)
  useEffect(() => {
    if (!isCreateMode && !isAIDraftRoute) return;

    const lang =
      prefillData?.language ||
      (isLanguageFilterActive && globalLanguage !== "all" ? globalLanguage : "") ||
      config?.defaultLanguage ||
      "";
    const defaultSenderName =
      prefillData?.fromName || userInfo?.details?.displayName || userInfo?.details?.userName || "";
    const defaultSenderEmail = prefillData?.fromEmail || userInfo?.details?.email || "";
    const defaultGroupId = prefillData?.emailGroupId || (storedGroupId ? Number(storedGroupId) : 0);

    if (lang && !formik.values.language) {
      formik.setFieldValue("language", lang);
    }
    if (defaultGroupId && !formik.values.emailGroupId) {
      formik.setFieldValue("emailGroupId", defaultGroupId);
    }
    if (prefillData?.subject && !formik.values.subject) {
      formik.setFieldValue("subject", prefillData.subject);
    }
    if (prefillData?.name && !formik.values.name) {
      formik.setFieldValue("name", prefillData.name);
    }
    if (defaultSenderName && !formik.values.fromName) {
      formik.setFieldValue("fromName", defaultSenderName);
    }
    if (defaultSenderEmail && !formik.values.fromEmail) {
      formik.setFieldValue("fromEmail", defaultSenderEmail);
    }
    if (prefillData?.category && !formik.values.category) {
      formik.setFieldValue("category", prefillData.category);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isCreateMode,
    isAIDraftRoute,
    config?.defaultLanguage,
    globalLanguage,
    isLanguageFilterActive,
    prefillData,
    storedGroupId,
    userInfo?.details?.displayName,
    userInfo?.details?.email,
    userInfo?.details?.userName,
  ]);

  const valueUpdate = (event: React.SyntheticEvent<Element, Event>) => {
    setWasModified(true);
    formik.handleChange(event);
  };

  const autoCompleteValueUpdate = <T,>(field: string, value: T): void => {
    setWasModified(true);
    formik.setFieldValue(field, value);
  };

  const defaultEmailGroupLanguage =
    formik.values.language ||
    (isLanguageFilterActive && globalLanguage !== "all" ? globalLanguage : "");

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
        const cat = formik.values.category;
        const translationChars = getEmailOutputChars("Html", cat);
        setAiProgressProps({
          targetLanguage: routeTargetLanguage,
          estimatedOutputTokens: charsToTokens(translationChars),
        });
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
          setWasModified(true);
          if (resp.data.emailGroup?.name) {
            setEmailGroupDisplayName(resp.data.emailGroup.name);
          }
          setTimeout(() => {
            setAiProgressOpen(false);
            setAiOperationComplete(false);
          }, 500);
        } catch (error) {
          setAiProgressOpen(false);
          showApiError(error, notificationsService, showErrorModal, "AI translation failed");
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
          setWasModified(true);
          if (resp.data.emailGroup?.name) {
            setEmailGroupDisplayName(resp.data.emailGroup.name);
          }
        } catch (error) {
          showApiError(error, notificationsService, showErrorModal, "Translation failed");
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
    } catch (error) {
      showApiError(error, notificationsService, showErrorModal, "Failed to delete email template");
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
    setAiEditPrompt(prompt);
    setAiEditTemplateVars(templateVariables);
    setAiEditError(null);
    setAiErrorDetails([]);
    setAiEditDialogOpen(false);
    setAiProgressType("edit");
    setAiOperationComplete(false);
    const cat = formik.values.category;
    const editChars = getEmailOutputChars("Html", cat);
    setAiProgressProps({
      contentTitle: formik.values.name || "Untitled",
      estimatedOutputTokens: charsToTokens(editChars),
    });
    setAiProgressOpen(true);

    try {
      const request: EmailTemplateEditRequest = {
        name: formik.values.name,
        subject: formik.values.subject,
        bodyTemplate: formik.values.bodyTemplate,
        category: formik.values.category || "General",
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
      setAiEditPrompt("");
      setAiEditTemplateVars(undefined);
      setAiEditError(null);
      setAiErrorDetails([]);
      setTimeout(() => {
        setAiProgressOpen(false);
        setAiOperationComplete(false);
      }, 500);
    } catch (error) {
      setAiProgressOpen(false);
      const parsed = showApiError(error, notificationsService, showErrorModal, "AI edit failed");
      setAiEditError(parsed.message);
      setAiErrorDetails(parsed.details.length > 0 ? [parsed.message, ...parsed.details] : []);
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

  /** Create with AI handler */
  const handleAIDraftCreate = async (
    language: string,
    emailGroupId: number,
    prompt: string,
    category: EmailTemplateCategory,
    referenceTemplateId?: number | null,
    templateVariables?: Record<string, string>,
    wordCount?: number | null,
    characterCount?: number | null
  ) => {
    setAiDraftError(null);
    setAiDraftLoading(true);
    setAiDraftPrompt(prompt);
    setAiDraftDialogOpen(false);
    setAiProgressType("content");
    setAiOperationComplete(false);
    const draftChars = getEmailOutputChars("Html", category);
    setAiProgressProps({
      estimatedOutputTokens: charsToTokens(draftChars),
    });
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
        category,
        referenceEmailTemplateId: referenceTemplateId ?? undefined,
        templateVariables: templateVariables ?? undefined,
      };
      const resp = await client.api.emailTemplatesAiDraftCreate(req);
      setAiOperationComplete(true);
      const body = normalizePlaceholders(resp.data.bodyTemplate || "");
      resp.data.bodyTemplate = body;
      await formik.setValues(resp.data);
      setWasModified(true);
      setAiDraftPrompt("");
      setTimeout(() => {
        setAiProgressOpen(false);
        setAiOperationComplete(false);
        navigate("/email-templates/add", { replace: true });
      }, 500);
    } catch (error) {
      setAiProgressOpen(false);
      const parsed = showApiError(
        error,
        notificationsService,
        showErrorModal,
        "AI draft generation failed. Please try again."
      );
      setAiDraftError(parsed.message);
      setAiErrorDetails(parsed.details.length > 0 ? [parsed.message, ...parsed.details] : []);
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

  // Check for validation errors in each tab
  const hasEditorErrors = Boolean(formik.errors.bodyTemplate);
  const hasSettingsErrors = Boolean(
    formik.errors.name ||
      formik.errors.language ||
      formik.errors.fromEmail ||
      formik.errors.fromName ||
      formik.errors.category
  );

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
              {readonly && !!id && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate(`/email-templates/${id}/edit`)}
                  disabled={formik.isSubmitting}
                  size="medium"
                  sx={{ mr: 2 }}
                >
                  Edit
                </Button>
              )}
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
              {hasAIAssistance && !!id && !readonly && (
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
                        defaultLanguage={defaultEmailGroupLanguage}
                        error={
                          (formik.touched.emailGroupId || formik.submitCount > 0) &&
                          Boolean(formik.errors.emailGroupId)
                        }
                        helperText={
                          (formik.touched.emailGroupId || formik.submitCount > 0) &&
                          formik.errors.emailGroupId
                        }
                        placeholder="Select group"
                        onChange={(value) => {
                          setWasModified(true);
                          formik.setFieldTouched("emailGroupId", true, false);
                          formik.setFieldValue("emailGroupId", value);
                        }}
                        onChangeWithLabel={(_, label) => {
                          setEmailGroupDisplayName(label);
                        }}
                        onBlur={() => formik.setFieldTouched("emailGroupId", true, false)}
                      />
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
                  <Tab
                    label="Editor"
                    value="editor"
                    sx={{
                      color: hasEditorErrors ? "error.main" : "inherit",
                      fontWeight: hasEditorErrors ? 600 : 400,
                      "&.Mui-selected": {
                        color: hasEditorErrors ? "error.main" : "primary.main",
                      },
                    }}
                  />
                  <Tab
                    label="Settings"
                    value="settings"
                    sx={{
                      color: hasSettingsErrors ? "error.main" : "inherit",
                      fontWeight: hasSettingsErrors ? 600 : 400,
                      "&.Mui-selected": {
                        color: hasSettingsErrors ? "error.main" : "primary.main",
                      },
                    }}
                  />
                  {!isCreateMode && id && (
                    <Tab
                      label="Change Log"
                      value="changelog"
                      sx={{
                        color: "inherit",
                        fontWeight: 400,
                        "&.Mui-selected": {
                          color: "primary.main",
                        },
                      }}
                    />
                  )}
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
                    <Box
                      sx={{
                        display: editorMode === "source" ? "block" : "none",
                      }}
                    >
                      <MonacoEditor
                        height={editorHeight}
                        defaultLanguage="html"
                        defaultValue={formik.values.bodyTemplate || ""}
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
                          formatOnPaste: false,
                        }}
                      />
                    </Box>
                    {editorMode === "diff" && (
                      <SafeDiffEditor
                        height={editorHeight}
                        language="html"
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
                          originalEditable: false,
                        }}
                      />
                    )}
                    {editorMode === "preview" && (
                      <TemplatePreview
                        source={formik.values.bodyTemplate || ""}
                        subject={formik.values.subject || ""}
                        fromEmail={formik.values.fromEmail || ""}
                        fromName={formik.values.fromName || ""}
                        language={formik.values.language || ""}
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
                      <RemoteAutocomplete
                        label="Sender Email"
                        placeholder="Enter sender email"
                        type={RemoteValues.SENDER_EMAILS}
                        freeSolo
                        multiple={false}
                        limit={1}
                        value={formik.values.fromEmail || ""}
                        error={formik.touched.fromEmail && Boolean(formik.errors.fromEmail)}
                        helperText={formik.touched.fromEmail && formik.errors.fromEmail}
                        language={formik.values.language}
                        onChange={(_event, value) => {
                          setWasModified(true);
                          formik.setFieldValue("fromEmail", (value as string) || "");
                        }}
                        onInputChange={(value) => {
                          setWasModified(true);
                          formik.setFieldValue("fromEmail", value);
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <RemoteAutocomplete
                        label="Sender Name"
                        placeholder="Enter sender name"
                        type={RemoteValues.SENDER_NAMES}
                        freeSolo
                        multiple={false}
                        limit={1}
                        value={formik.values.fromName || ""}
                        error={formik.touched.fromName && Boolean(formik.errors.fromName)}
                        helperText={formik.touched.fromName && formik.errors.fromName}
                        language={formik.values.language}
                        onChange={(_event, value) => {
                          setWasModified(true);
                          formik.setFieldValue("fromName", (value as string) || "");
                        }}
                        onInputChange={(value) => {
                          setWasModified(true);
                          formik.setFieldValue("fromName", value);
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Alert severity="warning" sx={{ py: 0.5, alignItems: "center" }}>
                        Sender must be trusted or allowed in your email provider, or sending may
                        fail.
                      </Alert>
                    </Grid>
                    {hasAIAssistance && (
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth>
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={formik.values.category || "General"}
                            label="Category"
                            disabled={readonly}
                            onChange={(e: SelectChangeEvent) => {
                              autoCompleteValueUpdate("category", e.target.value);
                            }}
                          >
                            {EMAIL_TEMPLATE_CATEGORY_OPTIONS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75 }}>
                          {getEmailTemplateCategoryNote(formik.values.category)}
                        </Typography>
                      </Grid>
                    )}

                    {/* Attachments */}
                    <Grid size={{ xs: 12 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Paperclip size={16} />
                          <Typography variant="subtitle2">Attachments</Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<FolderOpen size={16} />}
                            onClick={() => setAttachmentDialogOpen(true)}
                            disabled={readonly}
                          >
                            Browse Media
                          </Button>
                          <Button
                            size="small"
                            startIcon={<Plus size={16} />}
                            onClick={() => {
                              const current = formik.values.attachments || [];
                              autoCompleteValueUpdate("attachments", [...current, ""]);
                            }}
                            disabled={readonly}
                          >
                            Add
                          </Button>
                        </Box>
                      </Box>
                      {(formik.values.attachments || []).length > 0 ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {(formik.values.attachments || []).map((attachment, index) => (
                            <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                              <TextField
                                fullWidth
                                size="small"
                                value={attachment}
                                disabled={readonly}
                                placeholder="e.g. scope/file.pdf or {{ variable }}"
                                onChange={(e) => {
                                  const updated = [...(formik.values.attachments || [])];
                                  updated[index] = e.target.value;
                                  autoCompleteValueUpdate("attachments", updated);
                                }}
                              />
                              <IconButton
                                size="small"
                                disabled={readonly}
                                onClick={() => {
                                  const updated = (formik.values.attachments || []).filter(
                                    (_, i) => i !== index
                                  );
                                  autoCompleteValueUpdate("attachments", updated);
                                }}
                              >
                                <XCircle size={18} />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No attachments added yet.
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: "block" }}
                      >
                        Supports Liquid syntax for dynamic paths, e.g. {"{{ fileName }}"}.
                        Parameters are set by the site when sending a contact form request and can
                        be any of the ContactUs fields (firstName, lastName, email, companyName,
                        subject, message, phone, title, etc.) or custom values passed via ExtraData.
                      </Typography>
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
          onClose={() => {
            setAiEditDialogOpen(false);
            setAiEditPrompt("");
            setAiEditTemplateVars(undefined);
            setAiEditError(null);
            setAiErrorDetails([]);
          }}
          onEdit={handleAIEdit}
          error={aiEditError}
          onErrorClear={() => {
            setAiEditError(null);
            setAiErrorDetails([]);
          }}
          onViewErrorDetails={
            aiErrorDetails.length > 0 ? () => showErrorModal(aiErrorDetails) : undefined
          }
          contentTitle={formik.values.name || "Untitled"}
          currentContent={formik.values}
          variant="email-template"
          initialPrompt={aiEditPrompt}
          initialTemplateVariables={aiEditTemplateVars}
        />
      )}

      {/* AI Progress */}
      <UnifiedAIProgress
        open={aiProgressOpen}
        type={aiProgressType}
        isComplete={aiOperationComplete}
        contentTitle={(aiProgressProps.contentTitle as string) || undefined}
        targetLanguage={(aiProgressProps.targetLanguage as string) || undefined}
        estimatedOutputTokens={(aiProgressProps.estimatedOutputTokens as number) || undefined}
      />

      {/* AI Draft Dialog */}
      <AIEmailDraftDialog
        open={aiDraftDialogOpen}
        onClose={() => {
          setAiDraftDialogOpen(false);
          setAiDraftPrompt("");
          if (isAIDraftRoute) {
            navigate("/email-templates", { replace: true });
          }
        }}
        onCreate={handleAIDraftCreate}
        isLoading={aiDraftLoading}
        error={aiDraftError}
        onErrorClear={() => {
          setAiDraftError(null);
          setAiErrorDetails([]);
        }}
        onViewErrorDetails={
          aiErrorDetails.length > 0 ? () => showErrorModal(aiErrorDetails) : undefined
        }
        initialValues={{
          language: formik.values.language || "",
          emailGroupId: formik.values.emailGroupId || undefined,
          category: (formik.values.category || "General") as EmailTemplateCategory,
          prompt: aiDraftPrompt || undefined,
        }}
      />

      {/* Attachment Media Selection Dialog */}
      <ImageSelectionDialog
        open={attachmentDialogOpen}
        onClose={() => setAttachmentDialogOpen(false)}
        onSelect={() => undefined}
        onSelectMultipleItems={(items) => {
          const current = formik.values.attachments || [];
          const paths = items.map((item) =>
            item.scopeUid ? `${item.scopeUid}/${item.name}` : item.name
          );
          autoCompleteValueUpdate("attachments", [...current, ...paths]);
          setAttachmentDialogOpen(false);
        }}
        selectionMode="multiple"
        acceptAllFiles
      />
    </form>
  );
};
