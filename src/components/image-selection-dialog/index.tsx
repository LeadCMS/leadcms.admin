import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
  Alert,
  Stack,
  Link,
} from "@mui/material";
import { Upload, Trash2, Image as ImageIcon, ExternalLink, Sparkles } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { buildAbsoluteUrl, buildAbsoluteUrlWithCacheBustKey } from "@lib/network/utils";
import { ImageSelectionDialog } from "./image-selection-dialog";

export interface CoverImageEditorProps {
  value: string | null | undefined;
  onChange: (imageUrl: string | null) => void;
  onError?: (error: string) => void;
  contentSlug?: string;
  disabled?: boolean;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
  onGenerateWithAI?: () => void;
  onEditWithAI?: () => void;
  generateWithAIDisabled?: boolean;
  previewCacheKey?: string | number | null;
}

interface UploadStatus {
  status: "idle" | "uploading" | "success" | "error";
  progress?: number;
  error?: string;
}

export const CoverImageEditor: React.FC<CoverImageEditorProps> = ({
  value,
  onChange,
  onError,
  contentSlug,
  disabled = false,
  maxFileSize = 512 * 1024, // 512KB default
  acceptedFileTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
  onGenerateWithAI,
  onEditWithAI,
  generateWithAIDisabled = false,
  previewCacheKey,
}) => {
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: "idle" });
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [ignoreFileRejections, setIgnoreFileRejections] = useState(false);
  const [isReplaceMode, setIsReplaceMode] = useState(false);

  const hasImage = Boolean(value && value.trim());
  const previewUrl = hasImage ? buildAbsoluteUrlWithCacheBustKey(value, previewCacheKey) : "";

  // Helper function to check if error is file-size related and add "Learn why" link
  const formatErrorWithLearnMore = (message: string, isReplace = false): React.ReactNode => {
    const isFileSizeError =
      message.toLowerCase().includes("file size") ||
      message.toLowerCase().includes("too large") ||
      message.toLowerCase().includes("file length") ||
      message.toLowerCase().includes("size limit");

    // Only show "Previous image kept" if we're replacing AND there's actually an image
    const shouldShowKeptMessage = isReplace && hasImage;

    let finalMessage = message;
    if (shouldShowKeptMessage && isFileSizeError) {
      finalMessage = `${message}. Previous image kept`;
    }

    if (isFileSizeError) {
      return (
        <>
          {finalMessage}{" "}
          <Link
            href="https://leadcms.ai/blog/image-optimization-for-content-editors/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: "inherit", textDecoration: "underline" }}
          >
            Learn why there is a limit
          </Link>
        </>
      );
    }

    if (shouldShowKeptMessage) {
      return `${finalMessage}. Previous image kept`;
    }

    return finalMessage;
  };

  // Helper function to extract meaningful error messages from server responses
  const extractErrorMessage = (error: unknown): string => {
    // Handle structured API error responses
    if (error && typeof error === "object" && "error" in error) {
      const apiError = error.error as {
        title?: string;
        message?: string;
        errors?: Record<string, string[]>;
      };

      // Handle validation errors with detailed field information
      if (apiError.errors && typeof apiError.errors === "object") {
        const errorMessages: string[] = [];

        // Extract all field errors
        Object.entries(apiError.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg: string) => {
              // Clean up the error message to be more user-friendly
              let cleanMsg = msg;

              // Convert technical field names to user-friendly terms
              if (field === "File") {
                cleanMsg = msg.replace("Invalid file length", "File size limit exceeded");
              }

              errorMessages.push(cleanMsg);
            });
          }
        });

        if (errorMessages.length > 0) {
          return errorMessages.join(". ");
        }
      }

      // Fallback to title or message
      if (apiError.title) return apiError.title;
      if (apiError.message) return apiError.message;
    }

    // Handle basic Error objects
    if (error instanceof Error) {
      return error.message;
    }

    // Handle string errors
    if (typeof error === "string") {
      return error;
    }

    // Default fallback
    return "Failed to upload image";
  };

  const handleUpload = async (file: File, isReplace = false) => {
    if (disabled) return;

    // Clear all previous errors and reset state before validation
    setUploadStatus({ status: "idle", error: undefined });
    setClientError(null);
    setIgnoreFileRejections(false);
    setIsReplaceMode(isReplace);

    // Validate file size client-side before attempting upload
    if (file.size > maxFileSize) {
      const sizeLimit =
        maxFileSize >= 1024 * 1024
          ? `${(maxFileSize / 1024 / 1024).toFixed(1)}MB`
          : `${Math.round(maxFileSize / 1024)}KB`;
      const errorMsg = `File is too large. Maximum size is ${sizeLimit}`;
      setClientError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Validate file type client-side
    if (!acceptedFileTypes.includes(file.type)) {
      const errorMsg = `Invalid file type. Please use: ${acceptedFileTypes.join(", ")}`;
      setClientError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Start upload
    setUploadStatus({ status: "uploading", progress: 0, error: undefined });
    setClientError(null); // Ensure client error is cleared when starting upload

    try {
      // Determine scope based on content slug
      const scopeUid = contentSlug ? contentSlug.replace(/^\/+|\/+$/g, "") : "cover-images";

      const response = await client.api.mediaCreate({
        File: file,
        ScopeUid: scopeUid,
        Tags: ["Cover"],
      });

      if (response.error) {
        throw new Error(response.error.title || "Upload failed");
      }

      if (!response.data?.location) {
        throw new Error("Upload completed but no file location received");
      }

      // Clear all errors on successful upload
      setUploadStatus({ status: "success", error: undefined });
      setClientError(null);
      setIsReplaceMode(false);
      setIgnoreFileRejections(true); // Ignore old file rejections after success

      onChange(response.data.location);
      notificationsService.success("Cover image uploaded successfully");
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      setUploadStatus({ status: "error", error: errorMessage });
      setClientError(null); // Clear client errors when showing server error
      onError?.(errorMessage);

      // Error is now shown inline via Alert component, no need for notification
    }
  };

  const handleRemove = () => {
    if (disabled) return;
    onChange(null);
    // Clear ALL error states when removing image
    setUploadStatus({ status: "idle", error: undefined });
    setClientError(null);
    setIgnoreFileRejections(true); // Ignore any existing file rejections
  };

  const handleGallerySelect = (imageUrl: string) => {
    // Clear ALL error states FIRST before setting new image
    setUploadStatus({ status: "idle", error: undefined });
    setClientError(null);
    setIgnoreFileRejections(true); // Ignore any existing file rejections
    setIsReplaceMode(false); // Reset replace mode

    // Then set the new image and close gallery
    onChange(imageUrl);
    setGalleryOpen(false);
  };

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: (acceptedFiles) => {
      // Clear previous errors and reset ignore flag when new files are dropped
      setUploadStatus({ status: "idle", error: undefined });
      setClientError(null);
      setIgnoreFileRejections(false);

      if (acceptedFiles.length > 0) {
        // Drag & drop is always considered "replace" when there's already an image
        handleUpload(acceptedFiles[0], hasImage);
      }
    },
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: 1,
    maxSize: maxFileSize,
    disabled: disabled || uploadStatus.status === "uploading",
  });

  // Handle file rejections (show errors below drop zone like server errors)
  React.useEffect(() => {
    // If we're ignoring rejections (after successful gallery select), don't show errors
    if (ignoreFileRejections) {
      setClientError(null);
      return;
    }

    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      const error = rejection.errors[0];
      let message = "File upload rejected";

      switch (error.code) {
        case "file-too-large":
          message = `File is too large. Maximum size is ${
            maxFileSize >= 1024 * 1024
              ? `${(maxFileSize / 1024 / 1024).toFixed(1)}MB`
              : `${Math.round(maxFileSize / 1024)}KB`
          }`;
          break;
        case "file-invalid-type":
          message = `Invalid file type. Please use: ${acceptedFileTypes.join(", ")}`;
          break;
        case "too-many-files":
          message = "Please select only one image";
          break;
        default:
          message = error.message || "File upload rejected";
      }

      // Show error below the drop zone instead of notification
      setClientError(message);
      onError?.(message);
    }
    // Don't clear clientError in else block - it might be set by handleUpload validation
    // Only clear it explicitly when ignoring rejections
  }, [fileRejections, maxFileSize, acceptedFileTypes, onError, ignoreFileRejections]);

  const renderUploadArea = () => (
    <Box
      {...getRootProps()}
      sx={{
        border: "2px dashed",
        borderColor: isDragActive ? "primary.main" : "grey.300",
        borderRadius: 2,
        p: 4,
        textAlign: "center",
        cursor: disabled || uploadStatus.status === "uploading" ? "not-allowed" : "pointer",
        bgcolor: isDragActive ? "action.hover" : "background.default",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: "action.hover",
        },
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <input {...getInputProps()} />
      <Stack spacing={2} alignItems="center">
        {uploadStatus.status === "uploading" ? (
          <>
            <CircularProgress size={40} />
            <Typography variant="body1">Uploading...</Typography>
            {uploadStatus.progress !== undefined && uploadStatus.progress > 0 && (
              <Typography variant="body2" color="text.secondary">
                {Math.round(uploadStatus.progress)}% complete
              </Typography>
            )}
          </>
        ) : (
          <>
            <Upload size={40} color="gray" />
            <Typography variant="body1">
              {isDragActive
                ? "Drop the image here"
                : "Drag & drop an image here, or click to select"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {"Max size: "}
              {maxFileSize >= 1024 * 1024
                ? `${(maxFileSize / 1024 / 1024).toFixed(1)}MB`
                : `${Math.round(maxFileSize / 1024)}KB`}
              <br />
              Supported: AVIF, WebP, JPEG, PNG, GIF
            </Typography>
          </>
        )}
      </Stack>
    </Box>
  );

  const renderImagePreview = () => (
    <Paper
      elevation={2}
      sx={{
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        aspectRatio: "16/9",
        minHeight: 200,
      }}
    >
      {uploadStatus.status === "uploading" ? (
        // Show upload progress when replacing image
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.100",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={40} />
            <Typography variant="body1">Uploading...</Typography>
            {uploadStatus.progress !== undefined && uploadStatus.progress > 0 && (
              <Typography variant="body2" color="text.secondary">
                {Math.round(uploadStatus.progress)}% complete
              </Typography>
            )}
          </Stack>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "grey.50",
            }}
          >
            <Box
              component="img"
              src={previewUrl}
              alt="Cover image"
              sx={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
              onError={(e) => {
                // Handle broken image
                e.currentTarget.style.display = "none";
                onError?.("Failed to load image");
              }}
            />
          </Box>

          {/* Overlay controls */}
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              display: "flex",
              gap: 1,
            }}
          >
            <IconButton
              size="small"
              onClick={() => window.open(buildAbsoluteUrl(value || ""), "_blank")}
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.8)" },
              }}
            >
              <ExternalLink size={16} />
            </IconButton>

            {!disabled && (
              <IconButton
                size="small"
                onClick={handleRemove}
                sx={{
                  bgcolor: "rgba(255, 0, 0, 0.6)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(255, 0, 0, 0.8)" },
                }}
              >
                <Trash2 size={16} />
              </IconButton>
            )}
          </Box>
        </>
      )}
    </Paper>
  );

  return (
    <Stack spacing={2}>
      <Box>{hasImage ? renderImagePreview() : renderUploadArea()}</Box>

      {uploadStatus.status === "error" && (
        <Alert severity="error">
          {formatErrorWithLearnMore(
            uploadStatus.error || "Upload failed. Please try again.",
            isReplaceMode
          )}
        </Alert>
      )}

      {clientError && (
        <Alert severity="error">{formatErrorWithLearnMore(clientError, isReplaceMode)}</Alert>
      )}

      {!disabled && (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {hasImage && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Upload />}
              onClick={() => document.getElementById("cover-image-file-input")?.click()}
              disabled={uploadStatus.status === "uploading"}
            >
              Replace
            </Button>
          )}

          <Button
            variant="outlined"
            size="small"
            startIcon={<ImageIcon />}
            onClick={() => setGalleryOpen(true)}
            disabled={uploadStatus.status === "uploading"}
          >
            Select from Media
          </Button>

          {onGenerateWithAI && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Sparkles />}
              onClick={onGenerateWithAI}
              disabled={uploadStatus.status === "uploading" || generateWithAIDisabled}
            >
              Generate with AI
            </Button>
          )}

          {hasImage && onEditWithAI && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Sparkles />}
              onClick={onEditWithAI}
              disabled={uploadStatus.status === "uploading" || generateWithAIDisabled}
            >
              Edit with AI
            </Button>
          )}

          {hasImage && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<Trash2 />}
              onClick={handleRemove}
              disabled={uploadStatus.status === "uploading"}
            >
              Remove
            </Button>
          )}
        </Stack>
      )}

      {/* Hidden file input for replace action */}
      <Box
        component="input"
        id="cover-image-file-input"
        type="file"
        accept={acceptedFileTypes.join(",")}
        sx={{ display: "none" }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files && e.target.files[0]) {
            // Let handleUpload manage all state - don't clear errors prematurely
            // This is always a replace operation since button is only shown when hasImage is true
            handleUpload(e.target.files[0], true);
            // Reset file input so the same file can be selected again
            e.target.value = "";
          }
        }}
      />

      {/* Image Selection Dialog */}
      <ImageSelectionDialog
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onSelect={handleGallerySelect}
        initialFolder={contentSlug ? contentSlug.replace(/^\/+|\/+$/g, "") : ""}
      />
    </Stack>
  );
};

export default CoverImageEditor;
