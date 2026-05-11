import { useState, useEffect } from "react";
import { Autocomplete, Box, CircularProgress, TextField, Typography } from "@mui/material";
import { useDebounce } from "use-debounce";
import { useRequestContext } from "@providers/request-provider";
import { ContentDetailsDto } from "@lib/network/swagger-client";
import { showApiError } from "@utils/api-error-parser";
import { useNotificationsService } from "@hooks";

interface ContentIdAutocompleteProps {
  label: string;
  value: number | null;
  onChange: (id: number | null) => void;
  disabled?: boolean;
}

export const ContentIdAutocomplete = ({
  label,
  value,
  onChange,
  disabled,
}: ContentIdAutocompleteProps) => {
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<ContentDetailsDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentDetailsDto | null>(null);
  const [debouncedInput] = useDebounce(inputValue, 300);

  // Load existing record by id in edit mode; reset when value is cleared
  useEffect(() => {
    if (value == null) {
      setSelectedContent(null);
      setInputValue("");
      return;
    }
    // Don't reload if already selected
    if (selectedContent?.id === value) return;
    let isActive = true;
    const load = async () => {
      try {
        const { data } = await client.api.contentDetail(value);
        if (isActive) {
          setSelectedContent(data);
        }
      } catch (err) {
        if (isActive) {
          showApiError(err, notificationsService, undefined, "Failed to load content record.");
        }
      }
    };
    load();
    return () => {
      isActive = false;
    };
  }, [client.api, value, notificationsService, selectedContent?.id]);

  // Search content on debounced input or dropdown open
  useEffect(() => {
    if (!isOpen && debouncedInput.trim().length === 0) {
      return;
    }
    let isActive = true;
    const search = async () => {
      setIsLoading(true);
      try {
        const trimmed = debouncedInput.trim();
        const { data } = await client.api.contentList({
          query: trimmed || undefined,
        });
        if (isActive) {
          setOptions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isActive) {
          showApiError(err, notificationsService, undefined, "Failed to search content.");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    search();
    return () => {
      isActive = false;
    };
  }, [client.api, debouncedInput, isOpen, notificationsService]);

  return (
    <Autocomplete
      options={options}
      value={selectedContent}
      inputValue={inputValue}
      open={isOpen}
      disabled={disabled}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      onInputChange={(_, val) => setInputValue(val)}
      onChange={(_, val) => {
        setSelectedContent(val);
        onChange(val?.id ?? null);
      }}
      getOptionLabel={(option) => {
        const title = option.title || "Untitled";
        const slugPart = option.slug ? ` \u2022 ${option.slug}` : "";
        return `${title}${slugPart}`;
      }}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      loading={isLoading}
      filterOptions={(x) => x}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id ?? option.slug ?? option.title}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {option.title || "Untitled"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.slug || `ID: ${option.id ?? "-"}`}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="Search content by title or slug"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
