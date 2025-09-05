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
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Save, Settings as SettingsIcon, Info, Link } from "lucide-react";
import { ModuleWrapper } from "@components/module-wrapper";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { SettingDetailsDto } from "@lib/network/swagger-client";
import { networkErrorToStringArray } from "@utils/general-helper";
import { settingsFormBreadcrumbLinks, settingsCurrentBreadcrumb } from "./constants";
import { useLayout } from "@providers/layout-provider";

interface SettingsFormData {
  LivePreviewUrlTemplate: string;
  PreviewUrlTemplate: string;
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
  const [formData, setFormData] = useState<SettingsFormData>({
    LivePreviewUrlTemplate: "",
    PreviewUrlTemplate: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      };

      if (settings) {
        settings.forEach((setting: SettingDetailsDto) => {
          if (setting.key === "LivePreviewUrlTemplate") {
            newFormData.LivePreviewUrlTemplate = setting.value || "";
          } else if (setting.key === "PreviewUrlTemplate") {
            newFormData.PreviewUrlTemplate = setting.value || "";
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

  const handleInputChange =
    (field: keyof SettingsFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSave = async () => {
    const savePromise = async () => {
      setSaving(true);

      try {
        // Save LivePreviewUrlTemplate
        await client.api.settingsSystemUpdate("LivePreviewUrlTemplate", {
          value: formData.LivePreviewUrlTemplate,
        });

        // Save PreviewUrlTemplate
        await client.api.settingsSystemUpdate("PreviewUrlTemplate", {
          value: formData.PreviewUrlTemplate,
        });
      } finally {
        setSaving(false);
      }
    };

    notificationsService.promise(savePromise(), {
      pending: "Saving settings...",
      success: "Settings saved successfully",
      error: (error) => {
        const errMessage = "Unable to save settings. An error occurred.";
        const errDetails: string[] = [];

        if (error?.data?.error?.title) {
          errDetails.push(error.data.error.title);
        }
        if (error?.data?.message) {
          errDetails.push(error.data.message);
        }
        if (error?.data?.error?.errors) {
          errDetails.push(...networkErrorToStringArray(error.data.error.errors));
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
            <SectionHeader icon={<SettingsIcon size={22} />} title="URL Template Configuration" />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure URL templates for live preview and content preview functionality.
            </Typography>

            <Grid container spacing={3} marginBottom={4}>
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
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <SectionHeader icon={<Link size={22} />} title="Template Explanation" />
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <Box component="span">Live Preview URL Template</Box>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This template is used when content editors want to see a live preview of their
                  changes while editing. It typically includes user-specific variables to provide
                  personalized preview URLs that can show draft content or work-in-progress changes.
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <Box component="span">Preview URL Template</Box>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This template is used for general content preview functionality. It provides a
                  standardized way to generate preview URLs for published or staged content that can
                  be shared with stakeholders or used for content review processes.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </form>
    </ModuleWrapper>
  );
};

export default Settings;
