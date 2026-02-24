import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormHelperText,
  FormControlLabel,
  FormLabel,
  InputLabel,
  Radio,
  RadioGroup,
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
} from "@mui/material";
import { Plus, Sparkles, Trash2, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { useConfig } from "@providers/config-provider";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { showApiError } from "@utils/api-error-parser";
import { EmailGroupDetailsDto, EmailTemplateDetailsDto } from "@lib/network/swagger-client";
import {
  EMAIL_TEMPLATE_CATEGORY_OPTIONS,
  EmailTemplateCategory,
  getEmailTemplateCategoryNote,
} from "@utils/email-template-category";
import type { Theme } from "@mui/material/styles";
import { Chip, Stack } from "@mui/material";

type LimitType = "none" | "characters" | "words";

export interface AIEmailDraftDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (
    language: string,
    emailGroupId: number,
    prompt: string,
    category: EmailTemplateCategory,
    referenceTemplateId?: number | null,
    templateVariables?: Record<string, string>,
    wordCount?: number | null,
    characterCount?: number | null
  ) => void;
  isLoading?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
  onViewErrorDetails?: () => void;
  initialValues?: {
    language?: string;
    emailGroupId?: number;
    prompt?: string;
    category?: EmailTemplateCategory;
    referenceTemplateId?: number | null;
  };
}

export const AIEmailDraftDialog = ({
  open,
  onClose,
  onCreate,
  isLoading = false,
  error,
  onErrorClear,
  onViewErrorDetails,
  initialValues,
}: AIEmailDraftDialogProps) => {
  const { config } = useConfig();
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const [language, setLanguage] = useState("");
  const [emailGroupId, setEmailGroupId] = useState<number | "">("");
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState<EmailTemplateCategory>("General");
  const [referenceTemplate, setReferenceTemplate] = useState<EmailTemplateDetailsDto | null>(null);
  const [referenceOptions, setReferenceOptions] = useState<EmailTemplateDetailsDto[]>([]);
  const [referenceInput, setReferenceInput] = useState("");
  const [isRefLoading, setIsRefLoading] = useState(false);
  const [isRefOpen, setIsRefOpen] = useState(false);
  const [debouncedRefInput] = useDebounce(referenceInput, 300);
  const [templateVars, setTemplateVars] = useState<Array<{ key: string; value: string }>>([]);
  const [limitType, setLimitType] = useState<LimitType>("none");
  const [limitValue, setLimitValue] = useState<number | "">("");

  const languages = config?.languages || [];
  const hasAIAssistance = config?.capabilities?.includes("AIAssistance") || false;

  const [allEmailGroups, setAllEmailGroups] = useState<EmailGroupDetailsDto[]>([]);

  // Load email groups
  useEffect(() => {
    if (!open) return;
    client.api
      .emailGroupsList()
      .then((res) => setAllEmailGroups(res.data))
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }, [client, open]);

  // Filter groups by selected language
  const filteredEmailGroups = language
    ? allEmailGroups.filter((g) => {
        const langPrefix = language.split("-")[0].toLowerCase();
        return (
          g.language?.toLowerCase() === language.toLowerCase() ||
          g.language?.toLowerCase().startsWith(langPrefix)
        );
      })
    : allEmailGroups;

  // Clear stored group when it no longer belongs to the filtered list
  useEffect(() => {
    if (
      emailGroupId !== "" &&
      allEmailGroups.length > 0 &&
      !filteredEmailGroups.some((g) => g.id === emailGroupId)
    ) {
      setEmailGroupId("");
    }
  }, [filteredEmailGroups]);

  // Initialise form when dialog opens
  useEffect(() => {
    if (open) {
      const initGroupId = initialValues?.emailGroupId || "";
      setEmailGroupId(initGroupId);

      // Derive language: explicit > group's language > default
      let initLang = initialValues?.language || "";
      if (!initLang && initGroupId && allEmailGroups.length > 0) {
        const group = allEmailGroups.find((g) => g.id === Number(initGroupId));
        if (group?.language) {
          initLang = group.language;
        }
      }
      setLanguage(initLang || config?.defaultLanguage || "");

      setPrompt(initialValues?.prompt || "");
      setCategory(initialValues?.category || "General");
      setReferenceInput("");
      setReferenceTemplate(null);
      setTemplateVars([]);
      setLimitType("none");
      setLimitValue("");
    }
  }, [
    open,
    allEmailGroups,
    config?.defaultLanguage,
    initialValues?.language,
    initialValues?.emailGroupId,
    initialValues?.prompt,
  ]);

  // Load initial reference template if provided
  useEffect(() => {
    if (!open || !initialValues?.referenceTemplateId) return;
    let active = true;
    const load = async () => {
      try {
        const { data } = await client.api.emailTemplatesDetail(
          initialValues.referenceTemplateId ?? 0
        );
        if (active) setReferenceTemplate(data);
      } catch (error) {
        if (active) {
          showApiError(
            error,
            notificationsService,
            undefined,
            "Failed to load reference template."
          );
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [client.api, initialValues?.referenceTemplateId, notificationsService, open]);

  // Search reference templates
  useEffect(() => {
    const shouldSearch = isRefOpen || debouncedRefInput.trim().length > 0;
    if (!open || !shouldSearch) {
      setReferenceOptions([]);
      setIsRefLoading(false);
      return;
    }
    const load = async () => {
      setIsRefLoading(true);
      try {
        const trimmed = debouncedRefInput.trim();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryParams: Record<string, any> = {
          "filter[skip]": 0,
          "filter[limit]": trimmed ? 30 : 20,
          "filter[order]": "updatedAt desc",
        };
        if (trimmed) {
          queryParams.query = trimmed;
        }
        if (language) {
          queryParams["filter[where][language]"] = language;
        }
        if (emailGroupId !== "") {
          queryParams["filter[where][emailGroupId]"] = Number(emailGroupId);
        }
        const { data } = await client.api.emailTemplatesList(queryParams as { query?: string });
        setReferenceOptions(
          (data as unknown as { rows?: EmailTemplateDetailsDto[] })?.rows ||
            (data as EmailTemplateDetailsDto[]) ||
            []
        );
      } catch (error) {
        showApiError(error, notificationsService, undefined, "Failed to load reference templates.");
      } finally {
        setIsRefLoading(false);
      }
    };
    load();
  }, [
    client.api,
    debouncedRefInput,
    emailGroupId,
    isRefOpen,
    language,
    notificationsService,
    open,
  ]);

  const filteredReferenceOptions = useMemo(() => {
    return [...referenceOptions].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [referenceOptions]);

  const handleCreate = () => {
    if (language && emailGroupId && prompt.trim()) {
      const vars: Record<string, string> = {};
      templateVars.forEach(({ key, value }) => {
        const k = key.trim();
        if (k) vars[k] = value;
      });
      const wordCount = limitType === "words" && limitValue ? Number(limitValue) : null;
      const characterCount = limitType === "characters" && limitValue ? Number(limitValue) : null;
      onCreate(
        language,
        Number(emailGroupId),
        prompt.trim(),
        category,
        referenceTemplate?.id || null,
        Object.keys(vars).length > 0 ? vars : undefined,
        wordCount,
        characterCount
      );
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isFormValid = !!language && !!emailGroupId && prompt.trim().length > 0;

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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
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
                Create Email Template with AI
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: "0.875rem" }}>
                Generate an email template from your description
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
            Describe what email template you want to create. AI will generate the template body,
            subject line, and metadata for you to review and edit.
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={language}
              label="Language"
              onChange={(e) => {
                setLanguage(e.target.value);
                if (error && onErrorClear) onErrorClear();
              }}
              disabled={isLoading}
            >
              {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Email Group</InputLabel>
            <Select
              value={emailGroupId}
              label="Email Group"
              onChange={(e) => {
                setEmailGroupId(e.target.value as number);
                if (error && onErrorClear) onErrorClear();
              }}
              disabled={isLoading}
            >
              {filteredEmailGroups.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {g.name}
                    {g.language && (
                      <Chip
                        label={g.language}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 18,
                          fontSize: "0.65rem",
                          "& .MuiChip-label": { px: 0.75 },
                        }}
                      />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => {
                setCategory(e.target.value as EmailTemplateCategory);
                if (error && onErrorClear) onErrorClear();
              }}
              disabled={isLoading}
            >
              {EMAIL_TEMPLATE_CATEGORY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{getEmailTemplateCategoryNote(category)}</FormHelperText>
          </FormControl>

          <Autocomplete
            options={filteredReferenceOptions}
            value={referenceTemplate}
            inputValue={referenceInput}
            open={isRefOpen}
            onOpen={() => setIsRefOpen(true)}
            onClose={() => setIsRefOpen(false)}
            onInputChange={(_, value) => setReferenceInput(value)}
            onChange={(_, value) => {
              setReferenceTemplate(value);
              if (error && onErrorClear) onErrorClear();
            }}
            getOptionLabel={(option) => {
              const name = option.name || "Untitled";
              const subject = option.subject ? ` — ${option.subject}` : "";
              return `${name}${subject}`;
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={isRefLoading}
            noOptionsText="No templates found"
            disabled={isLoading}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id ?? option.name}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {option.name || "Untitled"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.subject || `ID: ${option.id ?? "-"}`}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Reference Template (Optional)"
                placeholder="Search for an existing template to use as a reference"
                helperText="Select a template as a style/structure reference for the AI."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isRefLoading ? <CircularProgress size={18} /> : null}
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
            label="Template Description"
            placeholder={
              "Describe the email template you want to create. " +
              "Include the purpose, tone, key sections, and any " +
              "specific template variables (e.g. {{ name }}, " +
              "{{ resetLink }})..."
            }
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (error && onErrorClear) onErrorClear();
            }}
            disabled={isLoading}
            sx={{
              mb: 3,
              "& .MuiInputBase-root": { lineHeight: 1.5 },
              "& .MuiInputBase-inputMultiline": {
                resize: "vertical",
              },
            }}
            helperText={`${prompt.length} characters. Be as detailed as possible for best results.`}
          />

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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
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
              Define placeholder tokens the AI must use in the template.
            </Typography>

            <Stack spacing={1.5}>
              {templateVars.map((tv, idx) => (
                <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                    onClick={() => setTemplateVars((prev) => prev.filter((_, i) => i !== idx))}
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
                        AI will decide the appropriate length
                      </Typography>
                    </Box>
                  }
                  disabled={isLoading}
                />
                <FormControlLabel
                  value="characters"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">Limit by characters</Typography>}
                  disabled={isLoading}
                />
                <FormControlLabel
                  value="words"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">Limit by words</Typography>}
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
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: "text.primary",
              }}
            >
              Tips for Better Results
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.5 }}>
              {"• "}
              <strong>Mention the purpose:</strong> Welcome email, password reset, order
              confirmation, newsletter, etc.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.5 }}>
              {"• "}
              <strong>List variables:</strong> Specify tokens like {"{{ name }}"}, {"{{ company }}"}
              , {"{{ actionUrl }}"} that should appear in the template.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              {"• "}
              <strong>Describe the tone:</strong> Professional, friendly, minimal,
              marketing-oriented, etc.
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mt: 3 }}
              action={
                onViewErrorDetails ? (
                  <Button color="error" size="small" onClick={onViewErrorDetails}>
                    View Details
                  </Button>
                ) : undefined
              }
            >
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
