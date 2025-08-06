import React from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import { ApiError } from "@lib/network/wrapApiClient";

interface ApiErrorDisplayProps {
  error: ApiError | string | null | undefined;
  fileName?: string;
}

export const ApiErrorDisplay: React.FC<ApiErrorDisplayProps> = ({ error, fileName }) => {
  if (!error) return null;

  let title = "";
  let message = "";
  let details: string[] = [];

  if (typeof error === "string") {
    message = error;
  } else {
    title = error.title || "Error";
    message = error.message || "";
    if (error.errors && typeof error.errors === "object") {
      details = Object.entries(error.errors).flatMap(([field, msgs]) =>
        Array.isArray(msgs) ? msgs.map((msg: string) => `${field}: ${msg}`) : []
      );
    }
  }

  // Remove duplicated fileName/message prefix if present
  const displayTitle = fileName ? `Failed to upload ${fileName}` : title;
  let displayMessage = message;
  if (fileName && message.startsWith(`Failed to upload ${fileName}: `)) {
    displayMessage = message.replace(`Failed to upload ${fileName}: `, "");
  }
  // Remove duplicated title/message if present
  if (title && displayMessage.startsWith(title + ": ")) {
    displayMessage = displayMessage.replace(title + ": ", "");
  }
  // Remove leading/trailing colons, spaces, and dots
  displayMessage = displayMessage.replace(/^[:.\s]+|[:.\s]+$/g, "");

  return (
    <Box sx={{ color: "error.main", my: 2 }}>
      {displayTitle && (
        <Typography variant="subtitle2" color="error">
          {displayTitle}
        </Typography>
      )}
      {displayMessage && (
        <Typography variant="body2" color="error" sx={{ whiteSpace: "pre-line" }}>
          {displayMessage}
        </Typography>
      )}
      {details.length > 0 && (
        <List dense sx={{ color: "error.main", pl: 2 }}>
          {details.map((d, i) => (
            <ListItem key={i} disablePadding>
              <ListItemText primary={d} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};
