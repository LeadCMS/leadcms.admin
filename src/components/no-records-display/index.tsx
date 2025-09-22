import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { Search, FileX, RefreshCw } from "lucide-react";

interface NoRecordsDisplayProps {
  visible: boolean;
  message?: string;
  description?: string;
  activeFilters?: {
    searchTerm?: string;
    contentType?: string;
    customFilters?: Array<{ field: string; operator: string; value: string }>;
    languageFilter?: string;
    languageDisplayName?: string;
  };
  onClearFilters?: () => void;
  icon?: React.ReactNode;
}

const NoRecordsDisplay: React.FC<NoRecordsDisplayProps> = ({
  visible,
  message,
  description,
  activeFilters,
  onClearFilters,
  icon,
}) => {
  if (!visible) return null;

  const hasActiveFilters =
    activeFilters &&
    (activeFilters.searchTerm ||
      activeFilters.contentType ||
      (activeFilters.customFilters && activeFilters.customFilters.length > 0) ||
      (activeFilters.languageFilter && activeFilters.languageFilter !== "all"));

  const getContextualMessage = () => {
    if (description) return description;

    if (!hasActiveFilters) {
      return "No content has been created yet. Start by adding your first piece of content.";
    }

    const filterDescriptions = [];

    if (activeFilters?.searchTerm) {
      filterDescriptions.push(`searching for "${activeFilters.searchTerm}"`);
    }

    if (activeFilters?.contentType) {
      filterDescriptions.push(`filtering by content type "${activeFilters.contentType}"`);
    }

    if (activeFilters?.languageFilter && activeFilters.languageFilter !== "all") {
      const languageName = activeFilters.languageDisplayName || activeFilters.languageFilter;
      filterDescriptions.push(`filtering by language "${languageName}"`);
    }

    if (activeFilters?.customFilters && activeFilters.customFilters.length > 0) {
      const filterCount = activeFilters.customFilters.length;
      filterDescriptions.push(`${filterCount} custom filter${filterCount > 1 ? "s" : ""}`);
    }

    if (filterDescriptions.length > 0) {
      return `No content found with your current filters: ${filterDescriptions.join(", ")}.`;
    }

    return "No content matches your current criteria.";
  };

  const getIcon = () => {
    if (icon) return icon;
    if (hasActiveFilters) return <Search size={48} />;
    return <FileX size={48} />;
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 300,
        py: 6,
        px: 2,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
        position: "relative",
        zIndex: 10,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: "center",
          backgroundColor: "grey.50",
          borderRadius: 3,
          border: "2px dashed",
          borderColor: "grey.300",
          maxWidth: 500,
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
            color: "grey.400",
          }}
        >
          {getIcon()}
        </Box>

        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: "grey.700",
          }}
        >
          {message || "No Content Found"}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: hasActiveFilters ? 3 : 0,
            color: "grey.600",
            lineHeight: 1.6,
          }}
        >
          {getContextualMessage()}
        </Typography>

        {hasActiveFilters && onClearFilters && (
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={16} />}
            onClick={onClearFilters}
            sx={{
              mt: 1,
              borderColor: "grey.400",
              color: "grey.700",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "primary.50",
              },
            }}
          >
            Clear All Filters
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default NoRecordsDisplay;
