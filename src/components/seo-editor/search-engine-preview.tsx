import { Box, Typography } from "@mui/material";

interface SearchEnginePreviewProps {
  title: string;
  description: string;
  url: string;
  siteUrl?: string;
}

export const SearchEnginePreview = ({
  title,
  description,
  url,
  siteUrl,
}: SearchEnginePreviewProps) => {
  const displayTitle = title || "Untitled Page";
  const displayDescription = description || "No description available.";
  const displayUrl = url || siteUrl || "";

  // Truncate like search engines do
  const truncatedTitle =
    displayTitle.length > 60 ? displayTitle.substring(0, 57) + "..." : displayTitle;
  const truncatedDescription =
    displayDescription.length > 160
      ? displayDescription.substring(0, 157) + "..."
      : displayDescription;

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        maxWidth: 600,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          mb: 1.5,
          display: "block",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        Search Engine Preview
      </Typography>
      <Box
        sx={{
          fontFamily: "arial, sans-serif",
        }}
      >
        <Typography
          sx={{
            fontSize: "20px",
            lineHeight: "26px",
            color: "#1a0dab",
            cursor: "pointer",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          {truncatedTitle}
        </Typography>
        <Typography
          sx={{
            fontSize: "14px",
            lineHeight: "22px",
            color: "#4d5156",
            mt: 0.25,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {truncatedDescription}
        </Typography>
        <Typography
          sx={{
            fontSize: "12px",
            lineHeight: "18px",
            color: "#202124",
            mt: 0.25,
          }}
        >
          {displayUrl}
        </Typography>
      </Box>
    </Box>
  );
};
