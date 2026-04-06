import { useCallback, useMemo } from "react";
import { TextField, InputAdornment, Typography } from "@mui/material";

interface MaskedSlugInputProps {
  value: string;
  onChange: (fullSlug: string) => void;
  prefix?: string | null;
  postfix?: string | null;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  name?: string;
}

export const MaskedSlugInput = ({
  value,
  onChange,
  prefix,
  postfix,
  label = "Slug",
  placeholder = "enter-your-slug",
  disabled = false,
  error = false,
  helperText,
  name,
}: MaskedSlugInputProps) => {
  const normalizedPrefix = prefix || "";
  const normalizedPostfix = postfix || "";
  const hasAffixes = !!normalizedPrefix || !!normalizedPostfix;

  const middlePart = useMemo(() => {
    if (!hasAffixes) return value;

    let result = value;
    if (normalizedPrefix && result.startsWith(normalizedPrefix)) {
      result = result.slice(normalizedPrefix.length);
    }
    if (normalizedPostfix && result.endsWith(normalizedPostfix)) {
      result = result.slice(0, -normalizedPostfix.length);
    }
    return result;
  }, [value, normalizedPrefix, normalizedPostfix, hasAffixes]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const middle = e.target.value;
      if (!middle) {
        onChange("");
        return;
      }
      const fullSlug = normalizedPrefix + middle + normalizedPostfix;
      onChange(fullSlug);
    },
    [normalizedPrefix, normalizedPostfix, onChange]
  );

  const affixStyle = {
    color: "text.secondary",
    fontFamily: "monospace",
    whiteSpace: "nowrap" as const,
    userSelect: "none" as const,
  };

  return (
    <TextField
      disabled={disabled}
      label={label}
      name={name}
      value={middlePart}
      error={error}
      helperText={helperText}
      placeholder={placeholder}
      variant="outlined"
      onChange={handleChange}
      fullWidth
      slotProps={{
        formHelperText: { sx: { ml: 0 } },
        input: {
          ...(normalizedPrefix
            ? {
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0 }}>
                    <Typography sx={affixStyle}>{normalizedPrefix}</Typography>
                  </InputAdornment>
                ),
              }
            : {}),
          ...(normalizedPostfix
            ? {
                endAdornment: (
                  <InputAdornment position="end" sx={{ ml: 0 }}>
                    <Typography sx={affixStyle}>{normalizedPostfix}</Typography>
                  </InputAdornment>
                ),
              }
            : {}),
        },
      }}
    />
  );
};
