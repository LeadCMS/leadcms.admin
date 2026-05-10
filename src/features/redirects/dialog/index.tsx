import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { parseApiError, showApiError } from "@utils/api-error-parser";
import {
  RedirectCreateDto,
  RedirectDetailsDto,
  RedirectUpdateDto,
} from "@lib/network/swagger-client";
import { ContentIdAutocomplete } from "./content-id-autocomplete";
import { LanguageSelect } from "@components/language-select";
import { useConfig } from "@providers/config-provider";

const trimSlashes = (value: string | null): string | null => {
  if (value == null) return null;
  const trimmed = value.replace(/^\/+|\/+$/g, "");
  return trimmed || null;
};

export interface RedirectDialogProps {
  open: boolean;
  mode: "create" | "edit";
  redirectId?: number | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
  onDeleted?: () => void | Promise<void>;
}

interface FormState {
  kind: "Temporary" | "Permanent";
  sourceType: "InternalPath" | "ContentSlug" | "ContentId";
  fromPath: string | null;
  fromLanguage: string | null;
  fromSlug: string | null;
  fromContentId: number | null;
  targetType: "ExternalUrl" | "InternalPath" | "ContentSlug" | "ContentId";
  toUrl: string | null;
  toPath: string | null;
  toLanguage: string | null;
  toSlug: string | null;
  toContentId: number | null;
}

const defaultFormState: FormState = {
  kind: "Temporary",
  sourceType: "InternalPath",
  fromPath: null,
  fromLanguage: null,
  fromSlug: null,
  fromContentId: null,
  targetType: "ExternalUrl",
  toUrl: null,
  toPath: null,
  toLanguage: null,
  toSlug: null,
  toContentId: null,
};

function validate(state: FormState, hasMultipleLanguages: boolean): Record<string, string> {
  const errors: Record<string, string> = {};
  if (state.sourceType === "InternalPath") {
    if (!state.fromPath?.trim()) {
      errors.fromPath = "From Path is required.";
    }
  }
  if (state.sourceType === "ContentSlug") {
    if (hasMultipleLanguages && !state.fromLanguage?.trim())
      errors.fromLanguage = "Language is required.";
    if (!state.fromSlug?.trim()) errors.fromSlug = "Slug is required.";
  }
  if (state.sourceType === "ContentId") {
    if (state.fromContentId == null || state.fromContentId <= 0) {
      errors.fromContentId = "A valid content record is required.";
    }
  }
  if (state.targetType === "ExternalUrl") {
    if (!state.toUrl?.trim()) {
      errors.toUrl = "URL is required.";
    } else if (!state.toUrl.startsWith("http://") && !state.toUrl.startsWith("https://")) {
      errors.toUrl = 'URL must start with "http://" or "https://".';
    }
  }
  if (state.targetType === "InternalPath") {
    if (!state.toPath?.trim()) {
      errors.toPath = "To Path is required.";
    }
  }
  if (state.targetType === "ContentSlug") {
    if (hasMultipleLanguages && !state.toLanguage?.trim())
      errors.toLanguage = "Language is required.";
    if (!state.toSlug?.trim()) errors.toSlug = "Slug is required.";
  }
  if (state.targetType === "ContentId") {
    if (state.toContentId == null || state.toContentId <= 0) {
      errors.toContentId = "A valid content record is required.";
    }
  }
  return errors;
}

export const RedirectDialog = ({
  open,
  mode,
  redirectId,
  onClose,
  onSaved,
  onDeleted,
}: RedirectDialogProps) => {
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const { config } = useConfig();
  const hasMultipleLanguages = (config?.languages?.length || 0) > 1;
  const defaultLang = config?.defaultLanguage ?? "";
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [original, setOriginal] = useState<RedirectDetailsDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (redirectId == null) return;
    setDeleteConfirmOpen(false);
    setIsSaving(true);
    try {
      await client.api.redirectsDelete(redirectId);
      notificationsService.success("Redirect deleted.");
      if (onDeleted) {
        await onDeleted();
      } else {
        onClose();
      }
    } catch (e) {
      showApiError(e, notificationsService);
    } finally {
      setIsSaving(false);
    }
  };
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSourceTypeChange = (newType: "InternalPath" | "ContentSlug" | "ContentId") => {
    setFormState((prev) => ({
      ...prev,
      sourceType: newType,
      fromPath: null,
      fromLanguage: newType === "ContentSlug" && !hasMultipleLanguages ? defaultLang : null,
      fromSlug: null,
      fromContentId: null,
    }));
  };

  const handleTargetTypeChange = (
    newType: "ExternalUrl" | "InternalPath" | "ContentSlug" | "ContentId"
  ) => {
    setFormState((prev) => ({
      ...prev,
      targetType: newType,
      toUrl: null,
      toPath: null,
      toLanguage: newType === "ContentSlug" && !hasMultipleLanguages ? defaultLang : null,
      toSlug: null,
      toContentId: null,
    }));
  };

  // Load record in edit mode
  useEffect(() => {
    if (!open || mode !== "edit" || redirectId == null) return;
    let isActive = true;
    const load = async () => {
      try {
        const { data } = await client.api.redirectsDetail(redirectId);
        if (!isActive) return;
        setOriginal(data);
        setFormState({
          kind: data.kind ?? "Permanent",
          sourceType: data.sourceType ?? "InternalPath",
          fromPath: trimSlashes(data.fromPath ?? null),
          fromLanguage: data.fromLanguage ?? null,
          fromSlug: trimSlashes(data.fromSlug ?? null),
          fromContentId: data.fromContentId ?? null,
          targetType: data.targetType ?? "ExternalUrl",
          toUrl: data.toUrl ?? null,
          toPath: trimSlashes(data.toPath ?? null),
          toLanguage: data.toLanguage ?? null,
          toSlug: trimSlashes(data.toSlug ?? null),
          toContentId: data.toContentId ?? null,
        });
      } catch (e) {
        if (!isActive) return;
        const parsed = parseApiError(e);
        if (parsed.status === 404) {
          notificationsService.error("This redirect no longer exists.");
          onClose();
          await onSaved();
        } else {
          showApiError(e, notificationsService);
        }
      }
    };
    load();
    return () => {
      isActive = false;
    };
  }, [client.api, mode, open, redirectId, notificationsService, onClose, onSaved]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormState(defaultFormState);
      setOriginal(null);
      setFormError(null);
      setFieldErrors({});
    }
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    // When single language, ensure language fields are set before validation
    const stateForSave: FormState = {
      ...formState,
      fromPath: trimSlashes(formState.fromPath),
      fromSlug: trimSlashes(formState.fromSlug),
      toPath: trimSlashes(formState.toPath),
      toSlug: trimSlashes(formState.toSlug),
      fromLanguage:
        formState.sourceType === "ContentSlug" && !hasMultipleLanguages
          ? defaultLang
          : formState.fromLanguage,
      toLanguage:
        formState.targetType === "ContentSlug" && !hasMultipleLanguages
          ? defaultLang
          : formState.toLanguage,
    };
    const errors = validate(stateForSave, hasMultipleLanguages);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    setFormError(null);
    try {
      if (mode === "create") {
        const payload: RedirectCreateDto = {
          kind: stateForSave.kind,
          sourceType: stateForSave.sourceType,
          targetType: stateForSave.targetType,
          ...(stateForSave.sourceType === "InternalPath" && {
            fromPath: stateForSave.fromPath,
          }),
          ...(stateForSave.sourceType === "ContentSlug" && {
            fromLanguage: stateForSave.fromLanguage,
            fromSlug: stateForSave.fromSlug,
          }),
          ...(stateForSave.sourceType === "ContentId" && {
            fromContentId: stateForSave.fromContentId,
          }),
          ...(stateForSave.targetType === "ExternalUrl" && { toUrl: stateForSave.toUrl }),
          ...(stateForSave.targetType === "InternalPath" && { toPath: stateForSave.toPath }),
          ...(stateForSave.targetType === "ContentSlug" && {
            toLanguage: stateForSave.toLanguage,
            toSlug: stateForSave.toSlug,
          }),
          ...(stateForSave.targetType === "ContentId" && {
            toContentId: stateForSave.toContentId,
          }),
        };
        await client.api.redirectsCreate(payload);
        notificationsService.success("Redirect created.");
      } else {
        const changed: RedirectUpdateDto = {};
        if (stateForSave.kind !== original?.kind) changed.kind = stateForSave.kind;
        if (stateForSave.sourceType !== original?.sourceType)
          changed.sourceType = stateForSave.sourceType;
        if (stateForSave.fromPath !== (original?.fromPath ?? null))
          changed.fromPath = stateForSave.fromPath;
        if (stateForSave.fromLanguage !== (original?.fromLanguage ?? null))
          changed.fromLanguage = stateForSave.fromLanguage;
        if (stateForSave.fromSlug !== (original?.fromSlug ?? null))
          changed.fromSlug = stateForSave.fromSlug;
        if (stateForSave.fromContentId !== (original?.fromContentId ?? null))
          changed.fromContentId = stateForSave.fromContentId;
        if (stateForSave.targetType !== original?.targetType)
          changed.targetType = stateForSave.targetType;
        if (stateForSave.toUrl !== (original?.toUrl ?? null)) changed.toUrl = stateForSave.toUrl;
        if (stateForSave.toPath !== (original?.toPath ?? null))
          changed.toPath = stateForSave.toPath;
        if (stateForSave.toLanguage !== (original?.toLanguage ?? null))
          changed.toLanguage = stateForSave.toLanguage;
        if (stateForSave.toSlug !== (original?.toSlug ?? null))
          changed.toSlug = stateForSave.toSlug;
        if (stateForSave.toContentId !== (original?.toContentId ?? null))
          changed.toContentId = stateForSave.toContentId;
        await client.api.redirectsPartialUpdate(redirectId ?? 0, changed);
        notificationsService.success("Redirect saved.");
      }
      await onSaved();
    } catch (e) {
      const parsed = parseApiError(e);
      if (parsed.status === 409 || parsed.status === 422) {
        setFormError(parsed.title ?? parsed.message ?? "Validation error.");
      } else if (parsed.status === 404) {
        notificationsService.error("This redirect no longer exists.");
        onClose();
        await onSaved();
      } else {
        showApiError(e, notificationsService);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{mode === "create" ? "Add Redirect" : "Edit Redirect"}</DialogTitle>
        <DialogContent>
          {mode === "edit" && original?.isAutoDiscovered && (
            <Alert severity="info" sx={{ mb: 2 }}>
              This redirect was created automatically by the system.
            </Alert>
          )}

          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Kind */}
            <Grid size={{ xs: 12 }}>
              <FormControl>
                <FormLabel>Kind</FormLabel>
                <RadioGroup
                  row
                  value={formState.kind}
                  onChange={(e) => setField("kind", e.target.value as FormState["kind"])}
                >
                  <FormControlLabel value="Temporary" control={<Radio />} label="Temporary (302)" />
                  <FormControlLabel value="Permanent" control={<Radio />} label="Permanent (301)" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Source section */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Source Type</InputLabel>
                <Select
                  value={formState.sourceType}
                  label="Source Type"
                  onChange={(e) =>
                    handleSourceTypeChange(e.target.value as FormState["sourceType"])
                  }
                >
                  <MenuItem value="InternalPath">Internal Path</MenuItem>
                  <MenuItem value="ContentSlug">Content Slug</MenuItem>
                  <MenuItem value="ContentId">Content ID</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formState.sourceType === "InternalPath" && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="From Path"
                  value={formState.fromPath ?? ""}
                  onChange={(e) => setField("fromPath", e.target.value)}
                  onBlur={(e) => setField("fromPath", trimSlashes(e.target.value))}
                  error={!!fieldErrors.fromPath}
                  helperText={
                    fieldErrors.fromPath ??
                    'Path without leading/trailing slashes, e.g. "long/multi-folder/path".'
                  }
                />
              </Grid>
            )}

            {formState.sourceType === "ContentSlug" && (
              <>
                {hasMultipleLanguages && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <LanguageSelect
                      size="small"
                      value={formState.fromLanguage ?? ""}
                      onChange={(v) => setField("fromLanguage", v)}
                      error={!!fieldErrors.fromLanguage}
                      helperText={fieldErrors.fromLanguage}
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: hasMultipleLanguages ? 6 : 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="From Slug"
                    value={formState.fromSlug ?? ""}
                    onChange={(e) => setField("fromSlug", e.target.value)}
                    onBlur={(e) => setField("fromSlug", trimSlashes(e.target.value))}
                    error={!!fieldErrors.fromSlug}
                    helperText={fieldErrors.fromSlug ?? 'Slug without slashes, e.g. "my-slug".'}
                  />
                </Grid>
              </>
            )}

            {formState.sourceType === "ContentId" && (
              <Grid size={{ xs: 12 }}>
                <ContentIdAutocomplete
                  label="From Content"
                  value={formState.fromContentId}
                  onChange={(id) => setField("fromContentId", id)}
                />
                {fieldErrors.fromContentId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                    {fieldErrors.fromContentId}
                  </Typography>
                )}
              </Grid>
            )}

            {/* Target section */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Target Type</InputLabel>
                <Select
                  value={formState.targetType}
                  label="Target Type"
                  onChange={(e) =>
                    handleTargetTypeChange(e.target.value as FormState["targetType"])
                  }
                >
                  <MenuItem value="ExternalUrl">External URL</MenuItem>
                  <MenuItem value="InternalPath">Internal Path</MenuItem>
                  <MenuItem value="ContentSlug">Content Slug</MenuItem>
                  <MenuItem value="ContentId">Content ID</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formState.targetType === "ExternalUrl" && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="URL"
                  value={formState.toUrl ?? ""}
                  onChange={(e) => setField("toUrl", e.target.value)}
                  error={!!fieldErrors.toUrl}
                  helperText={
                    fieldErrors.toUrl ?? 'Full external URL starting with "http://" or "https://".'
                  }
                />
              </Grid>
            )}

            {formState.targetType === "InternalPath" && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="To Path"
                  value={formState.toPath ?? ""}
                  onChange={(e) => setField("toPath", e.target.value)}
                  onBlur={(e) => setField("toPath", trimSlashes(e.target.value))}
                  error={!!fieldErrors.toPath}
                  helperText={
                    fieldErrors.toPath ??
                    'Full path without leading/trailing slashes, e.g. "destination-path".'
                  }
                />
              </Grid>
            )}

            {formState.targetType === "ContentSlug" && (
              <>
                {hasMultipleLanguages && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <LanguageSelect
                      size="small"
                      value={formState.toLanguage ?? ""}
                      onChange={(v) => setField("toLanguage", v)}
                      error={!!fieldErrors.toLanguage}
                      helperText={fieldErrors.toLanguage}
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: hasMultipleLanguages ? 6 : 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="To Slug"
                    value={formState.toSlug ?? ""}
                    onChange={(e) => setField("toSlug", e.target.value)}
                    onBlur={(e) => setField("toSlug", trimSlashes(e.target.value))}
                    error={!!fieldErrors.toSlug}
                    helperText={fieldErrors.toSlug ?? 'Slug without slashes, e.g. "my-slug".'}
                  />
                </Grid>
              </>
            )}

            {formState.targetType === "ContentId" && (
              <Grid size={{ xs: 12 }}>
                <ContentIdAutocomplete
                  label="To Content"
                  value={formState.toContentId}
                  onChange={(id) => setField("toContentId", id)}
                />
                {fieldErrors.toContentId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                    {fieldErrors.toContentId}
                  </Typography>
                )}
              </Grid>
            )}
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            Redirects in LeadCMS are a registry of redirect rules the site should know about,
            including both manual redirects and redirects auto-discovered from historical content
            slug changes. They do not execute redirects by themselves. The live site must still
            implement these rules using its own redirect engine, such as nginx redirect maps or a
            similar application-level mechanism.
          </Alert>
        </DialogContent>
        <DialogActions>
          {mode === "edit" && (
            <Button color="error" onClick={handleDelete} disabled={isSaving} sx={{ mr: "auto" }}>
              Delete
            </Button>
          )}
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isSaving}>
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Redirect</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this redirect? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirmed}
            color="error"
            variant="contained"
            disabled={isSaving}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
