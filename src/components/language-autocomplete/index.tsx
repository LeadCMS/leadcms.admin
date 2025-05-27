import Autocomplete, { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import { useConfig } from "@providers/config-provider";

interface LanguageAutocompleteProps {
  value: string;
  onChange: (value: string | null) => void;
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactNode;
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement>, 
    option: { label: string; value: string }) => React.ReactNode;
}

export const LanguageAutocomplete = ({
  value,
  onChange,
  renderInput,
  renderOption,
}: LanguageAutocompleteProps) => {
  const { config } = useConfig();
  const languages = config?.languages || [];
  const muiOptions = languages.map((lang) => ({
    label: lang.name,
    value: lang.code,
  }));
  const prepValue = (languageCode: string | null | undefined) => {
    if (!languageCode || !muiOptions.length) {
      return muiOptions[0] || { label: "", value: "" };
    }
    return muiOptions.find((opt) => opt.value === languageCode) || muiOptions[0];
  };

  const defaultRenderOption = (
    props: React.HTMLAttributes<HTMLLIElement>, 
    option: { label: string; value: string }
  ) => {
    return <li {...props}>{option.label}</li>;
  };

  return (
    <Autocomplete
      autoSelect
      value={prepValue(value)}
      onChange={(ev, val) => onChange(val && val.value)}
      getOptionLabel={(option) => option.label}
      options={muiOptions}
      renderInput={renderInput}
      renderOption={renderOption || defaultRenderOption}
    />
  );
};
