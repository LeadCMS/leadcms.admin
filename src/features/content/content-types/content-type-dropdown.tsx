import { useState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import { Plus } from "lucide-react";
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
  onBlur,
}: ContentTypeDropdownProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingSelect, setPendingSelect] = useState<string | null>(null);

  // Auto-select the new type after reload
  if (pendingSelect && options.some((t) => t.uid === pendingSelect)) {
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
            onChange={(e) => onChange(e.target.value)}
            error={!!error}
            helperText={helperText}
            onBlur={onBlur}
            fullWidth
          >
            {options
              .sort((a, b) => (b.contentCount || 0) - (a.contentCount || 0))
              .map((type) => (
                <MenuItem key={type.uid} value={type.uid}>
                  {idToDisplayName(type.uid)}
                  {(type.contentCount || 0) > 0 && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      ({type.contentCount})
                    </Typography>
                  )}
                </MenuItem>
              ))}
            <MenuItem value="__add__" onClick={() => setDialogOpen(true)}>
              <Plus size={20} />
              Add Custom Type
            </MenuItem>
          </TextField>
        </Grid>
      </Grid>
      {value && value !== "__add__" && (
        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            {(() => {
              const selected = options.find((t) => t.uid === value);
              if (!selected) return null;
              return (
                <>
                  {selected.format} format
                  {selected.supportsCoverImage ? ", supports cover image" : ""}
                  {selected.supportsComments ? ", supports comments" : ""}
                  {selected.supportsPreviewSlug ? ", supports preview slug" : ""}
                  {selected.supportsSEO ? ", supports SEO" : ""}
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
