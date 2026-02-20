import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import { Search, X, Link as LinkIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useConfig } from "@providers/config-provider";
import { useRequestContext } from "@providers/request-provider";
import { ContentDetailsDto, EmailTemplateDetailsDto } from "@lib/network/swagger-client";
import { useDebouncedCallback } from "use-debounce";

export type LinkableContentType = "content" | "emailTemplate";

/** Minimal shape shared by both content and email template DTOs */
export interface LinkableItem {
  id?: number;
  language?: string | null;
  translationKey?: string | null;
  /** Display label (content title or template name) */
  displayTitle: string;
  /** Secondary text (content description or template subject) */
  displaySubtitle?: string;
  /** Extra chips (content type/author, or template sender) */
  chips: { label: string }[];
}

function contentToLinkable(c: ContentDetailsDto): LinkableItem {
  return {
    id: c.id,
    language: c.language,
    translationKey: c.translationKey,
    displayTitle: c.title || "Untitled",
    displaySubtitle: c.description || undefined,
    chips: [
      ...(c.type ? [{ label: c.type }] : []),
      ...(c.author ? [{ label: `by ${c.author}` }] : []),
    ],
  };
}

function emailTemplateToLinkable(t: EmailTemplateDetailsDto): LinkableItem {
  return {
    id: t.id,
    language: t.language,
    translationKey: t.translationKey,
    displayTitle: t.name || "Untitled",
    displaySubtitle: t.subject || undefined,
    chips: [
      ...(t.fromName ? [{ label: t.fromName }] : []),
      ...(t.fromEmail ? [{ label: t.fromEmail }] : []),
    ],
  };
}

interface LinkTranslationDialogProps {
  open: boolean;
  onClose: () => void;
  onLink: (linkedItem: LinkableItem) => void;
  currentContentId: number;
  currentLanguage: string;
  isLoading?: boolean;
  error?: string | null;
  contentType?: LinkableContentType;
  /** Pre-populated search text when the dialog opens */
  defaultSearchText?: string;
}

export const LinkTranslationDialog = ({
  open,
  onClose,
  onLink,
  currentContentId,
  currentLanguage,
  isLoading = false,
  error,
  contentType = "content",
  defaultSearchText = "",
}: LinkTranslationDialogProps) => {
  const { config } = useConfig();
  const { client } = useRequestContext();
  const [searchTerm, setSearchTerm] = useState(defaultSearchText);
  const [searchResults, setSearchResults] = useState<LinkableItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<LinkableItem | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const languages = config?.languages || [];

  // Get language name helper
  const getLanguageName = (code: string) => {
    return languages.find((lang) => lang.code === code)?.name || code;
  };

  const entityLabel = contentType === "emailTemplate" ? "email template" : "content";

  // Debounced search function
  const debouncedSearch = useDebouncedCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setSearchError(null);

      let items: LinkableItem[] = [];

      if (contentType === "emailTemplate") {
        const response = await client.api.emailTemplatesList({
          query: term.trim(),
        });
        items = (response.data || [])
          .filter((t) => t.id !== currentContentId && t.language !== currentLanguage)
          .map(emailTemplateToLinkable);
      } else {
        const response = await client.api.contentList({
          query: term.trim(),
        });
        items = (response.data || [])
          .filter(
            (c: ContentDetailsDto) => c.id !== currentContentId && c.language !== currentLanguage
          )
          .map(contentToLinkable);
      }

      setSearchResults(items);
    } catch (err) {
      console.error("Search failed:", err);
      setSearchError(`Failed to search ${entityLabel}. Please try again.`);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, 300);

  useEffect(() => {
    if (open) {
      setSearchTerm(defaultSearchText);
    }
  }, [open, defaultSearchText]);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleClose = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedItem(null);
    setSearchError(null);
    onClose();
  };

  const handleLink = () => {
    if (selectedItem) {
      onLink(selectedItem);
    }
  };

  const handleItemSelect = (item: LinkableItem) => {
    setSelectedItem(item);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={{ zIndex: (theme) => theme.zIndex.modal }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <LinkIcon size={24} />
          <Typography variant="h6" component="span">
            Link Translation
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Search for {entityLabel} to link as a translation. Items in the same language (
          {getLanguageName(currentLanguage)}) will be excluded.
        </Typography>

        <TextField
          fullWidth
          placeholder={
            contentType === "emailTemplate"
              ? "Search email templates by name or subject..."
              : "Search content by title, description, or body..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {searching ? <CircularProgress size={20} /> : <Search size={20} />}
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm("")} aria-label="Clear">
                  <X size={18} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        {searchError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {searchError}
          </Alert>
        )}

        {searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
            Enter at least 2 characters to search
          </Typography>
        )}

        {searchTerm.trim().length >= 2 && searchResults.length === 0 && !searching && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
            No {entityLabel} found matching your search
          </Typography>
        )}

        <Box sx={{ maxHeight: 400, overflow: "auto" }}>
          {searchResults.map((item) => (
            <Card
              key={item.id}
              sx={{
                mb: 1,
                cursor: "pointer",
                border: selectedItem?.id === item.id ? 2 : 1,
                borderColor: selectedItem?.id === item.id ? "primary.main" : "divider",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: 1,
                },
              }}
              onClick={() => handleItemSelect(item)}
            >
              <CardContent sx={{ py: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    mb: 1,
                  }}
                >
                  <Typography variant="h6" component="div" sx={{ flex: 1, mr: 2 }}>
                    {item.displayTitle}
                  </Typography>
                  <Chip
                    size="small"
                    label={getLanguageName(item.language || "")}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                {item.displaySubtitle && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {item.displaySubtitle}
                  </Typography>
                )}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {item.chips.map((chip, idx) => (
                    <Chip
                      key={idx}
                      size="small"
                      label={chip.label}
                      variant="outlined"
                      sx={{ fontSize: "0.75rem" }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleLink}
          variant="contained"
          disabled={!selectedItem || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <LinkIcon size={16} />}
        >
          {isLoading ? "Linking..." : "Link Translation"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
