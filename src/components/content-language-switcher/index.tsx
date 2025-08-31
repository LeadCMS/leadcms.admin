import { useState, useEffect } from "react";
import {
  Box,
  Chip,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
} from "@mui/material";
import { Add, Translate, ExpandMore, Link } from "@mui/icons-material";
import { ContentDetailsDto, LanguageDto } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { useConfig } from "@providers/config-provider";
import { LinkTranslationDialog } from "@components/link-translation-dialog";

interface ContentLanguageSwitcherProps {
  contentId: number;
  currentLanguage: string;
  onLanguageChange: (language: string, translationId?: number) => void;
  onCreateTranslation: (language: string) => void;
  compact?: boolean; // Add compact mode prop
  // Translation mode props
  sourceContentId?: number; // When in translation mode, the original content's ID
  isTranslationMode?: boolean; // Whether we're in translation mode
}

interface LanguageWithStatus extends LanguageDto {
  hasTranslation: boolean;
  isCurrent: boolean;
}

export const ContentLanguageSwitcher = ({
  contentId,
  currentLanguage,
  onLanguageChange,
  onCreateTranslation,
  compact = false,
  sourceContentId,
  isTranslationMode = false,
}: ContentLanguageSwitcherProps) => {
  const [translations, setTranslations] = useState<ContentDetailsDto[]>([]);
  const [sourceTranslations, setSourceTranslations] = useState<ContentDetailsDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkingLoading, setLinkingLoading] = useState(false);
  const [linkingError, setLinkingError] = useState<string | null>(null);
  const { client } = useRequestContext();
  const { config } = useConfig();

  const supportedLanguages = config?.languages || [];
  const isMenuOpen = Boolean(anchorEl);

  useEffect(() => {
    if (contentId) {
      loadTranslations();
    }
    if (isTranslationMode && sourceContentId) {
      loadSourceTranslations();
    }
  }, [contentId, isTranslationMode, sourceContentId]);

  const loadTranslations = async () => {
    if (!contentId) return; // Don't load if contentId is 0 or falsy

    try {
      setLoading(true);
      const response = await client.api.contentTranslationsList(contentId);
      setTranslations(response.data || []);
    } catch (error) {
      console.error("Failed to load translations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSourceTranslations = async () => {
    if (!sourceContentId) return;

    try {
      const response = await client.api.contentTranslationsList(sourceContentId);
      setSourceTranslations(response.data || []);
    } catch (error) {
      console.error("Failed to load source translations:", error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    console.log("ContentLanguageSwitcher: Menu opened");
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (language: string) => {
    const translation = translations.find((t) => t.language === language);
    if (translation) {
      onLanguageChange(language, translation.id);
    } else {
      onCreateTranslation(language);
    }
    handleMenuClose();
  };

  const getCurrentLanguageLabel = () => {
    const currentLangConfig = supportedLanguages.find(
      (lang: LanguageDto) => lang.code === currentLanguage
    );
    return currentLangConfig?.name || currentLanguage?.toUpperCase() || "Unknown";
  };

  const handleLinkTranslation = async (linkedContent: ContentDetailsDto) => {
    try {
      setLinkingLoading(true);
      setLinkingError(null);

      const currentContentResponse = await client.api.contentDetail(contentId);
      const currentContent = currentContentResponse.data;

      let translationKey: string;

      // Check if either content has a translationKey
      if (currentContent.translationKey) {
        translationKey = currentContent.translationKey;
        // Update the linked content with the existing translationKey
        if (linkedContent.id) {
          await client.api.contentPartialUpdate(linkedContent.id, {
            translationKey: translationKey,
          });
        }
      } else if (linkedContent.translationKey) {
        translationKey = linkedContent.translationKey;
        // Update the current content with the linked content's translationKey
        await client.api.contentPartialUpdate(contentId, {
          translationKey: translationKey,
        });
      } else {
        // Neither has a translationKey, create a new draft translation to get one
        if (linkedContent.language) {
          const draftResponse = await client.api.contentTranslationDraftDetail(
            contentId,
            linkedContent.language,
            { transformer: "EmptyCopy" }
          );
          if (draftResponse.data.translationKey) {
            translationKey = draftResponse.data.translationKey;

            // Update the linked content with the new translationKey
            if (linkedContent.id) {
              await client.api.contentPartialUpdate(linkedContent.id, {
                translationKey: translationKey,
              });
            }
          }
        }
      }

      // Reload translations to reflect the changes
      await loadTranslations();
      setLinkDialogOpen(false);
    } catch (error) {
      console.error("Failed to link translation:", error);
      setLinkingError("Failed to link translation. Please try again.");
    } finally {
      setLinkingLoading(false);
    }
  };

  const handleLinkDialogOpen = () => {
    console.log("ContentLanguageSwitcher: Link Translation clicked");
    setLinkDialogOpen(true);
    setLinkingError(null);
    handleMenuClose();
  };

  const getAvailableLanguages = (): LanguageWithStatus[] => {
    // In translation mode, use source content's translations
    const translationsToUse = isTranslationMode ? sourceTranslations : translations;

    return supportedLanguages.map((lang: LanguageDto) => {
      const hasTranslation = translationsToUse.some((t) => t.language === lang.code);
      const isCurrent = lang.code === currentLanguage;

      // In translation mode, if current language is being created, mark it as having translation
      const hasTranslationOrIsCurrent = hasTranslation || (isTranslationMode && isCurrent);

      return {
        ...lang,
        hasTranslation: hasTranslationOrIsCurrent,
        isCurrent,
      };
    });
  };

  // Show component if we have contentId OR if we're in translation mode
  if (!contentId && !isTranslationMode) {
    console.log("ContentLanguageSwitcher: Hidden - no contentId and not in translation mode", {
      contentId,
      isTranslationMode,
    });
    return null;
  }

  // Hide component if there's only one language
  if (supportedLanguages.length <= 1) {
    console.log("ContentLanguageSwitcher: Hidden - only one language", {
      supportedLanguagesLength: supportedLanguages.length,
    });
    return null;
  }

  // Compact mode for top-left corner
  if (compact) {
    return (
      <>
        <Tooltip title="Switch language or add translation">
          <Chip
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Translate sx={{ fontSize: 14 }} />
                {getCurrentLanguageLabel()}
                {loading ? (
                  <CircularProgress size={10} />
                ) : (
                  <ExpandMore sx={{ fontSize: "0.875rem" }} />
                )}
              </Box>
            }
            size="small"
            variant="outlined"
            onClick={handleMenuOpen}
            sx={{
              cursor: "pointer",
              fontSize: "0.75rem",
              height: 24,
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          />
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              EXISTING TRANSLATIONS
            </Typography>
          </Box>

          {getAvailableLanguages()
            .filter((lang: LanguageWithStatus) => lang.hasTranslation)
            .map((lang: LanguageWithStatus) => (
              <MenuItem
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code || "")}
                selected={lang.isCurrent}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography variant="body2">{lang.name}</Typography>
                {lang.isCurrent && (
                  <Chip label="Current" size="small" color="primary" variant="filled" />
                )}
              </MenuItem>
            ))}

          {getAvailableLanguages().some(
            (lang: LanguageWithStatus) => !lang.hasTranslation && !lang.isCurrent
          ) && (
            <>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                  ADD TRANSLATION
                </Typography>
              </Box>

              {getAvailableLanguages()
                .filter((lang: LanguageWithStatus) => !lang.hasTranslation && !lang.isCurrent)
                .map((lang: LanguageWithStatus) => (
                  <MenuItem
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code || "")}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Add sx={{ fontSize: "1rem", color: "success.main" }} />
                    <Typography variant="body2">{lang.name}</Typography>
                  </MenuItem>
                ))}
            </>
          )}

          {/* Link Translation Option for Compact Mode */}
          <Divider sx={{ my: 1 }} />
          <MenuItem
            onClick={handleLinkDialogOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Link sx={{ fontSize: "1rem", color: "info.main" }} />
            <Typography variant="body2">Link Translation</Typography>
          </MenuItem>
        </Menu>

        {/* Link Translation Dialog */}
        <LinkTranslationDialog
          open={linkDialogOpen}
          onClose={() => setLinkDialogOpen(false)}
          onLink={handleLinkTranslation}
          currentContentId={contentId}
          currentLanguage={currentLanguage}
          isLoading={linkingLoading}
          error={linkingError}
        />
      </>
    );
  }

  // Full mode
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Translate sx={{ fontSize: 16, color: "text.secondary" }} />
      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
        Language:
      </Typography>

      <Tooltip title="Switch language or add translation">
        <Chip
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {getCurrentLanguageLabel()}
              {loading ? <CircularProgress size={12} /> : <ExpandMore sx={{ fontSize: "1rem" }} />}
            </Box>
          }
          size="small"
          variant="outlined"
          onClick={handleMenuOpen}
          sx={{
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        />
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
            EXISTING TRANSLATIONS
          </Typography>
        </Box>

        {getAvailableLanguages()
          .filter((lang: LanguageWithStatus) => lang.hasTranslation)
          .map((lang: LanguageWithStatus) => (
            <MenuItem
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code || "")}
              selected={lang.isCurrent}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography variant="body2">{lang.name}</Typography>
              {lang.isCurrent && (
                <Chip label="Current" size="small" color="primary" variant="filled" />
              )}
            </MenuItem>
          ))}

        {getAvailableLanguages().some(
          (lang: LanguageWithStatus) => !lang.hasTranslation && !lang.isCurrent
        ) && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                ADD TRANSLATION
              </Typography>
            </Box>

            {getAvailableLanguages()
              .filter((lang: LanguageWithStatus) => !lang.hasTranslation && !lang.isCurrent)
              .map((lang: LanguageWithStatus) => (
                <MenuItem
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code || "")}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Add sx={{ fontSize: "1rem", color: "success.main" }} />
                  <Typography variant="body2">{lang.name}</Typography>
                </MenuItem>
              ))}
          </>
        )}

        {/* Link Translation Option */}
        <Divider sx={{ my: 1 }} />
        <MenuItem
          onClick={handleLinkDialogOpen}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Link sx={{ fontSize: "1rem", color: "info.main" }} />
          <Typography variant="body2">Link Translation</Typography>
        </MenuItem>
      </Menu>

      {/* Link Translation Dialog */}
      <LinkTranslationDialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onLink={handleLinkTranslation}
        currentContentId={contentId}
        currentLanguage={currentLanguage}
        isLoading={linkingLoading}
        error={linkingError}
      />
    </Box>
  );
};

export default ContentLanguageSwitcher;

// Component for displaying language chips in collapsed mode
export const LanguageHighlights = ({
  contentId,
  currentLanguage,
  onLanguageChange,
  onCreateTranslation,
  sourceContentId,
  isTranslationMode = false,
}: ContentLanguageSwitcherProps) => {
  const [translations, setTranslations] = useState<ContentDetailsDto[]>([]);
  const [sourceTranslations, setSourceTranslations] = useState<ContentDetailsDto[]>([]);
  const [loading, setLoading] = useState(false);
  const { client } = useRequestContext();
  const { config } = useConfig();

  const supportedLanguages = config?.languages || [];

  useEffect(() => {
    if (contentId) {
      loadTranslations();
    }
    if (isTranslationMode && sourceContentId) {
      loadSourceTranslations();
    }
  }, [contentId, isTranslationMode, sourceContentId]);

  const loadTranslations = async () => {
    if (!contentId) return; // Don't load if contentId is 0 or falsy

    try {
      setLoading(true);
      const response = await client.api.contentTranslationsList(contentId);
      setTranslations(response.data || []);
    } catch (error) {
      console.error("Failed to load translations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSourceTranslations = async () => {
    if (!sourceContentId) return;

    try {
      const response = await client.api.contentTranslationsList(sourceContentId);
      setSourceTranslations(response.data || []);
    } catch (error) {
      console.error("Failed to load source translations:", error);
    }
  };

  const handleLanguageClick = (language: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event bubbling to parent
    const translation = translations.find((t) => t.language === language);
    if (translation) {
      onLanguageChange(language, translation.id);
    } else {
      onCreateTranslation(language);
    }
  };

  const getAvailableLanguages = (): LanguageWithStatus[] => {
    // In translation mode, use source content's translations
    const translationsToUse = isTranslationMode ? sourceTranslations : translations;

    return supportedLanguages.map((lang: LanguageDto) => {
      const hasTranslation = translationsToUse.some((t) => t.language === lang.code);
      const isCurrent = lang.code === currentLanguage;

      // In translation mode, if current language is being created, mark it as having translation
      const hasTranslationOrIsCurrent = hasTranslation || (isTranslationMode && isCurrent);

      return {
        ...lang,
        hasTranslation: hasTranslationOrIsCurrent,
        isCurrent,
      };
    });
  };

  // Show component if we have contentId OR if we're in translation mode, and not loading
  if ((!contentId && !isTranslationMode) || loading) {
    return null;
  }

  const languages = getAvailableLanguages();
  const existingLanguages = languages.filter((lang) => lang.hasTranslation);
  const missingLanguages = languages.filter((lang) => !lang.hasTranslation && !lang.isCurrent);

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
      {/* Existing translations */}
      {existingLanguages.map((lang) => (
        <Tooltip key={lang.code} title={`Switch to ${lang.name}`}>
          <Chip
            label={lang.name}
            size="small"
            variant={lang.isCurrent ? "filled" : "outlined"}
            color={lang.isCurrent ? "primary" : "default"}
            onClick={(event) => handleLanguageClick(lang.code || "", event)}
            sx={{
              cursor: "pointer",
              fontSize: "0.6875rem",
              height: 20,
              "&:hover": {
                backgroundColor: lang.isCurrent ? "primary.dark" : "action.hover",
              },
            }}
          />
        </Tooltip>
      ))}

      {/* Missing translations with + icon */}
      {missingLanguages.map((lang) => (
        <Tooltip key={lang.code} title={`Add ${lang.name} translation`}>
          <Chip
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                <Add sx={{ fontSize: "0.75rem" }} />
                {lang.name}
              </Box>
            }
            size="small"
            variant="outlined"
            onClick={(event) => handleLanguageClick(lang.code || "", event)}
            sx={{
              cursor: "pointer",
              fontSize: "0.6875rem",
              height: 20,
              borderStyle: "dashed",
              color: "success.main",
              borderColor: "success.main",
              "&:hover": {
                backgroundColor: "success.main",
                color: "success.contrastText",
              },
            }}
          />
        </Tooltip>
      ))}
    </Box>
  );
};
