import { Box, Grid, TextField, Typography, IconButton, Collapse } from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ContentTypeDropdown } from "@features/content/content-types";
import { LanguageHighlights } from "@components/content-language-switcher";
import ContentLanguageSwitcher from "@components/content-language-switcher";
import { ContentTypeDetailsDto, ContentDetailsDto } from "@lib/network/swagger-client";

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
}: ContentEditMetadataSectionProps) => {
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
        <Grid container spacing={2} alignItems="flex-start">
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              label="Title"
              name="title"
              value={title}
              onChange={onTitleChange}
              error={formTouched.title && Boolean(formErrors.title)}
              helperText={formTouched.title && formErrors.title}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <ContentTypeDropdown
              value={type}
              options={[...contentTypes].sort((a, b) => a.uid.localeCompare(b.uid))}
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
              onChange={onDescriptionChange}
              error={formTouched.description && Boolean(formErrors.description)}
              helperText={formTouched.description && formErrors.description}
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
