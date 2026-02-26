import React from "react";
import { Box, Grid, Alert, Typography } from "@mui/material";
import { SettingDetailsDto } from "@lib/network/swagger-client";
import { DynamicSettingField, keyToLabel } from "./dynamic-setting-field";

interface SiteProfileSettingsProps {
  settings: SettingDetailsDto[];
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const SITE_PROFILE_PREFIX = "AI.SiteProfile.";

const KNOWN_ORDER: string[] = [
  "AI.SiteProfile.Topic",
  "AI.SiteProfile.Audience",
  "AI.SiteProfile.BrandVoice",
  "AI.SiteProfile.StyleExamples",
  "AI.SiteProfile.PreferredTerms",
  "AI.SiteProfile.AvoidTerms",
];

const getFieldLabel = (key: string): string => {
  const suffix = key.replace(SITE_PROFILE_PREFIX, "");
  return keyToLabel(suffix);
};

export const SiteProfileSettings: React.FC<SiteProfileSettingsProps> = ({
  settings,
  formData,
  onChange,
}) => {
  const siteProfileSettings = settings
    .filter((s) => s.key?.startsWith(SITE_PROFILE_PREFIX))
    .sort((a, b) => {
      const idxA = KNOWN_ORDER.indexOf(a.key || "");
      const idxB = KNOWN_ORDER.indexOf(b.key || "");
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return (a.key || "").localeCompare(b.key || "");
    });

  if (siteProfileSettings.length === 0) {
    return (
      <Box sx={{ mt: "20px", maxWidth: 900, mr: "auto" }}>
        <Alert severity="info">
          <Typography variant="body2">No AI profile settings available.</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: "20px", maxWidth: 900, mr: "auto" }}>
      <Grid container spacing={3} marginBottom={4}>
        <Grid size={{ xs: 12 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Define your AI profile to help the AI assistant generate content that matches your
              brand and audience.
            </Typography>
          </Alert>
        </Grid>

        {siteProfileSettings.map((setting) => {
          const key = setting.key || "";
          return (
            <Grid size={{ xs: 12 }} key={key}>
              <DynamicSettingField
                setting={setting}
                value={formData[key] || ""}
                onChange={onChange}
                labelOverride={getFieldLabel(key)}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
