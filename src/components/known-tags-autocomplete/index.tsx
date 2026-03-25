import { useEffect, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useNotificationsService } from "@hooks";
import { useRequestContext } from "@providers/request-provider";
import { showApiError } from "@utils/api-error-parser";

export type KnownTagsEntityType =
  | "accounts"
  | "comments"
  | "contacts"
  | "content"
  | "deals"
  | "domains"
  | "media"
  | "orders";

interface KnownTagsAutocompleteProps {
  entityType: KnownTagsEntityType;
  label: string;
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  size?: "small" | "medium";
  language?: string | null;
  onInputKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
}

const uniqueStringValues = (values: string[]) =>
  values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, items) => items.indexOf(value) === index);

export function KnownTagsAutocomplete({
  entityType,
  label,
  placeholder,
  value,
  onChange,
  disabled,
  error,
  helperText,
  size = "small",
  language,
  onInputKeyDown,
}: KnownTagsAutocompleteProps) {
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    setIsLoaded(false);
    setIsLoading(false);
    setOptions([]);
  }, [entityType, language]);

  useEffect(() => {
    if (!isOpen || isLoaded || isLoading) {
      return;
    }

    let isCancelled = false;

    const loadOptions = async () => {
      setIsLoading(true);

      try {
        let data: string[] | undefined;

        switch (entityType) {
          case "accounts":
            data = (await client.api.accountsTagsList()).data;
            break;
          case "comments":
            data = (await client.api.commentsTagsList({ language: language || undefined })).data;
            break;
          case "contacts":
            data = (await client.api.contactsTagsList({ language: language || undefined })).data;
            break;
          case "content":
            data = (await client.api.contentTagsList({ language: language || undefined })).data;
            break;
          case "deals":
            data = (await client.api.dealsTagsList()).data;
            break;
          case "domains":
            data = (await client.api.domainsTagsList()).data;
            break;
          case "media":
            data = (await client.api.mediaTagsList()).data;
            break;
          case "orders":
            data = (await client.api.ordersTagsList()).data;
            break;
        }

        if (!isCancelled) {
          setOptions(uniqueStringValues(data || []));
          setIsLoaded(true);
        }
      } catch (error) {
        if (!isCancelled) {
          showApiError(error, notificationsService, undefined, "Failed to load tags.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadOptions();

    return () => {
      isCancelled = true;
    };
  }, [client.api, entityType, isLoaded, isOpen, language, notificationsService]);

  return (
    <Autocomplete
      multiple
      freeSolo
      filterSelectedOptions
      open={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      disabled={disabled}
      loading={isLoading}
      options={options}
      value={value}
      onChange={(_event, newValue) => onChange(uniqueStringValues(newValue as string[]))}
      isOptionEqualToValue={(option, selectedValue) => option === selectedValue}
      size={size}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          onKeyDown={onInputKeyDown}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
