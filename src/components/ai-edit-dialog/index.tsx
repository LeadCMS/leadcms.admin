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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Stack,
} from "@mui/material";
import { ImagePlus, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useConfig } from "@providers/config-provider";
import type { Theme } from "@mui/material/styles";
import { ImageSelectionDialog } from "@components/image-selection-dialog/image-selection-dialog";
import { buildAbsoluteUrlWithCacheBust } from "@lib/network/utils";
import {
  LimitType,
  countWords,
  countCharacters,
  estimateEditTokens,
  formatTokenCount,
  formatEstimatedTime,
  formatCost,
} from "@utils/ai-token-estimation";

export interface TokenEstimation {
  inputTokens: number;
  outputTokens: number;
  estimatedSeconds: number;
  estimatedCost: number;
}

export interface AIEditDialogProps {
  open: boolean;
  onClose: () => void;
  onEdit: (
    prompt: string,
    wordCount?: number | null,
    characterCount?: number | null,
    tokenEstimation?: TokenEstimation | null,
    requiredMediaPaths?: string[],
    templateVariables?: Record<string, string>
  ) => void;
  isLoading?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
  initialPrompt?: string;
  contentTitle?: string;
  currentContent?: unknown;
  initialRequiredMediaPaths?: string[];
  /** "content" shows media picker; "email-template" shows token editor */
  variant?: "content" | "email-template";
  /** Pre-filled template variables for email-template variant */
  initialTemplateVariables?: Record<string, string>;
}

const MAX_REQUIRED_MEDIA = 10;

export const AIEditDialog = ({
  open,
  onClose,
  onEdit,
  isLoading = false,
  error,
  onErrorClear,
  initialPrompt = "",
  contentTitle,
  currentContent,
  initialRequiredMediaPaths,
  variant = "content",
  initialTemplateVariables,
}: AIEditDialogProps) => {
  const { config } = useConfig();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [limitType, setLimitType] = useState<LimitType>("none");
  const [limitValue, setLimitValue] = useState<number | "">(" ");
  const [requiredMediaPaths, setRequiredMediaPaths] = useState<string[]>([]);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [templateVars, setTemplateVars] = useState<Array<{ key: string; value: string }>>([]);

  // Check if AI assistance is available
  const hasAIAssistance = config?.capabilities?.includes("AIAssistance") || false;

  // Calculate current content stats
  const contentStats = useMemo(() => {
    if (!currentContent) return null;
    const contentJson = JSON.stringify(currentContent);
    const bodyText =
      typeof currentContent === "object" && currentContent !== null
        ? (currentContent as Record<string, unknown>).body
        : "";
    const bodyString = typeof bodyText === "string" ? bodyText : "";
    return {
      characters: countCharacters(contentJson),
      words: countWords(bodyString),
      bodyCharacters: countCharacters(bodyString),
    };
  }, [currentContent]);

  // Auto-populate limit value when limit type changes
  useEffect(() => {
    <ImageSelectionDialog
      open={mediaPickerOpen}
      onClose={() => setMediaPickerOpen(false)}
      onSelect={(imageUrl) => {
        handleSelectMedia(imageUrl);
        setMediaPickerOpen(false);
      }}
    />;
    if (!contentStats) {
      setLimitValue("");
      return;
    }
    if (limitType === "characters") {
      setLimitValue(contentStats.bodyCharacters);
    } else if (limitType === "words") {
      setLimitValue(contentStats.words);
    } else {
      setLimitValue("");
    }
  }, [limitType, contentStats]);

  // Token estimation
  const tokenEstimation = useMemo(() => {
    return estimateEditTokens({
      currentContent,
      userPrompt: prompt,
      limitType,
      limitValue: typeof limitValue === "number" ? limitValue : undefined,
    });
  }, [currentContent, prompt, limitType, limitValue]);

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      setPrompt(initialPrompt);
      setLimitType("none");
      setLimitValue("");
      setRequiredMediaPaths(initialRequiredMediaPaths || []);
      // Initialize template variables
      if (initialTemplateVariables) {
        setTemplateVars(
          Object.entries(initialTemplateVariables).map(([key, value]) => ({
            key,
            value,
          }))
        );
      } else {
        setTemplateVars([]);
      }
    }
  }, [open, initialPrompt, initialRequiredMediaPaths, initialTemplateVariables]);

  const handleEdit = () => {
    if (prompt.trim()) {
      const wordCount = limitType === "words" && limitValue ? Number(limitValue) : null;
      const characterCount = limitType === "characters" && limitValue ? Number(limitValue) : null;
      const estimation: TokenEstimation | null = tokenEstimation
        ? {
            inputTokens: tokenEstimation.inputTokens,
            outputTokens: tokenEstimation.outputTokens,
            estimatedSeconds: tokenEstimation.estimatedSeconds,
            estimatedCost: tokenEstimation.estimatedCost,
          }
        : null;
      // Build templateVariables record from the key-value pairs
      const vars: Record<string, string> = {};
      templateVars.forEach(({ key, value }) => {
        const k = key.trim();
        if (k) vars[k] = value;
      });
      onEdit(
        prompt.trim(),
        wordCount,
        characterCount,
        estimation,
        requiredMediaPaths.length ? requiredMediaPaths : undefined,
        Object.keys(vars).length > 0 ? vars : undefined
      );
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isFormValid = prompt.trim().length > 0;

  const handleSelectMedia = (path: string) => {
    if (requiredMediaPaths.includes(path)) return;
    if (requiredMediaPaths.length >= MAX_REQUIRED_MEDIA) return;
    setRequiredMediaPaths((prev) => [...prev, path]);
  };

  const handleSelectMediaPaths = (paths: string[]) => {
    setRequiredMediaPaths((prev) => {
      const next = [...prev];
      paths.forEach((path) => {
        if (next.includes(path)) return;
        if (next.length >= MAX_REQUIRED_MEDIA) return;
        next.push(path);
      });
      return next;
    });
  };

  const handleRemoveMedia = (path: string) => {
    setRequiredMediaPaths((prev) => prev.filter((item) => item !== path));
  };

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

          {variant === "content" && (
            <Box
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "rgba(0, 0, 0, 0.02)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Media to insert (optional)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {requiredMediaPaths.length}/{MAX_REQUIRED_MEDIA}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.5 }}
              >
                Add images that the AI must place inside the article and blend into the content
                flow.
              </Typography>

              <Box sx={{ mt: 2 }}>
                {requiredMediaPaths.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    No media selected.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {requiredMediaPaths.map((path) => (
                      <Box
                        key={path}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          p: 1,
                          border: "1px solid",
                          borderColor: "grey.200",
                          borderRadius: 2,
                          backgroundColor: "common.white",
                        }}
                      >
                        <Box
                          component="img"
                          src={buildAbsoluteUrlWithCacheBust(path)}
                          alt="Selected media"
                          sx={{ width: 56, height: 56, objectFit: "cover", borderRadius: 1 }}
                        />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {path}
                        </Typography>
                        <IconButton size="small" onClick={() => handleRemoveMedia(path)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<ImagePlus size={16} />}
                onClick={() => setMediaPickerOpen(true)}
                disabled={requiredMediaPaths.length >= MAX_REQUIRED_MEDIA || isLoading}
                sx={{ mt: 2 }}
              >
                Add from Media Library
              </Button>
            </Box>
          )}

          {variant === "email-template" && (
            <Box
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "rgba(0, 0, 0, 0.02)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Template Variables (optional)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {templateVars.length} defined
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.5, mb: 2 }}
              >
                Define placeholder tokens the AI must use in the template (e.g. name, resetLink).
              </Typography>

              <Stack spacing={1.5}>
                {templateVars.map((tv, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <TextField
                      size="small"
                      label="Token name"
                      placeholder="e.g. name"
                      value={tv.key}
                      onChange={(e) => {
                        const next = [...templateVars];
                        next[idx] = { ...next[idx], key: e.target.value };
                        setTemplateVars(next);
                      }}
                      disabled={isLoading}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      size="small"
                      label="Description"
                      placeholder="e.g. Customer name"
                      value={tv.value}
                      onChange={(e) => {
                        const next = [...templateVars];
                        next[idx] = { ...next[idx], value: e.target.value };
                        setTemplateVars(next);
                      }}
                      disabled={isLoading}
                      sx={{ flex: 1.5 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        setTemplateVars((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      disabled={isLoading}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>

              <Button
                variant="outlined"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => setTemplateVars((prev) => [...prev, { key: "", value: "" }])}
                disabled={isLoading}
                sx={{ mt: 2 }}
              >
                Add Variable
              </Button>
            </Box>
          )}

          {/* Output Length Limit Section */}
          <Box
            sx={{
              p: 3,
              mb: 3,
              bgcolor: "grey.50",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600, fontSize: "0.875rem" }}>
                Output Length Limit
              </FormLabel>
              <RadioGroup
                value={limitType}
                onChange={(e) => setLimitType(e.target.value as LimitType)}
                sx={{ mb: 2 }}
              >
                <FormControlLabel
                  value="none"
                  control={<Radio size="small" />}
                  label={
                    <Box>
                      <Typography variant="body2">Do not set a limit</Typography>
                      <Typography variant="caption" color="text.secondary">
                        AI will decide based on the current content
                      </Typography>
                    </Box>
                  }
                  disabled={isLoading}
                />
                <FormControlLabel
                  value="characters"
                  control={<Radio size="small" />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2">Limit by characters</Typography>
                      {contentStats && (
                        <Typography variant="caption" color="primary">
                          (current: {contentStats.bodyCharacters.toLocaleString()})
                        </Typography>
                      )}
                    </Box>
                  }
                  disabled={isLoading}
                />
                <FormControlLabel
                  value="words"
                  control={<Radio size="small" />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2">Limit by words</Typography>
                      {contentStats && (
                        <Typography variant="caption" color="primary">
                          (current: {contentStats.words.toLocaleString()})
                        </Typography>
                      )}
                    </Box>
                  }
                  disabled={isLoading}
                />
              </RadioGroup>

              {limitType !== "none" && (
                <TextField
                  type="number"
                  size="small"
                  label={limitType === "characters" ? "Character limit" : "Word limit"}
                  value={limitValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLimitValue(val === "" ? "" : parseInt(val, 10) || 0);
                  }}
                  disabled={isLoading}
                  inputProps={{ min: 1 }}
                  sx={{ maxWidth: 200 }}
                />
              )}
            </FormControl>

            {/* Token Estimation */}
            <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid", borderColor: "grey.300" }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                <strong>Tokens:</strong> ~{formatTokenCount(tokenEstimation.inputTokens)} in / ~
                {formatTokenCount(tokenEstimation.outputTokens)} out |{" "}
                {formatEstimatedTime(tokenEstimation.estimatedSeconds)} |{" "}
                {formatCost(tokenEstimation.estimatedCost)}
              </Typography>
            </Box>
          </Box>

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

      <ImageSelectionDialog
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(imageUrl) => {
          handleSelectMedia(imageUrl);
          setMediaPickerOpen(false);
        }}
        onSelectMultiple={(imageUrls) => {
          handleSelectMediaPaths(imageUrls);
          setMediaPickerOpen(false);
        }}
        selectionMode="multiple"
        maxSelection={MAX_REQUIRED_MEDIA}
      />
    </>
  );
};
