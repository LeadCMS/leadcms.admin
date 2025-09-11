import { Box, Chip, Tooltip } from "@mui/material";
import { Add, Language } from "@mui/icons-material";
import { ContentDetailsDto, LanguageDto } from "@lib/network/swagger-client";
import { useConfig } from "@providers/config-provider";
import { useNavigate } from "react-router-dom";

interface ContentLanguageBadgesProps {
  content: ContentDetailsDto;
  compact?: boolean;
  shape?: "pill" | "square";
}

export const ContentLanguageBadges = ({
  content,
  compact = false,
  shape = "pill",
}: ContentLanguageBadgesProps) => {
  const { config } = useConfig();
  const navigate = useNavigate();

  const supportedLanguages = config?.languages || [];

  // Don't show if there's only one language supported
  if (supportedLanguages.length <= 1) {
    return null;
  }

  const currentLanguage = content.language;
  const translations = content.translations || {};

  // Get language name from code
  const getLanguageName = (code: string): string => {
    const lang = supportedLanguages.find((l: LanguageDto) => l.code === code);
    return lang?.name || code.toUpperCase();
  };

  // Handle language click - navigate to edit page for specific language
  const handleLanguageClick = (languageCode: string) => {
    if (!content.id) return;

    const translationId = translations[languageCode];

    if (translationId) {
      // Translation exists, navigate to edit it
      navigate(`/content/${translationId}/edit`);
    } else {
      // Translation doesn't exist, navigate to create it
      navigate(`/content/${content.id}/translate/${languageCode}`);
    }
  };

  // Get all languages with their status
  const getLanguageStatus = () => {
    return supportedLanguages.map((lang: LanguageDto) => {
      const isCurrent = lang.code === currentLanguage;
      const hasTranslation = translations[lang.code || ""] !== undefined;
      const translationExists = translations[lang.code || ""] !== null;

      return {
        ...lang,
        isCurrent,
        hasTranslation,
        translationExists,
      };
    });
  };

  const languageStatuses = getLanguageStatus();
  const existingLanguages = languageStatuses.filter(
    (lang) => lang.translationExists || lang.isCurrent
  );
  const missingLanguages = languageStatuses.filter(
    (lang) => !lang.translationExists && !lang.isCurrent
  );

  const isSquare = shape === "square";

  if (compact) {
    // Compact view - show all language chips
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
        {/* Show existing languages */}
        {existingLanguages.map((lang) => (
          <Tooltip
            key={lang.code}
            title={lang.isCurrent ? `Current: ${lang.name}` : `Edit ${lang.name} translation`}
          >
            <Chip
              label={lang.code?.toUpperCase()}
              size="small"
              variant={lang.isCurrent ? "filled" : "outlined"}
              color={lang.isCurrent ? "primary" : "default"}
              onClick={() => handleLanguageClick(lang.code || "")}
              sx={{
                fontSize: "0.65rem",
                height: 20,
                borderRadius: isSquare ? 1 : undefined,
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: lang.isCurrent ? "primary.dark" : "action.hover",
                },
              }}
            />
          </Tooltip>
        ))}

        {/* Show individual missing language chips */}
        {missingLanguages.map((lang) => (
          <Tooltip key={lang.code} title={`Add ${lang.name} translation`}>
            <Chip
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                  <Add sx={{ fontSize: "0.6rem" }} />
                  {lang.code?.toUpperCase()}
                </Box>
              }
              size="small"
              variant="outlined"
              color="success"
              onClick={() => handleLanguageClick(lang.code || "")}
              sx={{
                fontSize: "0.65rem",
                height: 20,
                borderRadius: isSquare ? 1 : undefined,
                cursor: "pointer",
                opacity: 0.8,
                "&:hover": {
                  opacity: 1,
                  backgroundColor: "success.50",
                },
              }}
            />
          </Tooltip>
        ))}
      </Box>
    );
  }

  // Full view - show all languages
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
      <Language sx={{ fontSize: 16, color: "text.secondary", mr: 0.5 }} />

      {/* Existing translations */}
      {existingLanguages.map((lang) => (
        <Tooltip
          key={lang.code}
          title={lang.isCurrent ? `Current: ${lang.name}` : `Edit ${lang.name} translation`}
        >
          <Chip
            label={getLanguageName(lang.code || "")}
            size="small"
            variant={lang.isCurrent ? "filled" : "outlined"}
            color={lang.isCurrent ? "primary" : "default"}
            onClick={() => handleLanguageClick(lang.code || "")}
            sx={{
              borderRadius: isSquare ? 1 : undefined,
              cursor: "pointer",
              "&:hover": {
                backgroundColor: lang.isCurrent ? "primary.dark" : "action.hover",
              },
            }}
          />
        </Tooltip>
      ))}

      {/* Missing translations */}
      {missingLanguages.map((lang) => (
        <Tooltip key={lang.code} title={`Add ${lang.name} translation`}>
          <Chip
            icon={<Add sx={{ fontSize: "1rem !important" }} />}
            label={getLanguageName(lang.code || "")}
            size="small"
            variant="outlined"
            color="success"
            onClick={() => handleLanguageClick(lang.code || "")}
            sx={{
              borderRadius: isSquare ? 1 : undefined,
              cursor: "pointer",
              opacity: 0.7,
              "&:hover": {
                opacity: 1,
                backgroundColor: "success.50",
              },
            }}
          />
        </Tooltip>
      ))}
    </Box>
  );
};

export default ContentLanguageBadges;
