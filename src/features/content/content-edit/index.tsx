import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useConfig } from "@providers/config-provider";
import { useUserInfo } from "@providers/user-provider";
import {
  useNavigationGuard,
  usePublicationDialogPreference,
  useSaveShortcut,
  useNotificationsService,
} from "@hooks";
import { TranslationType } from "@components/translate-dialog";
import { useRequestContext } from "@providers/request-provider";
import { useGlobalLanguageFilter } from "@providers/global-language-filter-provider";
import { useLayout } from "@providers/layout-provider";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { showApiError } from "@utils/api-error-parser";
import {
  getContentLengthSettings,
  validateTitleLength,
  validateDescriptionLength,
} from "@utils/content-validation-helper";
import { shouldShowPublicationDialog } from "@utils/publication-helper";

// Import our custom hooks
import {
  useContentFormOperations,
  useContentDataOperations,
  useAIContentOperations,
  useTranslationOperations,
} from "./hooks";

// Import components
import {
  ContentEditActionButtons,
  ContentEditMetadataSection,
  ContentChangeLog,
} from "./components";
import { UnifiedAIProgress } from "@components/unified-ai-progress";
import { AIDraftDialog, TokenEstimation } from "@components/ai-draft-dialog";
import { AIEditDialog } from "@components/ai-edit-dialog";
import { AICoverDialog } from "@components/ai-cover-dialog";
import { TranslateDialog } from "@components/translate-dialog";
import { PublicationStatusDialog, PublicationStatus } from "@components/publication-status-dialog";

import { ModuleWrapper } from "@components/module-wrapper";

// Import UI components
import {
  Card,
  CardContent,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Switch,
  Typography,
  FormControlLabel,
  IconButton,
  Button,
  Grid,
  TextField,
  Checkbox,
  Stack,
  Skeleton,
} from "@mui/material";
import { RefreshCw, ExternalLink } from "lucide-react";

// Import existing components and utilities
import { ContentEditContainer } from "../index.styled";
import { ContentDetails } from "./types";
import { generateDefaultValues, idToDisplayName, ContentFormat } from "../content-types";
import MDXEditorNew from "@components/mdx-editor-new";
import ValidationStatusBubble from "@components/validation-status-bubble";
import CoverImageEditor from "@components/image-selection-dialog";
import { RemoteAutocomplete } from "@components/remote-autocomplete";
import { RemoteValues } from "@components/remote-autocomplete/types";
import { LanguageSelect } from "@components/language-select";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import MonacoEditor, { loader } from "@monaco-editor/react";
import { openSitePreview } from "utils/preview-helper";

import useLocalStorage from "use-local-storage";

/**
 * Pin Monaco to 0.52.0 to avoid the "InstantiationService has been
 * disposed" regression shipped in 0.55.x.
 */
loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs",
  },
});

// Extended config interface to handle settings not in the swagger definition
interface ExtendedConfig {
  settings?: {
    LivePreviewUrlTemplate?: string;
    PreviewUrlTemplate?: string;
  };
  defaultLanguage?: string;
  capabilities?: string[];
}

interface ContentEditProps {
  readonly?: boolean;
}

const METADATA_COLLAPSED_STORAGE_KEY = "content-metadata-collapsed";

export const ContentEdit = (props: ContentEditProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { config } = useConfig();
  const userInfo = useUserInfo();
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const { selectedLanguage } = useGlobalLanguageFilter();
  const { setFullWidth } = useLayout();

  // Set full width layout for content editor
  useEffect(() => {
    setFullWidth(true);
    return () => {
      setFullWidth(false);
    };
  }, [setFullWidth]);

  // Route parameters
  const {
    id,
    sourceId: routeSourceId,
    targetLanguage: routeTargetLanguage,
    type: routeType,
  } = useParams();
  const [searchParams] = useSearchParams();

  // Support both route params (new) and query params (legacy)
  const sourceId = routeSourceId || searchParams.get("sourceId");
  const translateToParam = routeTargetLanguage || searchParams.get("translateTo");
  const translationTypeParam =
    (routeType as TranslationType) || (searchParams.get("type") as TranslationType | null);

  // Determine operation modes
  const aiGeneratedContent = location.state?.aiGeneratedContent;
  const isAIDraftRoute = location.pathname.includes("/ai-draft");
  const isAIDraftMode = !!aiGeneratedContent || isAIDraftRoute;
  const isDuplicateMode = !!sourceId && !translateToParam;
  const isTranslationMode = !!translateToParam;
  const isCreateMode = !id && !isDuplicateMode && !isTranslationMode && !isAIDraftMode;

  // UI state
  const [activeTab, setActiveTab] = useState<string>("content");
  const [storedMetadataCollapsed, setStoredMetadataCollapsed] = useLocalStorage(
    METADATA_COLLAPSED_STORAGE_KEY,
    false
  );
  const [localMetadataCollapsed, setLocalMetadataCollapsed] = useState(false);

  // Dialog states
  const [translateDialogOpen, setTranslateDialogOpen] = useState(false);
  const [createTranslationDialogOpen, setCreateTranslationDialogOpen] = useState(false);
  const [aiDraftDialogOpen, setAiDraftDialogOpen] = useState(false);
  const [aiEditDialogOpen, setAiEditDialogOpen] = useState(false);
  const [publicationStatusDialogOpen, setPublicationStatusDialogOpen] = useState(false);

  // AI Progress states
  const [aiProgressOpen, setAiProgressOpen] = useState(false);
  const [aiProgressType, setAiProgressType] = useState<
    "content" | "translation" | "edit" | "cover"
  >("content");
  const [aiProgressProps, setAiProgressProps] = useState<{
    contentType?: string;
    language?: string;
    targetLanguage?: string;
    originalTitle?: string;
    contentTitle?: string;
    estimatedOutputTokens?: number;
    estimatedSeconds?: number;
  }>({});
  const [aiOperationComplete, setAiOperationComplete] = useState(false);

  // Translation state
  const [targetLanguageForTranslation, setTargetLanguageForTranslation] = useState<string>("");
  // removed unused states processedTranslationUrl and shouldOpenTranslationDialog

  // Track which content type has already been preloaded to avoid duplicate API calls
  const preloadedTypeRef = useRef<string | null>(null);
  // removed isCreatingTranslation state as creation is route-driven now

  // AI form state for recovery
  const [aiDraftFormValues, setAiDraftFormValues] = useState<{
    language: string;
    contentType: string;
    prompt: string;
    referenceContentId?: number | null;
  } | null>(null);
  const [aiEditPrompt, setAiEditPrompt] = useState<string>("");
  const [aiErrorDetails, setAiErrorDetails] = useState<string[]>([]);
  const [aiCoverDialogOpen, setAiCoverDialogOpen] = useState(false);
  const [aiCoverDialogMode, setAiCoverDialogMode] = useState<"generate" | "edit">("generate");
  const [coverImageRefreshKey, setCoverImageRefreshKey] = useState<string | number | null>(null);

  // Initialize custom hooks
  const configSettings = (config as ExtendedConfig)?.settings;
  const hasLivePreview = !!configSettings?.LivePreviewUrlTemplate;
  const hasSitePreview = !!configSettings?.PreviewUrlTemplate;
  // Right preview pane should only be visible when BOTH templates are configured
  const canShowLivePreviewPane = hasLivePreview && hasSitePreview;
  const hasAIAssistance = config?.capabilities?.includes("AIAssistance") || false;
  const hasMultipleLanguages = (config?.languages?.length || 0) > 1;

  const contentDataOps = useContentDataOperations();
  const contentFormOps = useContentFormOperations(id, hasLivePreview, contentDataOps.contentTypes);
  const aiContentOps = useAIContentOperations();
  const translationOps = useTranslationOperations();
  const publicationDialogPreference = usePublicationDialogPreference();

  const handleCoverImageChange = (imageUrl: string | null) => {
    contentFormOps.onCoverImageChange(imageUrl);
    setCoverImageRefreshKey(Date.now());
  };

  // Determine if metadata should be collapsed
  const isMetadataCollapsed = isCreateMode ? localMetadataCollapsed : storedMetadataCollapsed;
  const setIsMetadataCollapsed = (collapsed: boolean) => {
    if (isCreateMode) {
      setLocalMetadataCollapsed(collapsed);
    } else {
      setStoredMetadataCollapsed(collapsed);
    }
  };

  // Navigation guard for unsaved changes in translation mode
  const isTranslationInProgress = !!(sourceId && translateToParam && !id);
  useNavigationGuard({
    when: isTranslationInProgress && contentFormOps.wasModified && !contentFormOps.isSaving,
    message: "You have unsaved translation changes. Are you sure you want to leave?",
  });

  // Guard for general editing with unsaved changes
  useNavigationGuard({
    when:
      !isTranslationInProgress &&
      (contentFormOps.wasModified || contentFormOps.coverWasModified) &&
      !contentFormOps.isSaving,
    message: "You have unsaved changes. Are you sure you want to leave?",
  });

  // Helper function to get content type display name
  const getContentTypeDisplayName = () => {
    if (!contentDataOps.contentType) return contentFormOps.formik.values.type || "Unknown";
    return contentDataOps.contentType.uid || "Unknown";
  };

  // Helper function to determine which preview template to use
  const getPreviewTemplate = () => {
    // Use LivePreviewUrlTemplate when content has been modified (draft version exists)
    // Use PreviewUrlTemplate when no changes have been made within the current editing session
    const shouldUseLivePreview =
      contentFormOps.hasContentChanged ||
      contentFormOps.wasModified ||
      contentFormOps.coverWasModified;
    return shouldUseLivePreview
      ? configSettings?.LivePreviewUrlTemplate
      : configSettings?.PreviewUrlTemplate;
  };

  // Helper function to set default values for a content type
  const setContentTypeDefaults = async (contentTypeId: string) => {
    const contentType = contentDataOps.contentTypes.find((t) => t.uid === contentTypeId);
    if (!contentType) return;

    const currentValues = { ...contentFormOps.formik.values };
    const defaults = generateDefaultValues(contentTypeId, userInfo?.details?.displayName || "");
    const currentContentType = contentDataOps.contentTypes.find(
      (t) => t.uid === currentValues.type
    );
    const shouldResetBody = !currentContentType || currentContentType.format !== contentType.format;

    contentFormOps.formik.setValues({
      ...currentValues,
      type: contentTypeId,
      body: shouldResetBody ? defaults.body : currentValues.body,
      author: currentValues.author || defaults.author, // Only set if not already set
      allowComments:
        currentValues.allowComments !== undefined
          ? currentValues.allowComments
          : defaults.allowComments,
    });
    contentFormOps.setWasModified(true);
  };

  // AI Draft handlers
  const handleAIDraftCreate = async (
    language: string,
    contentType: string,
    prompt: string,
    referenceContentId?: number | null,
    wordCount?: number | null,
    characterCount?: number | null,
    tokenEstimation?: TokenEstimation | null,
    requiredMediaPaths?: string[]
  ) => {
    setAiDraftFormValues({ language, contentType, prompt, referenceContentId });
    setAiDraftDialogOpen(false);

    setAiProgressType("content");
    setAiOperationComplete(false);
    setAiProgressProps({
      contentType,
      language,
      estimatedOutputTokens: tokenEstimation?.outputTokens,
      estimatedSeconds: tokenEstimation?.estimatedSeconds,
    });
    setAiProgressOpen(true);

    try {
      const aiContent = await aiContentOps.createAIDraft(
        language,
        contentType,
        prompt,
        referenceContentId,
        wordCount,
        characterCount,
        requiredMediaPaths
      );

      // Signal completion before loading content
      setAiOperationComplete(true);

      await loadContentIntoForm(aiContent, {
        markAsModified: true,
        resetContentChanged: true,
        triggerValidation: true,
      });

      setAiDraftFormValues(null);

      if (isAIDraftRoute) {
        navigate("/content/new", { replace: true });
      }
    } catch (error) {
      const parsed = showApiError(
        error,
        notificationsService,
        showErrorModal,
        "AI draft creation failed"
      );
      setAiErrorDetails(parsed.details.length > 0 ? [parsed.message, ...parsed.details] : []);
      setAiDraftDialogOpen(true);
    } finally {
      // Small delay to let completion animation play
      setTimeout(() => {
        setAiProgressOpen(false);
        setAiOperationComplete(false);
      }, 500);
    }
  };

  // AI Edit handlers
  const handleAIEdit = async (
    prompt: string,
    wordCount?: number | null,
    characterCount?: number | null,
    tokenEstimation?: TokenEstimation | null,
    requiredMediaPaths?: string[]
  ) => {
    setAiEditPrompt(prompt);
    setAiErrorDetails([]);
    setAiEditDialogOpen(false);

    setAiProgressType("edit");
    setAiOperationComplete(false);
    setAiProgressProps({
      contentTitle: contentFormOps.formik.values.title || "Untitled",
      estimatedOutputTokens: tokenEstimation?.outputTokens,
      estimatedSeconds: tokenEstimation?.estimatedSeconds,
    });
    setAiProgressOpen(true);

    try {
      const editedContent = await aiContentOps.editWithAI(
        contentFormOps.formik.values,
        prompt,
        wordCount,
        characterCount,
        requiredMediaPaths
      );

      // Signal completion before loading content
      setAiOperationComplete(true);

      await loadContentIntoForm(editedContent, {
        markAsModified: true,
        markContentChanged: true,
        triggerValidation: true,
        setOriginalContent: false, // Preserve original content during AI edits
      });
      setAiEditPrompt("");
    } catch (error) {
      const parsed = showApiError(error, notificationsService, showErrorModal, "AI edit failed");
      setAiErrorDetails(parsed.details.length > 0 ? [parsed.message, ...parsed.details] : []);
      setAiEditDialogOpen(true);
    } finally {
      // Small delay to let completion animation play
      setTimeout(() => {
        setAiProgressOpen(false);
        setAiOperationComplete(false);
      }, 500);
    }
  };

  const handleAICoverGenerate = async (prompt: string | null, sampleImagePaths: string[]) => {
    const { title, description, slug } = contentFormOps.formik.values;

    if (!title || !description || !slug) {
      return;
    }

    setAiCoverDialogOpen(false);
    setAiProgressType("cover");
    setAiOperationComplete(false);
    setAiProgressProps({
      contentTitle: title,
      estimatedSeconds: Math.min(120, 40 + sampleImagePaths.length * 5),
    });
    setAiProgressOpen(true);

    try {
      const media = await aiContentOps.generateAICover({
        contentTitle: title,
        contentDescription: description,
        contentSlug: slug,
        prompt: prompt || undefined,
        sampleImagePaths: sampleImagePaths.length ? sampleImagePaths : undefined,
      });

      if (media.location) {
        handleCoverImageChange(media.location);
      }

      setAiOperationComplete(true);
    } catch (error) {
      const parsed = showApiError(
        error,
        notificationsService,
        showErrorModal,
        "AI cover generation failed"
      );
      setAiErrorDetails(parsed.details.length > 0 ? [parsed.message, ...parsed.details] : []);
      setAiCoverDialogOpen(true);
    } finally {
      setTimeout(() => {
        setAiProgressOpen(false);
        setAiOperationComplete(false);
      }, 500);
    }
  };

  const handleAICoverEdit = async (prompt: string, sampleImagePaths: string[]) => {
    const { coverImageUrl, title, description } = contentFormOps.formik.values;

    if (!coverImageUrl || !title || !description || !prompt) {
      return;
    }

    setAiCoverDialogOpen(false);
    setAiProgressType("cover");
    setAiOperationComplete(false);
    setAiProgressProps({
      contentTitle: contentFormOps.formik.values.title || "",
      estimatedSeconds: Math.min(120, 40 + sampleImagePaths.length * 5),
    });
    setAiProgressOpen(true);

    const normalizeCoverImageUrl = (rawUrl: string) => {
      const trimmedUrl = rawUrl.trim();
      if (!trimmedUrl) return trimmedUrl;
      const apiPath = "/api/media/";

      try {
        const parsedUrl = new URL(trimmedUrl, window.location.origin);
        const pathname = parsedUrl.pathname;
        if (pathname.startsWith(apiPath)) {
          return pathname;
        }
      } catch {
        // Fall through to string-based normalization
      }

      const withoutQuery = trimmedUrl.split("?")[0];
      const apiIndex = withoutQuery.indexOf(apiPath);
      if (apiIndex >= 0) {
        return withoutQuery.slice(apiIndex);
      }

      return withoutQuery;
    };

    try {
      const media = await aiContentOps.editAICover({
        coverImageUrl: normalizeCoverImageUrl(coverImageUrl),
        contentTitle: title,
        contentDescription: description,
        prompt,
        sampleImagePaths: sampleImagePaths.length ? sampleImagePaths : undefined,
      });

      if (media.location) {
        handleCoverImageChange(media.location);
      }

      setAiOperationComplete(true);
    } catch (error) {
      const parsed = showApiError(
        error,
        notificationsService,
        showErrorModal,
        "AI cover edit failed"
      );
      setAiErrorDetails(parsed.details.length > 0 ? [parsed.message, ...parsed.details] : []);
      setAiCoverDialogOpen(true);
    } finally {
      setTimeout(() => {
        setAiProgressOpen(false);
        setAiOperationComplete(false);
      }, 500);
    }
  };

  // Translation handlers
  const handleTranslateConfirm = async (
    targetLanguage: string,
    translationType: TranslationType
  ) => {
    if (!id) return;
    navigate(`/content/${id}/translate/${targetLanguage}/${translationType}`);
  };

  const handleCreateTranslationConfirm = async (
    targetLanguage: string,
    translationType: TranslationType
  ) => {
    if (!sourceId) return;
    // Close dialog first to prevent onClose redirect from interfering
    setCreateTranslationDialogOpen(false);
    setTargetLanguageForTranslation(""); // Reset target language state
    // Small delay to ensure dialog closes before navigation
    setTimeout(() => {
      navigate(`/content/${sourceId}/translate/${targetLanguage}/${translationType}`, {
        replace: true,
      });
    }, 0);
  };

  // Language handling
  const handleLanguageChange = async (language: string, translationId?: number) => {
    if (translationId) {
      navigate(`/content/${translationId}/edit`);
    } else {
      contentFormOps.formik.setFieldValue("language", language);
      contentFormOps.setWasModified(true);
    }
  };

  const handleCreateTranslation = async (targetLanguage: string) => {
    if (!id) {
      contentFormOps.formik.setFieldValue("language", targetLanguage);
      contentFormOps.setWasModified(true);
      return;
    }
    navigate(`/content/${id}/translate/${targetLanguage}`);
  };

  // Site preview handler
  const handleSitePreview = () => {
    const params = {
      ...contentFormOps.formik.values,
      userId: userInfo?.details?.id || "",
    };
    const success = openSitePreview(
      params as unknown as Record<string, unknown>,
      configSettings?.PreviewUrlTemplate || "",
      config?.defaultLanguage
    );
    if (!success) {
      // notificationsService.error is available in the hook
    }
  };

  // Publication status dialog handlers
  const submitContent = async () => {
    const errors = await contentFormOps.formik.validateForm();
    if (Object.keys(errors).length > 0) {
      const touchedFields = Object.keys(contentFormOps.formik.values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      contentFormOps.formik.setTouched(touchedFields);
      return;
    }

    const publicationInfo = shouldShowPublicationDialog(contentFormOps.formik.values.publishedAt);

    if (publicationInfo.shouldShowDialog && publicationDialogPreference.shouldShowDialog()) {
      contentFormOps.setPendingSubmitData({
        values: contentFormOps.formik.values,
        helpers: contentFormOps.formik,
      });
      setPublicationStatusDialogOpen(true);
    } else {
      await contentFormOps.formik.submitForm();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitContent();
  };

  const handleSaveStay = async () => {
    contentFormOps.setNextSaveMode("stay");
    await submitContent();
  };

  const handleSaveAndClose = async () => {
    contentFormOps.setNextSaveMode("close");
    await submitContent();
  };

  useSaveShortcut(() => {
    if (props.readonly) {
      return;
    }
    void handleSaveStay();
  }, !props.readonly);

  const handlePublicationStatusConfirm = async (
    status: PublicationStatus,
    publishedAt: string | null,
    dontShowAgain: boolean
  ) => {
    setPublicationStatusDialogOpen(false);

    if (dontShowAgain) {
      publicationDialogPreference.setDontShowAgain();
    }

    // Complete the pending submit with the new publishedAt value
    try {
      await contentFormOps.completePendingSubmit(publishedAt);
    } catch (error) {
      showApiError(
        error,
        notificationsService,
        showErrorModal,
        "Content validation failed. Please check title and description requirements."
      );
    }
  };

  const handlePublicationStatusClose = () => {
    setPublicationStatusDialogOpen(false);
    contentFormOps.setPendingSubmitData(null);
  };

  // Unified function to handle content loading with proper validation
  const loadContentIntoForm = async (
    content: ContentDetails,
    options: {
      markAsModified?: boolean;
      markContentChanged?: boolean;
      triggerValidation?: boolean;
      resetContentChanged?: boolean;
      setOriginalContent?: boolean;
    } = {}
  ) => {
    const {
      markAsModified = false,
      markContentChanged = false,
      triggerValidation = true,
      resetContentChanged = false,
      setOriginalContent = true,
    } = options;

    // Set form values
    await contentFormOps.formik.setValues(content);

    // Set content state - only set original content if specified (preserve during AI edits)
    if (setOriginalContent) {
      contentFormOps.setOriginalContent(content.body || "");
    }
    contentFormOps.setRefreshKey(Date.now());

    // Set modification flags
    if (markAsModified) {
      contentFormOps.setWasModified(true);
    }
    if (markContentChanged) {
      contentFormOps.setHasContentChanged(true);
    }
    if (resetContentChanged) {
      contentFormOps.setHasContentChanged(false);
    }

    // Setup content type
    await setContentTypeAndMaybePreload(content.type);

    // Trigger validation if requested
    if (triggerValidation) {
      // Wait for React state updates to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Use direct validation instead of formik's validateForm to avoid timing issues
      const lengthSettings = getContentLengthSettings(config);

      // Check for validation errors using the content we're loading (not formik state)
      if (content.title) {
        const titleError = validateTitleLength(content.title, lengthSettings);
        if (titleError) {
          await contentFormOps.formik.setFieldTouched("title", true);
          await contentFormOps.formik.setFieldError("title", titleError);
        }
      }

      if (content.description) {
        const descriptionError = validateDescriptionLength(content.description, lengthSettings);
        if (descriptionError) {
          await contentFormOps.formik.setFieldTouched("description", true);
          await contentFormOps.formik.setFieldError("description", descriptionError);
        }
      }
    }
  };

  // Helper to set content type object and optionally preload MDX components
  const setContentTypeAndMaybePreload = async (typeUid?: string) => {
    if (!typeUid) {
      contentDataOps.setContentType(null);
      contentDataOps.setPreloadedMdxComponents(undefined);
      preloadedTypeRef.current = null;
      return;
    }

    // Skip if already preloaded for this type
    if (preloadedTypeRef.current === typeUid) {
      return;
    }

    // Wait for content types to be loaded if they're not available yet
    if (contentDataOps.contentTypes.length === 0) {
      console.log(`Content types not loaded yet for type: ${typeUid}, will retry when available`);
      return;
    }

    const ct = contentDataOps.contentTypes.find((t) => t.uid === typeUid) || null;
    console.log(`Setting content type for ${typeUid}:`, ct);
    contentDataOps.setContentType(ct);
    if (!ct) return;

    const isMdxLike = ct.format === "MDX" || ct.format === "MD";
    if (!isMdxLike) {
      contentDataOps.setPreloadedMdxComponents(undefined);
      preloadedTypeRef.current = typeUid;
      return;
    }
    try {
      contentDataOps.setContentTypeLoading(true);
      const resp = await client.api.contentMdxComponentsDetail(typeUid, {
        useCache: true,
        maxCacheAgeHours: 1,
      });
      contentDataOps.setPreloadedMdxComponents(resp.data);
      preloadedTypeRef.current = typeUid;
    } finally {
      contentDataOps.setContentTypeLoading(false);
    }
  };

  // Load existing content for edit mode
  useEffect(() => {
    const loadForEdit = async () => {
      if (!id || isDuplicateMode || isTranslationMode || isAIDraftMode) return;
      contentDataOps.setIsInitialLoading(true);
      try {
        const content = await contentDataOps.loadContent(id);

        await loadContentIntoForm(content, {
          markAsModified: false,
          resetContentChanged: true,
          triggerValidation: true,
        });

        // Preload translations
        try {
          const tr = await client.api.contentTranslationsList(Number(id));
          contentDataOps.setPreloadedTranslations(tr.data);
        } catch {
          contentDataOps.setPreloadedTranslations(undefined);
        }

        console.log(
          `loadForEdit completed, types: ${contentDataOps.contentTypes.length}, ` +
            `type: ${content.type}`
        );
      } finally {
        contentDataOps.setIsInitialLoading(false);
      }
    };
    loadForEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isDuplicateMode, isTranslationMode, isAIDraftMode]);

  // Load duplicated content when in duplicate mode
  useEffect(() => {
    const loadForDuplicate = async () => {
      if (!sourceId || !isDuplicateMode) return;
      contentDataOps.setIsInitialLoading(true);
      try {
        const content = await contentDataOps.loadContentForDuplication(sourceId);
        // Ensure duplicate is not linked to original
        content.translationKey = null;

        await loadContentIntoForm(content, {
          markAsModified: true,
          markContentChanged: true,
          triggerValidation: true,
        });
      } finally {
        contentDataOps.setIsInitialLoading(false);
      }
    };
    loadForDuplicate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceId, isDuplicateMode]);

  // Handle translation routes
  useEffect(() => {
    const handleTranslationRoutes = async () => {
      if (!sourceId || !translateToParam) return;
      if (id) return; // If we already have a created translation, nothing to do

      // If type is missing, open translate dialog for selection
      if (!translationTypeParam) {
        setTargetLanguageForTranslation(translateToParam);
        setCreateTranslationDialogOpen(true);
        return;
      }

      // Create translation draft according to type
      if (translationTypeParam === "AITranslation") {
        setAiProgressType("translation");
        setAiProgressProps({ targetLanguage: translateToParam });
        setAiProgressOpen(true);
      }

      contentDataOps.setIsInitialLoading(true);
      try {
        const translated = await translationOps.createTranslation(
          parseInt(sourceId),
          translateToParam,
          translationTypeParam
        );

        await loadContentIntoForm(translated, {
          markAsModified: true,
          markContentChanged: true,
          triggerValidation: true,
        });

        // Ensure the create dialog is closed after success
        setCreateTranslationDialogOpen(false);
      } catch (error) {
        // Conflict: navigate to existing translation
        const status = (error as { status?: number }).status;
        if (status === 409) {
          try {
            const existing = await translationOps.getExistingTranslation(
              parseInt(sourceId),
              translateToParam
            );
            if (existing?.id) {
              navigate(`/content/${existing.id}/edit`, { replace: true });
            }
          } catch (err) {
            console.error("Failed to resolve existing translation:", err);
          }
        } else {
          // Open dialog again on other errors
          setTargetLanguageForTranslation(translateToParam);
          setCreateTranslationDialogOpen(true);
        }
      } finally {
        contentDataOps.setIsInitialLoading(false);
        setAiProgressOpen(false);
      }
    };
    handleTranslationRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceId, translateToParam, translationTypeParam, id]);

  // AI Draft route handling
  useEffect(() => {
    const handleAIDraft = async () => {
      if (!isAIDraftRoute) return;
      // If AI content came via navigation state, prefill form
      const aiData = location.state?.aiGeneratedContent;
      if (aiData) {
        const content = await contentDataOps.loadAIGeneratedContent(aiData);

        await loadContentIntoForm(content, {
          markAsModified: false,
          resetContentChanged: true,
          triggerValidation: true,
        });

        return;
      }
      // Check for default content type from navigation state
      const defaultContentType = location.state?.defaultContentType;
      if (defaultContentType) {
        const defaultLanguage =
          selectedLanguage && selectedLanguage !== "all"
            ? (selectedLanguage as string)
            : config?.defaultLanguage || "";
        setAiDraftFormValues({
          language: defaultLanguage,
          contentType: defaultContentType,
          prompt: "",
        });
      }
      // Otherwise open the AI draft dialog
      setAiDraftDialogOpen(true);
    };
    handleAIDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAIDraftRoute]);

  // Create mode defaults: default language and first content type
  const preferredLanguage = useMemo(() => {
    if (selectedLanguage && selectedLanguage !== "all") return selectedLanguage as string;
    return config?.defaultLanguage || "";
  }, [selectedLanguage, config?.defaultLanguage]);

  // Get contentType from URL search params for create mode
  const urlContentType = useMemo(() => {
    return searchParams.get("contentType");
  }, [searchParams]);

  useEffect(() => {
    const applyCreateDefaults = async () => {
      if (!isCreateMode) return;
      // Language default
      if (!contentFormOps.formik.values.language && preferredLanguage) {
        contentFormOps.formik.setFieldValue("language", preferredLanguage);
      }
      // Author default - use current user's display name if not set
      if (!contentFormOps.formik.values.author && userInfo?.details?.displayName) {
        contentFormOps.formik.setFieldValue("author", userInfo.details.displayName);
      }
      // Type default when content types are loaded
      if (contentDataOps.contentTypes.length > 0 && !contentFormOps.formik.values.type) {
        // Use URL parameter if available and valid
        let selectedType = null;
        if (urlContentType) {
          const validType = contentDataOps.contentTypes.find((t) => t.uid === urlContentType);
          if (validType) {
            selectedType = urlContentType;
          }
        }
        // Fallback to first content type if no valid URL parameter
        if (!selectedType) {
          selectedType = contentDataOps.contentTypes[0]?.uid;
        }

        if (selectedType) {
          contentFormOps.formik.setFieldValue("type", selectedType);
          await setContentTypeAndMaybePreload(selectedType);
          // Apply type defaults for body and flags
          await setContentTypeDefaults(selectedType);
        }
      }
    };
    applyCreateDefaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateMode, contentDataOps.contentTypes, preferredLanguage, urlContentType]);

  // Keep content type object in sync when 'type' changes (but don't preload again)
  useEffect(() => {
    const typeUid = contentFormOps.formik.values.type;
    if (!typeUid || contentDataOps.contentTypes.length === 0) return;

    // Only update contentType object if it doesn't match current
    const ct = contentDataOps.contentTypes.find((t) => t.uid === typeUid) || null;
    if (ct && contentDataOps.contentType?.uid !== typeUid) {
      contentDataOps.setContentType(ct);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentFormOps.formik.values.type, contentDataOps.contentTypes]);

  // Force MDX editor remount when custom components finish loading
  const [componentsVersion, setComponentsVersion] = useState(0);
  useEffect(() => {
    setComponentsVersion((v) => v + 1);
  }, [contentDataOps.preloadedMdxComponents]);

  // Short key for MDX editor: include componentsVersion to avoid first-load race
  const mdxEditorKey = useMemo(() => {
    const t = contentFormOps.formik.values.type;
    const r = contentFormOps.refreshKey;
    const c = componentsVersion;
    return `mdx-${t}-${r}-${c}`;
  }, [contentFormOps.formik.values.type, contentFormOps.refreshKey, componentsVersion]);

  const shouldShowForm =
    isCreateMode ||
    isDuplicateMode ||
    isTranslationMode ||
    isAIDraftMode ||
    !contentDataOps.isInitialLoading;

  // Determine content format and which editor to render (robust, avoids race on first load)
  const resolvedFormat = useMemo(() => {
    const tUid = contentFormOps.formik.values.type;
    const ct =
      contentDataOps.contentType || contentDataOps.contentTypes.find((t) => t.uid === tUid) || null;
    return (ct?.format || "").toUpperCase();
  }, [contentDataOps.contentType, contentDataOps.contentTypes, contentFormOps.formik.values.type]);
  const formatKnown = resolvedFormat !== "";
  const isCodeEditor =
    resolvedFormat === "JSON" || resolvedFormat === "YAML" || resolvedFormat === "YML";
  const monacoLanguage: "json" | "yaml" = resolvedFormat === "JSON" ? "json" : "yaml";

  // Check for validation errors in each tab
  const hasContentErrors = Boolean(contentFormOps.formik.errors.body);
  const hasCoverErrors = Boolean(contentFormOps.formik.errors.coverImageAlt);
  const hasSettingsErrors = Boolean(
    contentFormOps.formik.errors.slug ||
      contentFormOps.formik.errors.language ||
      contentFormOps.formik.errors.category ||
      contentFormOps.formik.errors.tags ||
      contentFormOps.formik.errors.allowComments ||
      contentFormOps.formik.errors.author ||
      contentFormOps.formik.errors.publishedAt
  );

  return (
    <form onSubmit={handleFormSubmit}>
      <ModuleWrapper
        breadcrumbs={[]}
        currentBreadcrumb={contentFormOps.formik.values.title}
        isForm={true}
        actionButtons={
          <ContentEditActionButtons
            isSubmitting={contentFormOps.formik.isSubmitting}
            wasModified={contentFormOps.wasModified}
            coverWasModified={contentFormOps.coverWasModified}
            isSaving={contentFormOps.isSaving}
            id={id}
            isCreateMode={isCreateMode}
            isDuplicateMode={isDuplicateMode}
            isTranslationMode={isTranslationMode}
            hasMultipleLanguages={hasMultipleLanguages}
            hasAIAssistance={hasAIAssistance}
            onTranslate={() => setTranslateDialogOpen(true)}
            onEditWithAI={() => setAiEditDialogOpen(true)}
            onSave={handleSaveStay}
            onSaveAndClose={handleSaveAndClose}
          />
        }
      >
        <ContentEditContainer>
          {shouldShowForm ? (
            <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <CardContent
                sx={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}
              >
                {/* Metadata Section */}
                <ContentEditMetadataSection
                  title={contentFormOps.formik.values.title}
                  description={contentFormOps.formik.values.description}
                  type={contentFormOps.formik.values.type}
                  language={contentFormOps.formik.values.language}
                  onTitleChange={contentFormOps.valueUpdate}
                  onDescriptionChange={contentFormOps.valueUpdate}
                  onTypeChange={async (type) => {
                    if (type !== contentFormOps.formik.values.type) {
                      // Reset preloadedTypeRef to allow new type to be preloaded
                      preloadedTypeRef.current = null;
                      contentFormOps.formik.setFieldValue("type", type);
                      await setContentTypeAndMaybePreload(type);
                      await setContentTypeDefaults(type);
                    }
                  }}
                  contentTypes={contentDataOps.contentTypes}
                  onReloadContentTypes={contentDataOps.reloadContentTypes}
                  formErrors={{
                    title: contentFormOps.formik.errors.title,
                    description: contentFormOps.formik.errors.description,
                    type: contentFormOps.formik.errors.type,
                  }}
                  formTouched={{
                    title: contentFormOps.formik.touched.title,
                    description: contentFormOps.formik.touched.description,
                    type: contentFormOps.formik.touched.type,
                  }}
                  onBlur={(field) => contentFormOps.formik.setFieldTouched(field, true)}
                  onSetFieldError={(field, error) =>
                    contentFormOps.formik.setFieldError(field, error)
                  }
                  isMetadataCollapsed={isMetadataCollapsed}
                  onToggleCollapsed={setIsMetadataCollapsed}
                  hasMultipleLanguages={hasMultipleLanguages}
                  contentId={
                    sourceId && translateToParam
                      ? parseInt(sourceId)
                      : parseInt(id || "0") || undefined
                  }
                  sourceContentId={sourceId ? parseInt(sourceId) : undefined}
                  isTranslationMode={Boolean(sourceId && translateToParam)}
                  onLanguageChange={handleLanguageChange}
                  onCreateTranslation={handleCreateTranslation}
                  preloadedTranslations={contentDataOps.preloadedTranslations}
                  preloadedSourceTranslations={contentDataOps.preloadedTranslations}
                  getContentTypeDisplayName={getContentTypeDisplayName}
                  slug={contentFormOps.formik.values.slug}
                />

                {/* Tabs and Preview Controls */}
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
                    {contentDataOps.contentType?.supportsCoverImage && (
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

                  {/* Live Preview Toggle */}
                  {hasLivePreview &&
                    hasSitePreview &&
                    (resolvedFormat === "MDX" || resolvedFormat === "MD") && (
                      <FormControlLabel
                        control={
                          contentFormOps.isDraftSaving ? (
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                          ) : (
                            <Switch
                              checked={contentFormOps.useLivePreview}
                              onChange={(e) => {
                                const newValue = e.target.checked;
                                contentFormOps.setUseLivePreview(newValue);
                                if (
                                  newValue &&
                                  hasLivePreview &&
                                  id &&
                                  (contentFormOps.wasModified ||
                                    contentFormOps.coverWasModified ||
                                    contentFormOps.hasContentChanged)
                                ) {
                                  // Save draft would be triggered automatically by the hook
                                }
                              }}
                              size="small"
                            />
                          )
                        }
                        label={
                          <Typography variant="body2" component="span">
                            {contentFormOps.isDraftSaving ? "Saving Draft..." : "Live Preview"}
                          </Typography>
                        }
                        sx={{ mr: 2 }}
                      />
                    )}

                  {/* Manual refresh button */}
                  {hasLivePreview &&
                    contentFormOps.useLivePreview &&
                    (resolvedFormat === "MDX" || resolvedFormat === "MD") && (
                      <IconButton
                        aria-label="Refresh preview"
                        onClick={() => contentFormOps.setRefreshKey(Date.now())}
                        sx={{ color: "#1976d2", mr: 1 }}
                        size="small"
                      >
                        <RefreshCw size={20} />
                      </IconButton>
                    )}

                  {/* Site Preview Button */}
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

                {/* Tab Content */}
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
                          {!formatKnown ? (
                            <Box sx={{ p: 2 }}>
                              <Stack gap={2} alignItems="center">
                                <CircularProgress size={32} />
                                <Typography variant="body2" color="text.secondary">
                                  Preparing editor...
                                </Typography>
                              </Stack>
                            </Box>
                          ) : isCodeEditor ? (
                            <Box sx={{ position: "relative" }}>
                              <MonacoEditor
                                height={
                                  isMetadataCollapsed
                                    ? "calc(100vh - 283px)"
                                    : "calc(100vh - 500px)"
                                }
                                defaultLanguage={monacoLanguage}
                                value={contentFormOps.formik.values.body}
                                onChange={async (value) => {
                                  contentFormOps.setWasModified(true);
                                  await contentFormOps.formik.setFieldValue("body", value || "");
                                }}
                                options={{
                                  readOnly: !!props.readonly,
                                  minimap: { enabled: false },
                                  lineNumbers: "on",
                                  scrollBeyondLastLine: false,
                                  wordWrap: "on",
                                }}
                              />
                              <ValidationStatusBubble
                                content={contentFormOps.formik.values.body}
                                format={resolvedFormat}
                                enabled={!props.readonly}
                                previewPaneVisible={false} // No preview for basic editor
                              />
                            </Box>
                          ) : (
                            <Box sx={{ position: "relative" }}>
                              {contentDataOps.contentTypeLoading &&
                                contentFormOps.formik.values.type && (
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                                      zIndex: 1000,
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      minHeight: "400px",
                                      backdropFilter: "blur(2px)",
                                    }}
                                  >
                                    <Stack gap={2} alignItems="center">
                                      <CircularProgress size={40} />
                                      <Typography variant="body1" color="text.primary">
                                        Loading custom components for{" "}
                                        {contentDataOps.contentType?.uid
                                          ? idToDisplayName(contentDataOps.contentType.uid)
                                          : "content type"}
                                        ...
                                      </Typography>
                                      <Stack gap={1} sx={{ width: "300px" }}>
                                        <Skeleton height={20} width="80%" />
                                        <Skeleton height={200} />
                                        <Skeleton height={20} width="60%" />
                                      </Stack>
                                    </Stack>
                                  </Box>
                                )}
                              <MDXEditorNew
                                key={mdxEditorKey}
                                onChange={async (value) => {
                                  contentFormOps.setWasModified(true);
                                  await contentFormOps.formik.setFieldValue("body", value || "");
                                }}
                                onContentChangeStatus={(hasChanged) => {
                                  contentFormOps.setHasContentChanged(hasChanged);
                                }}
                                value={contentFormOps.formik.values.body}
                                isReadOnly={props.readonly}
                                contentDetails={contentFormOps.formik.values}
                                livePreview={
                                  contentFormOps.useLivePreview && canShowLivePreviewPane
                                }
                                livePreviewTemplate={getPreviewTemplate()}
                                isMetadataCollapsed={isMetadataCollapsed}
                                preloadedMdxComponents={contentDataOps.preloadedMdxComponents}
                                originalContentForDiff={contentFormOps.originalContent}
                                contentFormat={resolvedFormat as ContentFormat}
                              />
                              {/* Show validation bubble when preview pane is not visible */}
                              {(!canShowLivePreviewPane ||
                                !contentFormOps.useLivePreview ||
                                !getPreviewTemplate()) && (
                                <ValidationStatusBubble
                                  content={contentFormOps.formik.values.body}
                                  format={resolvedFormat}
                                  enabled={!props.readonly}
                                  previewPaneVisible={
                                    canShowLivePreviewPane &&
                                    contentFormOps.useLivePreview &&
                                    !!getPreviewTemplate()
                                  }
                                />
                              )}
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {activeTab === "cover" && contentDataOps.contentType?.supportsCoverImage && (
                    <Box sx={{ pt: 4 }}>
                      <Grid container spacing={2} alignItems="flex-start">
                        <Grid size={{ xs: 12, md: 7 }}>
                          <CoverImageEditor
                            value={contentFormOps.formik.values.coverImageUrl}
                            onChange={handleCoverImageChange}
                            previewCacheKey={coverImageRefreshKey}
                            contentSlug={contentFormOps.formik.values.slug}
                            disabled={props.readonly}
                            maxFileSize={512 * 1024} // 512KB
                            onGenerateWithAI={
                              hasAIAssistance
                                ? () => {
                                    setAiCoverDialogMode("generate");
                                    setAiCoverDialogOpen(true);
                                  }
                                : undefined
                            }
                            onEditWithAI={
                              hasAIAssistance
                                ? () => {
                                    setAiCoverDialogMode("edit");
                                    setAiCoverDialogOpen(true);
                                  }
                                : undefined
                            }
                            generateWithAIDisabled={props.readonly}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                          <TextField
                            label="Cover Image Alt Text"
                            name="coverImageAlt"
                            value={contentFormOps.formik.values.coverImageAlt || ""}
                            error={Boolean(
                              contentFormOps.formik.touched.coverImageAlt &&
                                contentFormOps.formik.errors.coverImageAlt
                            )}
                            helperText={
                              contentFormOps.formik.touched.coverImageAlt &&
                              contentFormOps.formik.errors.coverImageAlt
                            }
                            placeholder="Enter Cover Image Alt Text"
                            variant="outlined"
                            onChange={contentFormOps.valueUpdate}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {activeTab === "settings" && (
                    <Grid container spacing={6} sx={{ mt: 2 }}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          disabled={props.readonly}
                          label="Slug"
                          name="slug"
                          value={contentFormOps.formik.values.slug}
                          error={
                            contentFormOps.formik.touched.slug &&
                            Boolean(contentFormOps.formik.errors.slug)
                          }
                          helperText={
                            contentFormOps.formik.touched.slug && contentFormOps.formik.errors.slug
                          }
                          placeholder="Enter slug"
                          variant="outlined"
                          onChange={contentFormOps.valueUpdate}
                          fullWidth
                        />
                      </Grid>
                      {hasMultipleLanguages && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <LanguageSelect
                            value={contentFormOps.formik.values.language}
                            onChange={(val) =>
                              contentFormOps.autoCompleteValueUpdate("language", val)
                            }
                            label="Language"
                            error={
                              contentFormOps.formik.touched.language &&
                              Boolean(contentFormOps.formik.errors.language)
                            }
                            helperText={
                              contentFormOps.formik.touched.language &&
                              contentFormOps.formik.errors.language
                            }
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
                          error={
                            contentFormOps.formik.touched.category &&
                            Boolean(contentFormOps.formik.errors.category)
                          }
                          helperText={
                            contentFormOps.formik.touched.category &&
                            contentFormOps.formik.errors.category
                          }
                          value={contentFormOps.formik.values.category}
                          onChange={(ev, val) =>
                            contentFormOps.autoCompleteValueUpdate("category", val as string)
                          }
                          freeSolo
                          multiple={false}
                          limit={1}
                          contentType={contentFormOps.formik.values.type}
                          language={contentFormOps.formik.values.language}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <RemoteAutocomplete
                          type={RemoteValues.TAGS}
                          label="Tags"
                          placeholder="Select Tags"
                          error={
                            contentFormOps.formik.touched.tags &&
                            Boolean(contentFormOps.formik.errors.tags)
                          }
                          helperText={
                            contentFormOps.formik.touched.tags && contentFormOps.formik.errors.tags
                          }
                          value={contentFormOps.formik.values.tags}
                          onChange={(ev, val) =>
                            contentFormOps.autoCompleteValueUpdate("tags", val as string[])
                          }
                          freeSolo
                          multiple
                          limit={3}
                          contentType={contentFormOps.formik.values.type}
                          language={contentFormOps.formik.values.language}
                        />
                      </Grid>
                      {contentDataOps.contentType?.supportsComments && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <FormControlLabel
                            label="Allow Comments"
                            control={
                              <Checkbox
                                disabled={props.readonly}
                                checked={contentFormOps.formik.values.allowComments}
                                onChange={(ev) =>
                                  contentFormOps.valueUpdateGeneric(
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
                        <RemoteAutocomplete
                          type={RemoteValues.AUTHORS}
                          label="Author"
                          placeholder="Enter author name"
                          error={
                            contentFormOps.formik.touched.author &&
                            Boolean(contentFormOps.formik.errors.author)
                          }
                          helperText={
                            contentFormOps.formik.touched.author &&
                            contentFormOps.formik.errors.author
                          }
                          value={contentFormOps.formik.values.author}
                          onChange={(ev, val) =>
                            contentFormOps.autoCompleteValueUpdate("author", val as string)
                          }
                          freeSolo
                          multiple={false}
                          limit={1}
                          contentType={contentFormOps.formik.values.type}
                          language={contentFormOps.formik.values.language}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <DatePicker
                          label="Published At"
                          disabled={props.readonly}
                          value={
                            contentFormOps.formik.values.publishedAt
                              ? dayjs(contentFormOps.formik.values.publishedAt)
                              : null
                          }
                          onChange={(newValue) =>
                            contentFormOps.handleDateChange("publishedAt", newValue)
                          }
                          slotProps={{
                            textField: { fullWidth: true },
                            actionBar: {
                              actions: ["clear"],
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  )}

                  {activeTab === "changelog" && !isCreateMode && id && (
                    <ContentChangeLog
                      contentId={id}
                      contentType={contentFormOps.formik.values.type}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          ) : null}
        </ContentEditContainer>
      </ModuleWrapper>

      {/* Unified AI Progress Dialog */}
      <UnifiedAIProgress
        open={aiProgressOpen}
        type={aiProgressType}
        isComplete={aiOperationComplete}
        {...aiProgressProps}
      />

      {/* AI Draft Dialog */}
      <AIDraftDialog
        open={aiDraftDialogOpen}
        onClose={() => {
          setAiDraftDialogOpen(false);
          setAiDraftFormValues(null);
          if (!contentFormOps.formik.values.title && !contentFormOps.formik.values.body) {
            navigate("/content");
          }
        }}
        onCreate={handleAIDraftCreate}
        contentTypes={contentDataOps.contentTypes}
        isLoading={aiContentOps.isLoading}
        error={aiContentOps.error}
        onErrorClear={aiContentOps.clearError}
        onViewErrorDetails={
          aiErrorDetails.length > 0 ? () => showErrorModal(aiErrorDetails) : undefined
        }
        initialValues={aiDraftFormValues || undefined}
      />

      {/* AI Edit Dialog */}
      <AIEditDialog
        open={aiEditDialogOpen}
        onClose={() => {
          setAiEditDialogOpen(false);
          setAiEditPrompt("");
        }}
        onEdit={handleAIEdit}
        isLoading={aiContentOps.isLoading}
        error={aiContentOps.error}
        onErrorClear={aiContentOps.clearError}
        onViewErrorDetails={
          aiErrorDetails.length > 0 ? () => showErrorModal(aiErrorDetails) : undefined
        }
        initialPrompt={aiEditPrompt}
        contentTitle={contentFormOps.formik.values.title || "Untitled"}
        currentContent={contentFormOps.formik.values}
      />

      {hasAIAssistance && (
        <AICoverDialog
          open={aiCoverDialogOpen}
          onClose={() => setAiCoverDialogOpen(false)}
          onGenerate={handleAICoverGenerate}
          onEdit={handleAICoverEdit}
          title={contentFormOps.formik.values.title || ""}
          description={contentFormOps.formik.values.description || ""}
          slug={contentFormOps.formik.values.slug || ""}
          coverImageUrl={contentFormOps.formik.values.coverImageUrl || ""}
          language={contentFormOps.formik.values.language || ""}
          mode={aiCoverDialogMode}
          isLoading={aiContentOps.isLoading}
          error={aiContentOps.error}
          onErrorClear={aiContentOps.clearError}
          onViewErrorDetails={
            aiErrorDetails.length > 0 ? () => showErrorModal(aiErrorDetails) : undefined
          }
        />
      )}

      {/* Publication Status Dialog */}
      <PublicationStatusDialog
        open={publicationStatusDialogOpen}
        onClose={handlePublicationStatusClose}
        onConfirm={handlePublicationStatusConfirm}
        currentPublishedAt={contentFormOps.formik.values.publishedAt}
        contentTitle={contentFormOps.formik.values.title || "Untitled"}
      />

      {/* Translation Dialogs */}
      {hasMultipleLanguages && (
        <TranslateDialog
          open={translateDialogOpen}
          onClose={() => setTranslateDialogOpen(false)}
          onTranslate={handleTranslateConfirm}
          originalLanguage={contentFormOps.formik.values.language}
          originalTitle={contentFormOps.formik.values.title}
        />
      )}

      {hasMultipleLanguages && (
        <TranslateDialog
          open={createTranslationDialogOpen}
          onClose={() => {
            setCreateTranslationDialogOpen(false);
            setTargetLanguageForTranslation(""); // Reset target language on close
            // On cancel/close, redirect back to source content
            if (sourceId && translateToParam) {
              navigate(`/content/${sourceId}/edit`);
            }
          }}
          onTranslate={handleCreateTranslationConfirm}
          originalLanguage={
            contentDataOps.sourceContent?.language || contentFormOps.formik.values.language
          }
          originalTitle={contentDataOps.sourceContent?.title || contentFormOps.formik.values.title}
          preselectedLanguage={targetLanguageForTranslation}
          error={translationOps.error}
          readonly={true}
        />
      )}
    </form>
  );
};
