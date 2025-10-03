import React, { useState, useEffect } from "react";
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
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
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Save, Info, Link } from "lucide-react";
import { ModuleWrapper } from "@components/module-wrapper";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { SettingDetailsDto } from "@lib/network/swagger-client";
import { networkErrorToStringArray } from "@utils/general-helper";
import { settingsFormBreadcrumbLinks, settingsCurrentBreadcrumb } from "./constants";
import { useLayout } from "@providers/layout-provider";
import { useConfig } from "@providers/config-provider";

interface SettingsFormData {
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
  const { reloadConfig } = useConfig();
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [formData, setFormData] = useState<SettingsFormData>({
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
  });
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
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await client.api.settingsSystemList();
      const settings = response.data;

      const newFormData: SettingsFormData = {
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
      };

      if (settings) {
        settings.forEach((setting: SettingDetailsDto) => {
          if (setting.key === "LivePreviewUrlTemplate") {
            newFormData.LivePreviewUrlTemplate = setting.value || "";
          } else if (setting.key === "PreviewUrlTemplate") {
            newFormData.PreviewUrlTemplate = setting.value || "";
          } else if (setting.key === "Content.MinTitleLength") {
            newFormData["Content.MinTitleLength"] = setting.value || "";
          } else if (setting.key === "Content.MaxTitleLength") {
            newFormData["Content.MaxTitleLength"] = setting.value || "";
          } else if (setting.key === "Content.MinDescriptionLength") {
            newFormData["Content.MinDescriptionLength"] = setting.value || "";
          } else if (setting.key === "Content.MaxDescriptionLength") {
            newFormData["Content.MaxDescriptionLength"] = setting.value || "";
          } else if (setting.key === "Content.EnableRealtimeSyntaxValidation") {
            newFormData["Content.EnableRealtimeSyntaxValidation"] = setting.value || "true";
          } else if (setting.key === "Content.EnableCodeEditorLineNumbers") {
            newFormData["Content.EnableCodeEditorLineNumbers"] = setting.value || "true";
          } else if (setting.key === "Identity.RequireDigit") {
            newFormData["Identity.RequireDigit"] = setting.value || "true";
          } else if (setting.key === "Identity.RequireUppercase") {
            newFormData["Identity.RequireUppercase"] = setting.value || "true";
          } else if (setting.key === "Identity.RequireLowercase") {
            newFormData["Identity.RequireLowercase"] = setting.value || "true";
          } else if (setting.key === "Identity.RequireNonAlphanumeric") {
            newFormData["Identity.RequireNonAlphanumeric"] = setting.value || "true";
          } else if (setting.key === "Identity.RequiredLength") {
            newFormData["Identity.RequiredLength"] = setting.value || "8";
          } else if (setting.key === "Identity.RequiredUniqueChars") {
            newFormData["Identity.RequiredUniqueChars"] = setting.value || "1";
          }
        });
      }

      setFormData(newFormData);
    } catch (err: unknown) {
      notificationsService.error("Failed to load settings");
    } finally {
      setLoading(false);
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

    setValidationErrors(errors);
    return !hasErrors;
  };

  const getTabsWithErrors = (): string[] => {
    const tabsWithErrors: string[] = [];

    // Content tab fields
    const contentFields: Array<keyof SettingsFormData> = [
      "Content.MinTitleLength",
      "Content.MaxTitleLength",
      "Content.MinDescriptionLength",
      "Content.MaxDescriptionLength",
      "Content.EnableRealtimeSyntaxValidation",
      "Content.EnableCodeEditorLineNumbers",
    ];

    // Password tab fields
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

    return tabsWithErrors;
  };

  const handleInputChange =
    (field: keyof SettingsFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear previous error and validate new value
      const error = validateField(field, value);
      setValidationErrors((prev) => ({
        ...prev,
        [field]: error || undefined,
      }));
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
          { key: "LivePreviewUrlTemplate", value: formData.LivePreviewUrlTemplate },
          { key: "PreviewUrlTemplate", value: formData.PreviewUrlTemplate },
          { key: "Content.MinTitleLength", value: formData["Content.MinTitleLength"] },
          { key: "Content.MaxTitleLength", value: formData["Content.MaxTitleLength"] },
          { key: "Content.MinDescriptionLength", value: formData["Content.MinDescriptionLength"] },
          { key: "Content.MaxDescriptionLength", value: formData["Content.MaxDescriptionLength"] },
          {
            key: "Content.EnableRealtimeSyntaxValidation",
            value: formData["Content.EnableRealtimeSyntaxValidation"],
          },
          {
            key: "Content.EnableCodeEditorLineNumbers",
            value: formData["Content.EnableCodeEditorLineNumbers"],
          },
          { key: "Identity.RequireDigit", value: formData["Identity.RequireDigit"] },
          { key: "Identity.RequireUppercase", value: formData["Identity.RequireUppercase"] },
          { key: "Identity.RequireLowercase", value: formData["Identity.RequireLowercase"] },
          {
            key: "Identity.RequireNonAlphanumeric",
            value: formData["Identity.RequireNonAlphanumeric"],
          },
          { key: "Identity.RequiredLength", value: formData["Identity.RequiredLength"] },
          { key: "Identity.RequiredUniqueChars", value: formData["Identity.RequiredUniqueChars"] },
        ];

        // Use the batch import endpoint to save all settings at once
        const importResult = await client.api.settingsImportCreate(settingsToSave);

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
        const errMessage = "Unable to save settings. An error occurred.";
        const errDetails: string[] = [];

        if (error && typeof error === "object" && "data" in error) {
          const errorData = error.data as unknown;
          if (errorData && typeof errorData === "object") {
            if ("error" in errorData && errorData.error && typeof errorData.error === "object") {
              if ("title" in errorData.error && typeof errorData.error.title === "string") {
                errDetails.push(errorData.error.title);
              }
              if ("errors" in errorData.error && errorData.error.errors) {
                errDetails.push(...networkErrorToStringArray(errorData.error.errors));
              }
            }
            if ("message" in errorData && typeof errorData.message === "string") {
              errDetails.push(errorData.message);
            }
          }
        }

        return {
          title: errMessage,
          onClick: errDetails.length > 0 ? () => showErrorModal(errDetails) : undefined,
        };
      },
    });
  };

  const breadcrumbs = settingsFormBreadcrumbLinks;

  const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 3,
        mt: 4,
        pb: 1,
        borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
      }}
    >
      <Box sx={{ mr: 1.5, display: "flex", color: "primary.main" }}>{icon}</Box>
      <Typography variant="subtitle1" fontWeight="500" color="primary.main">
        {title}
      </Typography>
    </Box>
  );

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
            {/* Settings Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                <Tab label="Preview" value="preview" />
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

            {/* Preview Settings Tab */}
            {activeTab === "preview" && (
              <Box sx={{ mt: "20px" }}>
                <Grid container spacing={3} marginBottom={4}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Preview URL Template"
                      value={formData.PreviewUrlTemplate}
                      onChange={handleInputChange("PreviewUrlTemplate")}
                      placeholder="https://leadcms.ai/{lang+slug}/"
                      helperText="URL template used for general content preview"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Live Preview URL Template"
                      value={formData.LivePreviewUrlTemplate}
                      onChange={handleInputChange("LivePreviewUrlTemplate")}
                      placeholder="https://preview.leadcms.ai/{lang+slug}-{userId}/"
                      helperText="URL template used for live preview functionality while editing"
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
                        Template Variables
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      You can use the following variables in your URL templates:
                    </Typography>
                    <List dense>
                      {availableVariables.map((variable) => (
                        <ListItem key={variable.name}>
                          <ListItemIcon>
                            <Chip
                              label={variable.name}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          </ListItemIcon>
                          <ListItemText primary={variable.description} />
                        </ListItem>
                      ))}
                    </List>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Examples:</strong>
                        <br />
                        {" • "}
                        <code>
                          https://preview.leadcms.ai/{"{lang+slug}"}-{"{userId}"}/
                        </code>
                        <br />
                        {" • "}
                        <code>https://leadcms.ai/{"{lang+slug}"}/</code>
                        <br />
                        {" • "}
                        <code>https://leadcms.ai/{"{slug}"}/</code>
                      </Typography>
                    </Alert>
                  </AccordionDetails>
                </Accordion>

                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <SectionHeader icon={<Link size={22} />} title="Template Explanation" />
                    <Stack spacing={2}>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <Box component="span">Preview URL Template</Box>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          This template is used for general content preview functionality. It
                          provides a standardized way to generate preview URLs for published or
                          staged content that can be shared with stakeholders or used for content
                          review processes.
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <Box component="span">Live Preview URL Template</Box>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          This template is used when content editors want to see a live preview of
                          their changes while editing. It typically includes user-specific variables
                          to provide personalized preview URLs that can show draft content or
                          work-in-progress changes.
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Content Settings Tab */}
            {activeTab === "content" && (
              <Box sx={{ mt: "20px" }}>
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

            {/* Password Policy Settings Tab */}
            {activeTab === "password" && (
              <Box sx={{ mt: "20px" }}>
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
