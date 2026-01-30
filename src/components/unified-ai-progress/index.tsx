import { Dialog, DialogContent, Box, Typography, LinearProgress, Backdrop } from "@mui/material";
import { Bot, Sparkles } from "lucide-react";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { Theme } from "@mui/material/styles";
import { idToDisplayName } from "@features/content/content-types";
import { useConfig } from "@providers/config-provider";
import { TOKEN_GENERATION_SPEED, getRandomInRange } from "@utils/ai-token-estimation";

export interface UnifiedAIProgressProps {
  open: boolean;
  type: "content" | "translation" | "edit" | "cover";
  // Content-specific props
  contentType?: string;
  language?: string;
  // Translation-specific props
  targetLanguage?: string;
  originalTitle?: string;
  // Edit-specific props
  contentTitle?: string;
  // Token estimation props
  estimatedOutputTokens?: number;
  estimatedSeconds?: number;
  // Completion signal - when true, progress jumps to 100%
  isComplete?: boolean;
}

// Progress messages by stage (early, middle, late)
const PROGRESS_MESSAGES_BY_STAGE = {
  content: {
    early: [
      "Initializing AI models...",
      "Analyzing your content requirements...",
      "Understanding the context and tone...",
    ],
    middle: [
      "Generating creative content...",
      "Structuring your content...",
      "Building compelling narrative...",
      "Crafting engaging sections...",
    ],
    late: [
      "Refining the content...",
      "Polishing the final draft...",
      "Adding finishing touches...",
      "Almost there...",
    ],
  },
  translation: {
    early: [
      "Initializing translation models...",
      "Analyzing the original content...",
      "Understanding context and meaning...",
    ],
    middle: [
      "Generating translation...",
      "Adapting cultural nuances...",
      "Processing language patterns...",
      "Translating content sections...",
    ],
    late: [
      "Fine-tuning the translation...",
      "Ensuring accuracy...",
      "Polishing the result...",
      "Finalizing translation...",
    ],
  },
  edit: {
    early: [
      "Initializing AI editor...",
      "Analyzing your content...",
      "Understanding the structure...",
    ],
    middle: [
      "Applying improvements...",
      "Enhancing readability...",
      "Refining the content...",
      "Implementing your edits...",
    ],
    late: [
      "Fine-tuning changes...",
      "Polishing the result...",
      "Adding final touches...",
      "Wrapping up...",
    ],
  },
  cover: {
    early: [
      "Preparing the visual concept...",
      "Analyzing the content context...",
      "Setting up the creative pipeline...",
    ],
    middle: [
      "Generating the cover image...",
      "Composing the layout and imagery...",
      "Balancing colors and composition...",
    ],
    late: ["Refining details...", "Enhancing visual clarity...", "Applying final touches..."],
  },
};

const TITLES = {
  content: "AI Content Generation in Progress",
  translation: "AI Translation in Progress",
  edit: "AI Editing in Progress",
  cover: "AI Cover Generation in Progress",
};

export const UnifiedAIProgress = ({
  open,
  type,
  contentType,
  language,
  targetLanguage,
  originalTitle,
  contentTitle,
  estimatedOutputTokens = 6250, // Default ~25K chars / 4
  estimatedSeconds: providedEstimatedSeconds,
  isComplete = false,
}: UnifiedAIProgressProps) => {
  const { config } = useConfig();
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const intervalRef = useRef<NodeJS.Timeout>();

  // Calculate estimated time based on tokens
  const estimatedSeconds = useMemo(() => {
    if (providedEstimatedSeconds) return providedEstimatedSeconds;
    // Generate random speed once per open
    const speed = getRandomInRange(TOKEN_GENERATION_SPEED.min, TOKEN_GENERATION_SPEED.max);
    return Math.ceil(estimatedOutputTokens / speed);
  }, [estimatedOutputTokens, providedEstimatedSeconds]);

  // Get language name helper
  const getLanguageName = useCallback(
    (code?: string) => {
      if (!code) return "";
      const languages = config?.languages || [];
      return languages.find((lang) => lang.code === code)?.name || code;
    },
    [config?.languages]
  );

  // Get message based on progress stage
  const getMessageForProgress = useCallback(
    (progressPercent: number) => {
      const messages = PROGRESS_MESSAGES_BY_STAGE[type];
      let stageMessages: string[];

      if (progressPercent < 20) {
        stageMessages = messages.early;
      } else if (progressPercent < 75) {
        stageMessages = messages.middle;
      } else {
        stageMessages = messages.late;
      }

      // Pick a random message from the stage
      const index = Math.floor(Math.random() * stageMessages.length);
      return stageMessages[index];
    },
    [type]
  );

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setProgress(0);
      setElapsedSeconds(0);
      startTimeRef.current = Date.now();
      setCurrentMessage(getMessageForProgress(0));
    } else {
      // Cleanup on close
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [open, getMessageForProgress]);

  // Handle completion signal - speed up to 100%
  useEffect(() => {
    if (isComplete && open) {
      // Rapidly animate to 100%
      const currentProgress = progress;
      const increment = (100 - currentProgress) / 10;

      const animateToComplete = () => {
        setProgress((prev) => {
          const next = prev + increment;
          if (next >= 100) {
            return 100;
          }
          animationFrameRef.current = requestAnimationFrame(animateToComplete);
          return next;
        });
      };

      animationFrameRef.current = requestAnimationFrame(animateToComplete);
    }
  }, [isComplete, open, progress]);

  // Progress animation based on estimated time
  useEffect(() => {
    if (!open || isComplete) return;

    // Update progress every 100ms for smooth animation
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setElapsedSeconds(Math.floor(elapsed));

      // Calculate expected progress based on elapsed time
      // Cap at 95% to leave room for actual completion
      const expectedProgress = Math.min((elapsed / estimatedSeconds) * 100, 95);

      // Ensure progress only moves forward (never backwards)
      setProgress((prev) => Math.max(prev, expectedProgress));
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [open, estimatedSeconds, isComplete]);

  // Update message periodically based on progress
  useEffect(() => {
    if (!open) return;

    const messageInterval = setInterval(() => {
      setCurrentMessage(getMessageForProgress(progress));
    }, 3000);

    return () => clearInterval(messageInterval);
  }, [open, progress, getMessageForProgress]);

  // Format remaining time
  const formatRemainingTime = () => {
    const remaining = Math.max(0, estimatedSeconds - elapsedSeconds);
    if (remaining < 60) {
      return `~${remaining}s remaining`;
    }
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `~${minutes}m ${seconds}s remaining`;
  };

  const renderContentInfo = () => {
    switch (type) {
      case "content":
        return (
          <>
            {contentType && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Creating {idToDisplayName(contentType)} content
              </Typography>
            )}
            {language && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Language: <strong>{getLanguageName(language)}</strong>
              </Typography>
            )}
          </>
        );
      case "translation":
        return (
          <>
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
          </>
        );
      case "edit":
        return (
          <>
            {contentTitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Editing &quot;{contentTitle}&quot;
              </Typography>
            )}
          </>
        );
      case "cover":
        return (
          <>
            {contentTitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Generating a cover for &quot;{contentTitle}&quot;
              </Typography>
            )}
          </>
        );
      default:
        return null;
    }
  };

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
            {TITLES[type]}
          </Typography>

          {/* Content info */}
          {renderContentInfo()}

          {/* Progress Messages */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                minHeight: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.primary",
                fontWeight: 500,
              }}
            >
              {currentMessage}
            </Typography>

            {/* Determinate progress bar */}
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(45deg, #6366f1, #8b5cf6, #a855f7)",
                  borderRadius: 4,
                  transition: "transform 0.1s linear",
                },
              }}
            />

            {/* Progress percentage and time */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {Math.round(progress)}% complete
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress < 100 ? formatRemainingTime() : "Done!"}
              </Typography>
            </Box>
          </Box>

          {/* Stage-appropriate helper text */}
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            {progress >= 100
              ? "Content generated successfully!"
              : progress < 20
              ? "Warming up the AI models, this will just take a moment..."
              : progress < 75
              ? "Generation in progress, please wait while we craft your content..."
              : "Almost done, adding the finishing touches..."}
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};
