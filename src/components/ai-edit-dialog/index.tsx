import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
import type { Theme } from "@mui/material/styles";

export interface AIEditDialogProps {
  open: boolean;
  onClose: () => void;
  onEdit: (prompt: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
  initialPrompt?: string;
  contentTitle?: string;
}

export const AIEditDialog = ({
  open,
  onClose,
  onEdit,
  isLoading = false,
  error,
  onErrorClear,
  initialPrompt = "",
  contentTitle,
}: AIEditDialogProps) => {
  const { config } = useConfig();
  const [prompt, setPrompt] = useState(initialPrompt);

  // Check if AI assistance is available
  const hasAIAssistance = config?.capabilities?.includes("AIAssistance") || false;

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      setPrompt(initialPrompt);
    }
  }, [open, initialPrompt]);

  const handleEdit = () => {
    if (prompt.trim()) {
      onEdit(prompt.trim());
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isFormValid = prompt.trim().length > 0;

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
                Edit Content with AI
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.875rem" }}>
                Refine and improve your content using AI
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

          {contentTitle && (
            <Box sx={{ mb: 4, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Current Content
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Title:</strong> {contentTitle}
              </Typography>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
            Describe how you want to improve or modify your content. AI will analyze your current
            content and apply the changes you request.
          </Typography>

          <TextField
            fullWidth
            multiline
            minRows={4}
            maxRows={8}
            label="Edit Instructions"
            placeholder={
              "Describe what changes you want to make. For example:\n" +
              "• Make it more engaging and add examples\n" +
              "• Improve the SEO and readability\n" +
              "• Add more technical details\n" +
              "• Change the tone to be more professional..."
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
            helperText={`${prompt.length} characters. Be specific about the changes you want.`}
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
              ✨ Tips for Better AI Editing
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.5 }}>
              • <strong>Be specific:</strong> Describe exactly what you want to change or improve
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.5 }}>
              • <strong>Mention style:</strong> Specify tone, formality level, or writing style
              preferences
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              • <strong>Set constraints:</strong> Mention if you want to keep certain parts
              unchanged
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
            onClick={handleEdit}
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
            {isLoading ? "Editing..." : "Edit with AI"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
