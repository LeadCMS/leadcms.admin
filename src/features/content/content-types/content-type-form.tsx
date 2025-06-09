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
  CircularProgress,
} from "@mui/material";
import { Info } from "lucide-react";
import { 
  ContentFormat, displayNameToId, addContentType 
} from "./content-types";
import { useRequestContext } from "@providers/request-provider";
import { ContentTypeDetailsDto } from "@lib/network/swagger-client";

interface ContentTypeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (newContentType: ContentTypeDetailsDto) => void;
}

export const ContentTypeForm = ({ open, onClose, onSave }: ContentTypeFormProps) => {
  const { client } = useRequestContext();
  const [displayName, setDisplayName] = useState("");
  const [format, setFormat] = useState<ContentFormat>("MD");
  const [supportsComments, setSupportsComments] = useState(false);
  const [supportsCoverImage, setSupportsCoverImage] = useState(false);
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) {
      setNameError("Content type name is required");
      return;
    }
    setSaving(true);
    try {
      const id = displayNameToId(displayName.trim());
      const newContentType = await addContentType(client, {
        id,
        format,
        supportsComments,
        supportsCoverImage,
      });
      onSave(newContentType); // Pass newContentType up for selection
      resetForm();
    } finally {
      setSaving(false);
    }
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
                  <Info size={20} />
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
        <Button onClick={handleClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={saving}>
          {saving ? <CircularProgress size={20} sx={{ color: "white", mr: 1 }} /> : null}
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
