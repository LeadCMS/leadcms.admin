import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { idToDisplayName } from "@features/content/content-types";

interface ContentTypeFilterProps {
  selectedContentType: string | null;
  onContentTypeChange: (contentType: string | null) => void;
  showAllOption?: boolean;
  statistics?: Record<string, number>;
}

export const ContentTypeFilter: React.FC<ContentTypeFilterProps> = ({
  selectedContentType,
  onContentTypeChange,
  showAllOption = true,
  statistics = {},
}) => {
  // Extract content types from statistics and sort by count descending
  const contentTypes = useMemo(() => {
    return Object.entries(statistics)
      .filter(([, count]) => count > 0)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([uid]) => uid);
  }, [statistics]);

  const handleChipClick = (contentType: string | null) => {
    // If clicking the same content type, deselect it (set to null)
    if (selectedContentType === contentType) {
      onContentTypeChange(null);
    } else {
      onContentTypeChange(contentType);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontWeight: 500 }}>
          Type:
        </Typography>

        {showAllOption && (
          <Chip
            label="All"
            size="small"
            variant={selectedContentType === null ? "filled" : "outlined"}
            color={selectedContentType === null ? "primary" : "default"}
            onClick={() => handleChipClick(null)}
            sx={{
              fontSize: "0.75rem",
              height: 28,
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: selectedContentType === null ? "primary.dark" : "action.hover",
              },
            }}
          />
        )}

        {contentTypes.map((contentTypeUid) => (
          <Chip
            key={contentTypeUid}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <span>{idToDisplayName(contentTypeUid)}</span>
                <Tooltip
                  title={`Matching records with current filters: ${
                    statistics[contentTypeUid] || 0
                  }`}
                  arrow
                  placement="top"
                >
                  <Box
                    component="span"
                    sx={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      color: "text.secondary",
                      backgroundColor: "rgba(0, 0, 0, 0.06)",
                      borderRadius: "4px",
                      px: 0.5,
                      py: 0.1,
                      cursor: "help",
                    }}
                  >
                    {statistics[contentTypeUid] || 0}
                  </Box>
                </Tooltip>
              </Box>
            }
            size="small"
            variant={selectedContentType === contentTypeUid ? "filled" : "outlined"}
            color={selectedContentType === contentTypeUid ? "primary" : "default"}
            onClick={() => handleChipClick(contentTypeUid)}
            sx={{
              fontSize: "0.75rem",
              height: 28,
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor:
                  selectedContentType === contentTypeUid ? "primary.dark" : "action.hover",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};
