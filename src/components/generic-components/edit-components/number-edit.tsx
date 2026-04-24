import { ReactNode } from "react";
import { EditProps } from "@components/generic-components/edit-components/common";
import TextField from "@mui/material/TextField";

export const NumberEdit = ({
  key,
  label,
  example,
  value,
  onChangeValue,
  disabled,
  required,
  pattern,
  error,
}: EditProps<number>): ReactNode => {
  return (
    <TextField
      key={key}
      type={"number"}
      label={label}
      title={example}
      disabled={disabled}
      value={value}
      required={required}
      inputProps={{
        pattern: pattern,
      }}
      error={!!error}
      helperText={error}
      onChange={(e) => {
        onChangeValue && onChangeValue(Number(e.target.value || "0"));
      }}
      variant={"outlined"}
      fullWidth={true}
      size={"small"}
    />
  );
};
