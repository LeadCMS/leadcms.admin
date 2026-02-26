import React from "react";
import { TextField, FormControlLabel, Switch, Box, Typography } from "@mui/material";
import { SettingDetailsDto } from "@lib/network/swagger-client";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const parseEmailListInput = (value: string): string[] => {
  if (!value || !value.trim()) {
    return [];
  }

  const trimmedValue = value.trim();

  try {
    const parsed = JSON.parse(trimmedValue) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
  } catch {
    // Fall back to splitting
  }

  return trimmedValue
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

export const formatEmailListValue = (emails: string[]): string => {
  return emails.join(", ");
};

/**
 * Converts a setting key suffix into a human-readable label.
 * E.g. "BlogCover.Instructions" → "Blog Cover Instructions"
 * E.g. "BrandVoice" → "Brand Voice"
 */
export const keyToLabel = (key: string): string => {
  return key
    .split(".")
    .map((segment) =>
      segment.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    )
    .join(" ");
};

export const validateEmailArray = (value: string): string | null => {
  const emails = parseEmailListInput(value);
  if (value.trim() !== "" && emails.length === 0) {
    return "Enter at least one valid email";
  }

  const invalidEmails = emails.filter((email) => !emailRegex.test(email));
  if (invalidEmails.length > 0) {
    return "One or more emails are invalid";
  }
  return null;
};

interface DynamicSettingFieldProps {
  setting: SettingDetailsDto;
  value: string;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
  error?: string;
  labelOverride?: string;
}

export const DynamicSettingField: React.FC<DynamicSettingFieldProps> = ({
  setting,
  value,
  onChange,
  disabled = false,
  error,
  labelOverride,
}) => {
  const key = setting.key || "";
  const type = setting.type || "string";
  const description = setting.description || "";
  const label = labelOverride || keyToLabel(key.split(".").slice(-1)[0] || key);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(key, e.target.value);
  };

  const handleSwitchChange = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    onChange(key, checked ? "true" : "false");
  };

  if (type === "bool") {
    return (
      <FormControlLabel
        control={
          <Switch checked={value === "true"} onChange={handleSwitchChange} disabled={disabled} />
        }
        label={
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              {label}
            </Typography>
            {description && (
              <Typography variant="caption" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
        }
        sx={{ width: "100%", alignItems: "flex-start" }}
      />
    );
  }

  if (type === "int") {
    return (
      <TextField
        fullWidth
        type="number"
        label={label}
        value={value}
        onChange={handleTextChange}
        helperText={error || description}
        variant="outlined"
        size="small"
        error={Boolean(error)}
        disabled={disabled}
        slotProps={{ htmlInput: { step: 1 } }}
      />
    );
  }

  if (type === "email[]") {
    return (
      <TextField
        fullWidth
        multiline
        minRows={2}
        label={label}
        value={value}
        onChange={handleTextChange}
        placeholder="name@example.com, team@example.com"
        helperText={error || description}
        variant="outlined"
        size="small"
        error={Boolean(error)}
        disabled={disabled}
      />
    );
  }

  if (type === "textarea") {
    return (
      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={8}
        label={label}
        value={value}
        onChange={handleTextChange}
        helperText={error || description}
        variant="outlined"
        size="small"
        error={Boolean(error)}
        disabled={disabled}
      />
    );
  }

  // Default: string/text — single-line input
  return (
    <TextField
      fullWidth
      label={label}
      value={value}
      onChange={handleTextChange}
      helperText={error || description}
      variant="outlined"
      size="small"
      error={Boolean(error)}
      disabled={disabled}
    />
  );
};
