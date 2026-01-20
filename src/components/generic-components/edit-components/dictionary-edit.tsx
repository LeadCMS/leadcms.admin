import { ReactNode } from "react";
import { EditProps } from "@components/generic-components/edit-components/common";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { DictItem } from "@components/generic-components";

export const DictionaryEdit = ({
  key,
  label,
  example,
  required,
  value,
  onChangeValue,
  disabled,
  valueOptions,
  error,
}: EditProps<DictItem>): ReactNode => {
  return (
    <Autocomplete
      key={key}
      title={example}
      freeSolo
      autoSelect
      size={"small"}
      disabled={disabled}
      options={valueOptions || []}
      getOptionLabel={(option: DictItem | string) => {
        if (typeof option === "string") {
          return option;
        }
        return option && option.displayText;
      }}
      value={value || null}
      onChange={(ev, val: DictItem | string | null) => {
        if (typeof val !== "string") {
          onChangeValue && onChangeValue(val);
        }
      }}
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
