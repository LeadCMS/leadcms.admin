import React, { useMemo } from "react";
import { Box, Grid, Alert, Typography } from "@mui/material";
import { SettingDetailsDto } from "@lib/network/swagger-client";
import { DynamicSettingField, keyToLabel } from "./dynamic-setting-field";

interface LeadCaptureSettingsProps {
  settings: SettingDetailsDto[];
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  validationErrors: Record<string, string | undefined>;
  globalError?: string;
}

const LEAD_CAPTURE_PREFIX = "LeadCapture.";

interface StrategyGroup {
  name: string;
  enabledKey: string;
  fields: SettingDetailsDto[];
}

const getStrategyName = (key: string): string => {
  // LeadCapture.{Strategy}.{Field}
  const parts = key.replace(LEAD_CAPTURE_PREFIX, "").split(".");
  return parts[0] || "";
};

const getFieldLabel = (key: string): string => {
  // Strip "LeadCapture.{Strategy}." prefix, label the rest
  const parts = key.replace(LEAD_CAPTURE_PREFIX, "").split(".");
  const fieldParts = parts.slice(1);
  return keyToLabel(fieldParts.join("."));
};

export const LeadCaptureSettings: React.FC<LeadCaptureSettingsProps> = ({
  settings,
  formData,
  onChange,
  validationErrors,
  globalError,
}) => {
  const strategies = useMemo(() => {
    const leadSettings = settings.filter((s) => s.key?.startsWith(LEAD_CAPTURE_PREFIX));

    const grouped = new Map<string, SettingDetailsDto[]>();

    for (const setting of leadSettings) {
      const strategy = getStrategyName(setting.key || "");
      if (!strategy) continue;
      const existing = grouped.get(strategy);
      if (existing) {
        existing.push(setting);
      } else {
        grouped.set(strategy, [setting]);
      }
    }

    const result: StrategyGroup[] = [];

    for (const [name, fields] of grouped) {
      const enabledKey = `${LEAD_CAPTURE_PREFIX}${name}.Enabled`;
      const nonEnabledFields = fields
        .filter((f) => f.key !== enabledKey)
        .sort((a, b) => (a.key || "").localeCompare(b.key || ""));

      result.push({
        name,
        enabledKey,
        fields: nonEnabledFields,
      });
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [settings]);

  if (strategies.length === 0) {
    return (
      <Box sx={{ mt: "20px", maxWidth: 900, mr: "auto" }}>
        <Alert severity="info">
          <Typography variant="body2">No lead capture settings available.</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: "20px", maxWidth: 900, mr: "auto" }}>
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          Configure lead capture notifications for your enabled channels.
        </Typography>
      </Alert>

      {globalError && (
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="body2">{globalError}</Typography>
        </Alert>
      )}

      {strategies.map((strategy) => {
        const isEnabled = formData[strategy.enabledKey] === "true";
        const enabledSetting = settings.find((s) => s.key === strategy.enabledKey);

        return (
          <Box key={strategy.name} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              {strategy.name}
            </Typography>
            <Box
              sx={{
                p: 2.5,
                backgroundColor: "rgba(0, 0, 0, 0.02)",
                borderRadius: 1,
              }}
            >
              {enabledSetting && (
                <DynamicSettingField
                  setting={enabledSetting}
                  value={formData[strategy.enabledKey] || "false"}
                  onChange={onChange}
                  labelOverride={`Enable ${strategy.name} Notifications`}
                />
              )}

              {strategy.fields.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {strategy.fields.map((field) => {
                    const key = field.key || "";
                    const isTextArea = field.type === "textarea";

                    return (
                      <Grid size={{ xs: 12, sm: isTextArea ? 12 : 6 }} key={key}>
                        <DynamicSettingField
                          setting={field}
                          value={formData[key] || ""}
                          onChange={onChange}
                          disabled={!isEnabled}
                          error={validationErrors[key]}
                          labelOverride={getFieldLabel(key)}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
