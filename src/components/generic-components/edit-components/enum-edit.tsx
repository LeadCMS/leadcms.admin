import { ReactNode } from "react";
import { EditProps } from "@components/generic-components/edit-components/common";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

export const EnumEdit = ({
  key,
  label,
  example,
  required,
  value,
  onChangeValue,
  disabled,
  valueOptions,
  error,
}: EditProps<string>): ReactNode => {
  return (
    <Autocomplete
      key={key}
      title={example}
      freeSolo
      autoSelect
      size={"small"}
      disabled={disabled}
      value={value}
      onChange={(ev, val) => {
        onChangeValue && onChangeValue(val);
      }}
      options={valueOptions || []}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={!!error}
          helperText={error}
          placeholder="Select option"
          variant="outlined"
          fullWidth
        />
      )}
    />
  );
};
