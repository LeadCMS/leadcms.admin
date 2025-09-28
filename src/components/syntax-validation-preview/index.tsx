import React, { useEffect, useState } from "react";
import { Box, Alert, Typography, Chip, CircularProgress } from "@mui/material";
import { AlertTriangle, Code } from "lucide-react";
import {
  validateContentSyntax,
  SyntaxValidationResult,
  SyntaxValidationError,
} from "@utils/syntax-validators";
import { MarkdownLiveViewerFunc } from "@components/markdown-live-viewer";
import { useConfig } from "@providers/config-provider";
import { isRealtimeSyntaxValidationEnabled } from "@utils/config-helpers";

interface SyntaxValidationPreviewProps {
  params: Record<string, unknown>;
  template?: string;
  viewerKey?: React.Key;
  contentFormat?: string;
}

const SyntaxErrorDisplay: React.FC<{ error: SyntaxValidationError }> = ({ error }) => {
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

  const getErrorIcon = (type: string) => {
    switch (type) {
      case "json":
      case "yaml":
        return <Code size={20} />;
      case "mdx":
      default:
        return <AlertTriangle size={20} />;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        p: 3,
        backgroundColor: "#fefefe",
        border: "1px solid #e0e0e0",
        borderRadius: 1,
      }}
    >
      <Box sx={{ mb: 2, color: "error.main" }}>{getErrorIcon(error.type)}</Box>

      <Chip
        label={`${getLanguageLabel(error.type)} Syntax Error`}
        color="error"
        variant="outlined"
        sx={{ mb: 2 }}
      />

      <Alert severity="error" sx={{ mb: 2, maxWidth: "100%" }}>
        <Typography variant="body2" component="div">
          <strong>Error:</strong> {error.message}
        </Typography>
        {error.line && (
          <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
            Line {error.line}
            {error.column && `, Column ${error.column}`}
          </Typography>
        )}
      </Alert>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: "center", maxWidth: 400 }}
      >
        Please fix the syntax error above before the preview can be displayed. The content will not
        be saved until all syntax errors are resolved.
      </Typography>
    </Box>
  );
};

const SyntaxValidationPreview: React.FC<SyntaxValidationPreviewProps> = ({
  params,
  template,
  viewerKey,
  contentFormat,
}) => {
  const { config } = useConfig();
  const [validationResult, setValidationResult] = useState<SyntaxValidationResult>({
    isValid: true,
  });
  const [isValidating, setIsValidating] = useState(false);

  const body = params.body as string;
  const shouldValidate = body?.trim() && contentFormat && isRealtimeSyntaxValidationEnabled(config);

  useEffect(() => {
    if (!shouldValidate) {
      setValidationResult({ isValid: true });
      setIsValidating(false);
      return;
    }

    setIsValidating(true);

    const validateAsync = async () => {
      try {
        const result = validateContentSyntax(body, contentFormat);

        // Handle both sync and async validation results
        if (result instanceof Promise) {
          const asyncResult = await result;
          setValidationResult(asyncResult);
        } else {
          setValidationResult(result);
        }
      } catch (error) {
        // Fallback error handling
        setValidationResult({
          isValid: false,
          error: {
            message: "Validation failed",
            type: contentFormat.toLowerCase() as "json" | "yaml" | "mdx",
          },
        });
      } finally {
        setIsValidating(false);
      }
    };

    validateAsync();
  }, [body, contentFormat, shouldValidate, config]);

  // Show loading state during validation
  if (isValidating) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          p: 3,
          backgroundColor: "#fefefe",
          border: "1px solid #e0e0e0",
          borderRadius: 1,
        }}
      >
        <CircularProgress size={32} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Validating syntax...
        </Typography>
      </Box>
    );
  }

  // If syntax is invalid, show the error display
  if (!validationResult.isValid && validationResult.error) {
    return <SyntaxErrorDisplay error={validationResult.error} />;
  }

  // If syntax is valid and we have a template, show the regular preview
  if (template) {
    return MarkdownLiveViewerFunc(params, template, viewerKey);
  }

  // No template available
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        backgroundColor: "#f5f5f5",
        border: "1px solid #e0e0e0",
        borderRadius: 1,
      }}
    >
      <Typography variant="caption" sx={{ color: "text.disabled", textAlign: "center" }}>
        Preview template not configured
      </Typography>
    </Box>
  );
};

export default SyntaxValidationPreview;
