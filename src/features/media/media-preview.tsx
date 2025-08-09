import { useState, useEffect } from "react";
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
import DownloadIcon from "@mui/icons-material/Download";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MovieIcon from "@mui/icons-material/Movie";
import { buildAbsoluteUrlWithCacheBust } from "@lib/network/utils";
import { MediaDetailsDto, ProblemDetails } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { ApiErrorDisplay } from "@components/api-error-display";

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
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState<string>(file?.description || "");
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [justSavedDescription, setJustSavedDescription] = useState(false);

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
  }, [file]);

  if (!file) return null;

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
        const apiError = error as { message?: string };
        const errorMessage = apiError.message || "Failed to replace media file";
        setReplaceError(errorMessage);
        notificationsService.error(errorMessage);
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
                    <iframe
                      src={`${pdfBlobUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                      width="100%"
                      height="100%"
                      style={{ border: "none" }}
                      title={`PDF Preview: ${file.name}`}
                      onError={() => setPdfError(true)}
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
                    <video
                      src={fileUrl}
                      controls
                      style={{
                        width: "100%",
                        height: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                      onError={() => setVideoError(true)}
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )
                ) : (
                  <img
                    src={fileUrl || "/images/placeholder.svg"}
                    alt={file.name}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  />
                )}
              </Box>
            )}
            {tab === 1 && (
              <Box sx={{ mt: 2 }}>
                {/* Details in rows */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Name
                    </Typography>
                    <Typography>{file.name}</Typography>
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
                      Size
                    </Typography>
                    <Typography>{formatFileSize(file.size)}</Typography>
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
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      URL
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <input
                        type="text"
                        value={buildAbsoluteUrlWithCacheBust(
                          file.location,
                          file.size,
                          file.updatedAt
                        )}
                        readOnly
                        style={{
                          flex: 1,
                          padding: 6,
                          fontSize: 14,
                          border: "1px solid #eee",
                          borderRadius: 4,
                          background: "#fafafa",
                        }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleCopyLink}
                        sx={{ ml: 1 }}
                      >
                        {linkCopied ? "Copied!" : "Copy"}
                      </Button>
                    </Box>
                  </Box>
                </Box>
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
  );
};
