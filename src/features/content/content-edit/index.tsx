import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ContentDetailsDto,
  HttpResponse,
  ProblemDetails,
  ContentTypeDetailsDto,
} from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { useConfig } from "@providers/config-provider";
import { ContentEditContainer } from "../index.styled";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Switch,
  Typography,
} from "@mui/material";
import { useFormik, FormikHelpers } from "formik";
import {
  ContentDetails,
  ContentEditData,
  ContentEditRestoreState,
  ContentEditorAutoSave,
} from "./types";
import {
  ContentEditValidationScheme,
  ContentEditMaximumImageSize,
} from "./validation";
import {
  ContentTypeDropdown,
  getContentTypeByUid,
  generateDefaultValues,
  fetchAllContentTypes
} from "../content-types";
import { toFormikValidationSchema } from "zod-formik-adapter";
import MarkdownEditor from "@components/markdown-editor";
import FileDropdown from "@components/file-dropdown";
import { buildAbsoluteUrl } from "@lib/network/utils";
import useLocalStorage from "use-local-storage";
import { RestoreDataModal } from "@components/restore-data";
import { useDebouncedCallback } from "use-debounce";
import { ValidateFrontmatterError } from "utils/frontmatter-validator";
import { ImageData } from "@components/file-dropdown";
import { useCoreModuleNavigation, useNotificationsService } from "@hooks";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { ModuleWrapper } from "@components/module-wrapper";
import { RemoteAutocomplete } from "@components/remote-autocomplete";
import { RemoteValues } from "@components/remote-autocomplete/types";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { useUserInfo } from "@providers/user-provider";
import { LanguageSelect } from "@components/language-select";
import { execSubmitWithToast } from "utils/formik-helper";
import { CoreModule } from "@lib/router";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { Trash2, XCircle, Save, ExternalLink, Copy } from "lucide-react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import MonacoEditor from "@monaco-editor/react";
import { openSitePreview } from "utils/preview-helper";

// Extended config interface to handle settings not in the swagger definition
interface ExtendedConfig {
  settings?: {
    LivePreviewUrlTemplate?: string;
    PreviewUrlTemplate?: string;
  };
}

interface ContentEditProps {
  readonly?: boolean;
}

export const ContentEdit = (props: ContentEditProps) => {
  const { setSaving, setBusy } = useModuleWrapperContext();
  const errorDetailsModal = useErrorDetailsModal();
  // Use fallback function to satisfy TypeScript for the error modal
  const showErrorModal = errorDetailsModal?.Show || 
    ((data) => console.error("Error modal not available:", data));
  const { notificationsService } = useNotificationsService();
  const networkContext = useRequestContext();
  const handleNavigation = useCoreModuleNavigation();
  const navigate = useNavigate();
  const { config } = useConfig();
  const [editorLocalStorage, setEditorLocalStorage] = useLocalStorage<ContentEditData>(
    "leadcms_editor_autosave",
    { data: [] },
    {
      logger: (error) => console.log(error),
    }
  );
  const { client } = networkContext;
  const { id, sourceId } = useParams();
  const isDuplicateMode = !!sourceId;
  const [wasModified, setWasModified] = useState<boolean>(false);
  const [coverWasModified, setCoverWasModified] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDraftSaving, setIsDraftSaving] = useState<boolean>(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(!!id || !!sourceId);
  const [frontmatterState, setfrontmatterState] = useState<ValidateFrontmatterError | null>(null);
  const [restoreDataState, setRestoreDataState] = useState<ContentEditRestoreState>(
    ContentEditRestoreState.Idle
  );
  const [activeTab, setActiveTab] = useState<string>("content");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [useLivePreview, setUseLivePreview] = useState(true);
  const [contentTypes, setContentTypes] = useState<ContentTypeDetailsDto[]>([]);
  const [contentType, setContentType] = useState<ContentTypeDetailsDto | null>(null);

  const supportsCover = contentType?.supportsCoverImage;
  const supportsComments = contentType?.supportsComments;
  
  // Check if preview features are available from backend config
  const configSettings = (config as ExtendedConfig)?.settings;
  const hasLivePreview = !!configSettings?.LivePreviewUrlTemplate;
  const hasSitePreview = !!configSettings?.PreviewUrlTemplate;

  // API-based draft save (for live preview)
  const saveDraft = useDebouncedCallback(async (values: ContentDetails) => {
    // Only save draft if:
    // 1. Live preview is enabled
    // 2. Backend supports live preview 
    // 3. We have an existing content ID (not create mode)
    // 4. Content was actually modified
    if (!useLivePreview || !hasLivePreview || !id || (!wasModified && !coverWasModified)) {
      return;
    }

    try {
      setIsDraftSaving(true);
      setShowSaveIndicator(true);
      await client.api.contentDraftPartialUpdate(Number(id), {
        ...values,
      });
      
      // Show "saved" state for 2 seconds
      setTimeout(() => {
        setShowSaveIndicator(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to save draft:", error);
      // Don't show error to user for draft saves to avoid interrupting their workflow
      setShowSaveIndicator(false);
    } finally {
      setIsDraftSaving(false);
    }
  }, 1000); // 2 second debounce for draft saves

  const autoSave = useDebouncedCallback((value) => {
    if (!wasModified && !coverWasModified) {
      return;
    }
    const localStorageSnapshot = { ...editorLocalStorage };
    let reference = localStorageSnapshot.data.filter((data) => data.id === id)[0];
    if (reference === undefined) {
      reference = {
        id,
        savedData: value,
        latestAutoSave: new Date(),
      } as ContentEditorAutoSave;
      localStorageSnapshot.data.push(reference);
    } else {
      (reference.latestAutoSave = new Date()), (reference.savedData = value);
    }
    setEditorLocalStorage(localStorageSnapshot);
    !isSaving &&
      setSaving(async () => {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
      });
  }, 3000); ///TODO: User Settings

  const submitFunc = async (values: ContentDetails, helpers: FormikHelpers<ContentDetails>) => {
    let response: HttpResponse<ContentDetailsDto, void | ProblemDetails>;
    let coverUrl = values.coverImageUrl;
    setIsSaving(true);
    if (frontmatterState !== null) {
      throw Error("Frontmatter validation error. Check preview window for details");
    }
    if (coverWasModified && values.coverImagePending && values.coverImagePending.url) {
      const blob = await (await fetch(values.coverImagePending.url)).blob();
      const file = new File([blob], values.coverImagePending.fileName || "image.jpg");
      const imageUploadingResponse = await client.api.mediaCreate({
        Image: file,
        ScopeUid: values.slug,
      });
      if (imageUploadingResponse.error) {
        throw Error(imageUploadingResponse.error.title as string);
      }
      if (imageUploadingResponse.data.location === null) {
        throw Error("imageupload.data.location is null");
      }
      coverUrl = imageUploadingResponse.data.location as string;
    }
    if (values?.id) {
      response = await client.api.contentPartialUpdate(Number(values.id), {
        ...values,
        coverImageUrl: coverUrl,
      });
    } else {
      response = await client.api.contentCreate({
        ...values,
        coverImageUrl: coverUrl,
      });
    }
    // Patch ContentDetails fields that are not present in ContentDetailsDto
    const patched: ContentDetails = {
      ...response.data,
      id: response.data.id ? response.data.id.toString() : null,
      coverImagePending: {
        url: response.data.coverImageUrl
          ? buildAbsoluteUrl(response.data.coverImageUrl)
          : "",
        fileName: "",
      },
      files: [],
    } as ContentDetails;
    helpers.setValues(patched);
    await helpers.setFieldValue("coverImagePending", patched.coverImagePending);

    setWasModified(false);
    setCoverWasModified(false);
    const localStorageSnapshot = { ...editorLocalStorage };
    localStorageSnapshot.data = localStorageSnapshot.data.filter((data) => data.id !== id);
    setEditorLocalStorage(localStorageSnapshot);
    setIsSaving(false);
    helpers.setSubmitting(false);
    handleNavigation(CoreModule.content);
  };

  const submit = async (values: ContentDetails, helpers: FormikHelpers<ContentDetails>) => {
    execSubmitWithToast<ContentDetails>(
      values,
      helpers,
      submitFunc,
      notificationsService,
      showErrorModal,
      "post"
    );
  };

  const formik = useFormik<ContentDetails>({
    validationSchema: toFormikValidationSchema(ContentEditValidationScheme),
    initialValues: {
      title: "",
      description: "",
      body: "",
      slug: "",
      type: "",
      author: "",
      language: "",
      category: "",
      tags: [],
      allowComments: false,
      coverImagePending: { url: "", fileName: "" },
      coverImageAlt: "",
      publishedAt: null,
      id: null,
      coverImageUrl: "",
      createdAt: null,
      updatedAt: null,
      files: []
    },
    onSubmit: submit,
    validateOnChange: false,
    validateOnBlur: true,
  });

  const valueUpdate = (event: React.SyntheticEvent<Element, Event>) => {
    setWasModified(true);
    formik.handleChange(event);
  };
  const valueUpdateGeneric = (field: string, value: unknown) => {
    setWasModified(true);
    formik.setFieldValue(field, value);
  };

  function autoCompleteValueUpdate(field: string, value: unknown): void {
    setWasModified(true);
    formik.setFieldValue(field, value);
  }

  // Helper function to set default values for a content type
  const setContentTypeDefaults = async (contentTypeId: string) => {
    const contentType = await getContentTypeByUid(client, contentTypeId);
    if (!contentType) {
      return;
    }
    const currentValues = { ...formik.values };
    const defaults = generateDefaultValues(contentTypeId);
    
    // Get current content type to compare formats
    const currentContentType = await getContentTypeByUid(
      client, currentValues.type);
    const shouldResetBody = !currentContentType ||
      currentContentType.format !== contentType.format;
    
    // Preserve existing values, only update content type specific fields
    formik.setValues({
      ...currentValues,
      // Always update the content type
      type: contentTypeId,
      // Reset body content only if format has changed
      body: shouldResetBody ? defaults.body : currentValues.body,
      // Apply content type specific defaults for these fields only if they don't have values
      allowComments: currentValues.allowComments !== undefined ? 
        currentValues.allowComments : defaults.allowComments,
      // Keep all other existing values (title, description, author, etc.)
    });
    setWasModified(true);
  };

  const handleDateChange = (field: string, newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      setWasModified(true);
      formik.setFieldValue(field, newValue.toISOString());
    }
  };

  const onCoverImageChange = (url: ImageData) => {
    formik.setFieldValue("coverImagePending", url);
    setCoverWasModified(true);
  };

  useEffect(() => {
    setBusy(async () => {
      try {
        const localStorageSnapshot = { ...editorLocalStorage };
        switch (restoreDataState) {
          case ContentEditRestoreState.Idle: {
            if (localStorageSnapshot.data.filter((data) => data.id === id).length > 0) {
              setRestoreDataState(ContentEditRestoreState.Requested);
              return;
            }
            break;
          }
          case ContentEditRestoreState.Requested: {
            return;
          }
          case ContentEditRestoreState.Rejected: {
            localStorageSnapshot.data = localStorageSnapshot.data.filter((data) => data.id !== id);
            setEditorLocalStorage(localStorageSnapshot);
            break;
          }
          case ContentEditRestoreState.Accepted: {
            const saved = localStorageSnapshot.data.filter((data) => data.id === id)[0].savedData;
            await formik.setValues(saved);
            if (saved.coverImagePending.fileName.length > 0) {
              setCoverWasModified(true);
            }
            setWasModified(true);
            setIsInitialLoading(false);
            return;
          }
        }
        if (client && id) {
          const { data } = await client.api.contentDetail(Number(id));
          const patched: ContentDetails = {
            ...data,
            id: data.id ? data.id.toString() : null,
            coverImagePending: {
              url: data.coverImageUrl ? buildAbsoluteUrl(data.coverImageUrl) : "",
              fileName: "",
            },
            files: [],
          } as ContentDetails;
          await formik.setValues(patched);
          await formik.setFieldValue(
            "coverImagePending",
            patched.coverImagePending
          );
        } else if (client && sourceId) {
          // Load content for duplication
          const { data } = await client.api.contentDetail(Number(sourceId));
          const duplicatedContent: ContentDetails = {
            ...data,
            id: null,
            title: data.title + " - Copy",
            slug: data.slug + "-copy",
            createdAt: null,
            updatedAt: null,
            coverImagePending: {
              url: data.coverImageUrl ? buildAbsoluteUrl(data.coverImageUrl) : "",
              fileName: "",
            },
            files: [],
          } as ContentDetails;
          await formik.setValues(duplicatedContent);
          await formik.setFieldValue(
            "coverImagePending",
            duplicatedContent.coverImagePending
          );
          setWasModified(true); // Mark as modified since it's duplicated content
        }
        setIsInitialLoading(false);
      } catch (e) {
        console.log(e);
        setIsInitialLoading(false);
      }
    });
  }, [client, id, sourceId, restoreDataState]);

  useEffect(() => {
    autoSave(formik.values);
    saveDraft(formik.values);
  }, [formik.values]);

  const isCreateMode = !id && !isDuplicateMode;
  const shouldShowForm = (isCreateMode || isDuplicateMode) || !isInitialLoading;
  
  // Set default content type for new content when contentTypes are loaded
  useEffect(() => {
    if (
      isCreateMode &&
      contentTypes.length > 0 &&
      !formik.values.type
    ) {
      // Sort alphabetically by uid for consistency with dropdown
      const sorted = [...contentTypes].sort((a, b) => a.uid.localeCompare(b.uid));
      formik.setFieldValue("type", sorted[0].uid, false);
    }
  }, [isCreateMode, contentTypes, formik.values.type]);

  // Fetch all content types once on mount or when reloading
  const reloadContentTypes = async () => {
    if (client) {
      const types = await fetchAllContentTypes(client);
      setContentTypes(Array.isArray(types) ? types : []);
    }
  };

  useEffect(() => {
    reloadContentTypes();
  }, [client]);

  // Set contentType when formik.values.type changes
  useEffect(() => {
    if (formik.values.type && contentTypes.length > 0) {
      const found = contentTypes.find(t => t.uid === formik.values.type);
      setContentType(found || null);
    } else {
      setContentType(null);
    }
  }, [formik.values.type, contentTypes]);

  // Check for validation errors in each tab
  const hasContentErrors = Boolean(formik.errors.body);
  const hasCoverErrors = Boolean(formik.errors.coverImageAlt);
  const hasSettingsErrors = Boolean(
    formik.errors.slug ||
    formik.errors.language ||
    formik.errors.category ||
    formik.errors.tags ||
    formik.errors.allowComments ||
    formik.errors.author ||
    formik.errors.publishedAt
  );

  // Handler for delete action
  const handleDelete = async () => {
    if (!id) return;
    try {
      await client.api.contentDelete(parseInt(id));
      notificationsService.success("Content deleted successfully");
      handleNavigation(CoreModule.content);
    } catch (error) {
      notificationsService.error("Failed to delete content");
    }
  };

  // Handler for duplicate action
  const handleDuplicate = () => {
    if (!id) return;
    navigate(`/content/${id}/duplicate`);
  };

  // Handler for site preview
  const handleSitePreview = () => {
    const success = openSitePreview(
      formik.values as unknown as Record<string, unknown>,
      configSettings?.PreviewUrlTemplate || "",
    );
    if (!success) {
      notificationsService.error(
        "Cannot open site preview. Please ensure all required fields are filled."
      );
    }
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <ModuleWrapper
        breadcrumbs={[]}
        currentBreadcrumb={formik.values.title}
        saveIndicatorElement={
          showSaveIndicator ? (
            <Box minWidth={200}>
              <Grid container justifyContent={"flex-end"}>
                <Grid size={{ xs: "auto" }}>
                  {isDraftSaving ? (
                    <Grid container spacing={1} alignItems="center">
                      <Grid size={{ xs: "auto" }}>
                        <CircularProgress size={14} />
                      </Grid>
                      <Grid size={{ xs: "auto" }}>
                        <Typography variant="body2">
                          {useLivePreview && hasLivePreview 
                            ? "Saving draft..." 
                            : "Saving locally..."
                          }
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Grid container spacing={1} alignItems="center">
                      <Grid size={{ xs: "auto" }}>
                        <Save size={14} />
                      </Grid>
                      <Grid size={{ xs: "auto" }}>
                        <Typography variant="body2">
                          {useLivePreview && hasLivePreview 
                            ? "Draft saved" 
                            : "Saved locally"
                          }
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Box>
          ) : undefined
        }
        isForm={true}
        actionButtons={
          <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ pl: { sm: 4 } }}>
              {!isCreateMode && !isDuplicateMode && (
                <>
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
                </>
              )}
              {!isCreateMode && !isDuplicateMode && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Copy />}
                  onClick={handleDuplicate}
                  disabled={formik.isSubmitting}
                  size="medium"
                >
                  Duplicate
                </Button>
              )}
              <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="delete-content-dialog-title"
                aria-describedby="delete-content-dialog-description"
              >
                <DialogTitle id="delete-content-dialog-title">Delete Content</DialogTitle>
                <DialogContent>
                  <DialogContentText id="delete-content-dialog-description">
                    Are you sure you want to delete this content? This action cannot be undone.
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
                    disabled={formik.isSubmitting}
                  >
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
            <Box sx={{ display: "flex", gap: 2, pr: { sm: 4 } }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleNavigation(CoreModule.content)}
                disabled={formik.isSubmitting}
                startIcon={<XCircle />}
                size="medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!(wasModified || coverWasModified) || formik.isSubmitting}
                startIcon={isSaving ? <CircularProgress size={16} /> : <Save />}
                size="medium"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </Box>
          </Box>
        }
      >
        <RestoreDataModal
          isOpen={restoreDataState === ContentEditRestoreState.Requested}
          onClose={(value) =>
            value
              ? setRestoreDataState(ContentEditRestoreState.Accepted)
              : setRestoreDataState(ContentEditRestoreState.Rejected)
          }
        />
        <ContentEditContainer>
          {shouldShowForm ? (          
            <Card>
              <CardContent>
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <TextField
                      label="Title"
                      name="title"
                      value={formik.values.title}
                      onChange={valueUpdate}
                      error={formik.touched.title && Boolean(formik.errors.title)}
                      helperText={formik.touched.title && formik.errors.title}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <ContentTypeDropdown
                      value={formik.values.type}
                      options={[...contentTypes].sort((a, b) => a.uid.localeCompare(b.uid))}
                      onChange={(val: string) => {
                        if (val !== formik.values.type) {
                          setContentTypeDefaults(val);
                        }
                      }}
                      onAddNewType={reloadContentTypes}
                      error={formik.touched.type && Boolean(formik.errors.type)}
                      helperText={formik.touched.type && formik.errors.type}
                      onBlur={() => formik.setFieldTouched("type", true)}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, sm: 12 }}>
                    <TextField
                      label="Description"
                      name="description"
                      value={formik.values.description}
                      onChange={valueUpdate}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                      multiline
                      minRows={3}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}>
                  <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{ minHeight: 36 }}
                  >
                    <Tab 
                      label="Content" 
                      value="content"
                      sx={{
                        color: hasContentErrors ? "error.main" : "inherit",
                        fontWeight: hasContentErrors ? 600 : 400,
                        "&.Mui-selected": {
                          color: hasContentErrors ? "error.main" : "primary.main"
                        }
                      }}
                    />
                    {supportsCover && (
                      <Tab 
                        label="Cover" 
                        value="cover"
                        sx={{
                          color: hasCoverErrors ? "error.main" : "inherit",
                          fontWeight: hasCoverErrors ? 600 : 400,
                          "&.Mui-selected": {
                            color: hasCoverErrors ? "error.main" : "primary.main"
                          }
                        }}
                      />
                    )}
                    <Tab 
                      label="Settings" 
                      value="settings"
                      sx={{
                        color: hasSettingsErrors ? "error.main" : "inherit",
                        fontWeight: hasSettingsErrors ? 600 : 400,
                        "&.Mui-selected": {
                          color: hasSettingsErrors ? "error.main" : "primary.main"
                        }
                      }}
                    />
                  </Tabs>
                  <Box sx={{ flex: 1 }} />
                  {hasLivePreview && 
                   (contentType?.format === "MDX" || contentType?.format === "MD") && (
                    <FormControlLabel
                      control={
                        isDraftSaving ? (
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                        ) : (
                          <Switch
                            checked={useLivePreview}
                            onChange={(e) => {
                              const newValue = e.target.checked;
                              setUseLivePreview(newValue);
                              
                              // When enabling live preview, immediately save current draft
                              if (
                                newValue && 
                                hasLivePreview && 
                                id && 
                                (wasModified || coverWasModified)
                              ) {
                                saveDraft(formik.values);
                              }
                            }}
                            size="small"
                          />
                        )
                      }
                      label={isDraftSaving ? "Saving Draft..." : "Live Preview"}
                      sx={{ mr: 5 }}
                    />
                  )}
                  {hasSitePreview && (
                    <Button
                      variant="text"
                      onClick={handleSitePreview}
                      endIcon={<ExternalLink size={20} />}
                      sx={{
                        color: "#1976d2",
                        textTransform: "none",
                        fontSize: 14,
                        pl: 0,
                        pr: 0,
                        minWidth: 0,
                        "&:hover": { textDecoration: "underline", background: "none" }
                      }}
                    >
                      Preview on Site
                    </Button>
                  )}
                </Box>
                {activeTab === "content" && (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 12 }}>
                      {contentType?.format === "JSON" || contentType?.format === "YAML" ? (
                        <MonacoEditor
                          height="400px"
                          defaultLanguage={contentType.format.toLowerCase() as "json" | "yaml"}
                          value={formik.values.body}
                          onChange={async (value) => {
                            setWasModified(true);
                            await formik.setFieldValue("body", value || "");
                          }}
                          options={{
                            readOnly: !!props.readonly,
                            minimap: { enabled: false },
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            wordWrap: "on"
                          }}
                        />                        
                      ) : (
                        <MarkdownEditor
                          onChange={async (value) => {
                            setWasModified(true);
                            await formik.setFieldValue("body", value || "");
                          }}
                          onFrontmatterErrorChange={async (value) => {
                            setfrontmatterState(value);
                          }}
                          value={formik.values.body}
                          isReadOnly={props.readonly}
                          contentDetails={formik.values}
                          livePreview={useLivePreview}
                          livePreviewTemplate={configSettings?.LivePreviewUrlTemplate}
                        />
                      )}
                    </Grid>
                  </Grid>
                )}
                {activeTab === "cover" && supportsCover && (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FileDropdown
                        onChange={onCoverImageChange}
                        acceptMIME="image/*"
                        maxFileSize={ContentEditMaximumImageSize}
                        data={formik.values.coverImagePending}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Cover Image Alt Text"
                        name="coverImageAlt"
                        value={formik.values.coverImageAlt || ""}
                        error={Boolean(formik.touched.coverImageAlt && formik.errors.coverImageAlt)}
                        helperText={formik.touched.coverImageAlt && formik.errors.coverImageAlt}
                        placeholder="Enter Cover Image Alt Text"
                        variant="outlined"
                        onChange={valueUpdate}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                )}
                {activeTab === "settings" && (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        disabled={props.readonly}
                        label="Slug"
                        name="slug"
                        value={formik.values.slug}
                        error={formik.touched.slug && Boolean(formik.errors.slug)}
                        helperText={formik.touched.slug && formik.errors.slug}
                        placeholder="Enter slug"
                        variant="outlined"
                        onChange={valueUpdate}
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <LanguageSelect
                        value={formik.values.language}
                        onChange={(val) => autoCompleteValueUpdate("language", val)}
                        label="Language"
                        error={formik.touched.language && Boolean(formik.errors.language)}
                        helperText={formik.touched.language && formik.errors.language}
                        name="language"
                        disabled={props.readonly}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <RemoteAutocomplete
                        type={RemoteValues.CATEGORIES}
                        label="Category"
                        placeholder="Select Category"
                        error={formik.touched.category && Boolean(formik.errors.category)}
                        helperText={formik.touched.category && formik.errors.category}
                        value={formik.values.category}
                        onChange={(ev, val) => autoCompleteValueUpdate("category", val as string)}
                        freeSolo
                        multiple={false}
                        limit={1}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <RemoteAutocomplete
                        type={RemoteValues.TAGS}
                        label="Tags"
                        placeholder="Select Tags"
                        error={formik.touched.tags && Boolean(formik.errors.tags)}
                        helperText={formik.touched.tags && formik.errors.tags}
                        value={formik.values.tags}
                        onChange={(ev, val) => autoCompleteValueUpdate("tags", val as string[])}
                        freeSolo
                        multiple
                        limit={3}
                      />
                    </Grid>
                    {supportsComments && (
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControlLabel
                          label="Allow Comments"
                          control={
                            <Checkbox
                              disabled={props.readonly}
                              checked={formik.values.allowComments}
                              onChange={(ev) =>
                                valueUpdateGeneric(
                                  "allowComments",
                                  ev.target.checked
                                )
                              }
                              name="allowComments"
                            />
                          }
                        />
                      </Grid>
                    )}
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        disabled={props.readonly}
                        label="Author"
                        name="author"
                        value={formik.values.author}
                        error={formik.touched.author && Boolean(formik.errors.author)}
                        helperText={formik.touched.author && formik.errors.author}
                        placeholder="Enter author name"
                        variant="outlined"
                        onChange={valueUpdate}
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <DatePicker
                        label="Published At"
                        disabled={props.readonly}
                        value={formik.values.publishedAt ? dayjs(formik.values.publishedAt) : null}
                        onChange={(newValue) => handleDateChange("publishedAt", newValue)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          ) : null}
        </ContentEditContainer>
      </ModuleWrapper>
    </form>
  );
};
