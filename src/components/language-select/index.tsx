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
  required?: boolean;
}

export const LanguageSelect = ({
  value,
  onChange,
  label = "Language",
  error,
  helperText,
  name = "language",
  disabled = false,
  required = false,
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
      required={required}
      slotProps={{ formHelperText: { sx: { ml: 0 } } }}
    >
      {languages.map((lang) => (
        <MenuItem key={lang.code} value={lang.code}>
          {lang.name}
        </MenuItem>
      ))}
    </TextField>
  );
};
