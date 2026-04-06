import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { RemoteAutoCompleteProps, RemoteValues } from "./types";
import React, { useState, useEffect } from "react";
import { useRequestContext } from "@providers/request-provider";
import { HttpResponse, ProblemDetails } from "@lib/network/swagger-client";
import { useNotificationsService } from "@hooks";
import { showApiError } from "@utils/api-error-parser";

export function RemoteAutocomplete({
  label,
  placeholder,
  freeSolo,
  multiple,
  value,
  onChange,
  onInputChange,
  limit,
  type,
  error,
  helperText,
  contentType,
  language,
}: RemoteAutoCompleteProps) {
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [options, setOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const requestData = async () => {
    let response: HttpResponse<string[], void | ProblemDetails> | undefined = undefined;
    try {
      switch (type) {
        case RemoteValues.TAGS:
          if (contentType) {
            // Use content-type-specific endpoint with language filtering
            response = await client.api.contentTagsDetail(contentType, {
              language: language,
            });
          } else {
            // Use general endpoint with language filtering
            response = await client.api.contentTagsList({
              language: language,
            });
          }
          break;
        case RemoteValues.CATEGORIES:
          if (contentType) {
            // Use content-type-specific endpoint with language filtering
            response = await client.api.contentCategoriesDetail(contentType, {
              language: language,
            });
          } else {
            // Use general endpoint with language filtering
            response = await client.api.contentCategoriesList({
              language: language,
            });
          }
          break;
        case RemoteValues.AUTHORS:
          // Use content-independent endpoint for all authors with language filtering
          response = await client.api.contentAuthorsList({
            language: language,
          });
          break;
        case RemoteValues.SENDER_NAMES:
          response = await client.api.emailTemplatesSenderNamesList({
            language: language,
          });
          break;
        case RemoteValues.SENDER_EMAILS:
          response = await client.api.emailTemplatesSenderEmailsList({
            language: language,
          });
          break;
      }
    } catch (e) {
      showApiError(e, notificationsService, undefined, "Failed to get options");
    } finally {
      setOptions((response && response.data) || []);
      setIsLoading(false);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    if (isOpen && !isLoaded && !isLoading) {
      setIsLoading(true);
      requestData();
    }
  }, [isOpen]);

  // Reset loaded state when contentType or language changes to trigger reload
  useEffect(() => {
    setIsLoaded(false);
    setOptions([]);
  }, [contentType, language]);

  return (
    <Autocomplete
      open={isOpen}
      onOpen={() => {
        setIsOpen(true);
      }}
      onClose={() => {
        setIsOpen(false);
      }}
      options={options}
      loading={isLoading}
      freeSolo={freeSolo}
      multiple={multiple ? multiple : false}
      limitTags={limit ? limit : -1}
      autoSelect
      value={value}
      onChange={onChange}
      onInputChange={(_event, newValue) => onInputChange?.(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          slotProps={{ formHelperText: { sx: { ml: 0 } } }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}
