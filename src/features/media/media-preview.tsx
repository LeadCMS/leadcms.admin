import { useState, useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import DownloadIcon from "@mui/icons-material/Download";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MovieIcon from "@mui/icons-material/Movie";
import { buildAbsoluteUrlWithCacheBust } from "@lib/network/utils";
import { MediaDetailsDto, ProblemDetails } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { useAuthState } from "@providers/auth-provider";
import { useNotificationsService } from "@hooks";
import { ApiErrorDisplay } from "@components/api-error-display";
import { parseApiError } from "@utils/api-error-parser";
import { ApiError } from "@lib/network/wrapApiClient";
import { useConfig } from "@providers/config-provider";

interface MediaPreviewProps {
  file: MediaDetailsDto | null;
  open: boolean;
  onClose: () => void;
  onDownload: (file: MediaDetailsDto) => void;
  onCopyLink: (file: MediaDetailsDto) => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  onReplace?: (file: MediaDetailsDto) => void;
  onFileUpdate?: (updatedFile: MediaDetailsDto) => void;
}

const formatFileSize = (size: number | undefined) => {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

const normalizeTags = (tags: string[] | string | null | undefined) => {
  if (!tags) return [];
  const rawList = Array.isArray(tags) ? tags : [tags];
  const parsedList = rawList.flatMap((tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [trimmed];
      } catch {
        return [trimmed];
      }
    }
    return [trimmed];
  });

  return parsedList
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .filter((tag, index, self) => self.indexOf(tag) === index);
};

// Helper function to check if file is PDF
const isPdfFile = (file: MediaDetailsDto) => {
  return file?.mimeType === "application/pdf" || file?.name?.toLowerCase().endsWith(".pdf");
};

// Helper function to check if file is video
const isVideoFile = (file: MediaDetailsDto) => {
  return (
    file?.mimeType?.startsWith("video/") ||
    /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/i.test(file?.name || "")
  );
};

export const MediaPreview = ({
  file,
  open,
  onClose,
  onDownload,
  onCopyLink,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  onReplace,
  onFileUpdate,
}: MediaPreviewProps) => {
  const [tab, setTab] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceError, setReplaceError] = useState<ApiError | string | null>(null);
  const [pdfError, setPdfError] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const { client } = useRequestContext();
  const { config } = useConfig();
  const { getToken } = useAuthState();
  const { notificationsService } = useNotificationsService();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState<string>(file?.description || "");
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [justSavedDescription, setJustSavedDescription] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [tagsValue, setTagsValue] = useState<string[]>(normalizeTags(file?.tags));
  const [isSavingTags, setIsSavingTags] = useState(false);
  const [justSavedTags, setJustSavedTags] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isResizeDialogOpen, setIsResizeDialogOpen] = useState(false);
  const [isOptimizeDialogOpen, setIsOptimizeDialogOpen] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [cropSelection, setCropSelection] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const cropStartRef = useRef<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [newFileName, setNewFileName] = useState(file?.name || "");
  const [newScopeUid, setNewScopeUid] = useState(file?.scopeUid || "");
  const [isRenaming, setIsRenaming] = useState(false);
  const [resizeWidth, setResizeWidth] = useState<string>("");
  const [resizeHeight, setResizeHeight] = useState<string>("");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const [cropWidth, setCropWidth] = useState<string>("");
  const [cropHeight, setCropHeight] = useState<string>("");
  const [cropX, setCropX] = useState<string>("");
  const [cropY, setCropY] = useState<string>("");
  const [isCropping, setIsCropping] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [transformError, setTransformError] = useState<string | null>(null);

  const isPdf = file ? isPdfFile(file) : false;
  const isVideo = file ? isVideoFile(file) : false;
  const fileUrl = file
    ? buildAbsoluteUrlWithCacheBust(file.location, file.size, file.updatedAt)
    : "";

  // Fetch PDF as blob and create object URL for inline viewing
  useEffect(() => {
    if (!isPdf || !open) {
      setPdfBlobUrl(null);
      return;
    }

    let isCancelled = false;
    setIsLoadingPdf(true);
    setPdfError(false);

    const fetchPdfBlob = async () => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        if (isCancelled) return;

        // Ensure the blob has PDF mime type for proper handling
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(pdfBlob);
        setPdfBlobUrl(blobUrl);
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to fetch PDF:", error);
          setPdfError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingPdf(false);
        }
      }
    };

    fetchPdfBlob();

    return () => {
      isCancelled = true;
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [isPdf, open, fileUrl]);

  // Cleanup blob URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  // Keep local description synced with the incoming file
  useEffect(() => {
    setDescription(file?.description || "");
    setIsEditingDescription(false);
    setTagsValue(normalizeTags(file?.tags));
    setIsEditingTags(false);
    setNewFileName(file?.name || "");
    setNewScopeUid(file?.scopeUid || "");
    setResizeWidth(file?.width ? String(file.width) : "");
    setResizeHeight(file?.height ? String(file.height) : "");
    setMaintainAspectRatio(true);
    setCropWidth("");
    setCropHeight("");
    setCropX("");
    setCropY("");
    setTransformError(null);
    setCropMode(false);
    setCropSelection(null);
    setIsRenameDialogOpen(false);
    setIsResizeDialogOpen(false);
    setIsOptimizeDialogOpen(false);
    setMenuAnchorEl(null);
    setIsEditingName(false);
    setIsEditingFolder(false);
  }, [file]);

  if (!file) return null;

  const currentTags = normalizeTags(file.tags);
  const normalizedTagsValue = normalizeTags(tagsValue);
  const areTagsUnchanged =
    currentTags.length === normalizedTagsValue.length &&
    currentTags.every((tag, index) => tag === normalizedTagsValue[index]);
  const mediaSettings = config?.settings ?? {};
  const optimizeSetting = (mediaSettings["Media.EnableOptimisation"] ?? "true")
    .toLowerCase()
    .trim();
  const optimizeEnabled = optimizeSetting === "true";
  const preferredFormatSetting = mediaSettings["Media.PreferredFormat"]?.trim();
  const preferredFormatLabel = preferredFormatSetting
    ? preferredFormatSetting.toUpperCase()
    : "the preferred format";
  const maxDimensionsSetting = mediaSettings["Media.Max.Dimensions"]?.trim();
  const maxDimensionsLabel = maxDimensionsSetting || "configured max dimensions";
  const coverDimensionsSetting = mediaSettings["Media.Cover.Dimensions"]?.trim();
  const coverDimensionsSuffix = coverDimensionsSetting ? ` (${coverDimensionsSetting})` : "";
  const coverDimensionsLabel = coverDimensionsSetting || "configured cover dimensions";
  const usageCount = file.usageCount ?? 0;
  const usageLabel = usageCount > 0 ? usageCount : 0;
  const hasNameChange = newFileName.trim() !== (file.name || "");
  const hasFolderChange = newScopeUid.trim() !== (file.scopeUid || "");
  const isCoverImage = currentTags.some((tag) => tag.toLowerCase() === "cover");
  const isImage = file.mimeType?.startsWith("image/") || false;
  const showOptimizeTooltip = !optimizeEnabled && isImage;

  const parseOptionalNumber = (value: string) => {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return undefined;
    return parsed;
  };

  const recalcHeightFromWidth = (value: string) => {
    if (!file?.width || !file?.height) return;
    if (!value.trim()) {
      setResizeHeight("");
      return;
    }
    const width = Number(value);
    if (Number.isNaN(width) || width <= 0) return;
    const height = Math.round((width * file.height) / file.width);
    setResizeHeight(String(height));
  };

  const recalcWidthFromHeight = (value: string) => {
    if (!file?.width || !file?.height) return;
    if (!value.trim()) {
      setResizeWidth("");
      return;
    }
    const height = Number(value);
    if (Number.isNaN(height) || height <= 0) return;
    const width = Math.round((height * file.width) / file.height);
    setResizeWidth(String(width));
  };

  const isMenuOpen = Boolean(menuAnchorEl);
  const enableCrop = false;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleCropStart = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!cropMode || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
    cropStartRef.current = { x, y };
    setCropSelection({ x, y, width: 0, height: 0 });
    setIsDraggingCrop(true);
  };

  const handleCropMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!cropMode || !isDraggingCrop || !imageRef.current || !cropStartRef.current) {
      return;
    }
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);
    const start = cropStartRef.current;
    const left = Math.min(start.x, x);
    const top = Math.min(start.y, y);
    const width = Math.abs(x - start.x);
    const height = Math.abs(y - start.y);
    setCropSelection({ x: left, y: top, width, height });
  };

  const handleCropEnd = () => {
    if (!cropMode) return;
    setIsDraggingCrop(false);
    cropStartRef.current = null;
  };

  const handleRename = async () => {
    if (!file.scopeUid || !file.name) {
      notificationsService.error("Missing file identifiers");
      return;
    }

    if (!newFileName.trim() || !newScopeUid.trim()) {
      notificationsService.error("New name and folder are required");
      return;
    }

    setIsRenaming(true);
    setTransformError(null);

    try {
      const response = await client.api.mediaRenameCreate({
        scopeUid: file.scopeUid,
        fileName: file.name,
        newScopeUid: newScopeUid.trim(),
        newFileName: newFileName.trim(),
      });

      if (response.error) {
        const err = response.error as ProblemDetails;
        throw new Error(err.detail || err.title || "Rename failed");
      }

      notificationsService.success("Media updated");

      if (response.data && onFileUpdate) {
        onFileUpdate(response.data);
      }
    } catch (error) {
      const apiError = parseApiError(error, "Failed to rename media");
      setTransformError(apiError.message);
      notificationsService.error(apiError.message);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleResize = async () => {
    if (!file.scopeUid || !file.name) {
      notificationsService.error("Missing file identifiers");
      return;
    }

    const width = parseOptionalNumber(resizeWidth);
    const height = parseOptionalNumber(resizeHeight);

    if (!width && !height) {
      notificationsService.error("Provide width or height");
      return;
    }

    setIsResizing(true);
    setTransformError(null);

    try {
      const response = await client.api.mediaResizeCreate({
        scopeUid: file.scopeUid,
        fileName: file.name,
        width: width ?? undefined,
        height: height ?? undefined,
        maintainAspectRatio,
      });

      if (response.error) {
        const err = response.error as ProblemDetails;
        throw new Error(err.detail || err.title || "Resize failed");
      }

      notificationsService.success("Media resized");

      if (response.data && onFileUpdate) {
        onFileUpdate(response.data);
      }
    } catch (error) {
      const apiError = parseApiError(error, "Failed to resize media");
      setTransformError(apiError.message);
      notificationsService.error(apiError.message);
    } finally {
      setIsResizing(false);
    }
  };

  const handleCrop = async (override?: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  }) => {
    if (!file.scopeUid || !file.name) {
      notificationsService.error("Missing file identifiers");
      return;
    }

    const width = override?.width ?? parseOptionalNumber(cropWidth);
    const height = override?.height ?? parseOptionalNumber(cropHeight);

    if (!width || !height) {
      notificationsService.error("Width and height are required");
      return;
    }

    setIsCropping(true);
    setTransformError(null);

    try {
      const response = await client.api.mediaCropCreate({
        scopeUid: file.scopeUid,
        fileName: file.name,
        width,
        height,
        x: override?.x ?? parseOptionalNumber(cropX) ?? null,
        y: override?.y ?? parseOptionalNumber(cropY) ?? null,
      });

      if (response.error) {
        const err = response.error as ProblemDetails;
        throw new Error(err.detail || err.title || "Crop failed");
      }

      notificationsService.success("Media cropped");

      if (response.data && onFileUpdate) {
        onFileUpdate(response.data);
      }
    } catch (error) {
      const apiError = parseApiError(error, "Failed to crop media");
      setTransformError(apiError.message);
      notificationsService.error(apiError.message);
    } finally {
      setIsCropping(false);
    }
  };

  const handleOptimize = async () => {
    if (!file.scopeUid || !file.name) {
      notificationsService.error("Missing file identifiers");
      return;
    }

    setIsOptimizing(true);
    setTransformError(null);

    try {
      const response = await client.api.mediaOptimizeCreate({
        scopeUid: file.scopeUid,
        fileName: file.name,
      });

      if (response.error) {
        const err = response.error as ProblemDetails;
        throw new Error(err.detail || err.title || "Optimize failed");
      }

      notificationsService.success("Media optimized");

      if (response.data && onFileUpdate) {
        onFileUpdate(response.data);
      }
    } catch (error) {
      const apiError = parseApiError(error, "Failed to optimize media");
      setTransformError(apiError.message);
      notificationsService.error(apiError.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCropConfirm = async () => {
    if (!cropSelection || !imageRef.current) {
      notificationsService.error("Select an area to crop");
      return;
    }

    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;
    const width = Math.max(1, Math.round(cropSelection.width * scaleX));
    const height = Math.max(1, Math.round(cropSelection.height * scaleY));
    const x = Math.max(0, Math.round(cropSelection.x * scaleX));
    const y = Math.max(0, Math.round(cropSelection.y * scaleY));

    setCropWidth(String(width));
    setCropHeight(String(height));
    setCropX(String(x));
    setCropY(String(y));

    await handleCrop({ width, height, x, y });
    setCropMode(false);
    setCropSelection(null);
  };

  const handleCropCancel = () => {
    setCropMode(false);
    setCropSelection(null);
    setIsDraggingCrop(false);
    cropStartRef.current = null;
  };

  const saveTags = async (tags: string[]) => {
    if (!file.scopeUid || !file.name) {
      notificationsService.error("Missing file identifiers");
      return null;
    }

    const formData = new FormData();
    formData.append("ScopeUid", file.scopeUid);
    formData.append("FileName", file.name);
    tags.forEach((tag) => formData.append("Tags", tag));

    const token = await getToken?.();
    const baseUrl = client.baseUrl || process.env.CORE_API || "";
    const response = await fetch(`${baseUrl}/api/media`, {
      method: "PATCH",
      headers: token ? { authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const responseData = await response
      .json()
      .catch(() => null as unknown as MediaDetailsDto | ProblemDetails | null);

    if (!response.ok) {
      const err = responseData as ProblemDetails | null;
      throw new Error(err?.detail || err?.title || "Save failed");
    }

    return responseData as MediaDetailsDto | null;
  };

  const handleCopyLink = () => {
    onCopyLink(file);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleReplaceMedia = async () => {
    // Get file extension for filtering - ensure no leading dot
    const currentExtension = (file.extension || (file.name ?? "").split(".").pop() || "")
      .toLowerCase()
      .replace(/^\./, "");

    // Create file input with extension filter
    const input = document.createElement("input");
    input.type = "file";
    input.accept = currentExtension ? `.${currentExtension}` : "*/*";

    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) {
        return;
      }

      const selectedFile = target.files[0];
      const selectedExtension = (selectedFile.name.split(".").pop() || "").toLowerCase();

      // Validate extension match
      if (currentExtension && selectedExtension !== currentExtension) {
        notificationsService.error(
          `File extension mismatch. Expected .${currentExtension}, got .${selectedExtension}`
        );
        input.remove();
        return;
      }

      setIsReplacing(true);
      setReplaceError(null);

      try {
        // Use new mediaPartialUpdate method to replace existing file
        if (!file.scopeUid || !file.name) {
          notificationsService.error("Missing file identifiers");
          return;
        }

        const response = await client.api.mediaPartialUpdate({
          File: selectedFile,
          ScopeUid: file.scopeUid,
          FileName: file.name,
        });

        if (response.error) {
          throw new Error(response.error.detail || response.error.title || "Upload failed");
        }

        notificationsService.success("Media file replaced successfully");

        // Use PATCH response to update preview immediately
        if (response.data && onFileUpdate) {
          onFileUpdate(response.data);
        }

        // Optionally, still call onReplace to refresh the media list elsewhere
        if (onReplace) {
          onReplace(file);
        }

        // Don't close the dialog - keep it open with updated file
      } catch (error) {
        // Parse API error to get details
        const parsedError = parseApiError(error, "Failed to replace media file");

        // Store the error for display (try to preserve original structure for ApiErrorDisplay)
        const apiError = error as {
          error?: { errors?: Record<string, string[]> };
          errors?: Record<string, string[]>;
        };
        if (apiError?.error?.errors || apiError?.errors) {
          // If we have structured validation errors, pass them to ApiErrorDisplay
          const structuredError: ApiError = {
            status: parsedError.status || 422,
            title: parsedError.title || parsedError.message,
            message: parsedError.message,
            errors: apiError?.error?.errors || apiError?.errors,
          };
          setReplaceError(structuredError);
        } else {
          // Otherwise, use the parsed error message
          setReplaceError(parsedError.message);
        }

        // Show notification with concise error
        const errorSummary =
          parsedError.details.length > 0
            ? parsedError.details[0] // Show first validation error
            : parsedError.message;
        notificationsService.error(`Failed to upload ${selectedFile.name}: ${errorSummary}`);
      } finally {
        setIsReplacing(false);
        input.remove();
      }
    };

    input.click();
  };

  // Navigation button style (match preview tab style)
  const navButtonProps = {
    variant: "contained" as const,
    size: "small" as const,
    sx: { minWidth: 32, minHeight: 40, borderRadius: 2 },
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "stretch", width: "100%" }}>
          {/* Left nav button space */}
          <Box sx={{ width: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {hasPrev && (
              <Button onClick={onPrev} {...navButtonProps}>
                {"<"}
              </Button>
            )}
          </Box>
          {/* Main content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isPdf && <PictureAsPdfIcon color="error" />}
              {isVideo && <MovieIcon color="secondary" />}
              {file.name}
            </DialogTitle>
            <DialogContent>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Preview" />
                <Tab label="Details" />
              </Tabs>
              {transformError && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {transformError}
                </Typography>
              )}
              {tab === 0 && (
                <Box
                  sx={{
                    width: "100%",
                    height: "60vh",
                    bgcolor: "#f5f5f5",
                    borderRadius: 2,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <IconButton
                    onClick={handleMenuOpen}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 2,
                      bgcolor: "rgba(255, 255, 255, 0.9)",
                      "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={handleMenuClose}>
                    <MenuItem
                      onClick={() => {
                        setIsRenameDialogOpen(true);
                        handleMenuClose();
                      }}
                    >
                      Move / Rename
                    </MenuItem>
                    <Divider />
                    <Tooltip
                      title={
                        isCoverImage ? (
                          <Typography variant="caption" color="inherit">
                            Cover images have a fixed size{coverDimensionsSuffix} and cannot be
                            resized.
                          </Typography>
                        ) : (
                          ""
                        )
                      }
                      disableHoverListener={!isCoverImage}
                      disableFocusListener={!isCoverImage}
                      disableTouchListener={!isCoverImage}
                    >
                      <span>
                        <MenuItem
                          disabled={!isImage || isCoverImage}
                          onClick={() => {
                            setIsResizeDialogOpen(true);
                            handleMenuClose();
                          }}
                        >
                          Resize
                        </MenuItem>
                      </span>
                    </Tooltip>
                    {enableCrop &&
                      (cropMode ? (
                        <MenuItem
                          onClick={() => {
                            handleCropCancel();
                            handleMenuClose();
                          }}
                        >
                          Exit Crop
                        </MenuItem>
                      ) : (
                        <MenuItem
                          disabled={!isImage}
                          onClick={() => {
                            setCropMode(true);
                            setCropSelection(null);
                            handleMenuClose();
                          }}
                        >
                          Crop
                        </MenuItem>
                      ))}
                    <Tooltip
                      title={
                        showOptimizeTooltip ? (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Typography variant="caption" color="inherit">
                              Optimization is disabled in Media settings.
                            </Typography>
                            <Link
                              href="/settings?tab=media"
                              underline="always"
                              target="_blank"
                              rel="noreferrer"
                              color="inherit"
                              sx={{ alignSelf: "flex-start" }}
                            >
                              Media settings
                            </Link>
                          </Box>
                        ) : (
                          ""
                        )
                      }
                      disableHoverListener={!showOptimizeTooltip}
                      disableFocusListener={!showOptimizeTooltip}
                      disableTouchListener={!showOptimizeTooltip}
                    >
                      <span>
                        <MenuItem
                          disabled={!isImage || !optimizeEnabled || isOptimizing}
                          onClick={async () => {
                            handleMenuClose();
                            setIsOptimizeDialogOpen(true);
                          }}
                        >
                          {isOptimizing ? "Optimizing..." : "Optimize"}
                        </MenuItem>
                      </span>
                    </Tooltip>
                  </Menu>
                  {isPdf ? (
                    isLoadingPdf ? (
                      <Box sx={{ textAlign: "center", p: 4 }}>
                        <CircularProgress size={48} sx={{ mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          Loading PDF...
                        </Typography>
                      </Box>
                    ) : pdfError || !pdfBlobUrl ? (
                      <Box sx={{ textAlign: "center", p: 4 }}>
                        <PictureAsPdfIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          PDF Preview Not Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Unable to display PDF preview. You can download the file to view it.
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          onClick={() => onDownload(file)}
                        >
                          Download PDF
                        </Button>
                      </Box>
                    ) : (
                      <Box
                        component="iframe"
                        src={`${pdfBlobUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                        title={`PDF Preview: ${file.name}`}
                        onError={() => setPdfError(true)}
                        sx={{ width: "100%", height: "100%", border: "none" }}
                      />
                    )
                  ) : isVideo ? (
                    videoError ? (
                      <Box sx={{ textAlign: "center", p: 4 }}>
                        <MovieIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          Video Preview Not Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Unable to display video preview. You can download the file to view it.
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          onClick={() => onDownload(file)}
                        >
                          Download Video
                        </Button>
                      </Box>
                    ) : (
                      <Box
                        component="video"
                        src={fileUrl}
                        controls
                        onError={() => setVideoError(true)}
                        preload="metadata"
                        sx={{
                          width: "100%",
                          height: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      >
                        Your browser does not support the video tag.
                      </Box>
                    )
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          component="img"
                          src={fileUrl || "/images/placeholder.svg"}
                          alt={file.name}
                          ref={imageRef}
                          sx={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                        {cropMode && (
                          <Box
                            sx={{ position: "absolute", inset: 0, cursor: "crosshair" }}
                            onMouseDown={handleCropStart}
                            onMouseMove={handleCropMove}
                            onMouseUp={handleCropEnd}
                            onMouseLeave={handleCropEnd}
                          >
                            {cropSelection && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  left: cropSelection.x,
                                  top: cropSelection.y,
                                  width: cropSelection.width,
                                  height: cropSelection.height,
                                  border: "2px solid #1976d2",
                                  backgroundColor: "rgba(25, 118, 210, 0.15)",
                                }}
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                  {enableCrop && cropMode && isImage && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 16,
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        gap: 1,
                      }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleCropConfirm}
                        disabled={!cropSelection || isCropping}
                        startIcon={isCropping ? <CircularProgress size={14} /> : undefined}
                      >
                        {isCropping ? "Cropping..." : "Confirm Crop"}
                      </Button>
                      <Button variant="outlined" size="small" onClick={handleCropCancel}>
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
              {tab === 1 && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      URL
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                      <TextField
                        fullWidth
                        value={buildAbsoluteUrlWithCacheBust(
                          file.location,
                          file.size,
                          file.updatedAt
                        )}
                        slotProps={{
                          input: {
                            readOnly: true,
                          },
                        }}
                        size="small"
                        sx={{
                          "& .MuiInputBase-input": {
                            fontSize: 14,
                            backgroundColor: "#fafafa",
                          },
                        }}
                        aria-label="File URL"
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleCopyLink}
                        sx={{ flexShrink: 0 }}
                      >
                        {linkCopied ? "Copied!" : "Copy"}
                      </Button>
                    </Box>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 7 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Name
                          </Typography>
                          {!isEditingName ? (
                            <Box
                              onClick={() => setIsEditingName(true)}
                              sx={{
                                cursor: "pointer",
                                px: 0,
                                py: 0.5,
                                borderRadius: 1,
                                "&:hover": { backgroundColor: "action.hover" },
                              }}
                            >
                              <Typography>{file.name}</Typography>
                            </Box>
                          ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                              <TextField
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                size="small"
                                fullWidth
                              />
                              <Typography variant="caption" color="text.secondary">
                                Renaming updates file references. This file appears in at least
                                {` ${usageLabel} `}
                                place(s), and the CMS will attempt to update them.
                              </Typography>
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={async () => {
                                    await handleRename();
                                    setIsEditingName(false);
                                  }}
                                  disabled={!hasNameChange || isRenaming}
                                  startIcon={
                                    isRenaming ? <CircularProgress size={14} /> : undefined
                                  }
                                >
                                  {isRenaming ? "Renaming..." : "Rename"}
                                </Button>
                                <Button
                                  variant="text"
                                  size="small"
                                  onClick={() => {
                                    setNewFileName(file.name || "");
                                    setIsEditingName(false);
                                  }}
                                  disabled={isRenaming}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </Box>
                          )}
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Folder
                          </Typography>
                          {!isEditingFolder ? (
                            <Box
                              onClick={() => setIsEditingFolder(true)}
                              sx={{
                                cursor: "pointer",
                                px: 0,
                                py: 0.5,
                                borderRadius: 1,
                                "&:hover": { backgroundColor: "action.hover" },
                              }}
                            >
                              <Typography>{file.scopeUid || "-"}</Typography>
                            </Box>
                          ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                              <TextField
                                value={newScopeUid}
                                onChange={(e) => setNewScopeUid(e.target.value)}
                                size="small"
                                fullWidth
                              />
                              <Typography variant="caption" color="text.secondary">
                                Moving updates file references. This file appears in at least
                                {` ${usageLabel} `}
                                place(s), and the CMS will attempt to update them.
                              </Typography>
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={async () => {
                                    await handleRename();
                                    setIsEditingFolder(false);
                                  }}
                                  disabled={!hasFolderChange || isRenaming}
                                  startIcon={
                                    isRenaming ? <CircularProgress size={14} /> : undefined
                                  }
                                >
                                  {isRenaming ? "Moving..." : "Move"}
                                </Button>
                                <Button
                                  variant="text"
                                  size="small"
                                  onClick={() => {
                                    setNewScopeUid(file.scopeUid || "");
                                    setIsEditingFolder(false);
                                  }}
                                  disabled={isRenaming}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </Box>
                          )}
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Description
                          </Typography>
                          {!isEditingDescription ? (
                            <Box
                              onClick={() => setIsEditingDescription(true)}
                              sx={{
                                cursor: "pointer",
                                px: 0,
                                py: 0.5,
                                borderRadius: 1,
                                "&:hover": { backgroundColor: "action.hover" },
                              }}
                            >
                              <Typography sx={{ whiteSpace: "pre-line" }}>
                                {description?.trim() ? description : "Click to add description"}
                              </Typography>
                              {justSavedDescription && (
                                <Typography
                                  variant="caption"
                                  sx={{ color: "success.main", mt: 0.5, display: "block" }}
                                >
                                  Saved
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                              <TextField
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter description"
                                size="small"
                                multiline
                                minRows={2}
                                maxRows={6}
                                fullWidth
                              />
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={async () => {
                                    try {
                                      setIsSavingDescription(true);
                                      if (!file.scopeUid || !file.name) {
                                        notificationsService.error("Missing file identifiers");
                                        return;
                                      }

                                      const response = await client.api.mediaPartialUpdate({
                                        ScopeUid: file.scopeUid,
                                        FileName: file.name,
                                        Description: description,
                                      });

                                      if (response.error) {
                                        const err = response.error as ProblemDetails;
                                        throw new Error(err.detail || err.title || "Save failed");
                                      }

                                      notificationsService.success("Description saved");
                                      setIsEditingDescription(false);
                                      setJustSavedDescription(true);
                                      setTimeout(() => setJustSavedDescription(false), 2000);

                                      if (response.data && onFileUpdate) {
                                        onFileUpdate(response.data);
                                      }
                                    } catch (error) {
                                      const apiError = error as { message?: string };
                                      const errorMessage =
                                        apiError.message || "Failed to save description";
                                      notificationsService.error(errorMessage);
                                    } finally {
                                      setIsSavingDescription(false);
                                    }
                                  }}
                                  disabled={
                                    isSavingDescription || description === (file.description || "")
                                  }
                                  startIcon={
                                    isSavingDescription ? <CircularProgress size={14} /> : undefined
                                  }
                                >
                                  Confirm
                                </Button>
                                <Button
                                  variant="text"
                                  size="small"
                                  onClick={() => {
                                    setDescription(file.description || "");
                                    setIsEditingDescription(false);
                                  }}
                                  disabled={isSavingDescription}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </Box>
                          )}
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Tags
                          </Typography>
                          {!isEditingTags ? (
                            <Box
                              onClick={() => setIsEditingTags(true)}
                              sx={{
                                cursor: "pointer",
                                px: 0,
                                py: 0.5,
                                borderRadius: 1,
                                "&:hover": { backgroundColor: "action.hover" },
                              }}
                            >
                              {currentTags.length > 0 ? (
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                  {currentTags.map((tag) => (
                                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                                  ))}
                                </Stack>
                              ) : (
                                <Typography color="text.secondary">Click to add tags</Typography>
                              )}
                              {justSavedTags && (
                                <Typography
                                  variant="caption"
                                  sx={{ color: "success.main", mt: 0.5, display: "block" }}
                                >
                                  Saved
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                              <Autocomplete
                                multiple
                                freeSolo
                                options={[]}
                                value={tagsValue}
                                onChange={(_, newValue) => setTagsValue(newValue)}
                                renderTags={(value, getTagProps) =>
                                  value.map((option, index) => {
                                    const { key, ...tagProps } = getTagProps({ index });
                                    return (
                                      <Chip
                                        key={key}
                                        variant="outlined"
                                        label={option}
                                        size="small"
                                        {...tagProps}
                                      />
                                    );
                                  })
                                }
                                renderInput={(params) => (
                                  <TextField {...params} placeholder="Add tag" size="small" />
                                )}
                              />
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={async () => {
                                    try {
                                      setIsSavingTags(true);
                                      if (!file.scopeUid || !file.name) {
                                        notificationsService.error("Missing file identifiers");
                                        return;
                                      }

                                      const responseData = await saveTags(normalizedTagsValue);

                                      notificationsService.success("Tags saved");
                                      setIsEditingTags(false);
                                      setJustSavedTags(true);
                                      setTimeout(() => setJustSavedTags(false), 2000);

                                      if (responseData && onFileUpdate) {
                                        onFileUpdate(responseData);
                                      }
                                    } catch (error) {
                                      const apiError = error as { message?: string };
                                      const errorMessage =
                                        apiError.message || "Failed to save tags";
                                      notificationsService.error(errorMessage);
                                    } finally {
                                      setIsSavingTags(false);
                                    }
                                  }}
                                  disabled={isSavingTags || areTagsUnchanged}
                                  startIcon={
                                    isSavingTags ? <CircularProgress size={14} /> : undefined
                                  }
                                >
                                  Confirm
                                </Button>
                                <Button
                                  variant="text"
                                  size="small"
                                  onClick={() => {
                                    setTagsValue(currentTags);
                                    setIsEditingTags(false);
                                  }}
                                  disabled={isSavingTags}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </Box>
                          )}
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Type
                          </Typography>
                          <Typography>{file.mimeType}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Modified
                          </Typography>
                          <Typography>{file.updatedAt || file.createdAt}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Dimensions
                          </Typography>
                          <Typography>
                            {file.width && file.height ? `${file.width} × ${file.height}px` : "-"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Current size
                          </Typography>
                          <Typography>{formatFileSize(file.size)}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Original size
                          </Typography>
                          <Typography>{formatFileSize(file.originalSize ?? undefined)}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Original name
                          </Typography>
                          <Typography>{file.originalName || "-"}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Created
                          </Typography>
                          <Typography>{file.createdAt || "-"}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Extension
                          </Typography>
                          <Typography>
                            {file.extension || file.name?.split(".").pop() || "-"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
              {replaceError && <ApiErrorDisplay error={replaceError} fileName={file.name} />}
            </DialogContent>
            <DialogActions sx={{ gap: 2, px: 3, pb: 2 }}>
              <Button onClick={onClose} variant="outlined">
                Close
              </Button>
              <Button
                onClick={() => onDownload(file)}
                variant="outlined"
                startIcon={<DownloadIcon />}
              >
                Download
              </Button>
              <Button
                onClick={handleReplaceMedia}
                variant="outlined"
                startIcon={isReplacing ? <CircularProgress size={16} /> : <SwapHorizIcon />}
                disabled={isReplacing}
              >
                {isReplacing ? "Replacing..." : "Replace Media"}
              </Button>
              <Button onClick={handleCopyLink} variant="contained" startIcon={<FileCopyIcon />}>
                {linkCopied ? "Copied!" : "Copy Link"}
              </Button>
            </DialogActions>
          </Box>
          {/* Right nav button space */}
          <Box sx={{ width: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {hasNext && (
              <Button onClick={onNext} {...navButtonProps}>
                {">"}
              </Button>
            )}
          </Box>
        </Box>
      </Dialog>

      <Dialog
        open={isRenameDialogOpen}
        onClose={() => setIsRenameDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Move / Rename</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2, overflow: "visible" }}
        >
          <Typography variant="body2" color="text.secondary">
            This will update the file name and/or folder and attempt to update references. The file
            appears in at least {usageLabel} place(s).
          </Typography>
          <TextField
            label="New name"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            size="small"
            fullWidth
          />
          <TextField
            label="New folder (scope uid)"
            value={newScopeUid}
            onChange={(e) => setNewScopeUid(e.target.value)}
            size="small"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRenameDialogOpen(false)} variant="text">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await handleRename();
              setIsRenameDialogOpen(false);
            }}
            variant="contained"
            disabled={isRenaming || (!hasNameChange && !hasFolderChange)}
            startIcon={isRenaming ? <CircularProgress size={14} /> : undefined}
          >
            {isRenaming
              ? "Updating..."
              : hasNameChange && hasFolderChange
              ? "Rename & Move"
              : hasNameChange
              ? "Rename"
              : hasFolderChange
              ? "Move"
              : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isResizeDialogOpen}
        onClose={() => setIsResizeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Resize Image</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2, overflow: "visible" }}
        >
          <Typography variant="body2" color="text.secondary">
            Resize always uses the original uploaded image, not the current version.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <TextField
              label="Width"
              value={resizeWidth}
              onChange={(e) => {
                const value = e.target.value;
                setResizeWidth(value);
                if (maintainAspectRatio) {
                  recalcHeightFromWidth(value);
                }
              }}
              size="small"
              type="number"
              sx={{ width: 140 }}
            />
            <TextField
              label="Height"
              value={resizeHeight}
              onChange={(e) => {
                const value = e.target.value;
                setResizeHeight(value);
                if (maintainAspectRatio) {
                  recalcWidthFromHeight(value);
                }
              }}
              size="small"
              type="number"
              sx={{ width: 140 }}
            />
          </Stack>
          <FormControlLabel
            control={
              <Switch
                checked={maintainAspectRatio}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setMaintainAspectRatio(checked);
                  if (!checked) return;
                  if (resizeWidth.trim()) {
                    recalcHeightFromWidth(resizeWidth);
                    return;
                  }
                  if (resizeHeight.trim()) {
                    recalcWidthFromHeight(resizeHeight);
                  }
                }}
              />
            }
            label="Maintain ratio"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsResizeDialogOpen(false)} variant="text">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await handleResize();
              setIsResizeDialogOpen(false);
            }}
            variant="contained"
            disabled={isResizing}
            startIcon={isResizing ? <CircularProgress size={14} /> : undefined}
          >
            {isResizing ? "Resizing..." : "Resize"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isOptimizeDialogOpen}
        onClose={() => setIsOptimizeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Optimize Image</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            We convert the image to {preferredFormatLabel}, update references if the file name
            changes, and apply size constraints.{" "}
            {isCoverImage ? (
              <>
                Cover images are fit into a fixed size {coverDimensionsLabel} with a crop if needed
                to preserve aspect ratio.
              </>
            ) : (
              <>
                Images are resized to stay within {maxDimensionsLabel} while keeping aspect ratio.
              </>
            )}
          </Typography>
          {usageLabel > 0 ? (
            <Typography variant="body2" color="text.secondary">
              This image is used in{" "}
              <Box component="span" sx={{ fontWeight: 600 }}>
                {usageLabel}
              </Box>{" "}
              place(s). We will attempt to refactor those references after optimization.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              It seems like this image is not used anywhere. We will check again and replace any
              usages if found.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOptimizeDialogOpen(false)} variant="text">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await handleOptimize();
              setIsOptimizeDialogOpen(false);
            }}
            variant="contained"
            disabled={isOptimizing || !optimizeEnabled}
            startIcon={isOptimizing ? <CircularProgress size={14} /> : undefined}
          >
            {isOptimizing ? "Optimizing..." : "Optimize"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
