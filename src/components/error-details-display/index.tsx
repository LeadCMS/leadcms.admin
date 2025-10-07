import React from "react";
import { Box, Typography } from "@mui/material";
import { AlertCircle } from "lucide-react";

export interface ErrorDetailsDisplayProps {
  /** Main error message */
  message: string;
  /** Array of detailed error messages */
  details?: string[];
  /** Optional error title */
  title?: string;
  /** Whether to show as a compact inline version */
  compact?: boolean;
}

/**
 * Styled component for displaying error details in a user-friendly format
 * Can be used in modals, inline alerts, or toast notifications
 */
export const ErrorDetailsDisplay: React.FC<ErrorDetailsDisplayProps> = ({
  message,
  details = [],
  title,
  compact = false,
}) => {
  if (compact) {
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500, mb: details.length > 0 ? 0.5 : 0 }}>
          {message}
        </Typography>
        {details.length > 0 && (
          <Typography variant="body2" color="text.secondary" component="div">
            {details.map((detail, index) => (
              <Box key={index} sx={{ fontSize: "0.875rem", mt: 0.25 }}>
                • {detail}
              </Box>
            ))}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {title && (
        <Typography variant="h6" sx={{ mb: 2, color: "error.main" }}>
          {title}
        </Typography>
      )}

      <Typography variant="body1" sx={{ mb: details.length > 0 ? 2 : 0, fontWeight: 500 }}>
        {message}
      </Typography>

      {details.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary" }}>
            Details:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {details.map((detail, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <AlertCircle size={16} color="#d32f2f" style={{ flexShrink: 0, marginTop: 2 }} />
                <Typography variant="body2" sx={{ wordBreak: "break-word", lineHeight: 1.5 }}>
                  {detail}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ErrorDetailsDisplay;
