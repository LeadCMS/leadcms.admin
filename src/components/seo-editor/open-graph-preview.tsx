import { Box, Typography } from "@mui/material";

interface OpenGraphPreviewProps {
  title: string;
  description: string;
  imageUrl: string | null;
  url: string;
  siteUrl?: string;
}

export const OpenGraphPreview = ({
  title,
  description,
  imageUrl,
  url,
  siteUrl,
}: OpenGraphPreviewProps) => {
  const displayTitle = title || "Untitled Page";
  const displayDescription = description || "No description available.";

  // Extract domain from URL or siteUrl for display
  let domain = "";
  try {
    const source = url || siteUrl || "";
    if (source) {
      domain = new URL(source).hostname;
    }
  } catch {
    // keep empty
  }

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
        Social Media Preview
      </Typography>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "grey.300",
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "#f0f2f5",
        }}
      >
        {imageUrl && (
          <Box
            sx={{
              width: "100%",
              height: 200,
              bgcolor: "grey.200",
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        <Box sx={{ p: 1.5 }}>
          <Typography
            sx={{
              fontSize: "12px",
              color: "#65676b",
              textTransform: "uppercase",
              letterSpacing: 0.3,
            }}
          >
            {domain}
          </Typography>
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#1c1e21",
              lineHeight: "20px",
              mt: 0.25,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayTitle}
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              color: "#65676b",
              lineHeight: "20px",
              mt: 0.25,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {displayDescription}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
