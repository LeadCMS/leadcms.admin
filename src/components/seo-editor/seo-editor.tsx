import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  TextField,
  Typography,
  Chip,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Stack,
  Button,
} from "@mui/material";
import { ChevronDown, Image, RotateCcw } from "lucide-react";
import { SeoMetadataDto } from "@lib/network/swagger-client";
import { buildAbsoluteUrl } from "@lib/network/utils";
import { ImageSelectionDialog } from "@components/image-selection-dialog/image-selection-dialog";
import { SearchEnginePreview } from "./search-engine-preview";
import { OpenGraphPreview } from "./open-graph-preview";

const ROBOTS_OPTIONS = [
  { value: "index, follow", label: "Index, Follow (Recommended)" },
  { value: "noindex, follow", label: "No Index, Follow" },
  { value: "index, nofollow", label: "Index, No Follow" },
  { value: "noindex, nofollow", label: "No Index, No Follow" },
];

const DEFAULT_ROBOTS = "index, follow";

interface ContentDefaults {
  title: string;
  description: string;
  coverImageUrl: string | null;
  slug: string;
}

interface SeoEditorProps {
  seo: SeoMetadataDto | null | undefined;
  contentDefaults: ContentDefaults;
  onChange: (seo: SeoMetadataDto | null) => void;
  disabled?: boolean;
  siteUrl?: string;
}

/**
 * Returns the effective value for a SEO field,
 * falling back to the content default when no override is set.
 */
const effective = (override: string | null | undefined, fallback: string): string => {
  return override != null && override !== "" ? override : fallback;
};

/**
 * Determines if a field has a user-supplied override
 * (non-null, non-empty string that differs from the default).
 */
const isOverridden = (override: string | null | undefined, fallback: string): boolean => {
  return override != null && override !== "" && override !== fallback;
};

export const SeoEditor = ({
  seo,
  contentDefaults,
  onChange,
  disabled,
  siteUrl,
}: SeoEditorProps) => {
  const [keywordInput, setKeywordInput] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  // Build a merged SEO object that keeps explicit overrides
  // and falls back to content defaults for display
  const seoData = seo || {};

  const defaults = useMemo(
    () => ({
      metaTitle: contentDefaults.title,
      metaDescription: contentDefaults.description,
      openGraphTitle: contentDefaults.title,
      openGraphDescription: contentDefaults.description,
      openGraphImageUrl: contentDefaults.coverImageUrl || "",
      robots: DEFAULT_ROBOTS,
      canonicalUrl: "",
    }),
    [contentDefaults]
  );

  // Compute effective values for previews
  const effectiveTitle = effective(seoData.metaTitle, defaults.metaTitle);
  const effectiveDescription = effective(seoData.metaDescription, defaults.metaDescription);
  const effectiveOgTitle = effective(seoData.openGraphTitle, defaults.openGraphTitle);
  const effectiveOgDescription = effective(
    seoData.openGraphDescription,
    defaults.openGraphDescription
  );
  const effectiveOgImage = effective(seoData.openGraphImageUrl, defaults.openGraphImageUrl);
  const effectiveRobots = effective(seoData.robots, defaults.robots);
  const effectiveCanonical = effective(seoData.canonicalUrl, defaults.canonicalUrl);

  // Build the page URL for previews from siteUrl + slug
  const resolvedSiteUrl = siteUrl || (typeof window !== "undefined" ? window.location.origin : "");
  const baseUrl = resolvedSiteUrl.replace(/\/+$/, "");
  const pageUrl =
    effectiveCanonical ||
    (baseUrl && contentDefaults.slug ? `${baseUrl}/${contentDefaults.slug}` : baseUrl);

  const keywords = seoData.keywords || [];

  /**
   * Persist only the fields that differ from defaults.
   * If everything matches defaults, persist null.
   */
  const persistChange = useCallback(
    (patch: Partial<SeoMetadataDto>) => {
      const next: SeoMetadataDto = { ...seoData, ...patch };

      // Helper: clear field if it matches default
      const clean = (key: keyof SeoMetadataDto, defaultVal: string) => {
        const v = next[key];
        if (typeof v === "string" && v === defaultVal) {
          next[key] = null as never;
        }
      };

      clean("metaTitle", defaults.metaTitle);
      clean("metaDescription", defaults.metaDescription);
      clean("canonicalUrl", defaults.canonicalUrl);
      clean("openGraphTitle", defaults.openGraphTitle);
      clean("openGraphDescription", defaults.openGraphDescription);
      clean("openGraphImageUrl", defaults.openGraphImageUrl);
      clean("robots", defaults.robots);

      // Check if anything is actually set
      const hasValue =
        next.metaTitle ||
        next.metaDescription ||
        next.canonicalUrl ||
        next.openGraphTitle ||
        next.openGraphDescription ||
        next.openGraphImageUrl ||
        next.robots ||
        (next.keywords && next.keywords.length > 0);

      onChange(hasValue ? next : null);
    },
    [seoData, defaults, onChange]
  );

  const handleFieldChange = useCallback(
    (field: keyof SeoMetadataDto, value: string) => {
      persistChange({ [field]: value || null });
    },
    [persistChange]
  );

  const handleReset = useCallback(
    (field: keyof SeoMetadataDto) => {
      persistChange({ [field]: null });
    },
    [persistChange]
  );

  const handleKeywordsChange = useCallback(
    (_: unknown, value: string[]) => {
      persistChange({
        keywords: value.length > 0 ? value : null,
      });
    },
    [persistChange]
  );

  const fieldAdornment = (field: keyof SeoMetadataDto, defaultVal: string) => {
    const overridden = isOverridden(seoData[field] as string, defaultVal);
    if (!overridden) return null;
    return (
      <Tooltip title="Reset to default">
        <IconButton size="small" onClick={() => handleReset(field)} disabled={disabled}>
          <RotateCcw size={16} />
        </IconButton>
      </Tooltip>
    );
  };

  const overrideHint = (field: keyof SeoMetadataDto, defaultVal: string) => {
    const overridden = isOverridden(seoData[field] as string, defaultVal);
    if (overridden) {
      return (
        <Typography variant="caption" color="warning.main" sx={{ mt: 0.25 }}>
          Overridden — click reset to use default
        </Typography>
      );
    }
    if (defaultVal) {
      return (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
          Using default from content
        </Typography>
      );
    }
    return null;
  };

  const hasAdvancedOverrides =
    isOverridden(seoData.canonicalUrl, "") ||
    isOverridden(seoData.robots, defaults.robots) ||
    (seoData.keywords && seoData.keywords.length > 0) ||
    isOverridden(seoData.openGraphTitle, defaults.openGraphTitle) ||
    isOverridden(seoData.openGraphDescription, defaults.openGraphDescription) ||
    isOverridden(seoData.openGraphImageUrl, defaults.openGraphImageUrl);

  // Auto-expand when overrides exist (e.g. after data loads)
  useEffect(() => {
    if (hasAdvancedOverrides) {
      setAdvancedExpanded(true);
    }
  }, [hasAdvancedOverrides]);

  return (
    <Box sx={{ pt: 2 }}>
      <Grid container spacing={4}>
        {/* Form fields */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
            <Box>
              <TextField
                fullWidth
                label="Meta Title"
                value={effective(seoData.metaTitle, defaults.metaTitle)}
                onChange={(e) => handleFieldChange("metaTitle", e.target.value)}
                disabled={disabled}
                placeholder={defaults.metaTitle}
                slotProps={{
                  input: {
                    endAdornment: fieldAdornment("metaTitle", defaults.metaTitle),
                  },
                }}
                helperText={`${effectiveTitle.length}/60 characters`}
              />
              {overrideHint("metaTitle", defaults.metaTitle)}
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Meta Description"
                value={effective(seoData.metaDescription, defaults.metaDescription)}
                onChange={(e) => handleFieldChange("metaDescription", e.target.value)}
                disabled={disabled}
                placeholder={defaults.metaDescription}
                multiline
                minRows={2}
                maxRows={4}
                slotProps={{
                  input: {
                    endAdornment: fieldAdornment("metaDescription", defaults.metaDescription),
                  },
                }}
                helperText={`${effectiveDescription.length}/160 characters`}
              />
              {overrideHint("metaDescription", defaults.metaDescription)}
            </Box>

            {/* Advanced Settings */}
            <Accordion
              expanded={advancedExpanded}
              onChange={(_, isExpanded) => setAdvancedExpanded(isExpanded)}
              disableGutters
              sx={{
                boxShadow: "none",
                border: "1px solid",
                borderColor: "divider",
                "&::before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                <Typography variant="body2" fontWeight={500}>
                  Advanced Settings
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={3}>
                  <Box>
                    <TextField
                      fullWidth
                      label="Canonical URL"
                      value={seoData.canonicalUrl || ""}
                      onChange={(e) => handleFieldChange("canonicalUrl", e.target.value)}
                      disabled={disabled}
                      placeholder="Leave empty to use page URL"
                      size="small"
                      slotProps={{
                        input: {
                          endAdornment: fieldAdornment("canonicalUrl", ""),
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <FormControl fullWidth size="small">
                      <InputLabel>Robots</InputLabel>
                      <Select
                        value={effectiveRobots}
                        label="Robots"
                        onChange={(e) => handleFieldChange("robots", e.target.value)}
                        disabled={disabled}
                        endAdornment={fieldAdornment("robots", defaults.robots)}
                      >
                        {ROBOTS_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {overrideHint("robots", defaults.robots)}
                  </Box>

                  <Box>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={keywords}
                      onChange={handleKeywordsChange}
                      inputValue={keywordInput}
                      onInputChange={(_, v) => setKeywordInput(v)}
                      disabled={disabled}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const { key, ...rest } = getTagProps({
                            index,
                          });
                          return <Chip key={key} label={option} size="small" {...rest} />;
                        })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Keywords"
                          placeholder="Type and press Enter"
                          size="small"
                        />
                      )}
                    />
                  </Box>

                  <Typography variant="body2" fontWeight={500} sx={{ pt: 1 }}>
                    Social Sharing Overrides
                  </Typography>

                  <Box>
                    <TextField
                      fullWidth
                      label="OG Title"
                      value={effective(seoData.openGraphTitle, defaults.openGraphTitle)}
                      onChange={(e) => handleFieldChange("openGraphTitle", e.target.value)}
                      disabled={disabled}
                      placeholder={defaults.openGraphTitle}
                      size="small"
                      slotProps={{
                        input: {
                          endAdornment: fieldAdornment("openGraphTitle", defaults.openGraphTitle),
                        },
                      }}
                    />
                    {overrideHint("openGraphTitle", defaults.openGraphTitle)}
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      label="OG Description"
                      value={effective(seoData.openGraphDescription, defaults.openGraphDescription)}
                      onChange={(e) => handleFieldChange("openGraphDescription", e.target.value)}
                      disabled={disabled}
                      placeholder={defaults.openGraphDescription}
                      size="small"
                      multiline
                      minRows={2}
                      maxRows={3}
                      slotProps={{
                        input: {
                          endAdornment: fieldAdornment(
                            "openGraphDescription",
                            defaults.openGraphDescription
                          ),
                        },
                      }}
                    />
                    {overrideHint("openGraphDescription", defaults.openGraphDescription)}
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      label="OG Image URL"
                      value={effective(seoData.openGraphImageUrl, defaults.openGraphImageUrl)}
                      onChange={(e) => handleFieldChange("openGraphImageUrl", e.target.value)}
                      disabled={disabled}
                      placeholder={defaults.openGraphImageUrl || "No cover image set"}
                      size="small"
                      slotProps={{
                        input: {
                          endAdornment: fieldAdornment(
                            "openGraphImageUrl",
                            defaults.openGraphImageUrl
                          ),
                        },
                      }}
                    />
                    {overrideHint("openGraphImageUrl", defaults.openGraphImageUrl)}
                    <Button
                      size="small"
                      startIcon={<Image size={16} />}
                      onClick={() => setImageDialogOpen(true)}
                      disabled={disabled}
                      sx={{ mt: 0.5 }}
                    >
                      Select from Media Library
                    </Button>
                    <ImageSelectionDialog
                      open={imageDialogOpen}
                      onClose={() => setImageDialogOpen(false)}
                      onSelect={(url: string) => {
                        handleFieldChange("openGraphImageUrl", url);
                        setImageDialogOpen(false);
                      }}
                    />
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Grid>

        {/* Previews — sticky sidebar */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3} sx={{ position: "sticky", top: 24 }}>
            <SearchEnginePreview
              title={effectiveTitle}
              description={effectiveDescription}
              url={pageUrl}
              siteUrl={siteUrl}
            />
            <OpenGraphPreview
              title={effectiveOgTitle}
              description={effectiveOgDescription}
              imageUrl={effectiveOgImage ? buildAbsoluteUrl(effectiveOgImage) : null}
              url={pageUrl}
              siteUrl={siteUrl}
            />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};
