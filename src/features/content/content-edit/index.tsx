import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  ContentDetailsDto,
  HttpResponse,
  ProblemDetails,
  ContentTypeDetailsDto,
} from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { useConfig } from "@providers/config-provider";
import { useGlobalLanguageFilter } from "@providers/global-language-filter-provider";
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
  Collapse,
  IconButton,
} from "@mui/material";
import { useFormik, FormikHelpers } from "formik";
import {
  ContentDetails,
  ContentEditData,
  ContentEditRestoreState,
  ContentEditorAutoSave,
} from "./types";
import { ContentEditValidationScheme, ContentEditMaximumImageSize } from "./validation";
import {
  ContentTypeDropdown,
  getContentTypeByUid,
  generateDefaultValues,
  fetchAllContentTypes,
} from "../content-types";
import { toFormikValidationSchema } from "zod-formik-adapter";
import MarkdownEditor from "@components/markdown-editor";
import FileDropdown from "@components/file-dropdown";
import { buildAbsoluteUrl } from "@lib/network/utils";
import useLocalStorage from "use-local-storage";
import { RestoreDataModal } from "@components/restore-data";
import { useDebouncedCallback } from "use-debounce";
import { ValidateFrontmatterError } from "utils/frontmatter-validator";
import ContentLanguageSwitcher, { LanguageHighlights } from "@components/content-language-switcher";
import { ImageData } from "@components/file-dropdown";
import { useCoreModuleNavigation, useNotificationsService } from "@hooks";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { ModuleWrapper } from "@components/module-wrapper";
import { RemoteAutocomplete } from "@components/remote-autocomplete";
import { RemoteValues } from "@components/remote-autocomplete/types";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { LanguageSelect } from "@components/language-select";
import { execSubmitWithToast } from "utils/formik-helper";
import { CoreModule } from "@lib/router";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import {
  Trash2,
  XCircle,
  Save,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Languages,
} from "lucide-react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import MonacoEditor from "@monaco-editor/react";
import { openSitePreview } from "utils/preview-helper";
import { useUserInfo } from "@providers/user-provider";
import { TranslateDialog, TranslationType } from "@components/translate-dialog";
import { useNavigationGuard } from "@hooks";
import { useTranslationDraft } from "@providers/translation-draft-provider";
import { AITranslationProgress } from "@components/ai-translation-progress";
import { AIContentProgress } from "@components/ai-content-progress";
import { AIDraftDialog } from "@components/ai-draft-dialog";

// Extended config interface to handle settings not in the swagger definition
interface ExtendedConfig {
  settings?: {
    LivePreviewUrlTemplate?: string;
    PreviewUrlTemplate?: string;
  };
  defaultLanguage?: string;
}

interface ContentEditProps {
  readonly?: boolean;
}

const LIVE_PREVIEW_STORAGE_KEY = "content-live-preview-enabled";
const METADATA_COLLAPSED_STORAGE_KEY = "content-metadata-collapsed";

export const ContentEdit = (props: ContentEditProps) => {
  const { setSaving, setBusy } = useModuleWrapperContext();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const { notificationsService } = useNotificationsService();
  const networkContext = useRequestContext();
  const handleNavigation = useCoreModuleNavigation();
  const navigate = useNavigate();
  const { config } = useConfig();
  const { selectedLanguage } = useGlobalLanguageFilter();
  const [editorLocalStorage, setEditorLocalStorage] = useLocalStorage<ContentEditData>(
    "leadcms_editor_autosave",
    { data: [] },
    {
      logger: (error) => console.log(error),
    }
  );
  const { client } = networkContext;
  const location = useLocation();
  const {
    id,
    sourceId: routeSourceId,
    targetLanguage: routeTargetLanguage,
    type: routeType,
  } = useParams();
  const [searchParams] = useSearchParams();

  // Support both route params (new) and query params (legacy) for sourceId and translation
  const sourceId = routeSourceId || searchParams.get("sourceId");
  const translateToParam = routeTargetLanguage || searchParams.get("translateTo");
  const translationTypeParam =
    (routeType as TranslationType) || (searchParams.get("type") as TranslationType | null);

  // Check if this is an AI draft mode - either with content or on /ai-draft route
  const aiGeneratedContent = location.state?.aiGeneratedContent;
  const isAIDraftRoute = location.pathname.includes("/ai-draft");
  const isAIDraftMode = !!aiGeneratedContent || isAIDraftRoute;

  const { translationDraft, clearTranslationDraft, hasTranslationDraft, setTranslationDraft } =
    useTranslationDraft();
  const isDuplicateMode = !!sourceId && !translateToParam;
  const isTranslationMode = hasTranslationDraft || !!translateToParam;
  const [wasModified, setWasModified] = useState<boolean>(false);
  const [coverWasModified, setCoverWasModified] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDraftSaving, setIsDraftSaving] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(
    !!id || !!sourceId || isTranslationMode
  );
  const [frontmatterState, setfrontmatterState] = useState<ValidateFrontmatterError | null>(null);
  const [restoreDataState, setRestoreDataState] = useState<ContentEditRestoreState>(
    ContentEditRestoreState.Idle
  );
  const [activeTab, setActiveTab] = useState<string>("content");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [translateDialogOpen, setTranslateDialogOpen] = useState(false);
  const [createTranslationDialogOpen, setCreateTranslationDialogOpen] = useState(false);
  const [targetLanguageForTranslation, setTargetLanguageForTranslation] = useState<string>("");
  const [isCreatingTranslation, setIsCreatingTranslation] = useState(false);
  const [aiTranslationInProgress, setAiTranslationInProgress] = useState(false);
  const [aiTranslationTargetLanguage, setAiTranslationTargetLanguage] = useState<string>("");
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [sourceContent, setSourceContent] = useState<ContentDetailsDto | null>(null);
  const [useLivePreview, setUseLivePreview] = useLocalStorage(LIVE_PREVIEW_STORAGE_KEY, true);
  const [contentTypes, setContentTypes] = useState<ContentTypeDetailsDto[]>([]);
  const [contentType, setContentType] = useState<ContentTypeDetailsDto | null>(null);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [storedMetadataCollapsed, setStoredMetadataCollapsed] = useLocalStorage(
    METADATA_COLLAPSED_STORAGE_KEY,
    false
  );
  const [localMetadataCollapsed, setLocalMetadataCollapsed] = useState(false);
  const userInfo = useUserInfo();

  // AI Content Progress state
  const [aiContentInProgress, setAiContentInProgress] = useState(false);

  // AI Draft Dialog state
  const [aiDraftDialogOpen, setAiDraftDialogOpen] = useState(false);
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [aiDraftError, setAiDraftError] = useState<string | null>(null);
  const [aiRequestedContentType, setAiRequestedContentType] = useState<string>("");
  const [aiRequestedLanguage, setAiRequestedLanguage] = useState<string>("");
  const [aiDraftFormValues, setAiDraftFormValues] = useState<{
    language: string;
    contentType: string;
    prompt: string;
  } | null>(null);

  const supportsCover = contentType?.supportsCoverImage;
  const supportsComments = contentType?.supportsComments;

  // Navigation guard for unsaved changes in translation mode
  const isTranslationInProgress = !!(sourceId && translateToParam && !id);
  useNavigationGuard({
    when: isTranslationInProgress && wasModified && !isSaving,
    message: "You have unsaved translation changes. Are you sure you want to leave?",
  });

  // Check if AI assistance is available from backend config
  const configSettings = (config as ExtendedConfig)?.settings;
  const hasLivePreview = !!configSettings?.LivePreviewUrlTemplate;
  const hasSitePreview = !!configSettings?.PreviewUrlTemplate;
  const defaultLanguage = config?.defaultLanguage;

  // Helper function to call the appropriate translation API
  const createTranslationDraft = async (
    contentId: number,
    targetLanguage: string,
    translationType: TranslationType
  ) => {
    if (translationType === "AITranslation") {
      // Use AI translation endpoint
      return await client.api.contentAiTranslationDraftDetail(contentId, targetLanguage);
    } else {
      // Use traditional translation endpoint
      return await client.api.contentTranslationDraftDetail(contentId, targetLanguage, {
        transformer: translationType as "EmptyCopy" | "KeepOriginal",
      });
    }
  };

  // API-based draft save (for live preview)
  const filterEmptyValues = (obj: unknown) => {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).filter(
        ([, v]) =>
          v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)
      )
    );
  };

  const saveDraft = useDebouncedCallback(async (values: ContentDetails) => {
    // Only save draft if:
    // 1. Live preview is enabled
    // 2. Backend supports live preview
    // 3. Content was actually modified
    if (!useLivePreview || !hasLivePreview || (!wasModified && !coverWasModified)) {
      return;
    }

    try {
      setIsDraftSaving(true);
      const filteredValues = filterEmptyValues(values);
      if (id) {
        await client.api.contentDraftPartialUpdate(Number(id), filteredValues);
      } else {
        await client.api.contentDraftCreate(filteredValues);
      }
      // Add 1 second delay, then refresh iframe
      // setTimeout(() => {
      //   setIframeKey(Date.now());
      // }, 1000);
    } catch (error) {
      console.error("Failed to save draft:", error);
      // Don't show error to user for draft saves to avoid interrupting their workflow
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
    // Always trim slashes from slug before using it anywhere (e.g., image upload, API calls)
    const trimmedSlug = values.slug ? values.slug.replace(/^\/+|\/+$/g, "") : values.slug;
    if (coverWasModified && values.coverImagePending && values.coverImagePending.url) {
      const blob = await (await fetch(values.coverImagePending.url)).blob();
      const file = new File([blob], values.coverImagePending.fileName || "image.jpg");
      // Always use trimmedSlug for ScopeUid
      const imageUploadingResponse = await client.api.mediaCreate({
        File: file,
        ScopeUid: trimmedSlug,
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
        slug: trimmedSlug,
        coverImageUrl: coverUrl,
      });
    } else {
      response = await client.api.contentCreate({
        ...values,
        slug: trimmedSlug,
        coverImageUrl: coverUrl,
      });
    }
    // Patch ContentDetails fields that are not present in ContentDetailsDto
    const patched: ContentDetails = {
      ...response.data,
      id: response.data.id ? response.data.id.toString() : null,
      coverImagePending: {
        url: response.data.coverImageUrl ? buildAbsoluteUrl(response.data.coverImageUrl) : "",
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
      translationKey: null,
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
      files: [],
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
    const currentContentType = await getContentTypeByUid(client, currentValues.type);
    const shouldResetBody = !currentContentType || currentContentType.format !== contentType.format;

    // Preserve existing values, only update content type specific fields
    formik.setValues({
      ...currentValues,
      // Always update the content type
      type: contentTypeId,
      // Reset body content only if format has changed
      body: shouldResetBody ? defaults.body : currentValues.body,
      // Apply content type specific defaults for these fields only if they don't have values
      allowComments:
        currentValues.allowComments !== undefined
          ? currentValues.allowComments
          : defaults.allowComments,
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
            // Don't show restore dialog when we're in translation mode or creating from source
            if (
              !hasTranslationDraft &&
              !sourceId &&
              localStorageSnapshot.data.filter((data) => data.id === id).length > 0
            ) {
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
          await formik.setFieldValue("coverImagePending", patched.coverImagePending);
        } else if (sourceId && translateToParam) {
          // Handle translation mode via URL parameters
          // If we have a translation type from URL, use it; otherwise show dialog
          if (translationTypeParam) {
            // Check if we already have translated content loaded to avoid double translation
            // This happens when dialog completes translation and navigates to URL with type param
            const hasExistingContent =
              wasModified && formik.values.title && formik.values.title.trim() !== "";

            if (!hasExistingContent) {
              // Only trigger translation if we don't already have content loaded
              setIsCreatingTranslation(true);

              // Show AI progress for AI translation
              if (translationTypeParam === "AITranslation") {
                setAiTranslationInProgress(true);
                setAiTranslationTargetLanguage(translateToParam);
              }

              try {
                // Create translation draft using the appropriate API
                const { data } = await createTranslationDraft(
                  parseInt(sourceId),
                  translateToParam as string,
                  translationTypeParam as TranslationType
                );

                // Load the translation data directly
                const translatedContent: ContentDetails = {
                  ...data,
                  id: null,
                  createdAt: null,
                  updatedAt: null,
                  coverImagePending: {
                    url: data.coverImageUrl ? buildAbsoluteUrl(data.coverImageUrl) : "",
                    fileName: "",
                  },
                  files: [],
                } as ContentDetails;
                await formik.setValues(translatedContent);
                await formik.setFieldValue(
                  "coverImagePending",
                  translatedContent.coverImagePending
                );
                setWasModified(true);

                // Hide AI progress
                setAiTranslationInProgress(false);
                setAiTranslationTargetLanguage("");

                // DON'T navigate away - keep the URL parameters for language controls to work
                // navigate(`/content/new?type=${translationTypeParam}`, { replace: true });
              } catch (error: unknown) {
                console.error("Failed to create translation:", error);

                // Hide AI progress on error
                setAiTranslationInProgress(false);
                setAiTranslationTargetLanguage("");

                // Handle 409 Conflict - translation draft already exists
                if ((error as { status?: number })?.status === 409) {
                  try {
                    // Try to fetch existing translations
                    const translationsResponse = await client.api.contentTranslationsList(
                      parseInt(sourceId)
                    );
                    const existingTranslation = translationsResponse.data.find(
                      (t) => t.language === translateToParam
                    );

                    if (existingTranslation) {
                      // Load the existing translation
                      const translatedContent: ContentDetails = {
                        ...existingTranslation,
                        id: existingTranslation.id?.toString() || null,
                        coverImagePending: {
                          url: existingTranslation.coverImageUrl
                            ? buildAbsoluteUrl(existingTranslation.coverImageUrl)
                            : "",
                          fileName: "",
                        },
                        files: [],
                      } as ContentDetails;
                      await formik.setValues(translatedContent);
                      await formik.setFieldValue(
                        "coverImagePending",
                        translatedContent.coverImagePending
                      );
                      // Don't mark as modified since we're loading existing content
                      setWasModified(false);

                      notificationsService.info(
                        "Loaded existing translation draft for " + translateToParam.toUpperCase()
                      );

                      // Update the URL to reflect the existing content
                      navigate(`/content/${existingTranslation.id}/edit`, { replace: true });
                      return;
                    }
                  } catch (fetchError) {
                    console.error("Failed to fetch existing translations:", fetchError);
                  }

                  // Show user-friendly error message for conflict
                  notificationsService.error(
                    "A translation draft for this language already exists. " +
                      "Please check the translations list."
                  );
                  // Reset the creation state and let the useEffect complete normally
                  setIsCreatingTranslation(false);
                  // Navigate back to source content after a brief delay to ensure state is clean
                  setTimeout(() => {
                    navigate(`/content/${sourceId}/edit`, { replace: true });
                  }, 100);
                  return;
                }

                // For other errors, show generic error message
                notificationsService.error(
                  error instanceof Error ? error.message : "Failed to create translation draft"
                );
                // Reset the creation state and let the useEffect complete normally
                setIsCreatingTranslation(false);
                // Navigate back to source content after a brief delay to ensure state is clean
                setTimeout(() => {
                  navigate(`/content/${sourceId}/edit`, { replace: true });
                }, 100);
              } finally {
                setIsCreatingTranslation(false);
              }
            }
          } else {
            // Fetch source content
            try {
              if (client && sourceId) {
                // Fetch original content
                const sourceContentResponse = await client.api.contentDetail(Number(sourceId));
                setSourceContent(sourceContentResponse.data);
              }
            } catch (error) {
              console.error("Failed to fetch source content:", error);
            }

            // Show the translation dialog to get transformer settings
            setTargetLanguageForTranslation(translateToParam as string);
            setCreateTranslationDialogOpen(true);
          }
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
          await formik.setFieldValue("coverImagePending", duplicatedContent.coverImagePending);
          setWasModified(true); // Mark as modified since it's duplicated content
        } else if (isTranslationMode && translationDraft) {
          // Load content for translation using context data (fallback for existing workflow)
          const translatedContent: ContentDetails = {
            ...translationDraft,
            id: null,
            createdAt: null,
            updatedAt: null,
            publishedAt: null,
            coverImagePending: {
              url: translationDraft.coverImageUrl
                ? buildAbsoluteUrl(translationDraft.coverImageUrl)
                : "",
              fileName: "",
            },
            files: [],
          } as ContentDetails;
          await formik.setValues(translatedContent);
          await formik.setFieldValue("coverImagePending", translatedContent.coverImagePending);
          setWasModified(true); // Mark as modified since it's translated content
          // Clear the translation draft after loading
          clearTranslationDraft();
        } else if (isAIDraftMode && aiGeneratedContent) {
          // Load AI-generated content
          const aiContent: ContentDetails = {
            ...aiGeneratedContent,
            id: null,
            createdAt: null,
            updatedAt: null,
            publishedAt: null,
            coverImagePending: {
              url: aiGeneratedContent.coverImageUrl
                ? buildAbsoluteUrl(aiGeneratedContent.coverImageUrl)
                : "",
              fileName: "",
            },
            files: [],
          } as ContentDetails;
          await formik.setValues(aiContent);
          await formik.setFieldValue("coverImagePending", aiContent.coverImagePending);
          setWasModified(true); // Mark as modified since it's AI generated content

          // Clean up the location state to prevent reloading on refresh
          navigate("/content/ai-draft", { replace: true, state: {} });
        }
        setIsInitialLoading(false);
      } catch (e) {
        console.log(e);
        setIsInitialLoading(false);
      }
    });
  }, [
    client,
    id,
    sourceId,
    translateToParam,
    translationTypeParam,
    restoreDataState,
    translationDraft,
    hasTranslationDraft,
  ]);

  useEffect(() => {
    autoSave(formik.values);
    saveDraft(formik.values);
  }, [formik.values]);

  const isCreateMode = !id && !isDuplicateMode && !isTranslationMode && !isAIDraftMode;
  const shouldShowForm =
    isCreateMode || isDuplicateMode || isTranslationMode || isAIDraftMode || !isInitialLoading;
  const hasMultipleLanguages = (config?.languages?.length || 0) > 1;

  // Determine if metadata should be collapsed:
  // - For new content creation: use local state (starts expanded, doesn't persist)
  // - For editing existing content: use localStorage preference
  const isMetadataCollapsed = isCreateMode ? localMetadataCollapsed : storedMetadataCollapsed;

  // Function to set metadata collapsed state
  const setIsMetadataCollapsed = (collapsed: boolean) => {
    if (isCreateMode) {
      // For create mode, use local state (doesn't persist)
      setLocalMetadataCollapsed(collapsed);
    } else {
      // For edit mode, persist to localStorage
      setStoredMetadataCollapsed(collapsed);
    }
  };

  // Set default content type for new content when contentTypes are loaded
  useEffect(() => {
    if (isCreateMode && contentTypes.length > 0 && !formik.values.type) {
      // Sort alphabetically by uid for consistency with dropdown
      const sorted = [...contentTypes].sort((a, b) => a.uid.localeCompare(b.uid));
      formik.setFieldValue("type", sorted[0].uid, false);
    }
  }, [isCreateMode, contentTypes, formik.values.type, isTranslationMode]);

  // Set default language for new content based on global language filter
  useEffect(() => {
    if (
      isCreateMode &&
      config?.languages &&
      config.languages.length > 0 &&
      !formik.values.language
    ) {
      let defaultLang: string;

      // If global language filter is set to a specific language, use that
      if (selectedLanguage && selectedLanguage !== "all") {
        defaultLang = selectedLanguage;
      } else {
        // If "All Languages" or no selection, use first language from config
        defaultLang = config.languages[0].code || "";
      }

      formik.setFieldValue("language", defaultLang, false);
    }
  }, [
    isCreateMode,
    config?.languages,
    formik.values.language,
    selectedLanguage,
    isTranslationMode,
  ]);

  // Set language when in translation mode
  useEffect(() => {
    if (translateToParam && formik.values.language !== translateToParam) {
      formik.setFieldValue("language", translateToParam, false);
    }
  }, [translateToParam, formik.values.language]);

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
      const found = contentTypes.find((t) => t.uid === formik.values.type);
      setContentType(found || null);
    } else {
      setContentType(null);
    }
  }, [formik.values.type, contentTypes]);

  // Handle AI draft mode - open dialog if no content is provided
  useEffect(() => {
    if (
      isAIDraftRoute &&
      !aiGeneratedContent &&
      !aiDraftDialogOpen &&
      !formik.values.title &&
      !formik.values.body
    ) {
      setAiDraftDialogOpen(true);
    }
  }, [isAIDraftRoute, aiGeneratedContent, formik.values.title, formik.values.body]);

  // Load content types for AI draft dialog
  useEffect(() => {
    const loadContentTypes = async () => {
      if (client && isAIDraftMode) {
        try {
          const types = await fetchAllContentTypes(client);
          setContentTypes(Array.isArray(types) ? types : []);
        } catch (error) {
          console.error("Failed to load content types:", error);
        }
      }
    };
    loadContentTypes();
  }, [client, isAIDraftMode]);

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

  // Helper to determine which preview template to use
  const getPreviewTemplate = () => {
    if (!wasModified) {
      return configSettings?.PreviewUrlTemplate;
    }
    return configSettings?.LivePreviewUrlTemplate;
  };

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

  // Handler for translate action
  const handleTranslateConfirm = async (
    targetLanguage: string,
    translationType: TranslationType
  ) => {
    if (!id) return;
    try {
      const { data } = await createTranslationDraft(parseInt(id), targetLanguage, translationType);
      // Set the translation draft and navigate to new content page
      setTranslationDraft(data);
      navigate("/content/new");
    } catch (error: unknown) {
      console.error("Failed to create translation draft:", error);

      // Handle 409 Conflict - translation draft already exists
      if ((error as { status?: number })?.status === 409) {
        try {
          // Try to fetch existing translations
          const translationsResponse = await client.api.contentTranslationsList(parseInt(id));
          const existingTranslation = translationsResponse.data.find(
            (t) => t.language === targetLanguage
          );

          if (existingTranslation && existingTranslation.id) {
            // Navigate to edit the existing translation
            navigate(`/content/${existingTranslation.id}/edit`);
            notificationsService.info(
              "Opened existing translation draft for " + targetLanguage.toUpperCase()
            );
            return;
          }
        } catch (fetchError) {
          console.error("Failed to fetch existing translations:", fetchError);
        }

        // Show user-friendly error message for conflict
        notificationsService.error(
          "A translation draft for this language already exists. " +
            "Please check the translations list."
        );
        return;
      }

      // For other errors, show generic error message
      notificationsService.error(
        error instanceof Error ? error.message : "Failed to create translation draft"
      );
    }
  };

  // Handler for language switching within the current content
  const handleLanguageChange = async (language: string, translationId?: number) => {
    if (translationId) {
      // Navigate to the existing translation edit page
      navigate(`/content/${translationId}/edit`);
    } else {
      // Update the current form's language field
      formik.setFieldValue("language", language);
      setWasModified(true);
    }
  };

  // Handler for creating a new translation
  const handleCreateTranslation = async (targetLanguage: string) => {
    if (!id) return;
    // Navigate to translation route
    navigate(`/content/${id}/translate/${targetLanguage}`);
  };

  // Handler for translation confirmation from dialog
  const handleCreateTranslationConfirm = async (
    targetLanguage: string,
    translationType: TranslationType
  ) => {
    // Check if we're in URL parameter mode
    if (sourceId && translateToParam) {
      setIsCreatingTranslation(true);
      setTranslationError(null);

      // Show AI progress for AI translation
      if (translationType === "AITranslation") {
        setAiTranslationInProgress(true);
        setAiTranslationTargetLanguage(targetLanguage);
      }

      try {
        const { data } = await createTranslationDraft(
          parseInt(sourceId),
          targetLanguage,
          translationType
        );

        // Load the translation data directly
        const translatedContent: ContentDetails = {
          ...data,
          id: null,
          createdAt: null,
          updatedAt: null,
          publishedAt: null,
          coverImagePending: {
            url: data.coverImageUrl ? buildAbsoluteUrl(data.coverImageUrl) : "",
            fileName: "",
          },
          files: [],
        } as ContentDetails;

        await formik.setValues(translatedContent);
        await formik.setFieldValue("coverImagePending", translatedContent.coverImagePending);
        setWasModified(true);
        setCreateTranslationDialogOpen(false);
        setIsInitialLoading(false);

        // Hide AI progress
        setAiTranslationInProgress(false);
        setAiTranslationTargetLanguage("");

        // Update URL to include the type parameter for future refreshes
        navigate(`/content/${sourceId}/translate/${targetLanguage}/${translationType}`, {
          replace: true,
        });
      } catch (error: unknown) {
        console.error("Failed to create translation draft:", error);

        // Handle 409 Conflict - translation draft already exists
        if ((error as { status?: number })?.status === 409) {
          try {
            // Try to fetch existing translations
            const translationsResponse = await client.api.contentTranslationsList(
              parseInt(sourceId)
            );
            const existingTranslation = translationsResponse.data.find(
              (t) => t.language === targetLanguage
            );

            if (existingTranslation && existingTranslation.id) {
              // Load the existing translation
              const translatedContent: ContentDetails = {
                ...existingTranslation,
                id: existingTranslation.id?.toString() || null,
                coverImagePending: {
                  url: existingTranslation.coverImageUrl
                    ? buildAbsoluteUrl(existingTranslation.coverImageUrl)
                    : "",
                  fileName: "",
                },
                files: [],
              } as ContentDetails;
              await formik.setValues(translatedContent);
              await formik.setFieldValue("coverImagePending", translatedContent.coverImagePending);
              setWasModified(false); // Don't mark as modified since we're loading existing content
              setCreateTranslationDialogOpen(false);
              setIsInitialLoading(false);

              // Navigate to edit the existing translation
              navigate(`/content/${existingTranslation.id}/edit`, { replace: true });
              return;
            }
          } catch (fetchError) {
            console.error("Failed to fetch existing translations:", fetchError);
          }

          // Show user-friendly error message for conflict
          setTranslationError(
            "A translation draft for this language already exists. " +
              "Please check the translations list."
          );
        } else {
          // For other errors, show generic error message
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create translation";
          setTranslationError(errorMessage);
        }
      } finally {
        setIsCreatingTranslation(false);
        // Hide AI progress on error
        setAiTranslationInProgress(false);
        setAiTranslationTargetLanguage("");
      }
    } else if (id) {
      // Original flow for existing content
      // Show AI progress for AI translation
      if (translationType === "AITranslation") {
        setAiTranslationInProgress(true);
        setAiTranslationTargetLanguage(targetLanguage);
      }

      try {
        const { data } = await createTranslationDraft(
          parseInt(id),
          targetLanguage,
          translationType
        );
        // Set the translation draft and navigate to new content page
        setTranslationDraft(data);

        // Hide AI progress on success
        setAiTranslationInProgress(false);
        setAiTranslationTargetLanguage("");

        navigate("/content/new");
      } catch (error: unknown) {
        console.error("Failed to create translation draft:", error);

        // Handle 409 Conflict - translation draft already exists
        if ((error as { status?: number })?.status === 409) {
          try {
            // Try to fetch existing translations
            const translationsResponse = await client.api.contentTranslationsList(parseInt(id));
            const existingTranslation = translationsResponse.data.find(
              (t) => t.language === targetLanguage
            );

            if (existingTranslation && existingTranslation.id) {
              // Navigate to edit the existing translation
              navigate(`/content/${existingTranslation.id}/edit`);
              notificationsService.info(
                "Opened existing translation draft for " + targetLanguage.toUpperCase()
              );
              return;
            }
          } catch (fetchError) {
            console.error("Failed to fetch existing translations:", fetchError);
          }

          // Show user-friendly error message for conflict
          notificationsService.error(
            "A translation draft for this language already exists. " +
              "Please check the translations list."
          );
        } else {
          // For other errors, show generic error message
          notificationsService.error(
            error instanceof Error ? error.message : "Failed to create translation draft"
          );
        }
      } finally {
        // Hide AI progress on error
        setAiTranslationInProgress(false);
        setAiTranslationTargetLanguage("");
      }
    }
  };

  // Handler for site preview
  const handleSitePreview = () => {
    const params = {
      ...formik.values,
      userId: userInfo?.details?.id || "",
    };
    const success = openSitePreview(
      params as unknown as Record<string, unknown>,
      configSettings?.PreviewUrlTemplate || "",
      defaultLanguage
    );
    if (!success) {
      notificationsService.error(
        "Cannot open site preview. Please ensure all required fields are filled."
      );
    }
  };

  // Handler for AI draft creation
  const handleAIDraftCreate = async (language: string, contentType: string, prompt: string) => {
    setAiDraftLoading(true);
    setAiDraftError(null);
    setAiRequestedContentType(contentType);
    setAiRequestedLanguage(language);

    // Save form values in case we need to restore them on error
    setAiDraftFormValues({ language, contentType, prompt });

    // Close dialog and show progress
    setAiDraftDialogOpen(false);
    setAiContentInProgress(true);

    try {
      const { data } = await client.api.contentAiDraftCreate({
        language,
        contentType,
        prompt,
      });

      // Set up the AI-generated content for editing
      const aiContent: ContentDetails = {
        ...data,
        id: null,
        createdAt: null,
        updatedAt: null,
        publishedAt: null,
        coverImagePending: {
          url: data.coverImageUrl ? buildAbsoluteUrl(data.coverImageUrl) : "",
          fileName: "",
        },
        files: [],
      } as ContentDetails;

      await formik.setValues(aiContent);
      await formik.setFieldValue("coverImagePending", aiContent.coverImagePending);
      setWasModified(true); // Mark as modified since it's AI-generated content

      // Ensure dialog is closed on success
      setAiDraftDialogOpen(false);
      setAiDraftError(null);
      setAiDraftFormValues(null); // Clear saved form values on success

      // Navigate away from ai-draft route to prevent dialog from reopening
      if (isAIDraftRoute) {
        navigate("/content/new", { replace: true });
      }

      // Show success message
      notificationsService.success("AI draft created successfully!");
    } catch (error: unknown) {
      console.error("Failed to create AI draft:", error);

      // Extract error message from backend response
      let errorMessage = "Failed to create AI draft";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        // Handle different error response structures
        const errorObj = error as Record<string, unknown>;

        // Check for the specific error structure: { data: null, error: { title: "...", ... } }
        if (errorObj.error && typeof errorObj.error === "object") {
          const errorDetails = errorObj.error as Record<string, unknown>;
          if (errorDetails.title && typeof errorDetails.title === "string") {
            errorMessage = errorDetails.title;
          } else if (errorDetails.message && typeof errorDetails.message === "string") {
            errorMessage = errorDetails.message;
          } else if (errorDetails.detail && typeof errorDetails.detail === "string") {
            errorMessage = errorDetails.detail;
          }
        }
        // Check direct error object properties (fallback)
        else if (errorObj.title && typeof errorObj.title === "string") {
          errorMessage = errorObj.title;
        } else if (errorObj.message && typeof errorObj.message === "string") {
          errorMessage = errorObj.message;
        } else if (errorObj.detail && typeof errorObj.detail === "string") {
          errorMessage = errorObj.detail;
        }
        // Check nested response data (existing logic)
        else {
          const response = errorObj.response as Record<string, unknown> | undefined;
          const responseData = response?.data as Record<string, unknown> | undefined;

          if (responseData?.message && typeof responseData.message === "string") {
            errorMessage = responseData.message;
          } else if (responseData?.title && typeof responseData.title === "string") {
            errorMessage = responseData.title;
          } else if (responseData?.detail && typeof responseData.detail === "string") {
            errorMessage = responseData.detail;
          }
        }
      }

      setAiDraftError(errorMessage);
      // Reopen dialog on error so user can retry
      setAiDraftDialogOpen(true);
    } finally {
      setAiDraftLoading(false);
      setAiContentInProgress(false);
    }
  };

  // Helper function to get content type display name
  const getContentTypeDisplayName = () => {
    if (!contentType) return formik.values.type || "Unknown";
    return contentType.uid || "Unknown";
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <ModuleWrapper
        breadcrumbs={[]}
        currentBreadcrumb={formik.values.title}
        isForm={true}
        actionButtons={
          <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ pl: { sm: 4 } }}>
              {!isCreateMode && !isDuplicateMode && !isTranslationMode && (
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
              {!isCreateMode && !isDuplicateMode && !isTranslationMode && (
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
              {hasMultipleLanguages && !isCreateMode && !isDuplicateMode && !isTranslationMode && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Languages />}
                  onClick={() => setTranslateDialogOpen(true)}
                  disabled={formik.isSubmitting}
                  size="medium"
                >
                  Translate
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

              {hasMultipleLanguages && (
                <TranslateDialog
                  open={translateDialogOpen}
                  onClose={() => setTranslateDialogOpen(false)}
                  onTranslate={handleTranslateConfirm}
                  originalLanguage={formik.values.language}
                  originalTitle={formik.values.title}
                />
              )}

              {hasMultipleLanguages && (
                <TranslateDialog
                  open={createTranslationDialogOpen}
                  onClose={() => {
                    setCreateTranslationDialogOpen(false);
                    setTranslationError(null);
                  }}
                  onTranslate={handleCreateTranslationConfirm}
                  originalLanguage={sourceContent?.language || formik.values.language}
                  originalTitle={sourceContent?.title || formik.values.title}
                  preselectedLanguage={targetLanguageForTranslation}
                  isLoading={isCreatingTranslation}
                  error={translationError}
                  readonly={true}
                />
              )}
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
            <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <CardContent
                sx={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}
              >
                {/* Collapsible Metadata Section */}
                <Box sx={{ mb: 2 }}>
                  {/* Collapsed Header */}
                  {isMetadataCollapsed && (
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
                      onClick={() => setIsMetadataCollapsed(false)}
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
                        {/* Title, Description and Content Type on the same line */}
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
                              {formik.values.title || "Untitled"}
                              {formik.values.description && (
                                <Typography
                                  component="span"
                                  variant="body2"
                                  sx={{
                                    color: "text.secondary",
                                    fontWeight: 400,
                                    ml: 1,
                                  }}
                                >
                                  - {formik.values.description}
                                </Typography>
                              )}
                            </Typography>
                          </Box>

                          {/* Content Type badge on the right */}
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
                            {getContentTypeDisplayName()}
                          </Box>
                        </Box>

                        {/* Language Highlights on the second line */}
                        {hasMultipleLanguages &&
                          (formik.values.id || (sourceId && translateToParam)) && (
                            <LanguageHighlights
                              contentId={
                                sourceId && translateToParam
                                  ? parseInt(sourceId)
                                  : parseInt(formik.values.id || "0")
                              }
                              currentLanguage={formik.values.language || ""}
                              onLanguageChange={handleLanguageChange}
                              onCreateTranslation={handleCreateTranslation}
                              sourceContentId={sourceId ? parseInt(sourceId) : undefined}
                              isTranslationMode={Boolean(sourceId && translateToParam)}
                            />
                          )}
                      </Box>
                      <IconButton size="small">
                        <ChevronDown size={20} />
                      </IconButton>
                    </Box>
                  )}

                  {/* Expanded Header */}
                  {!isMetadataCollapsed && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      {/* Left side: Compact Language Switcher */}
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {hasMultipleLanguages &&
                          (formik.values.id || (sourceId && translateToParam)) && (
                            <ContentLanguageSwitcher
                              contentId={
                                sourceId && translateToParam
                                  ? parseInt(sourceId)
                                  : parseInt(formik.values.id || "0")
                              }
                              currentLanguage={formik.values.language || ""}
                              onLanguageChange={handleLanguageChange}
                              onCreateTranslation={handleCreateTranslation}
                              compact={true}
                              sourceContentId={sourceId ? parseInt(sourceId) : undefined}
                              isTranslationMode={Boolean(sourceId && translateToParam)}
                            />
                          )}
                      </Box>

                      {/* Right side: Collapse button */}
                      <IconButton
                        size="small"
                        onClick={() => setIsMetadataCollapsed(true)}
                        sx={{ color: "text.secondary" }}
                      >
                        <ChevronUp size={20} />
                      </IconButton>
                    </Box>
                  )}

                  {/* Collapsible Content */}
                  <Collapse in={!isMetadataCollapsed}>
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
                  </Collapse>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                    ...(isMetadataCollapsed && {
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      p: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }),
                  }}
                >
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
                          color: hasContentErrors ? "error.main" : "primary.main",
                        },
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
                            color: hasCoverErrors ? "error.main" : "primary.main",
                          },
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
                          color: hasSettingsErrors ? "error.main" : "primary.main",
                        },
                      }}
                    />
                  </Tabs>
                  <Box sx={{ flex: 1 }} />
                  {hasLivePreview &&
                    (contentType?.format === "MDX" || contentType?.format === "MD") && (
                      <FormControlLabel
                        control={
                          isDraftSaving ? (
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                          ) : (
                            <Switch
                              checked={useLivePreview}
                              onChange={(e) => {
                                const newValue = e.target.checked;
                                setUseLivePreview(newValue);
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
                        label={
                          <Typography variant="body2" component="span">
                            {isDraftSaving ? "Saving Draft..." : "Live Preview"}
                          </Typography>
                        }
                        sx={{ mr: 2 }}
                      />
                    )}
                  {/* Manual refresh button for live preview */}
                  {hasLivePreview &&
                    useLivePreview &&
                    (contentType?.format === "MDX" || contentType?.format === "MD") && (
                      <IconButton
                        aria-label="Refresh preview"
                        onClick={() => setIframeKey(Date.now())}
                        sx={{ color: "#1976d2", mr: 1 }}
                        size="small"
                      >
                        <RefreshCw size={20} />
                      </IconButton>
                    )}
                  {/* Show Preview on Site only for saved/existing content */}
                  {hasSitePreview && id && (
                    <Button
                      variant="text"
                      onClick={handleSitePreview}
                      endIcon={<ExternalLink size={20} />}
                      sx={{
                        color: "#1976d2",
                        textTransform: "none",
                        fontSize: 14,
                        pl: 0,
                        pr: 3,
                        minWidth: 0,
                        "&:hover": { textDecoration: "underline", background: "none" },
                      }}
                    >
                      Preview on Site
                    </Button>
                  )}
                </Box>
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                  {activeTab === "content" && (
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
                        <Grid
                          size={{ xs: 12, sm: 12 }}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            minHeight: 0,
                            height: "100%",
                          }}
                        >
                          {contentType?.format === "JSON" || contentType?.format === "YAML" ? (
                            <MonacoEditor
                              height={
                                isMetadataCollapsed ? "calc(100vh - 325px)" : "calc(100vh - 500px)"
                              }
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
                                wordWrap: "on",
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
                              livePreviewTemplate={getPreviewTemplate()}
                              key={iframeKey}
                              isMetadataCollapsed={isMetadataCollapsed}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </Box>
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
                          error={Boolean(
                            formik.touched.coverImageAlt && formik.errors.coverImageAlt
                          )}
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
                    <Grid container spacing={6} sx={{ mt: 2 }}>
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
                      {hasMultipleLanguages && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <LanguageSelect
                            value={formik.values.language}
                            onChange={(val) => autoCompleteValueUpdate("language", val)}
                            label="Language"
                            error={formik.touched.language && Boolean(formik.errors.language)}
                            helperText={formik.touched.language && formik.errors.language}
                            name="language"
                            disabled={props.readonly || isTranslationMode}
                          />
                        </Grid>
                      )}
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
                                  valueUpdateGeneric("allowComments", ev.target.checked)
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
                          value={
                            formik.values.publishedAt ? dayjs(formik.values.publishedAt) : null
                          }
                          onChange={(newValue) => handleDateChange("publishedAt", newValue)}
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </CardContent>
            </Card>
          ) : null}
        </ContentEditContainer>
      </ModuleWrapper>

      {/* AI Translation Progress Dialog */}
      <AITranslationProgress
        open={aiTranslationInProgress}
        targetLanguage={aiTranslationTargetLanguage}
        originalTitle={formik.values.title}
      />

      {/* AI Draft Dialog */}
      <AIDraftDialog
        open={aiDraftDialogOpen}
        onClose={() => {
          setAiDraftDialogOpen(false);
          setAiDraftError(null);
          setAiDraftFormValues(null); // Clear saved form values when closing
          // Navigate back to content list only if no content has been generated
          if (!formik.values.title && !formik.values.body) {
            navigate("/content");
          }
        }}
        onCreate={handleAIDraftCreate}
        contentTypes={contentTypes}
        isLoading={aiDraftLoading}
        error={aiDraftError}
        onErrorClear={() => setAiDraftError(null)}
        initialValues={aiDraftFormValues || undefined}
      />

      {/* AI Content Progress Dialog */}
      <AIContentProgress
        open={aiContentInProgress}
        contentType={aiRequestedContentType}
        language={aiRequestedLanguage}
      />
    </form>
  );
};
