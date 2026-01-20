import React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { AlertCircle, CheckCircle, Clock, Code, AlertTriangle } from "lucide-react";
import { useSyntaxValidation } from "@hooks";
import { useConfig } from "@providers/config-provider";
import { isRealtimeSyntaxValidationEnabled } from "@utils/config-helpers";

interface ValidationStatusBubbleProps {
  content: string;
  format: string;
  enabled?: boolean;
  previewPaneVisible?: boolean; // Whether the preview pane is currently visible
}

const ValidationStatusBubble: React.FC<ValidationStatusBubbleProps> = ({
  content,
  format,
  enabled = true,
  previewPaneVisible = false,
}) => {
  const { config } = useConfig();
  const validation = useSyntaxValidation({
    content,
    format,
    enabled: enabled && isRealtimeSyntaxValidationEnabled(config),
    debounceMs: 500,
  });

  if (!enabled || !content.trim() || !isRealtimeSyntaxValidationEnabled(config)) {
    return null;
  }

  const getLanguageLabel = (type: string) => {
    switch (type) {
      case "json":
        return "JSON";
      case "yaml":
        return "YAML";
      case "mdx":
        return "MDX";
      default:
        return type.toUpperCase();
    }
  };

  const getErrorIcon = (type: string, size = 20) => {
    switch (type) {
      case "json":
      case "yaml":
        return <Code size={size} />;
      case "mdx":
      default:
        return <AlertTriangle size={size} />;
    }
  };

  const renderTooltipContent = () => {
    if (validation.isValidating) {
      return (
        <Box sx={{ p: 1, maxWidth: 300 }}>
          <Typography variant="body2">Checking syntax...</Typography>
        </Box>
      );
    }

    if (validation.isValid) {
      return (
        <Box sx={{ p: 1, maxWidth: 300 }}>
          <Typography variant="body2" sx={{ color: "success.main" }}>
            {getLanguageLabel(format.toLowerCase())} syntax is valid
          </Typography>
        </Box>
      );
    }

    if (validation.error) {
      return (
        <Box sx={{ maxWidth: 400 }}>
          <Alert severity="error" sx={{ mb: 0 }}>
            <Typography variant="body2" component="div" sx={{ fontWeight: 600, mb: 1 }}>
              {getLanguageLabel(validation.error.type)} Syntax Error
            </Typography>
            <Typography variant="body2" component="div" sx={{ mb: 1 }}>
              <strong>Error:</strong> {validation.error.message}
            </Typography>
            {validation.error.line && (
              <Typography variant="caption" sx={{ display: "block" }}>
                Line {validation.error.line}
                {validation.error.column && `, Column ${validation.error.column}`}
              </Typography>
            )}
          </Alert>
        </Box>
      );
    }

    return null;
  };

  // Validating state - show subtle indicator
  if (validation.isValidating) {
    return (
      <Tooltip title={renderTooltipContent()} placement="left">
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            bottom: 16,
            right: previewPaneVisible ? "calc(50% + 24px)" : 16, // Avoid preview pane
            zIndex: 1000,
            borderRadius: "8px",
            overflow: "hidden",
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%": { opacity: 0.8 },
              "50%": { opacity: 1 },
              "100%": { opacity: 0.8 },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              backgroundColor: "#fff3cd",
              color: "#856404",
              borderLeft: "4px solid #ffc107",
            }}
          >
            <Clock size={16} />
            <Typography variant="body2" sx={{ fontSize: "0.75rem", fontWeight: 500 }}>
              Validating...
            </Typography>
          </Box>
        </Paper>
      </Tooltip>
    );
  }

  // Valid state - show success indicator
  if (validation.isValid) {
    return (
      <Tooltip title={renderTooltipContent()} placement="left">
        <Paper
          elevation={2}
          sx={{
            position: "absolute",
            bottom: 16,
            right: previewPaneVisible ? "calc(50% + 24px)" : 16, // Avoid preview pane
            zIndex: 1000,
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              backgroundColor: "#d4edda",
              color: "#155724",
              borderLeft: "4px solid #28a745",
            }}
          >
            <CheckCircle size={16} />
            <Typography variant="body2" sx={{ fontSize: "0.75rem", fontWeight: 500 }}>
              Valid
            </Typography>
          </Box>
        </Paper>
      </Tooltip>
    );
  }

  // Error state - show prominent error indicator (similar to preview error style)
  return (
    <Tooltip title={renderTooltipContent()} placement="left">
      <Paper
        elevation={6}
        sx={{
          position: "absolute",
          bottom: 16,
          right: previewPaneVisible ? "calc(50% + 24px)" : 16, // Avoid preview pane
          zIndex: 1000,
          borderRadius: "8px",
          overflow: "hidden",
          border: "2px solid #dc3545",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2.5,
            py: 1.5,
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderLeft: "4px solid #dc3545",
            minWidth: "120px",
          }}
        >
          <Box sx={{ color: "error.main" }}>
            {validation.error ? getErrorIcon(validation.error.type, 20) : <AlertCircle size={20} />}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontSize: "0.8rem", fontWeight: 600, mb: 0.5 }}>
              Syntax Error
            </Typography>
            <Typography variant="caption" sx={{ fontSize: "0.7rem", opacity: 0.9 }}>
              {getLanguageLabel(validation.error?.type || format)}
              {validation.error?.line && ` • Line ${validation.error.line}`}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Tooltip>
  );
};

export default ValidationStatusBubble;
