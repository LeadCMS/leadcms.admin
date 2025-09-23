import React, { useEffect, useState } from "react";
import { Box, Chip, Typography, Skeleton, Tooltip } from "@mui/material";
import { useRequestContext } from "@providers/request-provider";
import { fetchAllContentTypes, idToDisplayName } from "@features/content/content-types";
import { ContentTypeDetailsDto } from "@lib/network/swagger-client";

interface ContentTypeFilterProps {
  selectedContentType: string | null;
  onContentTypeChange: (contentType: string | null) => void;
  showAllOption?: boolean;
}

export const ContentTypeFilter: React.FC<ContentTypeFilterProps> = ({
  selectedContentType,
  onContentTypeChange,
  showAllOption = true,
}) => {
  const { client } = useRequestContext();
  const [contentTypes, setContentTypes] = useState<ContentTypeDetailsDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContentTypes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const types = await fetchAllContentTypes(client);

        // Filter to only show content types with at least one record and sort by count descending
        const typesWithContent = types
          .filter((type) => (type.contentCount || 0) > 0)
          .sort((a, b) => (b.contentCount || 0) - (a.contentCount || 0));

        setContentTypes(typesWithContent);
      } catch (err) {
        console.error("Failed to load content types:", err);
        setError("Failed to load content types");
      } finally {
        setIsLoading(false);
      }
    };

    loadContentTypes();
  }, [client]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {showAllOption && (
          <Skeleton variant="rectangular" width={60} height={32} sx={{ borderRadius: 1 }} />
        )}
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            width={80}
            height={32}
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="body2" color="error" sx={{ py: 1 }}>
        {error}
      </Typography>
    );
  }

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

        {contentTypes.map((contentType) => (
          <Chip
            key={contentType.uid}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <span>{idToDisplayName(contentType.uid)}</span>
                <Tooltip
                  title={`Total records in system: ${
                    contentType.contentCount || 0
                  } (regardless of current filters)`}
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
                    {contentType.contentCount || 0}
                  </Box>
                </Tooltip>
              </Box>
            }
            size="small"
            variant={selectedContentType === contentType.uid ? "filled" : "outlined"}
            color={selectedContentType === contentType.uid ? "primary" : "default"}
            onClick={() => handleChipClick(contentType.uid)}
            sx={{
              fontSize: "0.75rem",
              height: 28,
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor:
                  selectedContentType === contentType.uid ? "primary.dark" : "action.hover",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};
