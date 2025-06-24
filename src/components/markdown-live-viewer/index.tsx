import { useMemo } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
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

const MarkdownLiveViewer = ({ params, template, key: viewerKey }: MarkdownLiveViewerProps) => {
  const userInfo = useUserInfo();
  // Merge userId into params if available
  const mergedParams: Record<string, unknown> = {
    ...params,
    userId: params.userId || userInfo?.details?.id || "",
  };
  const previewUrl = useMemo(() => {
    if (!mergedParams) {
      console.debug("[MarkdownLiveViewer] No params provided", { params: mergedParams, template });
      return null;
    }

    if (!template) {
      console.debug("[MarkdownLiveViewer] No template provided");
      return null;
    }

    const placeholders = template.match(/{(.*?)}/g) || [];
    const missingKeys = placeholders
      .map((k: string) => k.replace(/[{}]/g, ""))
      .filter((key: string) => !mergedParams[key]);
    if (missingKeys.length > 0) {
      // Print all params and their values for debugging
      console.debug("[MarkdownLiveViewer] Params received:", JSON.stringify(mergedParams, null, 2));
      // Print all placeholders found in the template
      console.debug(
        "[MarkdownLiveViewer] Placeholders in template:",
        placeholders.map((k: string) => k.replace(/[{}]/g, ""))
      );
      // Print missing keys
      console.debug("[MarkdownLiveViewer] Missing required params for preview:", missingKeys, {
        params: mergedParams,
        template,
      });
      return null;
    }
    return generatePreviewUrl(template, mergedParams);
  }, [mergedParams, template]);

  if (!previewUrl) {
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
        <Typography variant="caption" sx={{ mt: 1, color: "text.disabled", textAlign: "center" }}>
          Missing required parameters for preview. <br /> Please make sure to set right{" "}
          <b>Content Type</b> as well as go to <b>SETTINGS</b> tab and set <b>Slug</b> value.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="markdown-live-viewer-container" sx={{ height: "100%" }}>
      <iframe
        key={viewerKey} // Pass key to iframe for remounting
        src={previewUrl}
        className="markdown-live-viewer-iframe"
        title="Live Preview"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        loading="lazy"
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
      />
    </Box>
  );
};

export const MarkdownLiveViewerFunc = (
  params: Record<string, unknown>,
  template: string,
  key?: React.Key
) => {
  console.log("[MarkdownLiveViewerFunc] Rendering with params:", params, template, key);
  return <MarkdownLiveViewer params={params} template={template} key={key} />;
};

export default MarkdownLiveViewer;
