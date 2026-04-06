import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useConfig } from "@providers/config-provider";
import { useRequestContext } from "@providers/request-provider";
import { ContentTypeDetailsDto } from "@lib/network/swagger-client";
import { fetchAllContentTypes } from "@features/content/content-types/content-types";
import { LanguageSelect } from "@components/language-select";
import { MaskedSlugInput } from "@components/masked-slug-input";
import { RemoteAutocomplete } from "@components/remote-autocomplete";
import { RemoteValues } from "@components/remote-autocomplete/types";
import { useGlobalLanguageFilter } from "@providers/global-language-filter-provider";
import { ContentTypeDropdown } from "@features/content/content-types/content-type-dropdown";
import {
  getContentLengthSettings,
  validateTitleLength,
  validateDescriptionLength,
} from "@utils/content-validation-helper";

export interface AddContentDialogResult {
  contentType: string;
  language: string;
  title: string;
  description: string;
  slug: string;
  category: string;
}

interface AddContentDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (result: AddContentDialogResult) => void;
  defaultContentType?: string | null;
}

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-_./]/gu, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const AddContentDialog = ({
  open,
  onClose,
  onAdd,
  defaultContentType,
}: AddContentDialogProps) => {
  const { config } = useConfig();
  const { client } = useRequestContext();
  const { selectedLanguage } = useGlobalLanguageFilter();

  const [contentTypes, setContentTypes] = useState<ContentTypeDetailsDto[]>([]);
  const [contentType, setContentType] = useState("");
  const [language, setLanguage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const hasMultipleLanguages = (config?.languages?.length || 0) > 1;
  const lengthSettings = getContentLengthSettings(config);

  const titleError = !title.trim()
    ? touched.title
      ? "Title is required"
      : null
    : validateTitleLength(title, lengthSettings);

  const descriptionError = !description.trim()
    ? touched.description
      ? "Description is required"
      : null
    : validateDescriptionLength(description, lengthSettings);

  const selectedContentType = useMemo(
    () => contentTypes.find((t) => t.uid === contentType) || null,
    [contentTypes, contentType]
  );

  const buildFullSlug = useCallback(
    (middle: string) => {
      const prefix = selectedContentType?.slugPrefix || "";
      const postfix = selectedContentType?.slugPostfix || "";
      if (!middle) return "";
      return prefix + middle + postfix;
    },
    [selectedContentType]
  );

  // Load content types on open
  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const types = await fetchAllContentTypes(client);
      setContentTypes(types);
    };
    load();
  }, [open, client]);

  // Set defaults when dialog opens
  useEffect(() => {
    if (!open) return;

    const defaultLang =
      selectedLanguage && selectedLanguage !== "all"
        ? (selectedLanguage as string)
        : config?.defaultLanguage || "";
    setLanguage(defaultLang);

    if (defaultContentType) {
      setContentType(defaultContentType);
    } else if (contentTypes.length > 0 && !contentType) {
      setContentType(contentTypes[0].uid);
    }
  }, [open, defaultContentType, contentTypes, config?.defaultLanguage, selectedLanguage]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setTouched((prev) => ({ ...prev, title: true }));
    if (!slugManuallyEdited) {
      setSlug(buildFullSlug(slugify(newTitle)));
    }
  };

  const handleSlugChange = (fullSlug: string) => {
    setSlugManuallyEdited(true);
    setSlug(fullSlug);
  };

  const handleContentTypeChange = (newType: string) => {
    setContentType(newType);
    // Recompute slug with new prefix/postfix if auto-slugifying
    if (!slugManuallyEdited && title) {
      const ct = contentTypes.find((t) => t.uid === newType);
      const prefix = ct?.slugPrefix || "";
      const postfix = ct?.slugPostfix || "";
      const middle = slugify(title);
      setSlug(middle ? prefix + middle + postfix : "");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAdd = () => {
    onAdd({
      contentType,
      language,
      title,
      description,
      slug,
      category,
    });
    resetForm();
  };

  const resetForm = () => {
    setContentType("");
    setLanguage("");
    setTitle("");
    setDescription("");
    setSlug("");
    setCategory("");
    setSlugManuallyEdited(false);
    setTouched({});
  };

  const isValid =
    !!contentType &&
    !!title.trim() &&
    !!description.trim() &&
    !!slug.trim() &&
    !titleError &&
    !descriptionError;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Content</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, mt: 1 }}>
          Fill in the details below to create a new content item.
        </Typography>

        <Grid container rowSpacing={4} columnSpacing={3}>
          {hasMultipleLanguages && (
            <Grid size={{ xs: 12 }}>
              <LanguageSelect value={language} onChange={setLanguage} label="Language" required />
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <ContentTypeDropdown
              value={contentType}
              options={contentTypes}
              onChange={handleContentTypeChange}
              onAddNewType={async () => {
                const types = await fetchAllContentTypes(client);
                setContentTypes(types);
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={handleTitleChange}
              onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
              required
              placeholder="Enter content title"
              error={!!titleError}
              helperText={
                titleError || "Typically page title, meta title, or H1. Actual use depends on site."
              }
              slotProps={{ formHelperText: { sx: { ml: 0 } } }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setTouched((prev) => ({ ...prev, description: true }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
              placeholder="Enter content description"
              multiline
              minRows={2}
              maxRows={4}
              required
              error={!!descriptionError}
              helperText={
                descriptionError ||
                "Typically meta description or content excerpt. Actual use depends on site."
              }
              slotProps={{ formHelperText: { sx: { ml: 0 } } }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <MaskedSlugInput
              value={slug}
              onChange={handleSlugChange}
              prefix={selectedContentType?.slugPrefix}
              postfix={selectedContentType?.slugPostfix}
              helperText="Typically the URL path for this content. Actual use depends on site."
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <RemoteAutocomplete
              type={RemoteValues.CATEGORIES}
              label="Category"
              placeholder="Select Category"
              value={category}
              onChange={(_ev, val) => setCategory(val as string)}
              freeSolo
              multiple={false}
              limit={1}
              contentType={contentType}
              language={language}
              error={false}
              helperText="Group related content. Actual use depends on site."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!isValid}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};
