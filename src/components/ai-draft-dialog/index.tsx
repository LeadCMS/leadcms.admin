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
  CircularProgress,
  Alert,
  Backdrop,
  TextField,
} from "@mui/material";
import { Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useConfig } from "@providers/config-provider";
import { ContentTypeDetailsDto } from "@lib/network/swagger-client";
import { idToDisplayName } from "@features/content/content-types";
import type { Theme } from "@mui/material/styles";

export interface AIDraftDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (language: string, contentType: string, prompt: string) => void;
  contentTypes: ContentTypeDetailsDto[];
  isLoading?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
  initialValues?: {
    language?: string;
    contentType?: string;
    prompt?: string;
  };
}

export const AIDraftDialog = ({
  open,
  onClose,
  onCreate,
  contentTypes,
  isLoading = false,
  error,
  onErrorClear,
  initialValues,
}: AIDraftDialogProps) => {
  const { config } = useConfig();
  const [language, setLanguage] = useState("");
  const [contentType, setContentType] = useState("");
  const [prompt, setPrompt] = useState("");

  const languages = config?.languages || [];

  // Check if AI assistance is available
  const hasAIAssistance = config?.capabilities?.includes("AIAssistance") || false;

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      // Use provided initial values or defaults
      setLanguage(initialValues?.language || config?.defaultLanguage || "");
      setContentType(initialValues?.contentType || "");
      setPrompt(initialValues?.prompt || "");
    }
  }, [open, config?.defaultLanguage, initialValues]);

  const handleCreate = () => {
    if (language && contentType && prompt.trim()) {
      onCreate(language, contentType, prompt.trim());
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isFormValid = language && contentType && prompt.trim().length > 0;

  return (
    <>
      <Backdrop
        open={open}
        sx={{
          zIndex: (theme: Theme) => theme.zIndex.modal - 1,
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        }}
      />

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        sx={{
          zIndex: (theme: Theme) => theme.zIndex.modal,
          "& .MuiDialog-paper": {
            borderRadius: 3,
            overflow: "visible",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Sparkles size={20} />
            </Box>
            <Box>
              <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                Create Content with AI
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.875rem" }}>
                Transform your ideas into engaging content
              </Typography>
            </Box>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
              bgcolor: "rgba(255, 255, 255, 0.1)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {!hasAIAssistance && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              AI assistance is not currently available. Please check your configuration.
            </Alert>
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 3, mb: 5, lineHeight: 1.6, mx: 2 }}
          >
            Use AI to generate content based on your prompt. Provide a detailed description of what
            you want to create, and AI will generate a draft for you to edit further.
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={language}
              label="Language"
              onChange={(e) => {
                setLanguage(e.target.value);
                // Clear error when user changes form fields
                if (error && onErrorClear) {
                  onErrorClear();
                }
              }}
              disabled={isLoading}
            >
              {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>{lang.name}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Content Type</InputLabel>
            <Select
              value={contentType}
              label="Content Type"
              onChange={(e) => {
                setContentType(e.target.value);
                // Clear error when user changes form fields
                if (error && onErrorClear) {
                  onErrorClear();
                }
              }}
              disabled={isLoading}
            >
              {contentTypes
                .sort((a, b) => (b.contentCount || 0) - (a.contentCount || 0))
                .map((type) => (
                  <MenuItem key={type.uid} value={type.uid}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span>{idToDisplayName(type.uid)}</span>
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
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            minRows={4}
            maxRows={8}
            label="Content Description"
            placeholder={
              "Describe what content you want to create. Be specific about the topic, " +
              "style, target audience, and any specific requirements..."
            }
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              // Clear error when user changes form fields
              if (error && onErrorClear) {
                onErrorClear();
              }
            }}
            disabled={isLoading}
            sx={{
              mb: 3,
              "& .MuiInputBase-root": {
                lineHeight: 1.5,
              },
              "& .MuiInputBase-inputMultiline": {
                resize: "vertical",
              },
            }}
            helperText={`${prompt.length} characters. Be as detailed as possible for best results.`}
          />

          <Box
            sx={{
              p: 3,
              bgcolor: "grey.50",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}>
              ✨ Pro Tips for Better AI Content
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.5 }}>
              • <strong>Be specific:</strong> Include topic, style (professional, casual, friendly),
              and target audience
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.5 }}>
              • <strong>Mention structure:</strong> Specify if you want headers, bullet points, or
              specific sections
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              • <strong>Set expectations:</strong> Include desired length (short, medium, long) and
              key points to cover
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 4, pb: 4, pt: 2, gap: 2 }}>
          <Button onClick={handleClose} color="inherit" disabled={isLoading} sx={{ minWidth: 100 }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!isFormValid || isLoading || !hasAIAssistance}
            startIcon={isLoading ? <CircularProgress size={16} /> : <Sparkles size={16} />}
            sx={{
              minWidth: 160,
              fontWeight: 600,
              px: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #694d90 100%)",
              },
              "&:disabled": {
                background: "rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            {isLoading ? "Creating..." : "Create AI Draft"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
