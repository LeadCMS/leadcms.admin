import { Dialog, DialogContent, Box, Typography, LinearProgress, Backdrop } from "@mui/material";
import { Bot, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface AITranslationProgressProps {
  open: boolean;
  targetLanguage?: string;
  originalTitle?: string;
}

const PROGRESS_MESSAGES = [
  "AI is analyzing the original content...",
  "AI is understanding the context and meaning...",
  "AI is generating translation in target language...",
  "AI is fine-tuning the translation...",
  "AI is finalizing the translated content...",
];

export const AITranslationProgress = ({
  open,
  targetLanguage,
  originalTitle,
}: AITranslationProgressProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setCurrentMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % PROGRESS_MESSAGES.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, [open]);

  return (
    <>
      {/* Backdrop to blur background */}
      <Backdrop
        open={open}
        sx={{
          zIndex: (theme) => theme.zIndex.modal - 1,
          backdropFilter: "blur(6px)",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}
      />

      <Dialog
        open={open}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
        sx={{
          zIndex: (theme) => theme.zIndex.modal,
          "& .MuiDialog-paper": {
            borderRadius: 3,
            overflow: "visible",
          },
        }}
      >
        <DialogContent sx={{ p: 4, textAlign: "center" }}>
          {/* Animated AI Icon */}
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(45deg, #6366f1, #8b5cf6, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%": {
                    transform: "scale(1)",
                    boxShadow: "0 0 0 0 rgba(139, 92, 246, 0.7)",
                  },
                  "70%": {
                    transform: "scale(1.05)",
                    boxShadow: "0 0 0 10px rgba(139, 92, 246, 0)",
                  },
                  "100%": {
                    transform: "scale(1)",
                    boxShadow: "0 0 0 0 rgba(139, 92, 246, 0)",
                  },
                },
              }}
            >
              <Bot size={32} color="white" />
            </Box>
            <Sparkles
              size={20}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                color: "#fbbf24",
                animation: "sparkle 1.5s infinite",
              }}
            />
            <style>
              {`
                @keyframes sparkle {
                  0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
                  50% { opacity: 0.7; transform: scale(1.2) rotate(180deg); }
                }
              `}
            </style>
          </Box>

          {/* Title */}
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}>
            AI Translation in Progress
          </Typography>

          {/* Content info */}
          {originalTitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Translating &quot;{originalTitle}&quot;
            </Typography>
          )}

          {targetLanguage && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Target Language: <strong>{targetLanguage.toUpperCase()}</strong>
            </Typography>
          )}

          {/* Progress Messages */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                minHeight: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.primary",
                fontWeight: 500,
              }}
            >
              {PROGRESS_MESSAGES[currentMessageIndex]}
            </Typography>

            {/* Infinite progress bar */}
            <LinearProgress
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(45deg, #6366f1, #8b5cf6, #a855f7)",
                  borderRadius: 3,
                },
              }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            This may take a few moments. Please wait while AI processes your content...
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};
