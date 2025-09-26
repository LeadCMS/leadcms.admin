import React from "react";
import { Chip, Tooltip } from "@mui/material";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useSyntaxValidation } from "@hooks";

interface SyntaxValidationIndicatorProps {
  content: string;
  format: string;
  enabled?: boolean;
}

const SyntaxValidationIndicator: React.FC<SyntaxValidationIndicatorProps> = ({
  content,
  format,
  enabled = true,
}) => {
  const validation = useSyntaxValidation({
    content,
    format,
    enabled,
    debounceMs: 500, // Longer debounce for indicator
  });

  if (!enabled || !content.trim()) {
    return null;
  }

  if (validation.isValidating) {
    return (
      <Tooltip title="Checking syntax...">
        <Chip
          icon={<Clock size={14} />}
          label="Checking..."
          size="small"
          variant="outlined"
          sx={{
            height: 20,
            fontSize: "0.7rem",
            "& .MuiChip-icon": {
              fontSize: "14px",
            },
          }}
        />
      </Tooltip>
    );
  }

  if (validation.isValid) {
    return (
      <Tooltip title="Syntax is valid">
        <Chip
          icon={<CheckCircle size={14} />}
          label="Valid"
          size="small"
          color="success"
          variant="outlined"
          sx={{
            height: 20,
            fontSize: "0.7rem",
            "& .MuiChip-icon": {
              fontSize: "14px",
            },
          }}
        />
      </Tooltip>
    );
  }

  const errorMessage = validation.error?.message || "Syntax error";
  const lineInfo = validation.error?.line ? ` (line ${validation.error.line})` : "";

  return (
    <Tooltip title={`${errorMessage}${lineInfo}`}>
      <Chip
        icon={<AlertCircle size={14} />}
        label="Error"
        size="small"
        color="error"
        variant="outlined"
        sx={{
          height: 20,
          fontSize: "0.7rem",
          "& .MuiChip-icon": {
            fontSize: "14px",
          },
        }}
      />
    </Tooltip>
  );
};

export default SyntaxValidationIndicator;
