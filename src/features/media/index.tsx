import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Breadcrumbs,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import MovieIcon from "@mui/icons-material/Movie";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import DescriptionIcon from "@mui/icons-material/Description";
import ArchiveIcon from "@mui/icons-material/Archive";
import SearchIcon from "@mui/icons-material/Search";
import { useRequestContext } from "@providers/request-provider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useLocation } from "react-router-dom";
import { buildAbsoluteUrl } from "@lib/network/utils";
import { MediaPreview } from "./media-preview";
import { MediaUploadDialog } from "./media-upload-dialog";
import { useNotificationsService } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { wrapApiClient } from "@lib/network/wrapApiClient";
import type { FileUploadStatus } from "./media-upload-dialog";

// Helper for file size formatting
function formatFileSize(size: number | undefined) {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

const fileTypeIcons: Record<string, JSX.Element> = {
  image: <ImageIcon color="primary" />,
  video: <MovieIcon color="secondary" />,
  audio: <MusicNoteIcon color="success" />,
  document: <DescriptionIcon color="error" />,
  archive: <ArchiveIcon color="warning" />,
  folder: <FolderIcon color="warning" />,
  other: <InsertDriveFileIcon color="disabled" />,
};

const getFileType = (mimeType: string, extension: string) => {
  if (mimeType === "inode/directory") return "folder";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf" || extension.match(/\.(docx?|xlsx?|pptx?)$/))
    return "document";
  if (mimeType === "application/zip" || extension.match(/\.(zip|rar|tar|gz)$/)) return "archive";
  return "other";
};

type MediaItem = {
  id: number;
  name: string;
  location: string;
  scopeUid: string;
  size: number;
  extension: string;
  mimeType: string;
  createdAt: string;
  updatedAt: string | null;
};

type DialogType = "new-folder" | "upload" | null;

const MediaManagement = () => {
  const { client } = useRequestContext();
  const navigate = useNavigate();
  const location = useLocation();
  // Wrap the API client for error handling
  const api = useMemo(() => wrapApiClient(client.api), [client.api]);
  const params = new URLSearchParams(location.search);
  const initialFolder = params.get("folder") || "";
  const initialBreadcrumbs = initialFolder
    ? initialFolder
      .split("/")
      .filter(Boolean)
      .map((name, idx, arr) => ({
        name,
        scopeUid: arr.slice(0, idx + 1).join("/"),
      }))
    : [];
  const [search, setSearch] = useState<string>("");
  const [dialog, setDialog] = useState<DialogType>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] =
    useState<{ name: string; scopeUid: string }[]>(initialBreadcrumbs);
  const [currentScopeUid, setCurrentScopeUid] = useState<string>(initialFolder);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItem, setMenuItem] = useState<MediaItem | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadFolderName, setUploadFolderName] = useState("");
  const [uploadFolderError, setUploadFolderError] = useState<string | null>(null);
  // Add fetchError state
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Add preview dialog state
  const [previewFile, setPreviewFile] = useState<MediaItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // For preview navigation
  const imageItems = items.filter(
    (item) => getFileType(item.mimeType, item.extension) === "image"
  );
  const getCurrentImageIndex = useCallback(
    () => imageItems.findIndex((img) => img.id === previewFile?.id),
    [imageItems, previewFile]
  );
  const handlePreview = (item: MediaItem) => {
    setPreviewFile(item);
    setPreviewOpen(true);
    handleMenuClose();
  };
  const handlePreviewNext = useCallback(() => {
    const idx = getCurrentImageIndex();
    if (idx >= 0 && idx < imageItems.length - 1) {
      setPreviewFile(imageItems[idx + 1]);
    }
  }, [getCurrentImageIndex, imageItems]);
  const handlePreviewPrev = useCallback(() => {
    const idx = getCurrentImageIndex();
    if (idx > 0) {
      setPreviewFile(imageItems[idx - 1]);
    }
  }, [getCurrentImageIndex, imageItems]);
  // Keyboard navigation for preview
  useEffect(() => {
    if (!previewOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePreviewPrev();
      } else if (e.key === "ArrowRight") {
        handlePreviewNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewOpen, handlePreviewNext, handlePreviewPrev]);

  // On mount, set currentScopeUid from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const folder = params.get("folder");
    if (folder) {
      setCurrentScopeUid(folder);
      setBreadcrumbs(
        folder
          .split("/")
          .filter(Boolean)
          .map((name, idx, arr) => ({
            name,
            scopeUid: arr.slice(0, idx + 1).join("/"),
          }))
      );
    }
  }, []); // Only on mount

  // When currentScopeUid changes, update the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (currentScopeUid) {
      params.set("folder", currentScopeUid);
    } else {
      params.delete("folder");
    }
    navigate({ search: params.toString() }, { replace: true });
  }, [currentScopeUid]);

  // Fetch folders/files for current scope
  useEffect(() => {
    if (search) return;
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const response = await api.mediaList({ scopeUid: currentScopeUid, includeFolders: true });
        const validItems = ((response.data || []) as MediaItem[])
          .filter((item: MediaItem) => item.id !== undefined)
          .map((item: MediaItem) => ({ ...item, id: item.id as number }));
        setItems(validItems);
        setFetchError(null);
      } catch (error) {
        const apiError = error as { status?: number; message?: string };
        if (apiError.status === 0) {
          setFetchError(apiError.message || "Network error");
        } else {
          setItems([]);
          setFetchError(apiError.message || "Failed to load media");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [api, currentScopeUid, search]);

  // Search
  useEffect(() => {
    if (!search) return;
    const searchMedia = async () => {
      setIsSearching(true);
      setLoading(true);
      try {
        const response = await api.mediaList({ query: search });
        const validItems = ((response.data || []) as MediaItem[])
          .filter((item: MediaItem) => item.id !== undefined)
          .map((item: MediaItem) => ({ ...item, id: item.id as number }));
        setItems(validItems);
        setFetchError(null);
      } catch (error) {
        const apiError = error as { status?: number; message?: string };
        if (apiError.status === 0) {
          setFetchError(apiError.message || "Network error");
        } else {
          setItems([]);
          setFetchError(apiError.message || "Failed to search media");
        }
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };
    searchMedia();
  }, [api, search]);

  // Navigation for folders
  const handleFolderClick = (item: MediaItem) => {
    setCurrentScopeUid(item.scopeUid);
    setBreadcrumbs((prev) => [...prev, { name: item.name, scopeUid: item.scopeUid }]);
    setSearch("");
  };

  // Breadcrumb navigation
  const handleBreadcrumbClick = (idx: number) => {
    if (idx === -1) {
      setCurrentScopeUid("");
      setBreadcrumbs([]);
    } else {
      setCurrentScopeUid(breadcrumbs[idx].scopeUid);
      setBreadcrumbs(breadcrumbs.slice(0, idx + 1));
    }
    setSearch("");
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: MediaItem) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuItem(item);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuItem(null);
  };
  const handleCopyLink = (item: MediaItem) => {
    navigator.clipboard.writeText(item.location);
    handleMenuClose();
  };
  const handleDownload = (item: MediaItem) => {
    window.open(buildAbsoluteUrl(item.location), "_blank");
    handleMenuClose();
  };
  const handlePreviewMenu = (item: MediaItem) => {
    setPreviewFile(item);
    setPreviewOpen(true);
    handleMenuClose();
  };

  // Delete logic
  const { notificationsService } = useNotificationsService();
  const errorDetailsModal = useErrorDetailsModal();
  const showErrorModal = errorDetailsModal?.Show || 
    ((errDetails: string[]) => console.error(errDetails));
  
  const refreshMediaList = async () => {
    setLoading(true);
    try {
      const response = await api.mediaList({ scopeUid: currentScopeUid, includeFolders: true });
      const validItems = ((response.data || []) as MediaItem[])
        .filter((item: MediaItem) => item.id !== undefined)
        .map((item: MediaItem) => ({ ...item, id: item.id as number }));
      setItems(validItems);
      setFetchError(null);
    } catch (error) {
      const apiError = error as { status?: number; message?: string };
      if (apiError.status === 0) {
        setFetchError(apiError.message || "Network error");
      } else {
        setItems([]);
        setFetchError(apiError.message || "Failed to refresh media");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    handleMenuClose();
    const deletePromise = async () => {
      // Calculate pathToFile as required by the API
      const pathToFile = `${item.scopeUid}/${item.name}`;
      const result = await api.mediaDelete(pathToFile);
      // Only refresh the list after successful deletion and toast completion
      refreshMediaList();
      return result;
    };
    try {
      // Use notificationsService.promise to handle toasts
      await notificationsService.promise(deletePromise(), {
        pending: "Deleting media file",
        success: "Media file deleted successfully",
        error: (error) => {
          const errMessage = "Unable to delete media file. An error occurred.";
          const errDetails: string[] = [];
          if (error?.message) {
            errDetails.push(error.message);
          }
          return {
            title: errMessage,
            onClick: errDetails.length > 0 ? () => showErrorModal(errDetails) : undefined,
          };
        },
      });    
    } catch (error) {
      // Error toast is already handled by notificationsService.promise
      // No need to refresh the list on error
    }
  };

  // Upload logic
  const handleDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files).filter(
      (file) => !uploadFiles.some((existing) => existing.name === file.name)
    );
    setUploadFiles((prev) => [...prev, ...newFiles]);
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(
        (file) => !uploadFiles.some((existing) => existing.name === file.name)
      );
      setUploadFiles((prev) => [...prev, ...newFiles]);
    }
  };
  // Utility to convert any folder name to kebab-case (ScopeUid format)
  function toScopeUid(name: string): string {
    return name
      .replace(/([a-z])([A-Z])/g, "$1-$2") // camelCase to camel-Case
      .replace(/[_\s]+/g, "-") // underscores and spaces to dash
      .replace(/([A-Z]+)/g, (m) => "-" + m.toLowerCase()) // handle consecutive capitals
      .replace(/-+/g, "-") // collapse multiple dashes
      .replace(/^-+|-+$/g, "") // trim leading/trailing dashes
      .toLowerCase();
  }

  const [fileStatuses, setFileStatuses] = useState<FileUploadStatus[]>([]);
  const handleUploadFiles = async (
    files: File[],
    setFileStatusesCb: (statuses: FileUploadStatus[]) => void
  ): Promise<void> => {
    setUploading(true);
    setUploadError(null);
    setUploadFolderError(null);
    let scopeUid = currentScopeUid;
    if (currentScopeUid && uploadFolderName) {
      scopeUid = currentScopeUid + "/" + toScopeUid(uploadFolderName);
    } else if (!currentScopeUid) {
      if (!uploadFolderName.trim()) {
        setUploadFolderError("Folder name is required when uploading to root");
        setUploading(false);
        return;
      }
      scopeUid = toScopeUid(uploadFolderName.trim());
    }
    
    // Initialize statuses: preserve existing success statuses, set others to uploading
    const statuses: FileUploadStatus[] = files.map((file) => {
      const existingStatus = fileStatuses.find((s) => s.file.name === file.name);
      if (existingStatus && existingStatus.status === "success") {
        return existingStatus; // Keep existing success status
      }
      return { file, status: "uploading" };
    });
    setFileStatuses(statuses);
    setFileStatusesCb(statuses);
    
    // Only upload files that are not already successfully uploaded
    const filesToUpload = files.filter((file) => {
      const existingStatus = fileStatuses.find((s) => s.file.name === file.name);
      return !existingStatus || existingStatus.status !== "success";
    });
    
    await Promise.all(
      filesToUpload.map(async (file) => {
        const idx = files.findIndex((f) => f.name === file.name);
        try {
          await api.mediaCreate({ Image: file, ScopeUid: scopeUid });
          statuses[idx] = { file, status: "success" };
        } catch (err) {
          const apiError = err as { message?: string };
          statuses[idx] = {
            file,
            status: "error",
            error:
              apiError && apiError.message
                ? `Failed: ${apiError.message}`
                : "Unknown error"
          };
        }
        setFileStatuses([...statuses]);
        setFileStatusesCb([...statuses]);
      })
    );
    setUploading(false);
    
    // Check if all files are successfully uploaded and close dialog immediately
    if (statuses.every((s) => s.status === "success")) {
      setUploadFiles([]);
      setUploadFolderName("");
      setDialog(null); // Close dialog immediately
      setLoading(true);
      try {
        const response = await api.mediaList({ scopeUid: currentScopeUid, includeFolders: true });
        const validItems = ((response.data || []) as MediaItem[])
          .filter((item: MediaItem) => item.id !== undefined)
          .map((item: MediaItem) => ({ ...item, id: item.id as number }));
        setItems(validItems);
        setFetchError(null);
      } catch (error) {
        const apiError = error as { status?: number; message?: string };
        if (apiError.status === 0) {
          setFetchError(apiError.message || "Network error");
        } else {
          setItems([]);
          setFetchError(apiError.message || "Failed to refresh media");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Reset fileStatuses when dialog is closed to prevent auto-close on next open
  useEffect(() => {
    if (dialog !== "upload") {
      setFileStatuses([]);
    }
  }, [dialog]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: "100%" }}>
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search media..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              if (value) {
                setCurrentScopeUid("");
                setBreadcrumbs([]);
              }
              // If clearing search, do not reset folder
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }} display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="contained" onClick={() => setDialog("upload")}>
            Upload
          </Button>
        </Grid>
      </Grid>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Button size="small" onClick={() => handleBreadcrumbClick(-1)}>
          Root
        </Button>
        {breadcrumbs.map((bc, idx) => (
          <Button key={bc.scopeUid} size="small" onClick={() => handleBreadcrumbClick(idx)}>
            {bc.name}
          </Button>
        ))}
      </Breadcrumbs>
      {/* Tile (card/grid) mode */}
      {fetchError ? (
        <Box textAlign="center" py={6}>
          <Typography color="error">{fetchError}</Typography>
        </Box>
      ) : loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography>
            {isSearching ? "No files found for your search." : "This folder is empty."}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {items.map((item) => {
            const type = getFileType(item.mimeType, item.extension);
            const isFolder = type === "folder";
            const folderItemCount = isFolder ? item.id : undefined;
            return (
              <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                <Paper
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    position: "relative",
                    transition: "box-shadow 0.2s, border 0.2s",
                    boxShadow: 1,
                    border: "1px solid #e0e0e0",
                    cursor: isFolder ? "pointer" : "default",
                    width: 290,
                    aspectRatio: "1 / 1",
                    maxWidth: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "stretch",
                    m: "auto",
                    "&:hover": {
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => {
                    if (isFolder) {
                      handleFolderClick(item);
                    } else {
                      handlePreview(item);
                    }
                  }}
                >
                  {/* Preview area */}
                  <Box
                    sx={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      position: "relative",
                      overflow: "hidden",
                      bgcolor: isFolder ? "#FFF8E1" : "#F5F5F5",
                      borderBottom: "1px solid #f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Show image preview for images, icon for others */}
                    {type === "image" ? (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                      >
                        <img
                          src={buildAbsoluteUrl(item.location)}
                          alt={item.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            borderRadius: 0,
                            background: "#fafafa",
                          }}
                          loading="lazy"
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {fileTypeIcons[type] || fileTypeIcons.other}
                      </Box>
                    )}
                  </Box>
                  {/* Actions (hover only) */}
                  {!isFolder && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        opacity: 0.7,
                        zIndex: 2,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuOpen(e, item);
                      }}
                    >
                      <IconButton size="small" sx={{ bgcolor: "white", borderRadius: "50%" }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                  {/* Info */}
                  <Box sx={{ p: 3, pt: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        mb: 1,
                        fontSize: 16,
                        lineHeight: 1.3,
                        maxHeight: 36,
                      }}
                      title={item.name}
                    >
                      {item.name}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 13 }}>
                        {formatFileSize(item.size)}
                      </Typography>
                      {isFolder ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: 12, ml: 2, flexShrink: 0 }}
                        >
                          {folderItemCount} items
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: 12, ml: 2, flexShrink: 0 }}
                          title={item.mimeType}
                        >
                          {item.mimeType}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
      {/* Popup menu for tile actions */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {menuItem && menuItem.mimeType !== "inode/directory" && (
          <MenuItem onClick={() => handlePreviewMenu(menuItem)}>
            <ImageIcon fontSize="small" sx={{ mr: 1 }} /> Preview
          </MenuItem>
        )}
        {menuItem && menuItem.mimeType !== "inode/directory" && (
          <MenuItem onClick={() => handleDownload(menuItem)}>
            <DownloadIcon fontSize="small" sx={{ mr: 1 }} /> Download
          </MenuItem>
        )}
        {menuItem && menuItem.mimeType !== "inode/directory" && (
          <MenuItem onClick={() => handleCopyLink(menuItem)}>
            <FileCopyIcon fontSize="small" sx={{ mr: 1 }} /> Copy Link
          </MenuItem>
        )}
        {/* Only show Rename/Delete for files, not folders */}
        {menuItem && menuItem.mimeType !== "inode/directory" && (
          <MenuItem onClick={() => handleDelete(menuItem)}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        )}
      </Menu>
      {/* Media Preview Dialog */}
      <MediaPreview
        file={previewFile}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onDownload={handleDownload}
        onCopyLink={handleCopyLink}
        onNext={handlePreviewNext}
        onPrev={handlePreviewPrev}
        hasNext={getCurrentImageIndex() < imageItems.length - 1}
        hasPrev={getCurrentImageIndex() > 0}
      />
      {/* Dialogs (New Folder, Upload, etc.) */}
      <MediaUploadDialog
        open={dialog === "upload"}
        onClose={() => setDialog(null)}
        currentScopeUid={currentScopeUid}
        uploadFolderName={uploadFolderName}
        setUploadFolderName={setUploadFolderName}
        uploadFiles={uploadFiles}
        uploading={uploading}
        uploadError={uploadError}
        uploadFolderError={uploadFolderError}
        handleDropFiles={handleDropFiles}
        handleFileInputChange={handleFileInputChange}
        handleUploadFiles={(files, setFileStatusesCb) => {
          handleUploadFiles(files, (statuses) => {
            setFileStatuses(statuses);
            setFileStatusesCb(statuses);
          });
        }}
        setUploadError={setUploadError}
        setUploadFolderError={setUploadFolderError}
        fileStatuses={fileStatuses}
        onRemoveFile={(fileName) => {
          setUploadFiles((prev) => prev.filter((f) => f.name !== fileName));
          setFileStatuses((prev) => prev.filter((f) => f.file.name !== fileName));
        }}
      />
    </Box>
  );
};

export default MediaManagement;
