import { ReactNode } from "react";
import { EditProps } from "@components/generic-components/edit-components/common";
import TextField from "@mui/material/TextField";

export const TextEdit = ({
  key,
  label,
  example,
  required,
  value,
  onChangeValue,
  disabled,
  minLength,
  maxLength,
  pattern,
  error,
}: EditProps<string>): ReactNode => {
  return (
    <TextField
      key={key}
      title={example}
      type={"text"}
      label={label}
      disabled={disabled}
      required={required}
      inputProps={{
        minLength,
        maxLength,
        pattern,
      }}
      error={!!error}
      helperText={error}
      value={value}
      onChange={(e) => {
        onChangeValue && onChangeValue(e.target.value);
      }}
      variant={"outlined"}
      fullWidth={true}
      size={"small"}
    />
  );
};
