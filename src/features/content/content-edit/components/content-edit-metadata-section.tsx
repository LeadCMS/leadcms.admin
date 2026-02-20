import { Box, Grid, TextField, Typography, IconButton, Collapse, Alert } from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ContentTypeDropdown } from "@features/content/content-types";
import { LanguageHighlights } from "@components/content-language-switcher";
import ContentLanguageSwitcher from "@components/content-language-switcher";
import { ContentTypeDetailsDto, ContentDetailsDto } from "@lib/network/swagger-client";
import { useConfig } from "@providers/config-provider";
import {
  getContentLengthSettings,
  validateTitleLength,
  validateDescriptionLength,
} from "@utils/content-validation-helper";

export interface ContentEditMetadataSectionProps {
  // Form values
  title: string;
  description: string;
  type: string;
  language: string;
  // Form handlers
  onTitleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: (type: string) => void;
  // Content types
  contentTypes: ContentTypeDetailsDto[];
  onReloadContentTypes: () => void;
  // Form errors
  formErrors: {
    title?: string;
    description?: string;
    type?: string;
  };
  formTouched: {
    title?: boolean;
    description?: boolean;
    type?: boolean;
  };
  onBlur: (field: string) => void;
  onSetFieldError: (field: string, error: string | undefined) => void;
  // UI state
  isMetadataCollapsed: boolean;
  onToggleCollapsed: (collapsed: boolean) => void;
  // Translation/language features
  hasMultipleLanguages: boolean;
  contentId?: number;
  sourceContentId?: number;
  isTranslationMode: boolean;
  onLanguageChange?: (language: string, translationId?: number) => void;
  onCreateTranslation?: (targetLanguage: string) => void;
  preloadedTranslations?: ContentDetailsDto[];
  preloadedSourceTranslations?: ContentDetailsDto[];
  // Display helpers
  getContentTypeDisplayName: () => string;
  /** Slug used as default search text in Link Translation dialog */
  slug?: string;
}

export const ContentEditMetadataSection = ({
  title,
  description,
  type,
  language,
  onTitleChange,
  onDescriptionChange,
  onTypeChange,
  contentTypes,
  onReloadContentTypes,
  formErrors,
  formTouched,
  onBlur,
  onSetFieldError,
  isMetadataCollapsed,
  onToggleCollapsed,
  hasMultipleLanguages,
  contentId,
  sourceContentId,
  isTranslationMode,
  onLanguageChange,
  onCreateTranslation,
  preloadedTranslations,
  preloadedSourceTranslations,
  getContentTypeDisplayName,
  slug,
}: ContentEditMetadataSectionProps) => {
  const { config } = useConfig();
  const lengthSettings = getContentLengthSettings(config);

  // Validation info helpers
  const getTitleValidationInfo = () => {
    const titleTouched = formTouched.title;
    const titleErrors = formErrors.title;
    const titleValidationResult = validateTitleLength(title, getContentLengthSettings(config));

    // Show character count when no errors, detailed errors when there are issues
    let helperText = undefined;
    if (titleTouched && (titleValidationResult || titleErrors)) {
      // Show detailed error message with current length
      helperText = titleValidationResult || titleErrors;
    } else if (lengthSettings) {
      // Show character counter when no errors
      helperText = `${title.length}/${lengthSettings.maxTitleLength} characters`;
    }

    return {
      hasError: titleTouched && !!(titleValidationResult || titleErrors),
      helperText,
    };
  };

  const getDescriptionValidationInfo = () => {
    const descriptionTouched = formTouched.description;
    const descriptionErrors = formErrors.description;
    const descriptionValidationResult = validateDescriptionLength(
      description,
      getContentLengthSettings(config)
    );

    // Show character count when no errors, detailed errors when there are issues
    let helperText = undefined;
    if (descriptionTouched && (descriptionValidationResult || descriptionErrors)) {
      // Show detailed error message with current length
      helperText = descriptionValidationResult || descriptionErrors;
    } else if (lengthSettings) {
      // Show character counter when no errors
      helperText = `${description.length}/${lengthSettings.maxDescriptionLength} characters`;
    }

    return {
      hasError: descriptionTouched && !!(descriptionValidationResult || descriptionErrors),
      helperText,
    };
  };

  // Enhanced change handlers with real-time validation
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Update the field value first
    onTitleChange(event);

    // Perform real-time validation
    const validationError = validateTitleLength(newValue, lengthSettings);

    // Update Formik error state in real-time
    onSetFieldError("title", validationError || undefined);

    // Mark field as touched for consistent error display
    onBlur("title");
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Update the field value first
    onDescriptionChange(event);

    // Perform real-time validation
    const validationError = validateDescriptionLength(newValue, lengthSettings);

    // Update Formik error state in real-time
    onSetFieldError("description", validationError || undefined);

    // Mark field as touched for consistent error display
    onBlur("description");
  };

  const showLengthSettingsWarning =
    !lengthSettings && config && !config.settings?.["Content.MinTitleLength"];
  return (
    <Box sx={{ mb: 2 }}>
      {/* Collapsed Header */}
      {isMetadataCollapsed && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "grey.50",
            cursor: "pointer",
          }}
          onClick={() => onToggleCollapsed(false)}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              minWidth: 0,
              flex: 1,
            }}
          >
            {/* Title, Description and Content Type on the same line */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                minWidth: 0,
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {title || "Untitled"}
                  {description && (
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 400,
                        ml: 1,
                      }}
                    >
                      - {description}
                    </Typography>
                  )}
                </Typography>
              </Box>

              {/* Content Type badge on the right */}
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  borderRadius: 2,
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  flexShrink: 0,
                }}
              >
                {getContentTypeDisplayName()}
              </Box>
            </Box>

            {/* Language Highlights on the second line */}
            {hasMultipleLanguages && contentId && onLanguageChange && onCreateTranslation && (
              <LanguageHighlights
                contentId={contentId}
                currentLanguage={language || ""}
                onLanguageChange={onLanguageChange}
                onCreateTranslation={onCreateTranslation}
                sourceContentId={sourceContentId}
                isTranslationMode={isTranslationMode}
                preloadedTranslations={preloadedTranslations}
                preloadedSourceTranslations={preloadedSourceTranslations}
                linkTranslationSearchText={slug}
              />
            )}
          </Box>
          <IconButton size="small">
            <ChevronDown size={20} />
          </IconButton>
        </Box>
      )}

      {/* Expanded Header */}
      {!isMetadataCollapsed && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          {/* Left side: Compact Language Switcher */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {hasMultipleLanguages && contentId && onLanguageChange && onCreateTranslation && (
              <ContentLanguageSwitcher
                contentId={contentId}
                currentLanguage={language || ""}
                onLanguageChange={onLanguageChange}
                onCreateTranslation={onCreateTranslation}
                compact={true}
                sourceContentId={sourceContentId}
                isTranslationMode={isTranslationMode}
                preloadedTranslations={preloadedTranslations}
                preloadedSourceTranslations={preloadedSourceTranslations}
                linkTranslationSearchText={slug}
              />
            )}
          </Box>

          {/* Right side: Collapse button */}
          <IconButton
            size="small"
            onClick={() => onToggleCollapsed(true)}
            sx={{ color: "text.secondary" }}
          >
            <ChevronUp size={20} />
          </IconButton>
        </Box>
      )}

      {/* Collapsible Content */}
      <Collapse in={!isMetadataCollapsed}>
        {showLengthSettingsWarning && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Content length validation is not configured.</strong>
              <br />
              Go to Settings → Content tab to configure title and description length requirements.
            </Typography>
          </Alert>
        )}

        <Grid container spacing={2} alignItems="flex-start">
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              label="Title"
              name="title"
              value={title}
              onChange={handleTitleChange}
              onBlur={() => onBlur("title")}
              error={getTitleValidationInfo().hasError}
              helperText={getTitleValidationInfo().helperText}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <ContentTypeDropdown
              value={type}
              options={contentTypes}
              onChange={onTypeChange}
              onAddNewType={onReloadContentTypes}
              error={formTouched.type && Boolean(formErrors.type)}
              helperText={formTouched.type && formErrors.type}
              onBlur={() => onBlur("type")}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 12 }}>
            <TextField
              label="Description"
              name="description"
              value={description}
              onChange={handleDescriptionChange}
              onBlur={() => onBlur("description")}
              error={getDescriptionValidationInfo().hasError}
              helperText={getDescriptionValidationInfo().helperText}
              multiline
              minRows={3}
              fullWidth
            />
          </Grid>
        </Grid>
      </Collapse>
    </Box>
  );
};
