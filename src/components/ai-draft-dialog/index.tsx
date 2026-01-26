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
  Autocomplete,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from "@mui/material";
import { Sparkles, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { useConfig } from "@providers/config-provider";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { getWhereFilterQuery } from "@providers/query-provider";
import { ContentDetailsDto, ContentTypeDetailsDto } from "@lib/network/swagger-client";
import { idToDisplayName } from "@features/content/content-types";
import type { Theme } from "@mui/material/styles";
import {
  LimitType,
  countWords,
  countCharacters,
  estimateGenerationTokens,
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

export interface AIDraftDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (
    language: string,
    contentType: string,
    prompt: string,
    referenceContentId?: number | null,
    wordCount?: number | null,
    characterCount?: number | null,
    tokenEstimation?: TokenEstimation | null
  ) => void;
  contentTypes: ContentTypeDetailsDto[];
  isLoading?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
  initialValues?: {
    language?: string;
    contentType?: string;
    prompt?: string;
    referenceContentId?: number | null;
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
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const [language, setLanguage] = useState("");
  const [contentType, setContentType] = useState("");
  const [prompt, setPrompt] = useState("");
  const [referenceContent, setReferenceContent] = useState<ContentDetailsDto | null>(null);
  const [referenceContentOptions, setReferenceContentOptions] = useState<ContentDetailsDto[]>([]);
  const [referenceContentInput, setReferenceContentInput] = useState("");
  const [isReferenceLoading, setIsReferenceLoading] = useState(false);
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [debouncedReferenceInput] = useDebounce(referenceContentInput, 300);
  const [limitType, setLimitType] = useState<LimitType>("none");
  const [limitValue, setLimitValue] = useState<number | "">("");

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
      setReferenceContentInput("");
      setReferenceContent(null);
      setLimitType("none");
      setLimitValue("");
    }
  }, [
    open,
    config?.defaultLanguage,
    initialValues?.language,
    initialValues?.contentType,
    initialValues?.prompt,
  ]);

  useEffect(() => {
    if (!open || !initialValues?.referenceContentId) return;

    let isActive = true;

    const loadReferenceContent = async () => {
      try {
        const { data } = await client.api.contentDetail(initialValues.referenceContentId ?? 0);
        if (isActive) {
          setReferenceContent(data);
        }
      } catch (err) {
        if (isActive) {
          notificationsService.error("Failed to load reference content.");
        }
      }
    };

    loadReferenceContent();

    return () => {
      isActive = false;
    };
  }, [client.api, initialValues?.referenceContentId, notificationsService, open]);

  useEffect(() => {
    setReferenceContent(null);
    setReferenceContentInput("");
    // Reset limit value when reference changes
    setLimitValue("");
  }, [contentType]);

  useEffect(() => {
    const shouldSearch = isReferenceOpen || debouncedReferenceInput.trim().length > 0;

    if (!open || !contentType || !shouldSearch) {
      setReferenceContentOptions([]);
      setIsReferenceLoading(false);
      return;
    }

    const loadReferenceContent = async () => {
      setIsReferenceLoading(true);

      try {
        const trimmedSearch = debouncedReferenceInput.trim();
        const filter: Record<string, unknown> = {
          "filter[skip]": 0,
          "filter[limit]": trimmedSearch ? 20 : 10,
          "filter[order]": "updatedAt desc",
          includeTranslations: (config?.languages?.length || 0) > 1,
        };

        if (trimmedSearch) {
          filter.query = trimmedSearch;
        }

        const typeQuery = getWhereFilterQuery("type", contentType, "equals");
        if (typeQuery) {
          filter.query = `${filter.query || ""}${typeQuery}`;
        }

        const { data } = await client.api.contentWithStatisticsList(filter);
        const items = data?.content || [];
        setReferenceContentOptions(items);
      } catch (err) {
        notificationsService.error("Failed to load reference content list.");
      } finally {
        setIsReferenceLoading(false);
      }
    };

    loadReferenceContent();
  }, [
    client.api,
    config?.languages?.length,
    contentType,
    debouncedReferenceInput,
    isReferenceOpen,
    notificationsService,
    open,
  ]);

  const handleCreate = () => {
    if (language && contentType && prompt.trim()) {
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
      onCreate(
        language,
        contentType,
        prompt.trim(),
        referenceContent?.id || null,
        wordCount,
        characterCount,
        estimation
      );
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Calculate sample content stats
  const sampleStats = useMemo(() => {
    if (!referenceContent) return null;
    const contentJson = JSON.stringify(referenceContent);
    const bodyText = referenceContent.body || "";
    return {
      characters: countCharacters(contentJson),
      words: countWords(bodyText),
      bodyCharacters: countCharacters(bodyText),
    };
  }, [referenceContent]);

  // Auto-populate limit value when limit type changes and sample is selected
  useEffect(() => {
    if (!sampleStats) {
      setLimitValue("");
      return;
    }
    if (limitType === "characters") {
      setLimitValue(sampleStats.bodyCharacters);
    } else if (limitType === "words") {
      setLimitValue(sampleStats.words);
    } else {
      setLimitValue("");
    }
  }, [limitType, sampleStats]);

  // Token estimation
  const tokenEstimation = useMemo(() => {
    return estimateGenerationTokens({
      sampleContent: referenceContent,
      userPrompt: prompt,
      limitType,
      limitValue: typeof limitValue === "number" ? limitValue : undefined,
    });
  }, [referenceContent, prompt, limitType, limitValue]);

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

          <Autocomplete
            options={referenceContentOptions}
            value={referenceContent}
            inputValue={referenceContentInput}
            open={isReferenceOpen}
            onOpen={() => setIsReferenceOpen(true)}
            onClose={() => setIsReferenceOpen(false)}
            onInputChange={(_, value) => {
              setReferenceContentInput(value);
            }}
            onChange={(_, value) => {
              setReferenceContent(value);
              if (error && onErrorClear) {
                onErrorClear();
              }
            }}
            getOptionLabel={(option) => {
              const title = option.title || "Untitled";
              const slugPart = option.slug ? ` • ${option.slug}` : "";
              return `${title}${slugPart}`;
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={isReferenceLoading}
            noOptionsText={contentType ? "No content found" : "Select a content type first"}
            disabled={!contentType || isLoading}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id ?? option.slug ?? option.title}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {option.title || "Untitled"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.slug || `ID: ${option.id ?? "-"}`}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Reference Content (Optional)"
                placeholder={
                  contentType
                    ? "Search or select a content sample to reference"
                    : "Select a content type first"
                }
                helperText={"Pick a content record to guide the AI (top 10 shown by default)."}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isReferenceLoading ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{ mb: 3 }}
              />
            )}
          />

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
                        AI will decide based on the sample and prompt
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
                      {sampleStats && (
                        <Typography variant="caption" color="primary">
                          (sample: {sampleStats.bodyCharacters.toLocaleString()})
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
                      {sampleStats && (
                        <Typography variant="caption" color="primary">
                          (sample: {sampleStats.words.toLocaleString()})
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
