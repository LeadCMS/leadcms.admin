import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useConfig } from "@providers/config-provider";
import { useLayout } from "@providers/layout-provider";
import { useCoreModuleNavigation, useNotificationsService, useSaveShortcut } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { useRequestContext } from "@providers/request-provider";
import {
  EmailTemplateDetailsDto,
  EmailTemplateEditRequest,
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
  FormControlLabel,
  Switch,
} from "@mui/material";
import useLocalStorage from "use-local-storage";
import {
  EmailTemplateEditData,
  EmailTemplateEditProps,
  EmailTemplateEditRestoreState,
  EmailTemplateEditorAutoSave,
} from "./types";
import { useDebouncedCallback } from "use-debounce";
import { RestoreDataModal } from "@components/restore-data";
import { LanguageSelect } from "@components/language-select";
import { EmailGroupAutocomplete } from "@components/email-group-autocomplete";
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
} from "lucide-react";
import { GrapesEmailEditor } from "@components/grapes-email-editor";
import MonacoEditor from "@monaco-editor/react";
import { TranslateDialog, TranslationType } from "@components/translate-dialog";
import { AIEditDialog } from "@components/ai-edit-dialog";
import { UnifiedAIProgress } from "@components/unified-ai-progress";
import ContentLanguageSwitcher, { LanguageHighlights } from "@components/content-language-switcher";
import { EmailTemplateChangeLog } from "./email-template-change-log";

const METADATA_COLLAPSED_KEY = "emailTemplate-metadata-collapsed";

export const EmailTemplateEdit = ({ readonly }: EmailTemplateEditProps) => {
  const navigate = useNavigate();
  const { config } = useConfig();
  const { setFullWidth } = useLayout();
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const { client } = useRequestContext();
  const handleNavigation = useCoreModuleNavigation();
  const { id, sourceId: routeSourceId } = useParams();

  const hasAIAssistance = config?.capabilities?.includes("AIAssistance") || false;
  const hasMultipleLanguages = (config?.languages?.length || 0) > 1;

  // Full-width layout
  useEffect(() => {
    setFullWidth(true);
    return () => setFullWidth(false);
  }, [setFullWidth]);

  // Determine modes
  const isDuplicateMode = !!routeSourceId && !id;
  const isCreateMode = !id && !isDuplicateMode;

  // UI state
  const [activeTab, setActiveTab] = useState<"editor" | "settings" | "changelog">("editor");
  const [editorMode, setEditorMode] = useState<"visual" | "source">("visual");
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

  // Restore state
  const [restoreDataState, setRestoreDataState] = useState<EmailTemplateEditRestoreState>(
    EmailTemplateEditRestoreState.Idle
  );
  const [editorLocalStorage, setEditorLocalStorage] = useLocalStorage<EmailTemplateEditData>(
    "leadcms_emailTemplateEditor_autosave",
    { data: [] },
    { logger: (error) => console.log(error) }
  );
  const [wasModified, setWasModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveModeRef = useRef<"stay" | "close">("close");

  // Autosave
  const autoSave = useDebouncedCallback((value) => {
    if (!wasModified) return;
    const snap = { ...editorLocalStorage };
    let ref = snap.data.find((d) => d.id === id);
    if (!ref) {
      ref = {
        id,
        savedData: value,
        latestAutoSave: new Date(),
      } as EmailTemplateEditorAutoSave;
      snap.data.push(ref);
    } else {
      ref.latestAutoSave = new Date();
      ref.savedData = value;
    }
    setEditorLocalStorage(snap);
  }, 3000);

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
      const snap = { ...editorLocalStorage };
      snap.data = snap.data.filter((d) => d.id !== id);
      setEditorLocalStorage(snap);
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
    if (!id || isDuplicateMode) return;
    const load = async () => {
      try {
        const resp = await client.api.emailTemplatesDetail(Number(id));
        await formik.setValues(resp.data);
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
  }, [client, id, isDuplicateMode]);

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

  // Restore from local storage
  useEffect(() => {
    const run = async () => {
      try {
        const snap = { ...editorLocalStorage };
        switch (restoreDataState) {
          case EmailTemplateEditRestoreState.Idle:
            if (snap.data.some((d) => d.id === id)) {
              setRestoreDataState(EmailTemplateEditRestoreState.Requested);
              return;
            }
            break;
          case EmailTemplateEditRestoreState.Requested:
            return;
          case EmailTemplateEditRestoreState.Rejected:
            snap.data = snap.data.filter((d) => d.id !== id);
            setEditorLocalStorage(snap);
            break;
          case EmailTemplateEditRestoreState.Accepted:
            await formik.setValues(
              snap.data.find((d) => d.id === id)!.savedData as EmailTemplateDetailsDto
            );
            setWasModified(true);
            return;
        }
      } catch (e) {
        console.error(e);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoreDataState]);

  useEffect(() => {
    autoSave(formik.values);
  }, [formik.values]);

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
    if (!id) return;
    setTranslateDialogOpen(false);

    if (translationType === "AITranslation") {
      setAiProgressType("translation");
      setAiOperationComplete(false);
      setAiProgressProps({ targetLanguage });
      setAiProgressOpen(true);
      try {
        const resp = await client.api.emailTemplatesAiTranslationDraftDetail(
          Number(id),
          targetLanguage,
          {
            emailGroupId: formik.values.emailGroupId,
          }
        );
        setAiOperationComplete(true);
        setTimeout(() => {
          setAiProgressOpen(false);
          setAiOperationComplete(false);
          // Navigate to the new translation
          if (resp.data.id) {
            navigate(`/email-templates/${resp.data.id}/edit`);
          }
        }, 500);
      } catch {
        setAiProgressOpen(false);
        notificationsService.error("AI translation failed");
      }
    } else {
      try {
        const resp = await client.api.emailTemplatesTranslationDraftDetail(
          Number(id),
          targetLanguage,
          {
            transformer: translationType === "KeepOriginal" ? "KeepOriginal" : "EmptyCopy",
          }
        );
        if (resp.data.id) {
          navigate(`/email-templates/${resp.data.id}/edit`);
        } else {
          // It's a new draft, load in-place
          await formik.setValues(resp.data);
          setWasModified(true);
        }
      } catch {
        notificationsService.error("Translation failed");
      }
    }
  };

  const handleAIEdit = async (prompt: string) => {
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
    setTranslateDialogOpen(true);
  };

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
        <RestoreDataModal
          isOpen={restoreDataState === EmailTemplateEditRestoreState.Requested}
          onClose={(value) =>
            value
              ? setRestoreDataState(EmailTemplateEditRestoreState.Accepted)
              : setRestoreDataState(EmailTemplateEditRestoreState.Rejected)
          }
        />

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

                {/* Collapsible Content: Subject + Group */}
                <Collapse in={!isCollapsed}>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid size={{ xs: 12, sm: 8 }}>
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
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editorMode === "source"}
                        onChange={(e) => setEditorMode(e.target.checked ? "source" : "visual")}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2" component="span">
                        Source Code
                      </Typography>
                    }
                    sx={{ mr: 2 }}
                  />
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
                      <GrapesEmailEditor
                        value={formik.values.bodyTemplate || ""}
                        onChange={(html) => {
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
                        value={formik.values.bodyTemplate || ""}
                        onChange={(value) => {
                          setWasModified(true);
                          formik.setFieldValue("bodyTemplate", value || "");
                        }}
                        options={{
                          readOnly: !!readonly,
                          minimap: {
                            enabled: false,
                          },
                          lineNumbers: "on",
                          scrollBeyondLastLine: false,
                          wordWrap: "on",
                        }}
                      />
                    </Box>
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
    </form>
  );
};
