import { useState, useEffect } from "react";
import {
  Autocomplete,
  Grid,
  TextField,
  Typography,
  Box
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  CONTENT_TYPES,
  ContentTypeDefinition,
  ContentFormat,
  displayNameToId,
  idToDisplayName
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
  const [contentTypes, setContentTypes] = useState<ContentTypeDefinition[]>(CONTENT_TYPES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  // Convert internal value (id) to display name for UI
  const displayValue = value ? idToDisplayName(value) : "";

  // Store content types in localStorage to persist across sessions
  useEffect(() => {
    const storedTypes = localStorage.getItem("leadcms_content_types");
    if (storedTypes) {
      try {
        const parsedTypes = JSON.parse(storedTypes);
        if (Array.isArray(parsedTypes) && parsedTypes.length > 0) {
          // Merge stored content types with default ones, giving preference to stored types
          // for any that have the same ID
          const mergedTypes = [...CONTENT_TYPES];
          
          parsedTypes.forEach(storedType => {
            const existingIndex = mergedTypes.findIndex(t => t.id === storedType.id);
            if (existingIndex >= 0) {
              // Replace existing with stored version
              mergedTypes[existingIndex] = storedType;
            } else {
              // Add Custom Type
              mergedTypes.push(storedType);
            }
          });
          
          setContentTypes(mergedTypes);
        }
      } catch (e) {
        console.error("Error parsing stored content types:", e);
      }
    }
  }, []);

  // Save content types to localStorage when they change
  useEffect(() => {
    if (contentTypes.length > 0) {
      localStorage.setItem("leadcms_content_types", JSON.stringify(contentTypes));
    }
  }, [contentTypes]);

  const handleChange = (
    _event: React.SyntheticEvent<Element, Event>, 
    newValue: string | null): void => {
    if (newValue) {
      const id = displayNameToId(newValue);
      onChange(id);
      
      // Find the content type definition and notify parent
      const contentType = contentTypes.find(type => type.id === id);
      onContentTypeChange(contentType);
    }
  };

  const handleAddNewType = (newType: {
    displayName: string;
    format: ContentFormat;
    supportsComments: boolean;
    supportsCoverImage: boolean;
    supportsSEO: boolean;
  }): void => {
    const id = displayNameToId(newType.displayName);
    
    // Create new content type definition
    const newContentType: ContentTypeDefinition = {
      id,
      displayName: newType.displayName,
      format: newType.format,
      supportsComments: newType.supportsComments,
      supportsCoverImage: newType.supportsCoverImage,
      supportsSEO: newType.supportsSEO,
      defaultValues: {
        allowComments: newType.supportsComments
      }
    };
    
    // Update state with new content type
    setContentTypes([...contentTypes, newContentType]);
    
    // Select the newly created content type
    onChange(id);
    onContentTypeChange(newContentType);
    
    setDialogOpen(false);
  };

  // Get display names for the dropdown
  const options = ["Add Custom Type", ...contentTypes.map(type => type.displayName)];

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
            {contentTypes.find(type => type.id === value)?.format || ""} format
            {contentTypes.find(type => type.id === value)?.supportsCoverImage ? 
              ", supports cover image" : ""}
            {contentTypes.find(type => type.id === value)?.supportsComments ? 
              ", supports comments" : ""}
            {contentTypes.find(type => type.id === value)?.supportsSEO ? 
              ", supports SEO" : ""}
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
