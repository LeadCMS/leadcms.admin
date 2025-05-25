import Autocomplete, { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import Locale from "locale-codes";

interface LanguageAutocompleteProps {
  value: string;
  onChange: (value: string | null) => void;
  renderInput: (params: AutocompleteRenderInputParams) => React.ReactNode;
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement>, 
    option: { label: string; value: string }) => React.ReactNode;
}
const AvailableLanguages = ["ru-RU", "en-US"];

const muiOptions = AvailableLanguages.map((value) => {
  return {
    label: Locale.getByTag(value).name,
    value: value,
  };
});

const prepValue = (languageCode: string | null | undefined) => {
  if (languageCode === null || languageCode === undefined || languageCode.length === 0) {
    return {
      label: Locale.getByTag("en-US").name,
      value: "en-US",
    };
  }
  return {
    label: Locale.getByTag(languageCode).name,
    value: languageCode,
  };
};

export const LanguageAutocomplete = ({
  value,
  onChange,
  renderInput,
  renderOption,
}: LanguageAutocompleteProps) => {
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
