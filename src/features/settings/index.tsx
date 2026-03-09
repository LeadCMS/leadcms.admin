import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  FormGroup,
  MenuItem,
  Select,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Save, Info } from "lucide-react";
import { ModuleWrapper } from "@components/module-wrapper";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { SettingDetailsDto } from "@lib/network/swagger-client";
import { toPromiseError } from "@utils/api-error-parser";
import { settingsFormBreadcrumbLinks, settingsCurrentBreadcrumb } from "./constants";
import { useLayout } from "@providers/layout-provider";
import { useConfig } from "@providers/config-provider";
import { useGlobalLanguageFilter } from "@providers/global-language-filter-provider";
import { SiteProfileSettings } from "./components/site-profile-settings";
import { LeadCaptureSettings } from "./components/lead-capture-settings";
import {
  parseEmailListInput,
  formatEmailListValue,
  validateEmailArray,
} from "./components/dynamic-setting-field";

interface SettingsFormData {
  "General.SiteUrl": string;
  "General.UnsubscribeUrl": string;
  "General.PrivacyUrl": string;
  LivePreviewUrlTemplate: string;
  PreviewUrlTemplate: string;
  "Content.MinTitleLength": string;
  "Content.MaxTitleLength": string;
  "Content.MinDescriptionLength": string;
  "Content.MaxDescriptionLength": string;
  "Content.EnableRealtimeSyntaxValidation": string;
  "Content.EnableCodeEditorLineNumbers": string;
  "Identity.RequireDigit": string;
  "Identity.RequireUppercase": string;
  "Identity.RequireLowercase": string;
  "Identity.RequireNonAlphanumeric": string;
  "Identity.RequiredLength": string;
  "Identity.RequiredUniqueChars": string;
  "Media.Cover.Dimensions": string;
  "Media.EnableCoverResize": string;
  "Media.MaxDimensions": string;
  "Media.MaxFileSize": string;
  "Media.PreferredFormat": string;
  "Media.Quality": string;
  "Media.EnableOptimisation": string;
}

const availableVariables = [
  { name: "{lang}", description: "Language code (e.g., en, es, fr)" },
  { name: "{slug}", description: "Content slug" },
  { name: "{userId}", description: "User ID" },
  { name: "{lang+slug}", description: "Language code combined with slug" },
];

const Settings = () => {
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const { setFullWidth } = useLayout();
  const { config, reloadConfig } = useConfig();
  const hasAIAssistance = config?.capabilities?.includes("AIAssistance") || false;
  const hasSiteCapability = config?.capabilities?.includes("Site") || false;
  const supportedLanguages = config?.languages || [];
  const shouldShowLanguageContextAlert = supportedLanguages.length > 1;
  const { selectedLanguage, isLanguageFilterActive } = useGlobalLanguageFilter();
  const languageParam = isLanguageFilterActive ? selectedLanguage : undefined;
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Initialize from URL or default
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) {
      return tabFromUrl;
    }
    return "general";
  });
  const hasInitializedTab = useRef(false);
  const [formData, setFormData] = useState<SettingsFormData>({
    "General.SiteUrl": "",
    "General.UnsubscribeUrl": "",
    "General.PrivacyUrl": "",
    LivePreviewUrlTemplate: "",
    PreviewUrlTemplate: "",
    "Content.MinTitleLength": "",
    "Content.MaxTitleLength": "",
    "Content.MinDescriptionLength": "",
    "Content.MaxDescriptionLength": "",
    "Content.EnableRealtimeSyntaxValidation": "true",
    "Content.EnableCodeEditorLineNumbers": "true",
    "Identity.RequireDigit": "true",
    "Identity.RequireUppercase": "true",
    "Identity.RequireLowercase": "true",
    "Identity.RequireNonAlphanumeric": "true",
    "Identity.RequiredLength": "8",
    "Identity.RequiredUniqueChars": "1",
    "Media.Cover.Dimensions": "",
    "Media.EnableCoverResize": "true",
    "Media.MaxDimensions": "",
    "Media.MaxFileSize": "",
    "Media.PreferredFormat": "",
    "Media.Quality": "",
    "Media.EnableOptimisation": "true",
  });
  const [allSettings, setAllSettings] = useState<SettingDetailsDto[]>([]);
  const [dynamicFormData, setDynamicFormData] = useState<Record<string, string>>({});
  const [dynamicValidationErrors, setDynamicValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [coverWidth, setCoverWidth] = useState("");
  const [coverHeight, setCoverHeight] = useState("");
  const [maxWidth, setMaxWidth] = useState("");
  const [maxHeight, setMaxHeight] = useState("");
  const [availableFormats, setAvailableFormats] = useState<string[]>([]);
  const [loadingFormats, setLoadingFormats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<SettingsFormData>>({});

  // Set full width layout for settings page
  useEffect(() => {
    setFullWidth(true);
    return () => {
      setFullWidth(false);
    };
  }, [setFullWidth]);

  useEffect(() => {
    loadSettings();
    loadAvailableFormats();
  }, [selectedLanguage]);

  // Handle tab changes based on capabilities and sync with URL
  useEffect(() => {
    if (!hasInitializedTab.current) {
      // On first render, validate the tab from URL
      const tabFromUrl = searchParams.get("tab");
      if (!tabFromUrl) {
        // No tab in URL, set default
        const defaultTab = "general";
        setActiveTab(defaultTab);
        setSearchParams({ tab: defaultTab }, { replace: true });
      } else if (!hasAIAssistance && tabFromUrl === "siteProfile") {
        // AI not available but siteProfile tab requested, redirect to general
        setActiveTab("general");
        setSearchParams({ tab: "general" }, { replace: true });
      } else if (!hasSiteCapability && tabFromUrl === "leadCapture") {
        setActiveTab("general");
        setSearchParams({ tab: "general" }, { replace: true });
      }
      hasInitializedTab.current = true;
      return;
    }

    // If AI assistance is removed and user is on siteProfile tab, switch to general
    if (!hasAIAssistance && activeTab === "siteProfile") {
      setActiveTab("general");
      setSearchParams({ tab: "general" }, { replace: true });
    }
    if (!hasSiteCapability && activeTab === "leadCapture") {
      setActiveTab("general");
      setSearchParams({ tab: "general" }, { replace: true });
    }
  }, [activeTab, hasAIAssistance, hasSiteCapability, searchParams, setSearchParams]);

  // Handler for tab changes
  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    setSearchParams({ tab: newValue });
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await client.api.settingsSystemList(
        languageParam ? { language: languageParam } : undefined
      );
      const settings = response.data;

      const newFormData: SettingsFormData = {
        "General.SiteUrl": "",
        "General.UnsubscribeUrl": "",
        "General.PrivacyUrl": "",
        LivePreviewUrlTemplate: "",
        PreviewUrlTemplate: "",
        "Content.MinTitleLength": "",
        "Content.MaxTitleLength": "",
        "Content.MinDescriptionLength": "",
        "Content.MaxDescriptionLength": "",
        "Content.EnableRealtimeSyntaxValidation": "true",
        "Content.EnableCodeEditorLineNumbers": "true",
        "Identity.RequireDigit": "true",
        "Identity.RequireUppercase": "true",
        "Identity.RequireLowercase": "true",
        "Identity.RequireNonAlphanumeric": "true",
        "Identity.RequiredLength": "8",
        "Identity.RequiredUniqueChars": "1",
        "Media.Cover.Dimensions": "",
        "Media.EnableCoverResize": "true",
        "Media.MaxDimensions": "",
        "Media.MaxFileSize": "",
        "Media.PreferredFormat": "",
        "Media.Quality": "",
        "Media.EnableOptimisation": "true",
      };

      const newDynamicData: Record<string, string> = {};

      if (settings) {
        setAllSettings(settings);

        settings.forEach((setting: SettingDetailsDto) => {
          const key = setting.key || "";

          // Dynamic settings: AI.SiteProfile.* and LeadCapture.*
          if (key.startsWith("AI.SiteProfile.") || key.startsWith("LeadCapture.")) {
            if (setting.type === "email[]") {
              const emailList = parseEmailListInput(setting.value || "");
              newDynamicData[key] = formatEmailListValue(emailList);
            } else {
              newDynamicData[key] = setting.value || "";
            }
            return;
          }

          // Static settings
          if (key === "General.SiteUrl") {
            newFormData["General.SiteUrl"] = setting.value || "";
          } else if (key === "General.UnsubscribeUrl") {
            newFormData["General.UnsubscribeUrl"] = setting.value || "";
          } else if (key === "General.PrivacyUrl") {
            newFormData["General.PrivacyUrl"] = setting.value || "";
          } else if (key === "LivePreviewUrlTemplate") {
            newFormData.LivePreviewUrlTemplate = setting.value || "";
          } else if (key === "PreviewUrlTemplate") {
            newFormData.PreviewUrlTemplate = setting.value || "";
          } else if (key === "Content.MinTitleLength") {
            newFormData["Content.MinTitleLength"] = setting.value || "";
          } else if (key === "Content.MaxTitleLength") {
            newFormData["Content.MaxTitleLength"] = setting.value || "";
          } else if (key === "Content.MinDescriptionLength") {
            newFormData["Content.MinDescriptionLength"] = setting.value || "";
          } else if (key === "Content.MaxDescriptionLength") {
            newFormData["Content.MaxDescriptionLength"] = setting.value || "";
          } else if (key === "Content.EnableRealtimeSyntaxValidation") {
            newFormData["Content.EnableRealtimeSyntaxValidation"] = setting.value || "true";
          } else if (key === "Content.EnableCodeEditorLineNumbers") {
            newFormData["Content.EnableCodeEditorLineNumbers"] = setting.value || "true";
          } else if (key === "Identity.RequireDigit") {
            newFormData["Identity.RequireDigit"] = setting.value || "true";
          } else if (key === "Identity.RequireUppercase") {
            newFormData["Identity.RequireUppercase"] = setting.value || "true";
          } else if (key === "Identity.RequireLowercase") {
            newFormData["Identity.RequireLowercase"] = setting.value || "true";
          } else if (key === "Identity.RequireNonAlphanumeric") {
            newFormData["Identity.RequireNonAlphanumeric"] = setting.value || "true";
          } else if (key === "Identity.RequiredLength") {
            newFormData["Identity.RequiredLength"] = setting.value || "8";
          } else if (key === "Identity.RequiredUniqueChars") {
            newFormData["Identity.RequiredUniqueChars"] = setting.value || "1";
          } else if (key === "Media.Cover.Dimensions") {
            newFormData["Media.Cover.Dimensions"] = setting.value || "";
            const rawSize = setting.value || "";
            const [widthValue, heightValue] = rawSize.split(/x/i);
            setCoverWidth(widthValue?.trim() || "");
            setCoverHeight(heightValue?.trim() || "");
          } else if (key === "Media.EnableCoverResize") {
            newFormData["Media.EnableCoverResize"] = setting.value || "true";
          } else if (key === "Media.Max.Dimensions") {
            newFormData["Media.MaxDimensions"] = setting.value || "";
            const rawSize = setting.value || "";
            const [widthValue, heightValue] = rawSize.split(/x/i);
            setMaxWidth(widthValue?.trim() || "");
            setMaxHeight(heightValue?.trim() || "");
          } else if (key === "Media.Max.FileSize") {
            newFormData["Media.MaxFileSize"] = setting.value || "";
          } else if (key === "Media.PreferredFormat") {
            newFormData["Media.PreferredFormat"] = setting.value || "";
          } else if (key === "Media.Quality") {
            newFormData["Media.Quality"] = setting.value || "";
          } else if (key === "Media.EnableOptimisation") {
            newFormData["Media.EnableOptimisation"] = setting.value || "true";
          }
        });
      }

      setFormData(newFormData);
      setDynamicFormData(newDynamicData);
    } catch (err: unknown) {
      notificationsService.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableFormats = async () => {
    try {
      setLoadingFormats(true);
      const response = await client.api.mediaFormatsList();
      if (response.data) {
        setAvailableFormats(response.data);
      }
    } catch (err: unknown) {
      notificationsService.error("Failed to load available media formats");
    } finally {
      setLoadingFormats(false);
    }
  };

  const validateField = (field: keyof SettingsFormData, value: string): string | null => {
    switch (field) {
      case "Content.MaxTitleLength":
        if (value && value.trim() !== "") {
          const numValue = parseInt(value, 10);
          if (isNaN(numValue) || numValue < 15) {
            return "Maximum Title Length must be at least 15 characters";
          }
        }
        break;
      case "Content.MaxDescriptionLength":
        if (value && value.trim() !== "") {
          const numValue = parseInt(value, 10);
          if (isNaN(numValue) || numValue < 15) {
            return "Maximum Description Length must be at least 15 characters";
          }
        }
        break;
      case "Content.MinTitleLength":
        if (value && value.trim() !== "") {
          const numValue = parseInt(value, 10);
          if (isNaN(numValue) || numValue < 1) {
            return "Minimum Title Length must be at least 1 character";
          }
        }
        break;
      case "Content.MinDescriptionLength":
        if (value && value.trim() !== "") {
          const numValue = parseInt(value, 10);
          if (isNaN(numValue) || numValue < 1) {
            return "Minimum Description Length must be at least 1 character";
          }
        }
        break;
      case "Identity.RequiredLength":
        if (value && value.trim() !== "") {
          const numValue = parseInt(value, 10);
          if (isNaN(numValue) || numValue < 1 || numValue > 128) {
            return "Password length must be between 1 and 128 characters";
          }
        }
        break;
      case "Identity.RequiredUniqueChars":
        if (value && value.trim() !== "") {
          const numValue = parseInt(value, 10);
          if (isNaN(numValue) || numValue < 1 || numValue > 128) {
            return "Unique characters must be between 1 and 128";
          }
        }
        break;
    }
    return null;
  };

  const validateDynamicLeadCapture = (): {
    errors: Record<string, string | undefined>;
    globalError: string | undefined;
    hasErrors: boolean;
  } => {
    const errors: Record<string, string | undefined> = {};
    let hasErrors = false;
    let globalError: string | undefined;

    const leadSettings = allSettings.filter((s) => s.key?.startsWith("LeadCapture."));

    // Group by strategy to find enabled toggles
    const strategies = new Map<string, SettingDetailsDto[]>();
    for (const s of leadSettings) {
      const parts = (s.key || "").replace("LeadCapture.", "").split(".");
      const strategy = parts[0];
      if (!strategy) continue;
      const existing = strategies.get(strategy);
      if (existing) {
        existing.push(s);
      } else {
        strategies.set(strategy, [s]);
      }
    }

    let anyEnabled = false;
    for (const [strategy, fields] of strategies) {
      const enabledKey = `LeadCapture.${strategy}.Enabled`;
      const isEnabled = dynamicFormData[enabledKey] === "true";
      if (isEnabled) anyEnabled = true;

      for (const field of fields) {
        const key = field.key || "";
        if (key.endsWith(".Enabled")) continue;

        const value = dynamicFormData[key] || "";

        if (isEnabled && field.required && !value.trim()) {
          const fieldName = key.split(".").slice(-1)[0] || key;
          errors[key] = `${fieldName} is required when ${strategy} is enabled`;
          hasErrors = true;
        }

        if (field.type === "email[]" && value.trim()) {
          const emailError = validateEmailArray(value);
          if (emailError) {
            errors[key] = emailError;
            hasErrors = true;
          }
        }
      }
    }

    if (strategies.size > 0 && !anyEnabled) {
      globalError = "Enable at least one lead capture channel";
      hasErrors = true;
    }

    return { errors, globalError, hasErrors };
  };

  const [leadCaptureGlobalError, setLeadCaptureGlobalError] = useState<string | undefined>();

  const validateAllFields = (): boolean => {
    const errors: Partial<SettingsFormData> = {};
    let hasErrors = false;

    (Object.keys(formData) as Array<keyof SettingsFormData>).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        hasErrors = true;
      }
    });

    if (hasSiteCapability) {
      const lcResult = validateDynamicLeadCapture();
      setDynamicValidationErrors(lcResult.errors);
      setLeadCaptureGlobalError(lcResult.globalError);
      if (lcResult.hasErrors) {
        hasErrors = true;
      }
    }

    setValidationErrors(errors);
    return !hasErrors;
  };

  const getTabsWithErrors = (): string[] => {
    const tabsWithErrors: string[] = [];

    const contentFields: Array<keyof SettingsFormData> = [
      "Content.MinTitleLength",
      "Content.MaxTitleLength",
      "Content.MinDescriptionLength",
      "Content.MaxDescriptionLength",
      "Content.EnableRealtimeSyntaxValidation",
      "Content.EnableCodeEditorLineNumbers",
    ];

    const passwordFields: Array<keyof SettingsFormData> = [
      "Identity.RequiredLength",
      "Identity.RequiredUniqueChars",
    ];

    if (contentFields.some((field) => validationErrors[field])) {
      tabsWithErrors.push("content");
    }

    if (passwordFields.some((field) => validationErrors[field])) {
      tabsWithErrors.push("password");
    }

    const hasLeadErrors =
      leadCaptureGlobalError || Object.values(dynamicValidationErrors).some(Boolean);
    if (hasLeadErrors) {
      tabsWithErrors.push("leadCapture");
    }

    return tabsWithErrors;
  };

  const handleInputChange =
    (field: keyof SettingsFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      const error = validateField(field, value);
      setValidationErrors((prev) => ({
        ...prev,
        [field]: error || undefined,
      }));
    };

  const handleDynamicChange = (key: string, value: string) => {
    setDynamicFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Clear validation error for this key
    setDynamicValidationErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }));

    // If toggling off an Enabled switch, clear errors for that strategy
    if (key.endsWith(".Enabled") && value !== "true") {
      const prefix = key.replace(".Enabled", ".");
      setDynamicValidationErrors((prev) => {
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          if (k.startsWith(prefix)) {
            next[k] = undefined;
          }
        }
        return next;
      });
      setLeadCaptureGlobalError(undefined);
    }
  };

  const handleSave = async () => {
    const savePromise = async () => {
      setSaving(true);

      try {
        // Validate form before saving
        const isValid = validateAllFields();
        if (!isValid) {
          throw new Error("Please fix the validation errors before saving.");
        }

        // Save all settings using batch import
        const settingsToSave = [
          {
            key: "General.SiteUrl",
            value: formData["General.SiteUrl"],
          },
          {
            key: "General.UnsubscribeUrl",
            value: formData["General.UnsubscribeUrl"],
          },
          {
            key: "General.PrivacyUrl",
            value: formData["General.PrivacyUrl"],
          },
          {
            key: "LivePreviewUrlTemplate",
            value: formData.LivePreviewUrlTemplate,
          },
          {
            key: "PreviewUrlTemplate",
            value: formData.PreviewUrlTemplate,
          },
          {
            key: "Content.MinTitleLength",
            value: formData["Content.MinTitleLength"],
          },
          {
            key: "Content.MaxTitleLength",
            value: formData["Content.MaxTitleLength"],
          },
          {
            key: "Content.MinDescriptionLength",
            value: formData["Content.MinDescriptionLength"],
          },
          {
            key: "Content.MaxDescriptionLength",
            value: formData["Content.MaxDescriptionLength"],
          },
          {
            key: "Content.EnableRealtimeSyntaxValidation",
            value: formData["Content.EnableRealtimeSyntaxValidation"],
          },
          {
            key: "Content.EnableCodeEditorLineNumbers",
            value: formData["Content.EnableCodeEditorLineNumbers"],
          },
          {
            key: "Identity.RequireDigit",
            value: formData["Identity.RequireDigit"],
          },
          {
            key: "Identity.RequireUppercase",
            value: formData["Identity.RequireUppercase"],
          },
          {
            key: "Identity.RequireLowercase",
            value: formData["Identity.RequireLowercase"],
          },
          {
            key: "Identity.RequireNonAlphanumeric",
            value: formData["Identity.RequireNonAlphanumeric"],
          },
          {
            key: "Identity.RequiredLength",
            value: formData["Identity.RequiredLength"],
          },
          {
            key: "Identity.RequiredUniqueChars",
            value: formData["Identity.RequiredUniqueChars"],
          },
        ];

        // Add Media settings
        const coverDimensionsValue =
          coverWidth.trim() && coverHeight.trim()
            ? `${coverWidth.trim()}x${coverHeight.trim()}`
            : null;
        const maxDimensionsValue =
          maxWidth.trim() && maxHeight.trim() ? `${maxWidth.trim()}x${maxHeight.trim()}` : null;

        settingsToSave.push(
          {
            key: "Media.Cover.Dimensions",
            value: coverDimensionsValue || "",
          },
          {
            key: "Media.EnableCoverResize",
            value: formData["Media.EnableCoverResize"],
          },
          {
            key: "Media.Max.Dimensions",
            value: maxDimensionsValue || "",
          },
          {
            key: "Media.Max.FileSize",
            value: formData["Media.MaxFileSize"],
          },
          {
            key: "Media.PreferredFormat",
            value: formData["Media.PreferredFormat"],
          },
          {
            key: "Media.Quality",
            value: formData["Media.Quality"],
          },
          {
            key: "Media.EnableOptimisation",
            value: formData["Media.EnableOptimisation"],
          }
        );

        // Add dynamic AI.SiteProfile.* settings
        if (hasAIAssistance) {
          for (const setting of allSettings) {
            const key = setting.key || "";
            if (!key.startsWith("AI.SiteProfile.")) continue;
            settingsToSave.push({
              key,
              value: dynamicFormData[key] || "",
            });
          }
        }

        // Add dynamic LeadCapture.* settings
        if (hasSiteCapability) {
          for (const setting of allSettings) {
            const key = setting.key || "";
            if (!key.startsWith("LeadCapture.")) continue;
            let value = dynamicFormData[key] || "";
            if (setting.type === "email[]") {
              const emailList = parseEmailListInput(value);
              value = JSON.stringify(emailList);
            }
            settingsToSave.push({ key, value });
          }
        }

        // Set language on each item when a specific language is selected
        const settingsWithLanguage = settingsToSave.map((s) => ({
          ...s,
          language: languageParam || null,
        }));

        // Use the batch import endpoint to save all settings at once
        const importResult = await client.api.settingsImportCreate(settingsWithLanguage);

        // Check if there were any failures
        if (importResult.data.failed && importResult.data.failed > 0) {
          const errorMessages =
            importResult.data.errors?.map((err) => err.message).join(", ") ||
            "Some settings failed to save";
          throw new Error(`Failed to save ${importResult.data.failed} settings: ${errorMessages}`);
        }

        // Reload config from /api/config to update the app with new settings
        await reloadConfig();
      } finally {
        setSaving(false);
      }
    };

    notificationsService.promise(savePromise(), {
      pending: "Saving settings...",
      success: "Settings saved successfully",
      error: (error: unknown) => {
        return toPromiseError(error, showErrorModal, "Unable to save settings. An error occurred.");
      },
    });
  };

  const breadcrumbs = settingsFormBreadcrumbLinks;

  const actionButtons = (
    <Box sx={{ display: "flex", width: "100%", gap: 2, justifyContent: "flex-end" }}>
      <Button
        variant="contained"
        startIcon={saving ? <CircularProgress size={16} /> : <Save size={16} />}
        onClick={handleSave}
        disabled={saving}
        size="medium"
      >
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </Box>
  );

  if (loading) {
    return (
      <ModuleWrapper
        breadcrumbs={breadcrumbs}
        currentBreadcrumb={settingsCurrentBreadcrumb}
        leftContainerChildren={null}
        extraActionsContainerChildren={null}
        addButtonContainerChildren={null}
      >
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
          <CircularProgress />
        </Box>
      </ModuleWrapper>
    );
  }

  return (
    <ModuleWrapper
      breadcrumbs={breadcrumbs}
      currentBreadcrumb={settingsCurrentBreadcrumb}
      leftContainerChildren={null}
      extraActionsContainerChildren={null}
      addButtonContainerChildren={null}
      isForm={true}
      actionButtons={actionButtons}
    >
      <form>
        <Card>
          <CardContent>
            {/* Language context alert */}
            {shouldShowLanguageContextAlert &&
              (isLanguageFilterActive ? (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Language override: {selectedLanguage}</strong> — You are editing
                    language-specific settings. Only values that differ from the defaults will be
                    saved. These overrides apply exclusively to <strong>{selectedLanguage}</strong>
                    -specific operations.
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>All Languages (global defaults)</strong> — You are editing the default
                    settings that apply across all languages. To create language-specific overrides,
                    select a language from the global language filter.
                  </Typography>
                </Alert>
              ))}

            {/* Settings Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="General" value="general" />
                {hasAIAssistance && <Tab label="AI Profile" value="siteProfile" />}
                <Tab label="Preview" value="preview" />
                <Tab label="Media" value="media" />
                {hasSiteCapability && (
                  <Tab
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        Lead Capture
                        {getTabsWithErrors().includes("leadCapture") && (
                          <Box
                            component="span"
                            sx={{
                              color: "error.main",
                              fontWeight: "bold",
                              fontSize: "1.2em",
                            }}
                          >
                            *
                          </Box>
                        )}
                      </Box>
                    }
                    value="leadCapture"
                  />
                )}
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      Content
                      {getTabsWithErrors().includes("content") && (
                        <Box
                          component="span"
                          sx={{
                            color: "error.main",
                            fontWeight: "bold",
                            fontSize: "1.2em",
                          }}
                        >
                          *
                        </Box>
                      )}
                    </Box>
                  }
                  value="content"
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      Password Policy
                      {getTabsWithErrors().includes("password") && (
                        <Box
                          component="span"
                          sx={{
                            color: "error.main",
                            fontWeight: "bold",
                            fontSize: "1.2em",
                          }}
                        >
                          *
                        </Box>
                      )}
                    </Box>
                  }
                  value="password"
                />
              </Tabs>
            </Box>

            {/* General Settings Tab */}
            {activeTab === "general" && (
              <Box sx={{ mt: "20px", maxWidth: 900, mr: "auto" }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  General URLs
                </Typography>
                <Grid container spacing={3} marginBottom={4}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Site URL"
                      value={formData["General.SiteUrl"]}
                      onChange={handleInputChange("General.SiteUrl")}
                      placeholder="https://example.com"
                      helperText="Base public site URL used across the application."
                      variant="outlined"
                      size="small"
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Unsubscribe URL"
                      value={formData["General.UnsubscribeUrl"]}
                      onChange={handleInputChange("General.UnsubscribeUrl")}
                      placeholder="https://example.com/unsubscribe"
                      helperText="Public URL where recipients can manage unsubscribe actions."
                      variant="outlined"
                      size="small"
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Privacy URL"
                      value={formData["General.PrivacyUrl"]}
                      onChange={handleInputChange("General.PrivacyUrl")}
                      placeholder="https://example.com/privacy"
                      helperText="Public URL pointing to your privacy policy."
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Preview Settings Tab */}
            {activeTab === "preview" && (
              <Box sx={{ mt: "20px", maxWidth: 900, mr: "auto" }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Preview URL Templates
                </Typography>
                <Grid container spacing={4} marginBottom={5}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Preview URL Template"
                      value={formData.PreviewUrlTemplate}
                      onChange={handleInputChange("PreviewUrlTemplate")}
                      placeholder="https://leadcms.ai/{lang+slug}/"
                      helperText="URL template used for general content preview.
                      This is typically a public URL."
                      variant="outlined"
                      size="small"
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Live Preview URL Template"
                      value={formData.LivePreviewUrlTemplate}
                      onChange={handleInputChange("LivePreviewUrlTemplate")}
                      placeholder="https://preview.leadcms.ai/{lang+slug}-{userId}/"
                      helperText="URL template for live preview while editing.
                      Includes user-specific variables for personalized previews."
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                </Grid>

                <Accordion sx={{ mt: 3 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                      borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                      "& .MuiAccordionSummary-content": {
                        alignItems: "center",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box sx={{ mr: 1.5, display: "flex", color: "primary.main" }}>
                        <Info size={22} />
                      </Box>
                      <Typography variant="subtitle1" fontWeight="500" color="primary.main">
                        Available Template Variables
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      You can use the following variables in your URL templates. They will be
                      replaced with actual values when generating preview URLs:
                    </Typography>
                    <Stack spacing={2}>
                      {availableVariables.map((variable) => (
                        <Box
                          key={variable.name}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 2,
                            p: 1.5,
                            backgroundColor: "rgba(0, 0, 0, 0.02)",
                            borderRadius: 1,
                          }}
                        >
                          <Chip
                            label={variable.name}
                            size="small"
                            variant="outlined"
                            sx={{ mt: 0.5, flexShrink: 0 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {variable.description}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}

            {/* Media Settings Tab */}
            {activeTab === "media" && (
              <Box sx={{ mt: "20px", maxWidth: 900, mr: "auto" }}>
                <Alert severity="info" sx={{ mb: 4 }}>
                  <Typography variant="body2">
                    Configure media processing settings including file size limits, optimization
                    preferences, and cover image handling.
                  </Typography>
                </Alert>

                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  File Management
                </Typography>
                <Box sx={{ mb: 5 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum File Size (KB)"
                    value={formData["Media.MaxFileSize"]}
                    onChange={handleInputChange("Media.MaxFileSize")}
                    placeholder="10240"
                    variant="outlined"
                    size="small"
                    helperText="Maximum file size for uploads in kilobytes"
                    slotProps={{ htmlInput: { min: 1, step: 1 } }}
                  />
                </Box>

                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Optimization Settings
                </Typography>
                <Box
                  sx={{ mb: 3, p: 2.5, backgroundColor: "rgba(0, 0, 0, 0.02)", borderRadius: 1 }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData["Media.EnableOptimisation"] === "true"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            "Media.EnableOptimisation": e.target.checked ? "true" : "false",
                          }))
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          Auto-Optimize on Upload
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          When enabled, newly uploaded media files will be automatically optimized
                        </Typography>
                      </Box>
                    }
                    sx={{ width: "100%" }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1.5, display: "block", pl: 6 }}
                  >
                    Manual optimization via the Optimize button in media preview is always
                    available, regardless of this setting.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    mb: 3,
                    p: 2.5,
                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 2, fontWeight: 500 }}
                  >
                    Maximum Dimensions
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 2, display: "block" }}
                  >
                    Maximum dimensions for media resizing during optimization
                  </Typography>
                  <Grid container spacing={2} alignItems="flex-end">
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Width"
                        value={maxWidth}
                        onChange={(e) => setMaxWidth(e.target.value)}
                        placeholder="2048"
                        variant="outlined"
                        size="small"
                        slotProps={{ htmlInput: { min: 1 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Height"
                        value={maxHeight}
                        onChange={(e) => setMaxHeight(e.target.value)}
                        placeholder="2048"
                        variant="outlined"
                        size="small"
                        slotProps={{ htmlInput: { min: 1 } }}
                      />
                    </Grid>
                  </Grid>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Saved as WxH. If either value is empty, the setting is cleared.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    mb: 3,
                    p: 2.5,
                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 2, fontWeight: 500 }}
                  >
                    Format & Quality
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 2, display: "block" }}
                  >
                    Target format and quality level for optimized images
                  </Typography>
                  <Grid container spacing={2} alignItems="flex-start">
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Select
                        fullWidth
                        value={formData["Media.PreferredFormat"]}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            "Media.PreferredFormat": e.target.value,
                          }))
                        }
                        displayEmpty
                        size="small"
                        disabled={loadingFormats || availableFormats.length === 0}
                      >
                        <MenuItem value="">
                          <em>{loadingFormats ? "Loading..." : "None (use original format)"}</em>
                        </MenuItem>
                        {availableFormats.map((format) => (
                          <MenuItem key={format} value={format}>
                            {format}
                          </MenuItem>
                        ))}
                      </Select>
                      {availableFormats.length === 0 && !loadingFormats && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 1, display: "block" }}
                        >
                          No formats available. Please check server configuration.
                        </Typography>
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Quality (%)"
                        value={formData["Media.Quality"]}
                        onChange={handleInputChange("Media.Quality")}
                        placeholder="80"
                        variant="outlined"
                        size="small"
                        helperText="1-100, higher means better quality but larger files"
                        slotProps={{ htmlInput: { min: 1, max: 100, step: 1 } }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Cover Image Settings
                </Typography>
                <Box
                  sx={{ mb: 3, p: 2.5, backgroundColor: "rgba(0, 0, 0, 0.02)", borderRadius: 1 }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData["Media.EnableCoverResize"] === "true"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            "Media.EnableCoverResize": e.target.checked ? "true" : "false",
                          }))
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                          Auto-Resize Cover Images
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          When enabled, cover images will be automatically resized and cropped to
                          the dimensions specified below
                        </Typography>
                      </Box>
                    }
                    sx={{ width: "100%" }}
                  />
                </Box>

                <Box
                  sx={{ mb: 3, p: 2.5, backgroundColor: "rgba(0, 0, 0, 0.02)", borderRadius: 1 }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 2, fontWeight: 500 }}
                  >
                    Cover Dimensions
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 2, display: "block" }}
                  >
                    Target dimensions for cover images. Used for both AI generation and automatic
                    resizing (default: 512x256)
                  </Typography>
                  <Grid container spacing={2} alignItems="flex-end">
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Width"
                        value={coverWidth}
                        onChange={(e) => setCoverWidth(e.target.value)}
                        placeholder="512"
                        variant="outlined"
                        size="small"
                        slotProps={{ htmlInput: { min: 1 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Height"
                        value={coverHeight}
                        onChange={(e) => setCoverHeight(e.target.value)}
                        placeholder="256"
                        variant="outlined"
                        size="small"
                        slotProps={{ htmlInput: { min: 1 } }}
                      />
                    </Grid>
                  </Grid>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Saved as WxH. If either value is empty, the setting is cleared.
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Lead Capture Settings Tab */}
            {activeTab === "leadCapture" && hasSiteCapability && (
              <LeadCaptureSettings
                settings={allSettings}
                formData={dynamicFormData}
                onChange={handleDynamicChange}
                validationErrors={dynamicValidationErrors}
                globalError={leadCaptureGlobalError}
              />
            )}

            {/* Content Settings Tab */}
            {activeTab === "content" && (
              <Box sx={{ mt: "20px", maxWidth: 900, mr: "auto" }}>
                <Grid container spacing={3} marginBottom={4}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Minimum Title Length"
                      value={formData["Content.MinTitleLength"]}
                      onChange={handleInputChange("Content.MinTitleLength")}
                      placeholder="10"
                      helperText={
                        validationErrors["Content.MinTitleLength"] ||
                        "Minimum number of characters required for content titles"
                      }
                      variant="outlined"
                      size="small"
                      error={Boolean(validationErrors["Content.MinTitleLength"])}
                      slotProps={{ htmlInput: { min: 1 } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Maximum Title Length"
                      value={formData["Content.MaxTitleLength"]}
                      onChange={handleInputChange("Content.MaxTitleLength")}
                      placeholder="60"
                      helperText={
                        validationErrors["Content.MaxTitleLength"] ||
                        "Maximum number of characters allowed for content titles"
                      }
                      variant="outlined"
                      size="small"
                      error={Boolean(validationErrors["Content.MaxTitleLength"])}
                      slotProps={{ htmlInput: { min: 15 } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Minimum Description Length"
                      value={formData["Content.MinDescriptionLength"]}
                      onChange={handleInputChange("Content.MinDescriptionLength")}
                      placeholder="20"
                      helperText={
                        validationErrors["Content.MinDescriptionLength"] ||
                        "Minimum number of characters required for content descriptions"
                      }
                      variant="outlined"
                      size="small"
                      error={Boolean(validationErrors["Content.MinDescriptionLength"])}
                      slotProps={{ htmlInput: { min: 1 } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Maximum Description Length"
                      value={formData["Content.MaxDescriptionLength"]}
                      onChange={handleInputChange("Content.MaxDescriptionLength")}
                      placeholder="155"
                      helperText={
                        validationErrors["Content.MaxDescriptionLength"] ||
                        "Maximum number of characters allowed for content descriptions"
                      }
                      variant="outlined"
                      size="small"
                      error={Boolean(validationErrors["Content.MaxDescriptionLength"])}
                      slotProps={{ htmlInput: { min: 15 } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ py: 2, borderTop: 1, borderColor: "divider" }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Content Editor Settings
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData["Content.EnableRealtimeSyntaxValidation"] === "true"}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                "Content.EnableRealtimeSyntaxValidation": e.target.checked
                                  ? "true"
                                  : "false",
                              });
                            }}
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body1">
                              Enable Realtime Syntax Validation
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              When enabled, MDX, JSON, and YAML content will be validated in
                              real-time as users type. This helps catch syntax errors early and
                              avoid sending invalid draft content to the backend and preview server.
                            </Typography>
                          </Box>
                        }
                        sx={{ alignItems: "flex-start" }}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData["Content.EnableCodeEditorLineNumbers"] === "true"}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                "Content.EnableCodeEditorLineNumbers": e.target.checked
                                  ? "true"
                                  : "false",
                              });
                            }}
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body1">
                              Show Line Numbers in Code Editors
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              When enabled, line numbers will be displayed in MDX source mode and
                              code block editors. This can help with debugging and code navigation
                              but may take up additional screen space.
                            </Typography>
                          </Box>
                        }
                        sx={{ alignItems: "flex-start" }}
                      />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Alert severity="info">
                      <Typography variant="body2">
                        <strong>Content Length Validation:</strong>
                        <br />
                        These settings enforce validation rules when creating or editing content.
                        Both title and description must meet the specified length requirements.
                        <br />
                        <br />
                        <strong>Important:</strong> For existing content records, adjusting these
                        settings will not automatically increase or decrease the actual length of
                        the existing content. However, validation rules will be enforced the next
                        time you try to edit existing content. If the requirements are not met, you
                        will not be able to save the content unless the validation errors are fixed.
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* AI Profile Settings Tab */}
            {activeTab === "siteProfile" && hasAIAssistance && (
              <SiteProfileSettings
                settings={allSettings}
                formData={dynamicFormData}
                onChange={handleDynamicChange}
              />
            )}

            {/* Password Policy Settings Tab */}
            {activeTab === "password" && (
              <Box sx={{ mt: "20px", maxWidth: 900, mr: "auto" }}>
                <Grid container spacing={3} marginBottom={4}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Minimum Password Length"
                      value={formData["Identity.RequiredLength"]}
                      onChange={handleInputChange("Identity.RequiredLength")}
                      placeholder="8"
                      helperText={
                        validationErrors["Identity.RequiredLength"] ||
                        "Minimum number of characters required for passwords"
                      }
                      variant="outlined"
                      size="small"
                      error={Boolean(validationErrors["Identity.RequiredLength"])}
                      slotProps={{ htmlInput: { min: 1, max: 128 } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Required Unique Characters"
                      value={formData["Identity.RequiredUniqueChars"]}
                      onChange={handleInputChange("Identity.RequiredUniqueChars")}
                      placeholder="1"
                      helperText={
                        validationErrors["Identity.RequiredUniqueChars"] ||
                        "Minimum number of unique characters required"
                      }
                      variant="outlined"
                      size="small"
                      error={Boolean(validationErrors["Identity.RequiredUniqueChars"])}
                      slotProps={{ htmlInput: { min: 1, max: 128 } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Character Requirements
                    </Typography>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData["Identity.RequireDigit"] === "true"}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                "Identity.RequireDigit": e.target.checked ? "true" : "false",
                              }))
                            }
                          />
                        }
                        label="Require at least one digit (0-9)"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData["Identity.RequireUppercase"] === "true"}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                "Identity.RequireUppercase": e.target.checked ? "true" : "false",
                              }))
                            }
                          />
                        }
                        label="Require at least one uppercase letter (A-Z)"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData["Identity.RequireLowercase"] === "true"}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                "Identity.RequireLowercase": e.target.checked ? "true" : "false",
                              }))
                            }
                          />
                        }
                        label="Require at least one lowercase letter (a-z)"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData["Identity.RequireNonAlphanumeric"] === "true"}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                "Identity.RequireNonAlphanumeric": e.target.checked
                                  ? "true"
                                  : "false",
                              }))
                            }
                          />
                        }
                        label="Require at least one special character (!@#$%^&*)"
                      />
                    </FormGroup>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        <strong>Password Policy Configuration:</strong>
                        <br />
                        These settings define the password requirements for user accounts. Changes
                        will apply to new passwords and password resets. Existing passwords remain
                        valid until users change them.
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      </form>
    </ModuleWrapper>
  );
};

export default Settings;
