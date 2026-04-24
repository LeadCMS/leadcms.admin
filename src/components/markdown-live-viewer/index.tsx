import { useMemo, useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Tooltip from "@mui/material/Tooltip";
import { ZoomIn, ZoomOut, Monitor, Smartphone, RotateCcw } from "lucide-react";
import { MarkdownLiveViewerProps } from "./types";
import "./styles.css";
import { useUserInfo } from "@providers/user-provider";
import { useConfig } from "@providers/config-provider";
import { generateSitePreviewUrl } from "@utils/preview-helper";
import { loadStored, saveStored } from "@utils/template-preview-utils";

const REQUIRED_KEYS = ["type", "slug", "body"];

const ZOOM_MIN = 25;
const ZOOM_MAX = 200;
const ZOOM_STEP = 25;
const MOBILE_WIDTH = 375;

const STORAGE_KEY_ZOOM = "live-preview-zoom";
const STORAGE_KEY_DEVICE = "live-preview-device";

type DeviceMode = "desktop" | "mobile";

const MarkdownLiveViewer = ({ params, template, viewerKey }: MarkdownLiveViewerProps) => {
  const userInfo = useUserInfo();
  const { config } = useConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [zoom, setZoom] = useState(() => loadStored(STORAGE_KEY_ZOOM, 100));
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(() =>
    loadStored<DeviceMode>(STORAGE_KEY_DEVICE, "desktop")
  );

  useEffect(() => {
    saveStored(STORAGE_KEY_ZOOM, zoom);
  }, [zoom]);

  useEffect(() => {
    saveStored(STORAGE_KEY_DEVICE, deviceMode);
  }, [deviceMode]);

  const defaultLanguage = config?.defaultLanguage;

  // Merge userId into params if available
  const mergedParams: Record<string, unknown> = {
    ...params,
    userId: params.userId || userInfo?.details?.id || "",
  };

  // Check for missing required params (for new page)
  const missingRequired = REQUIRED_KEYS.some((k) => !mergedParams[k]);

  // Compute preview URL
  const previewUrl = useMemo(() => {
    if (!mergedParams || !template) return null;
    if (missingRequired) return null;

    const generatedUrl = generateSitePreviewUrl(template, mergedParams, defaultLanguage);

    // Check if there are still unresolved placeholders after URL generation
    const unresolvedPlaceholders = generatedUrl.match(/{(.*?)}/g) || [];
    if (unresolvedPlaceholders.length > 0) {
      console.debug("[MarkdownLiveViewer] Unresolved placeholders:", unresolvedPlaceholders);
      return null;
    }

    return generatedUrl;
  }, [mergedParams, template, missingRequired, defaultLanguage]);

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
    const scale = zoom / 100;
    return (
      <Box
        className="markdown-live-viewer-container"
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Preview toolbar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1,
            py: 0.5,
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "#fafafa",
            minHeight: 44,
            flexShrink: 0,
          }}
        >
          <ToggleButtonGroup
            value={deviceMode}
            exclusive
            onChange={(_, v) => v && setDeviceMode(v)}
            size="small"
          >
            <ToggleButton value="desktop" aria-label="Desktop preview" sx={{ px: 1, py: 0.5 }}>
              <Monitor size={16} />
            </ToggleButton>
            <ToggleButton value="mobile" aria-label="Mobile preview" sx={{ px: 1, py: 0.5 }}>
              <Smartphone size={16} />
            </ToggleButton>
          </ToggleButtonGroup>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Tooltip title="Zoom out">
              <span>
                <IconButton
                  size="small"
                  onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
                  disabled={zoom <= ZOOM_MIN}
                >
                  <ZoomOut size={16} />
                </IconButton>
              </span>
            </Tooltip>
            <Typography
              variant="caption"
              sx={{
                minWidth: 40,
                textAlign: "center",
                userSelect: "none",
              }}
            >
              {zoom}%
            </Typography>
            <Tooltip title="Zoom in">
              <span>
                <IconButton
                  size="small"
                  onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
                  disabled={zoom >= ZOOM_MAX}
                >
                  <ZoomIn size={16} />
                </IconButton>
              </span>
            </Tooltip>
            {zoom !== 100 && (
              <Tooltip title="Reset zoom">
                <IconButton size="small" onClick={() => setZoom(100)}>
                  <RotateCcw size={14} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Preview area */}
        <Box
          sx={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            backgroundColor: deviceMode === "mobile" ? "#f0f0f0" : "transparent",
          }}
        >
          <Box
            sx={{
              width: deviceMode === "mobile" ? MOBILE_WIDTH : "100%",
              maxWidth: "100%",
              height: "100%",
              transition: "width 0.3s ease",
              backgroundColor: "white",
              overflow: "hidden",
              ...(deviceMode === "mobile" && {
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              }),
            }}
          >
            <iframe
              key={viewerKey}
              src={iframeUrl}
              className={"markdown-live-viewer-iframe"}
              title="Preview"
              sandbox={"allow-scripts allow-same-origin" + " allow-forms allow-popups"}
              loading="lazy"
              style={{
                width: `${10000 / zoom}%`,
                height: `${10000 / zoom}%`,
                transform: `scale(${scale})`,
                transformOrigin: "0 0",
                border: "none",
                display: "block",
              }}
            />
          </Box>
        </Box>
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
  return <MarkdownLiveViewer params={params} template={template} viewerKey={key} key={key} />;
};

export default MarkdownLiveViewer;
