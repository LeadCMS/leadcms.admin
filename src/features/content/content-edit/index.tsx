import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useConfig } from "@providers/config-provider";
import { useUserInfo } from "@providers/user-provider";
import { useNavigationGuard } from "@hooks";
import { TranslationType } from "@components/translate-dialog";
import { useRequestContext } from "@providers/request-provider";
import { useGlobalLanguageFilter } from "@providers/global-language-filter-provider";
import { useLayout } from "@providers/layout-provider";

// Import our custom hooks
import {
  useContentFormOperations,
  useContentDataOperations,
  useAIContentOperations,
  useTranslationOperations,
} from "./hooks";

// Import components
import { ContentEditActionButtons, ContentEditMetadataSection } from "./components";
import { UnifiedAIProgress } from "@components/unified-ai-progress";
import { AIDraftDialog } from "@components/ai-draft-dialog";
import { AIEditDialog } from "@components/ai-edit-dialog";
import { TranslateDialog } from "@components/translate-dialog";
import { RestoreDataModal } from "@components/restore-data";
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
import { ContentEditRestoreState } from "./types";
import { generateDefaultValues, idToDisplayName } from "../content-types";
import MDXEditorNew from "@components/mdx-editor-new";
import FileDropdown from "@components/file-dropdown";
import { RemoteAutocomplete } from "@components/remote-autocomplete";
import { RemoteValues } from "@components/remote-autocomplete/types";
import { LanguageSelect } from "@components/language-select";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import MonacoEditor from "@monaco-editor/react";
import { openSitePreview } from "utils/preview-helper";
import useLocalStorage from "use-local-storage";

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
  const [restoreDataState, setRestoreDataState] = useState<ContentEditRestoreState>(
    ContentEditRestoreState.Idle
  );
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

  // AI Progress states
  const [aiProgressOpen, setAiProgressOpen] = useState(false);
  const [aiProgressType, setAiProgressType] = useState<"content" | "translation" | "edit">(
    "content"
  );
  const [aiProgressProps, setAiProgressProps] = useState<{
    contentType?: string;
    language?: string;
    targetLanguage?: string;
    originalTitle?: string;
    contentTitle?: string;
  }>({});

  // Translation state
  const [targetLanguageForTranslation, setTargetLanguageForTranslation] = useState<string>("");
  // removed unused states processedTranslationUrl and shouldOpenTranslationDialog
  // removed isCreatingTranslation state as creation is route-driven now

  // AI form state for recovery
  const [aiDraftFormValues, setAiDraftFormValues] = useState<{
    language: string;
    contentType: string;
    prompt: string;
  } | null>(null);

  // Initialize custom hooks
  const configSettings = (config as ExtendedConfig)?.settings;
  const hasLivePreview = !!configSettings?.LivePreviewUrlTemplate;
  const hasSitePreview = !!configSettings?.PreviewUrlTemplate;
  const hasAIAssistance = config?.capabilities?.includes("AIAssistance") || false;
  const hasMultipleLanguages = (config?.languages?.length || 0) > 1;

  const contentFormOps = useContentFormOperations(id, hasLivePreview);
  const contentDataOps = useContentDataOperations();
  const aiContentOps = useAIContentOperations();
  const translationOps = useTranslationOperations();

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
    return contentFormOps.useLivePreview
      ? configSettings?.LivePreviewUrlTemplate
      : configSettings?.PreviewUrlTemplate;
  };

  // Helper function to set default values for a content type
  const setContentTypeDefaults = async (contentTypeId: string) => {
    const contentType = contentDataOps.contentTypes.find((t) => t.uid === contentTypeId);
    if (!contentType) return;

    const currentValues = { ...contentFormOps.formik.values };
    const defaults = generateDefaultValues(contentTypeId);
    const currentContentType = contentDataOps.contentTypes.find(
      (t) => t.uid === currentValues.type
    );
    const shouldResetBody = !currentContentType || currentContentType.format !== contentType.format;

    contentFormOps.formik.setValues({
      ...currentValues,
      type: contentTypeId,
      body: shouldResetBody ? defaults.body : currentValues.body,
      allowComments:
        currentValues.allowComments !== undefined
          ? currentValues.allowComments
          : defaults.allowComments,
    });
    contentFormOps.setWasModified(true);
  };

  // AI Draft handlers
  const handleAIDraftCreate = async (language: string, contentType: string, prompt: string) => {
    setAiDraftFormValues({ language, contentType, prompt });
    setAiDraftDialogOpen(false);

    setAiProgressType("content");
    setAiProgressProps({ contentType, language });
    setAiProgressOpen(true);

    try {
      const aiContent = await aiContentOps.createAIDraft(language, contentType, prompt);
      await contentFormOps.formik.setValues(aiContent);
      await contentFormOps.formik.setFieldValue("coverImagePending", aiContent.coverImagePending);
      contentFormOps.setRefreshKey(Date.now());
      contentFormOps.setWasModified(true);
      contentFormOps.setOriginalContent(aiContent.body || "");
      setAiDraftFormValues(null);

      if (isAIDraftRoute) {
        navigate("/content/new", { replace: true });
      }
    } catch (error) {
      setAiDraftDialogOpen(true);
    } finally {
      setAiProgressOpen(false);
    }
  };

  // AI Edit handlers
  const handleAIEdit = async (prompt: string) => {
    setAiEditDialogOpen(false);

    setAiProgressType("edit");
    setAiProgressProps({ contentTitle: contentFormOps.formik.values.title || "Untitled" });
    setAiProgressOpen(true);

    try {
      const editedContent = await aiContentOps.editWithAI(contentFormOps.formik.values, prompt);
      await contentFormOps.formik.setValues(editedContent);
      await contentFormOps.formik.setFieldValue(
        "coverImagePending",
        editedContent.coverImagePending
      );
      contentFormOps.setRefreshKey(Date.now());
      contentFormOps.setWasModified(true);
    } catch (error) {
      setAiEditDialogOpen(true);
    } finally {
      setAiProgressOpen(false);
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

  // Helper to set content type object and optionally preload MDX components
  const setContentTypeAndMaybePreload = async (typeUid?: string) => {
    if (!typeUid) {
      contentDataOps.setContentType(null);
      contentDataOps.setPreloadedMdxComponents(undefined);
      return;
    }
    const ct = contentDataOps.contentTypes.find((t) => t.uid === typeUid) || null;
    contentDataOps.setContentType(ct);
    if (!ct) return;

    const isMdxLike = ct.format === "MDX" || ct.format === "MD";
    if (!isMdxLike) {
      contentDataOps.setPreloadedMdxComponents(undefined);
      return;
    }
    try {
      contentDataOps.setContentTypeLoading(true);
      const resp = await client.api.contentMdxComponentsDetail(typeUid, {
        useCache: true,
        maxCacheAgeHours: 1,
      });
      contentDataOps.setPreloadedMdxComponents(resp.data);
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
        await contentFormOps.formik.setValues(content);
        await contentFormOps.formik.setFieldValue("coverImagePending", content.coverImagePending);
        contentFormOps.setOriginalContent(content.body || "");
        contentFormOps.setRefreshKey(Date.now());

        // Preload translations
        try {
          const tr = await client.api.contentTranslationsList(Number(id));
          contentDataOps.setPreloadedTranslations(tr.data);
        } catch {
          contentDataOps.setPreloadedTranslations(undefined);
        }

        await setContentTypeAndMaybePreload(content.type);
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
        await contentFormOps.formik.setValues(content);
        await contentFormOps.formik.setFieldValue("coverImagePending", content.coverImagePending);
        contentFormOps.setOriginalContent(content.body || "");
        contentFormOps.setRefreshKey(Date.now());
        await setContentTypeAndMaybePreload(content.type);
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
        await contentFormOps.formik.setValues(translated);
        await contentFormOps.formik.setFieldValue(
          "coverImagePending",
          translated.coverImagePending
        );
        contentFormOps.setOriginalContent(translated.body || "");
        contentFormOps.setRefreshKey(Date.now());
        await setContentTypeAndMaybePreload(translated.type);
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
        await contentFormOps.formik.setValues(content);
        await contentFormOps.formik.setFieldValue("coverImagePending", content.coverImagePending);
        contentFormOps.setOriginalContent(content.body || "");
        contentFormOps.setRefreshKey(Date.now());
        await setContentTypeAndMaybePreload(content.type);
        return;
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

  useEffect(() => {
    const applyCreateDefaults = async () => {
      if (!isCreateMode) return;
      // Language default
      if (!contentFormOps.formik.values.language && preferredLanguage) {
        contentFormOps.formik.setFieldValue("language", preferredLanguage);
      }
      // Type default when content types are loaded
      if (contentDataOps.contentTypes.length > 0 && !contentFormOps.formik.values.type) {
        const first = contentDataOps.contentTypes[0]?.uid;
        if (first) {
          contentFormOps.formik.setFieldValue("type", first);
          await setContentTypeAndMaybePreload(first);
          // Apply type defaults for body and flags
          await setContentTypeDefaults(first);
        }
      }
    };
    applyCreateDefaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateMode, contentDataOps.contentTypes, preferredLanguage]);

  // Keep content type object and MDX components in sync when 'type' changes
  useEffect(() => {
    setContentTypeAndMaybePreload(contentFormOps.formik.values.type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentFormOps.formik.values.type]);

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
    <form onSubmit={contentFormOps.formik.handleSubmit}>
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
          />
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
                {/* Metadata Section */}
                <ContentEditMetadataSection
                  title={contentFormOps.formik.values.title}
                  description={contentFormOps.formik.values.description}
                  type={contentFormOps.formik.values.type}
                  language={contentFormOps.formik.values.language}
                  onTitleChange={contentFormOps.valueUpdate}
                  onDescriptionChange={contentFormOps.valueUpdate}
                  onTypeChange={(type) => {
                    if (type !== contentFormOps.formik.values.type) {
                      contentFormOps.formik.setFieldValue("type", type);
                      setContentTypeDefaults(type);
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
                  </Tabs>
                  <Box sx={{ flex: 1 }} />

                  {/* Live Preview Toggle */}
                  {hasLivePreview && (resolvedFormat === "MDX" || resolvedFormat === "MD") && (
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
                                (contentFormOps.wasModified || contentFormOps.coverWasModified)
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
                            <MonacoEditor
                              height={
                                isMetadataCollapsed ? "calc(100vh - 283px)" : "calc(100vh - 500px)"
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
                                onFrontmatterErrorChange={async (value) => {
                                  contentFormOps.setFrontmatterState(value);
                                }}
                                value={contentFormOps.formik.values.body}
                                isReadOnly={props.readonly}
                                contentDetails={contentFormOps.formik.values}
                                livePreview={contentFormOps.useLivePreview}
                                livePreviewTemplate={getPreviewTemplate()}
                                isMetadataCollapsed={isMetadataCollapsed}
                                preloadedMdxComponents={contentDataOps.preloadedMdxComponents}
                                originalContentForDiff={contentFormOps.originalContent}
                              />
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {activeTab === "cover" && contentDataOps.contentType?.supportsCoverImage && (
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FileDropdown
                          onChange={contentFormOps.onCoverImageChange}
                          acceptMIME="image/*"
                          maxFileSize={2 * 1024 * 1024} // 2MB
                          data={contentFormOps.formik.values.coverImagePending}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
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
                        <TextField
                          disabled={props.readonly}
                          label="Author"
                          name="author"
                          value={contentFormOps.formik.values.author}
                          error={
                            contentFormOps.formik.touched.author &&
                            Boolean(contentFormOps.formik.errors.author)
                          }
                          helperText={
                            contentFormOps.formik.touched.author &&
                            contentFormOps.formik.errors.author
                          }
                          placeholder="Enter author name"
                          variant="outlined"
                          onChange={contentFormOps.valueUpdate}
                          fullWidth
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

      {/* Unified AI Progress Dialog */}
      <UnifiedAIProgress open={aiProgressOpen} type={aiProgressType} {...aiProgressProps} />

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
        initialValues={aiDraftFormValues || undefined}
      />

      {/* AI Edit Dialog */}
      <AIEditDialog
        open={aiEditDialogOpen}
        onClose={() => {
          setAiEditDialogOpen(false);
        }}
        onEdit={handleAIEdit}
        isLoading={aiContentOps.isLoading}
        error={aiContentOps.error}
        onErrorClear={aiContentOps.clearError}
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
