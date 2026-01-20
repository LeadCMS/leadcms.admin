import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Radio from "@mui/material/Radio";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Backdrop from "@mui/material/Backdrop";
import { Languages, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useConfig } from "@providers/config-provider";

export type TranslationType = "EmptyCopy" | "KeepOriginal" | "AITranslation";

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
  const [translationType, setTranslationType] = useState<TranslationType>("AITranslation");
  const languages = config?.languages || [];

  // Check if AI assistance is available
  const hasAIAssistance = config?.capabilities?.includes("AIAssistance") || false;

  // Update default translation type when hasAIAssistance changes
  useEffect(() => {
    if (hasAIAssistance) {
      setTranslationType("AITranslation");
    } else {
      setTranslationType("KeepOriginal");
    }
  }, [hasAIAssistance]);

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
      setTranslationType(hasAIAssistance ? "AITranslation" : "KeepOriginal");
    }
  };

  const handleClose = () => {
    onClose();
    setTargetLanguage("");
    setTranslationType(hasAIAssistance ? "AITranslation" : "KeepOriginal");
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
        maxWidth="sm"
        fullWidth
        sx={{
          zIndex: (theme) => theme.zIndex.modal,
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
              <Languages size={20} />
            </Box>
            <Box>
              <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                Translate Content
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.875rem" }}>
                Create a translation of your content
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

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ px: 4, pt: 4, pb: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {!hasAIAssistance && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                AI assistance is not currently available. Please check your configuration.
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
              This will create a new draft translation of this content. You can then edit the
              translated content in the content editor.
            </Typography>

            {/* Original Content Information */}
            <Box sx={{ mb: 4, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Original Content
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Title:</strong> {originalTitle || "Untitled"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Language:</strong> {getLanguageName(originalLanguage || "")}
              </Typography>
            </Box>

            <FormControl fullWidth sx={{ mb: 4 }}>
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

            <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 600 }}>
              Translation Method
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {hasAIAssistance && (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: translationType === "AITranslation" ? "primary.main" : "grey.300",
                    bgcolor: translationType === "AITranslation" ? "primary.50" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: translationType === "AITranslation" ? "primary.50" : "grey.50",
                    },
                  }}
                  onClick={() => setTranslationType("AITranslation")}
                >
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                    <Radio
                      checked={translationType === "AITranslation"}
                      value="AITranslation"
                      onChange={(e) => setTranslationType(e.target.value as TranslationType)}
                      sx={{ mt: -0.5 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        ✨ Translate with AI
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                        Use AI to automatically translate the content to the target language
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: translationType === "KeepOriginal" ? "primary.main" : "grey.300",
                  bgcolor: translationType === "KeepOriginal" ? "primary.50" : "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: translationType === "KeepOriginal" ? "primary.50" : "grey.50",
                  },
                }}
                onClick={() => setTranslationType("KeepOriginal")}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <Radio
                    checked={translationType === "KeepOriginal"}
                    value="KeepOriginal"
                    onChange={(e) => setTranslationType(e.target.value as TranslationType)}
                    sx={{ mt: -0.5 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                      📋 Keep Original Content
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                      Copy all content from the original and allow you to translate it manually
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: translationType === "EmptyCopy" ? "primary.main" : "grey.300",
                  bgcolor: translationType === "EmptyCopy" ? "primary.50" : "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: translationType === "EmptyCopy" ? "primary.50" : "grey.50",
                  },
                }}
                onClick={() => setTranslationType("EmptyCopy")}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <Radio
                    checked={translationType === "EmptyCopy"}
                    value="EmptyCopy"
                    onChange={(e) => setTranslationType(e.target.value as TranslationType)}
                    sx={{ mt: -0.5 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                      📝 Empty Copy
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                      Create empty fields for you to fill with translated content
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 4, pb: 4, pt: 2, gap: 2 }}>
          <Button onClick={handleClose} color="inherit" disabled={isLoading} sx={{ minWidth: 100 }}>
            Cancel
          </Button>
          <Button
            onClick={handleTranslate}
            variant="contained"
            disabled={!targetLanguage || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <Languages size={16} />}
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
            {isLoading ? "Creating..." : "Create Translation"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
