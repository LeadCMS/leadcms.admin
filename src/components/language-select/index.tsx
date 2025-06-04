import { TextField, MenuItem } from "@mui/material";
import { useConfig } from "@providers/config-provider";

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string | false | undefined;
  name?: string;
  disabled?: boolean;
}

export const LanguageSelect = ({
  value,
  onChange,
  label = "Language",
  error,
  helperText,
  name = "language",
  disabled = false,
}: LanguageSelectProps) => {
  const { config } = useConfig();
  const languages = config?.languages || [];

  return (
    <TextField
      select
      fullWidth
      label={label}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      helperText={helperText}
      disabled={disabled}
    >
      {languages.map((lang) => (
        <MenuItem key={lang.code} value={lang.code}>
          {lang.name}
        </MenuItem>
      ))}
    </TextField>
  );
};
