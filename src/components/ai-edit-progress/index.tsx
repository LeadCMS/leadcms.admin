import { Dialog, DialogContent, Box, Typography, LinearProgress, Backdrop } from "@mui/material";
import { Bot, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { Theme } from "@mui/material/styles";

export interface AIEditProgressProps {
  open: boolean;
  contentTitle?: string;
}

const PROGRESS_MESSAGES = [
  "AI is analyzing your content...",
  "AI is understanding the context and structure...",
  "AI is applying improvements and edits...",
  "AI is fine-tuning the content...",
  "AI is finalizing the edited content...",
];

export const AIEditProgress = ({ open, contentTitle }: AIEditProgressProps) => {
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
          zIndex: (theme: Theme) => theme.zIndex.modal + 1,
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
          zIndex: (theme: Theme) => theme.zIndex.modal + 2,
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
            AI Editing in Progress
          </Typography>

          {/* Content info */}
          {contentTitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Editing &quot;{contentTitle}&quot;
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
            This may take a few moments. Please wait while AI improves your content...
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};
