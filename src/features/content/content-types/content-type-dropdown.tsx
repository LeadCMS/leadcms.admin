import { useState } from "react";
import {
  Grid,
  TextField,
  Typography,
  Box,
  MenuItem
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { idToDisplayName } from "./content-types";
import { ContentTypeForm } from "./content-type-form";
import { ContentTypeDetailsDto } from "@lib/network/swagger-client";

interface ContentTypeDropdownProps {
  value: string;
  options: ContentTypeDetailsDto[];
  onChange: (value: string) => void;
  onAddNewType: () => void;
  error?: boolean;
  helperText?: React.ReactNode;
  onBlur?: () => void;
}

export const ContentTypeDropdown = ({
  value,
  options,
  onChange,
  onAddNewType,
  error,
  helperText,
  onBlur
}: ContentTypeDropdownProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingSelect, setPendingSelect] = useState<string | null>(null);

  // Auto-select the new type after reload
  if (pendingSelect && options.some(t => t.uid === pendingSelect)) {
    onChange(pendingSelect);
    setPendingSelect(null);
  }

  const handleAddNewType = (newContentType: ContentTypeDetailsDto) => {
    setDialogOpen(false);
    setPendingSelect(newContentType.uid);
    onAddNewType();
  };

  // If there are no options, do not render the dropdown
  if (options.length === 0) return null;

  return (
    <>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12 }}>
          <TextField
            select
            label="Content Type"
            value={value}
            onChange={e => onChange(e.target.value)}
            error={!!error}
            helperText={helperText}
            onBlur={onBlur}
            fullWidth
          >
            {options.map(type => (
              <MenuItem key={type.uid} value={type.uid}>
                {idToDisplayName(type.uid)}
              </MenuItem>
            ))}
            <MenuItem value="__add__" onClick={() => setDialogOpen(true)}>
              <AddIcon fontSize="small" sx={{ mr: 1 }} />Add Custom Type
            </MenuItem>
          </TextField>
        </Grid>
      </Grid>
      {value && value !== "__add__" && (
        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            {(() => {
              const selected = options.find(t => t.uid === value);
              if (!selected) return null;
              return (
                <>
                  {selected.format} format
                  {selected.supportsCoverImage ? ", supports cover image" : ""}
                  {selected.supportsComments ? ", supports comments" : ""}
                </>
              );
            })()}
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
