import { useState } from "react";
import {
  Autocomplete,
  Grid,
  TextField,
  Typography,
  Box
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  getAllContentTypes,
  ContentTypeDefinition,
  displayNameToId,
  idToDisplayName,
  getContentTypeById
} from "./content-types";
import { ContentTypeForm } from "./content-type-form";

interface ContentTypeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onContentTypeChange: (contentType: ContentTypeDefinition | undefined) => void;
}

export const ContentTypeDropdown = ({
  value,
  onChange,
  onContentTypeChange
}: ContentTypeDropdownProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  // Get all content types from centralized function
  const contentTypes = getAllContentTypes();
  
  // Convert internal value (id) to display name for UI
  // Handle unknown content types by checking if they exist in our known types
  const isKnownType = contentTypes.some(type => type.id === value);
  const displayValue = value ? (
    isKnownType ? idToDisplayName(value) : `${idToDisplayName(value)} (Unknown)`) : "";

  const handleChange = (
    _event: React.SyntheticEvent<Element, Event>, 
    newValue: string | null): void => {
    if (newValue) {
      const id = displayNameToId(newValue.replace(" (Unknown)", ""));
      onChange(id);
      
      // Find the content type definition or get default for unknown types
      const contentType = getContentTypeById(id);
      onContentTypeChange(contentType);
    }
  };

  const handleAddNewType = (newContentType: ContentTypeDefinition): void => {
    // Select the newly created content type
    onChange(newContentType.id);
    onContentTypeChange(newContentType);
    
    setDialogOpen(false);
  };

  // Get display names for the dropdown
  const options = ["Add Custom Type", ...contentTypes.map(type => idToDisplayName(type.id))];

  return (
    <>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12 }}>
          <Autocomplete
            value={displayValue}
            onChange={(event, newValue) => {
              if (newValue === "Add Custom Type") {
                setDialogOpen(true);
                return;
              }
              handleChange(event, newValue);
            }}
            inputValue={inputValue}
            onInputChange={(_event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            options={options}
            filterOptions={(options, state) => {
              const filtered = options.filter(option => {
                // Always show "Add Custom Type" regardless of search input
                if (option === "Add Custom Type") {
                  return true;
                }
                // For other options, perform standard filtering
                return option.toLowerCase().includes(state.inputValue.toLowerCase());
              });
              return filtered;
            }}
            renderOption={(props, option) => {
              if (option === "Add Custom Type") {
                return (
                  <li {...props}>
                    <AddIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography fontWeight="bold">{option}</Typography>
                  </li>
                );
              }
              return <li {...props}>{option}</li>;
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Content Type" 
                placeholder="Search content type..."
                fullWidth 
              />
            )}
            freeSolo={false}
            autoHighlight
            disableClearable={false}
          />
        </Grid>
      </Grid>
      
      {value && (
        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            {getContentTypeById(value).format} format
            {getContentTypeById(value).supportsCoverImage ? 
              ", supports cover image" : ""}
            {getContentTypeById(value).supportsComments ? 
              ", supports comments" : ""}
            {!isKnownType ? " (Unknown content type with default settings)" : ""}
          </Typography>
        </Box>
      )}
      
      <ContentTypeForm
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleAddNewType}
      />
    </>
  );
};
