import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  CircularProgress,
  Alert,
  Backdrop,
} from "@mui/material";
import { Languages, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useConfig } from "@providers/config-provider";

export type TranslationType = "EmptyCopy" | "KeepOriginal";

interface TranslateDialogProps {
  open: boolean;
  onClose: () => void;
  onTranslate: (targetLanguage: string, translationType: TranslationType) => void;
  originalLanguage?: string; // Original content language
  originalTitle?: string; // Original content title
  preselectedLanguage?: string;
  isLoading?: boolean;
  error?: string | null;
  readonly?: boolean; // Make language selection readonly
}

export const TranslateDialog = ({
  open,
  onClose,
  onTranslate,
  originalLanguage,
  originalTitle,
  preselectedLanguage,
  isLoading = false,
  error,
  readonly = false,
}: TranslateDialogProps) => {
  const { config } = useConfig();
  const [targetLanguage, setTargetLanguage] = useState(preselectedLanguage || "");
  const [translationType, setTranslationType] = useState<TranslationType>("KeepOriginal");
  const languages = config?.languages || [];

  // Update targetLanguage when preselectedLanguage changes
  useEffect(() => {
    if (preselectedLanguage) {
      setTargetLanguage(preselectedLanguage);
    }
  }, [preselectedLanguage]);

  // Get available languages (exclude original language)
  const availableLanguages = languages.filter((lang) => lang.code !== originalLanguage);

  // Get language name helper
  const getLanguageName = (code?: string) => {
    if (!code) return "";
    return languages.find((lang) => lang.code === code)?.name || code;
  };

  const handleTranslate = () => {
    if (targetLanguage) {
      onTranslate(targetLanguage, translationType);
      onClose();
      setTargetLanguage("");
      setTranslationType("KeepOriginal");
    }
  };

  const handleClose = () => {
    onClose();
    setTargetLanguage("");
    setTranslationType("KeepOriginal");
  };

  return (
    <>
      {/* Backdrop to blur background */}
      <Backdrop
        open={open}
        sx={{
          zIndex: (theme) => theme.zIndex.modal - 1,
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        }}
      />

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{ zIndex: (theme) => theme.zIndex.modal }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Languages size={24} />
            <Typography variant="h6" component="span">
              Translate Content
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Original Content Information */}
          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Original Title:</strong> {originalTitle || "Untitled"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Original Language:</strong> {getLanguageName(originalLanguage || "")}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This will create a new draft translation of this content. You can then edit the
            translated content in the content editor.
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Target Language</InputLabel>
            <Select
              value={targetLanguage}
              label="Target Language"
              onChange={(e) => setTargetLanguage(e.target.value)}
              disabled={readonly}
            >
              {availableLanguages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Languages size={16} />
                    <span>{lang.name}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ mb: 2 }}>
              Translation Type
            </FormLabel>
            <RadioGroup
              value={translationType}
              onChange={(e) => setTranslationType(e.target.value as TranslationType)}
            >
              <FormControlLabel
                value="KeepOriginal"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Keep Original Content
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Copy all content from the original and allow you to translate it
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="EmptyCopy"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Empty Copy
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Create empty fields for you to fill with translated content
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleTranslate}
            variant="contained"
            disabled={!targetLanguage || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <Languages size={16} />}
          >
            {isLoading ? "Creating Translation..." : "Create Translation"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
