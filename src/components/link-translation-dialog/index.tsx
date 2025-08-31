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
import { ContentDetailsDto } from "@lib/network/swagger-client";
import { useDebouncedCallback } from "use-debounce";

interface LinkTranslationDialogProps {
  open: boolean;
  onClose: () => void;
  onLink: (linkedContent: ContentDetailsDto) => void;
  currentContentId: number;
  currentLanguage: string;
  isLoading?: boolean;
  error?: string | null;
}

export const LinkTranslationDialog = ({
  open,
  onClose,
  onLink,
  currentContentId,
  currentLanguage,
  isLoading = false,
  error,
}: LinkTranslationDialogProps) => {
  const { config } = useConfig();
  const { client } = useRequestContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ContentDetailsDto[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentDetailsDto | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const languages = config?.languages || [];

  // Get language name helper
  const getLanguageName = (code: string) => {
    return languages.find((lang) => lang.code === code)?.name || code;
  };

  // Debounced search function
  const debouncedSearch = useDebouncedCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setSearchError(null);

      // Search for content excluding current content and same language
      const response = await client.api.contentList({
        query: term.trim(),
      });

      // Filter out current content and same language content
      const filteredResults = (response.data || []).filter(
        (item: ContentDetailsDto) =>
          item.id !== currentContentId && item.language !== currentLanguage
      );

      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchError("Failed to search content. Please try again.");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleClose = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedContent(null);
    setSearchError(null);
    onClose();
  };

  const handleLink = () => {
    if (selectedContent) {
      onLink(selectedContent);
    }
  };

  const handleContentSelect = (content: ContentDetailsDto) => {
    setSelectedContent(content);
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
          Search for content to link as a translation. Content in the same language (
          {getLanguageName(currentLanguage)}) will be excluded.
        </Typography>

        <TextField
          fullWidth
          placeholder="Search content by title, description, or body..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {searching ? <CircularProgress size={20} /> : <Search size={20} />}
              </InputAdornment>
            ),
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
            No content found matching your search
          </Typography>
        )}

        <Box sx={{ maxHeight: 400, overflow: "auto" }}>
          {searchResults.map((content) => (
            <Card
              key={content.id}
              sx={{
                mb: 1,
                cursor: "pointer",
                border: selectedContent?.id === content.id ? 2 : 1,
                borderColor: selectedContent?.id === content.id ? "primary.main" : "divider",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: 1,
                },
              }}
              onClick={() => handleContentSelect(content)}
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
                    {content.title || "Untitled"}
                  </Typography>
                  <Chip
                    size="small"
                    label={getLanguageName(content.language || "")}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                {content.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {content.description}
                  </Typography>
                )}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {content.type && (
                    <Chip
                      size="small"
                      label={content.type}
                      variant="outlined"
                      sx={{ fontSize: "0.75rem" }}
                    />
                  )}
                  {content.author && (
                    <Chip
                      size="small"
                      label={`by ${content.author}`}
                      variant="outlined"
                      sx={{ fontSize: "0.75rem" }}
                    />
                  )}
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
          disabled={!selectedContent || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <LinkIcon size={16} />}
        >
          {isLoading ? "Linking..." : "Link Translation"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
