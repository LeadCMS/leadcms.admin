import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import {
  Plus as Add,
  Languages as Translate,
  ChevronDown as ExpandMore,
  Link
} from 'lucide-react';
import { ContentDetailsDto, LanguageDto } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { useConfig } from "@providers/config-provider";
import {
  LinkTranslationDialog,
  LinkableContentType,
  LinkableItem,
} from "@components/link-translation-dialog";

interface ContentLanguageSwitcherProps {
  contentId: number;
  currentLanguage: string;
  onLanguageChange: (language: string, translationId?: number) => void;
  onCreateTranslation: (language: string) => void;
  compact?: boolean;
  sourceContentId?: number;
  isTranslationMode?: boolean;
  preloadedTranslations?: ContentDetailsDto[];
  preloadedSourceTranslations?: ContentDetailsDto[];
  /** Which entity type this switcher operates on */
  contentType?: LinkableContentType;
  /** Default search text for the Link Translation dialog */
  linkTranslationSearchText?: string;
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
  preloadedTranslations,
  preloadedSourceTranslations,
  contentType = "content",
  linkTranslationSearchText = "",
}: ContentLanguageSwitcherProps) => {
  const [translations, setTranslations] = useState<ContentDetailsDto[]>(
    preloadedTranslations || []
  );
  const [sourceTranslations, setSourceTranslations] = useState<ContentDetailsDto[]>(
    preloadedSourceTranslations || []
  );
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
    // Use preloaded data if available, otherwise fetch
    if (preloadedTranslations) {
      setTranslations(preloadedTranslations);
    } else if (contentId) {
      loadTranslations();
    }

    if (preloadedSourceTranslations) {
      setSourceTranslations(preloadedSourceTranslations);
    } else if (isTranslationMode && sourceContentId) {
      loadSourceTranslations();
    }
  }, [
    contentId,
    isTranslationMode,
    sourceContentId,
    preloadedTranslations,
    preloadedSourceTranslations,
  ]);

  const loadTranslations = async () => {
    if (!contentId) return;

    try {
      setLoading(true);
      if (contentType === "emailTemplate") {
        const response = await client.api.emailTemplatesTranslationsList(contentId);
        setTranslations(response.data as never);
      } else {
        const response = await client.api.contentTranslationsList(contentId);
        setTranslations(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load translations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSourceTranslations = async () => {
    if (!sourceContentId) return;

    try {
      if (contentType === "emailTemplate") {
        const response = await client.api.emailTemplatesTranslationsList(sourceContentId);
        setSourceTranslations(response.data as never);
      } else {
        const response = await client.api.contentTranslationsList(sourceContentId);
        setSourceTranslations(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load source translations:", error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
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

  const handleLinkTranslation = async (linkedItem: LinkableItem) => {
    try {
      setLinkingLoading(true);
      setLinkingError(null);

      let translationKey: string | undefined;

      if (contentType === "emailTemplate") {
        const currentResp = await client.api.emailTemplatesDetail(contentId);
        const current = currentResp.data;

        if (current.translationKey) {
          translationKey = current.translationKey;
          if (linkedItem.id) {
            await client.api.emailTemplatesPartialUpdate(linkedItem.id, { translationKey });
          }
        } else if (linkedItem.translationKey) {
          translationKey = linkedItem.translationKey;
          await client.api.emailTemplatesPartialUpdate(contentId, { translationKey });
        } else if (linkedItem.language) {
          const draftResp = await client.api.emailTemplatesTranslationDraftDetail(
            contentId,
            linkedItem.language,
            { transformer: "EmptyCopy" }
          );
          if (draftResp.data.translationKey) {
            translationKey = draftResp.data.translationKey;
            if (linkedItem.id) {
              await client.api.emailTemplatesPartialUpdate(linkedItem.id, { translationKey });
            }
          }
        }
      } else {
        const currentResp = await client.api.contentDetail(contentId);
        const current = currentResp.data;

        if (current.translationKey) {
          translationKey = current.translationKey;
          if (linkedItem.id) {
            await client.api.contentPartialUpdate(linkedItem.id, { translationKey });
          }
        } else if (linkedItem.translationKey) {
          translationKey = linkedItem.translationKey;
          await client.api.contentPartialUpdate(contentId, {
            translationKey,
          });
        } else if (linkedItem.language) {
          const draftResp = await client.api.contentTranslationDraftDetail(
            contentId,
            linkedItem.language,
            { transformer: "EmptyCopy" }
          );
          if (draftResp.data.translationKey) {
            translationKey = draftResp.data.translationKey;
            if (linkedItem.id) {
              await client.api.contentPartialUpdate(linkedItem.id, { translationKey });
            }
          }
        }
      }

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
                <Translate size={14} />
                {getCurrentLanguageLabel()}
                {loading ? (
                  <CircularProgress size={10} />
                ) : (
                  <ExpandMore size={14} />
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
                    <Add size={14} color="success.main" />
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
            <Link size={14} color="info.main" />
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
          contentType={contentType}
          defaultSearchText={linkTranslationSearchText}
        />
      </>
    );
  }

  // Full mode
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Translate size={16} color="text.secondary" />
      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
        Language:
      </Typography>

      <Tooltip title="Switch language or add translation">
        <Chip
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {getCurrentLanguageLabel()}
              {loading ? <CircularProgress size={12} /> : <ExpandMore size={14} />}
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
                  <Add size={14} color="success.main" />
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
          <Link size={14} color="info.main" />
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
        contentType={contentType}
        defaultSearchText={linkTranslationSearchText}
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
  preloadedTranslations,
  preloadedSourceTranslations,
  contentType = "content",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  linkTranslationSearchText: _linkTranslationSearchText = "",
}: ContentLanguageSwitcherProps) => {
  const [translations, setTranslations] = useState<ContentDetailsDto[]>(
    preloadedTranslations || []
  );
  const [sourceTranslations, setSourceTranslations] = useState<ContentDetailsDto[]>(
    preloadedSourceTranslations || []
  );
  const [loading, setLoading] = useState(false);
  const { client } = useRequestContext();
  const { config } = useConfig();

  const supportedLanguages = config?.languages || [];

  useEffect(() => {
    // Use preloaded data if available, otherwise fetch
    if (preloadedTranslations) {
      setTranslations(preloadedTranslations);
    } else if (contentId) {
      loadTranslations();
    }

    if (preloadedSourceTranslations) {
      setSourceTranslations(preloadedSourceTranslations);
    } else if (isTranslationMode && sourceContentId) {
      loadSourceTranslations();
    }
  }, [
    contentId,
    isTranslationMode,
    sourceContentId,
    preloadedTranslations,
    preloadedSourceTranslations,
  ]);

  const loadTranslations = async () => {
    if (!contentId) return;

    try {
      setLoading(true);
      if (contentType === "emailTemplate") {
        const response = await client.api.emailTemplatesTranslationsList(contentId);
        setTranslations(response.data as never);
      } else {
        const response = await client.api.contentTranslationsList(contentId);
        setTranslations(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load translations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSourceTranslations = async () => {
    if (!sourceContentId) return;

    try {
      if (contentType === "emailTemplate") {
        const response = await client.api.emailTemplatesTranslationsList(sourceContentId);
        setSourceTranslations(response.data as never);
      } else {
        const response = await client.api.contentTranslationsList(sourceContentId);
        setSourceTranslations(response.data || []);
      }
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
                <Add size={12} />
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
