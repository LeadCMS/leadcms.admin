import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { ContentFormat, displayNameToId } from "./content-types";

interface ContentTypeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (newContentType: {
    displayName: string;
    format: ContentFormat;
    supportsComments: boolean;
    supportsCoverImage: boolean;
  }) => void;
}

export const ContentTypeForm = ({ open, onClose, onSave }: ContentTypeFormProps) => {
  const [displayName, setDisplayName] = useState("");
  const [format, setFormat] = useState<ContentFormat>("MD");
  const [supportsComments, setSupportsComments] = useState(false);
  const [supportsCoverImage, setSupportsCoverImage] = useState(false);
  const [nameError, setNameError] = useState("");

  const handleSave = () => {
    if (!displayName.trim()) {
      setNameError("Content type name is required");
      return;
    }

    onSave({
      displayName: displayName.trim(),
      format,
      supportsComments,
      supportsCoverImage,
    });

    // Reset form
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setDisplayName("");
    setFormat("MD");
    setSupportsComments(false);
    setSupportsCoverImage(false);
    setNameError("");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
    setNameError("");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Content Type</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          Define a new content type for your SaaS website.
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Content Type Name"
              value={displayName}
              onChange={handleNameChange}
              error={!!nameError}
              helperText={nameError || `ID: ${displayName ? displayNameToId(displayName) : ""}`}
              margin="normal"
            />
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="content-format-label">Content Format</InputLabel>
              <Select
                labelId="content-format-label"
                value={format}
                label="Content Format"
                onChange={(e) => setFormat(e.target.value as ContentFormat)}
              >
                <MenuItem value="MD">Markdown (MD)</MenuItem>
                <MenuItem value="MDX">MDX</MenuItem>
                <MenuItem value="HTML">HTML</MenuItem>
                <MenuItem value="JSON">JSON</MenuItem>
                <MenuItem value="YAML">YAML</MenuItem>
                <MenuItem value="Plain Text">Plain Text</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              Select the format that best suits this content type&apos;s needs
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, display: "flex", alignItems: "center" }}>
              Features
              <Tooltip title="Define which features this content type will support">
                <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={supportsCoverImage}
                    onChange={(e) => setSupportsCoverImage(e.target.checked)}
                  />
                }
                label="Supports Cover Image"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={supportsComments}
                    onChange={(e) => setSupportsComments(e.target.checked)}
                  />
                }
                label="Supports Comments"
              />
            </FormGroup>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
