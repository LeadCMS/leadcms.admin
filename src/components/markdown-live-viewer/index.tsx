import { useMemo, useEffect, useState, useRef } from "react";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { MarkdownLiveViewerProps } from "./types";
import "./styles.css";
import { useUserInfo } from "@providers/user-provider";

const generatePreviewUrl = (template: string, params: Record<string, unknown>): string => {
  let url = template;
  Object.keys(params).forEach((key) => {
    url = url.replace(
      new RegExp(`{${key}}`, "g"),
      params[key] !== undefined ? String(params[key]) : ""
    );
  });
  return url;
};

const REQUIRED_KEYS = ["type", "slug", "body"];

const MarkdownLiveViewer = ({ params, template, key: viewerKey }: MarkdownLiveViewerProps) => {
  const userInfo = useUserInfo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Merge userId into params if available
  const mergedParams: Record<string, unknown> = {
    ...params,
    userId: params.userId || userInfo?.details?.id || "",
  };

  // Check for missing required params (for new page)
  const placeholders = template ? template.match(/{(.*?)}/g) || [] : [];
  const missingKeys = placeholders
    .map((k: string) => k.replace(/[{}]/g, ""))
    .filter((key: string) => !mergedParams[key]);
  const missingRequired = REQUIRED_KEYS.some((k) => !mergedParams[k]);

  // Compute preview URL
  const previewUrl = useMemo(() => {
    if (!mergedParams || !template) return null;
    if (missingKeys.length > 0) return null;
    return generatePreviewUrl(template, mergedParams);
  }, [mergedParams, template, missingKeys]);

  // Always poll for preview URL availability
  useEffect(() => {
    if (!previewUrl) {
      setIframeUrl(null);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    let tries = 0;
    setLoading(true);
    setError(null);
    setIframeUrl(null);
    const checkUrl = async () => {
      try {
        const resp = await fetch(previewUrl, { method: "HEAD" });
        if (!cancelled && resp.status !== 404) {
          setIframeUrl(previewUrl);
          setLoading(false);
          setError(null);
        } else if (!cancelled && tries < 4) {
          tries++;
          timerRef.current = setTimeout(checkUrl, 2000);
        } else if (!cancelled) {
          setLoading(false);
          setError(
            "Preview is not available. Please make some changes or refresh the page manually."
          );
        }
      } catch (e) {
        if (!cancelled && tries < 4) {
          tries++;
          timerRef.current = setTimeout(checkUrl, 2000);
        } else if (!cancelled) {
          setLoading(false);
          setError(
            "Preview is not available. Please make some changes or refresh the page manually."
          );
        }
      }
    };
    checkUrl();
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl, viewerKey]);

  // Show missing required params error (for new page)
  if (missingRequired) {
    return (
      <Box
        className="markdown-live-viewer-container"
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
          Missing required parameters for preview.
          <br />
          Please make sure to set right <b>Content Type</b>, <b>Slug</b> and <b>Body</b> value.
        </Typography>
      </Box>
    );
  }

  // Show error if polling failed
  if (error) {
    return (
      <Box
        className="markdown-live-viewer-container"
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Show loading spinner while polling
  if (loading) {
    return (
      <Box
        className="markdown-live-viewer-container"
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
        <CircularProgress size={40} />
        <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
          Loading preview...
        </Typography>
      </Box>
    );
  }

  // Show iframe if available
  if (iframeUrl) {
    return (
      <Box className="markdown-live-viewer-container" sx={{ height: "100%" }}>
        <iframe
          key={viewerKey}
          src={iframeUrl}
          className="markdown-live-viewer-iframe"
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          loading="lazy"
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        />
      </Box>
    );
  }

  // Fallback (should not happen)
  return null;
};

export const MarkdownLiveViewerFunc = (
  params: Record<string, unknown>,
  template: string,
  key?: React.Key
) => {
  return <MarkdownLiveViewer params={params} template={template} key={key} />;
};

export default MarkdownLiveViewer;
