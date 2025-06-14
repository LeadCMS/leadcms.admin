import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useNavigate, useLocation } from "react-router-dom";
import { buildAbsoluteUrl } from "@lib/network/utils";
import { MediaPreview } from "./media-preview";
import { useNotificationsService } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";

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
    setLoading(true);
    client.api
      .mediaList({ scopeUid: currentScopeUid, includeFolders: true })
      .then((response) => {
        // Filter out items with undefined ids and cast to MediaItem[]
        const validItems = (response.data || [])
          .filter((item) => item.id !== undefined)
          .map((item) => ({ ...item, id: item.id as number } as MediaItem));
        setItems(validItems);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  }, [client, currentScopeUid, search]);

  // Search
  useEffect(() => {
    if (!search) return;
    setIsSearching(true);
    setLoading(true);
    client.api
      .mediaList({ query: search })
      .then((response) => {
        // Filter out items with undefined ids and cast to MediaItem[]
        const validItems = (response.data || [])
          .filter((item) => item.id !== undefined)
          .map((item) => ({ ...item, id: item.id as number } as MediaItem));
        setItems(validItems);
        setLoading(false);
        setIsSearching(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
        setIsSearching(false);
      });
  }, [client, search]);

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
  
  const refreshMediaList = () => {
    setLoading(true);
    client.api
      .mediaList({ scopeUid: currentScopeUid, includeFolders: true })
      .then((response) => {
        // Filter out items with undefined ids and cast to MediaItem[]
        const validItems = (response.data || [])
          .filter((item) => item.id !== undefined)
          .map((item) => ({ ...item, id: item.id as number } as MediaItem));
        setItems(validItems);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  };

  const handleDelete = async (item: MediaItem) => {
    handleMenuClose();
    
    const deletePromise = async () => {
      // Calculate pathToFile as required by the API
      const pathToFile = `${item.scopeUid}/${item.name}`;
      const result = await client.api.mediaDelete(pathToFile);
      if (!result || (typeof result === "object" && (
        ("status" in result && result.status && result.status >= 400) ||
        ("ok" in result && result.ok === false)
      ))) {
        throw new Error("Media delete failed or file not found (404)");
      }

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
    setUploadFiles(Array.from(e.dataTransfer.files));
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadFiles(Array.from(e.target.files));
    }
  };
  const handleUploadFiles = async () => {
    setUploading(true);
    setUploadError(null);
    setUploadFolderError(null);
    let scopeUid = currentScopeUid;
    if (currentScopeUid && uploadFolderName) {
      scopeUid = currentScopeUid + "/" + uploadFolderName;
    } else if (!currentScopeUid) {
      if (!uploadFolderName.trim()) {
        setUploadFolderError("Folder name is required when uploading to root");
        setUploading(false);
        return;
      }
      scopeUid = uploadFolderName.trim();
    }
    let allSuccess = true;
    for (const file of uploadFiles) {
      try {
        await client.api.mediaCreate({
          Image: file,
          ScopeUid: scopeUid,
        });
      } catch (err: unknown) {
        allSuccess = false;
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setUploadError(`Failed to upload ${file.name}: ${errorMessage}`);
        break;
      }
    }
    setUploading(false);
    if (allSuccess) {
      setUploadFiles([]);
      setDialog(null);
      setUploadFolderName("");
      setLoading(true);
      client.api
        .mediaList({ scopeUid: currentScopeUid, includeFolders: true })
        .then((response) => {
          // Filter out items with undefined ids and cast to MediaItem[]
          const validItems = (response.data || [])
            .filter((item) => item.id !== undefined)
            .map((item) => ({ ...item, id: item.id as number } as MediaItem));
          setItems(validItems);
          setLoading(false);
        })
        .catch(() => {
          setItems([]);
          setLoading(false);
        });
    }
  };

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
      {loading ? (
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
      <Dialog open={dialog === "upload"} onClose={() => setDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          Upload Files to /
          {currentScopeUid ? (
            <>
              {currentScopeUid}{" "}
              <input
                type="text"
                placeholder="(optional subfolder)"
                value={uploadFolderName}
                onChange={(e) => setUploadFolderName(e.target.value)}
                style={{
                  marginLeft: 8,
                  padding: 2,
                  fontSize: 16,
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  width: 160,
                }}
              />
            </>
          ) : (
            <input
              type="text"
              placeholder="folder name (required)"
              value={uploadFolderName}
              onChange={(e) => setUploadFolderName(e.target.value)}
              style={{
                marginLeft: 4,
                padding: 2,
                fontSize: 16,
                border: "1px solid #ccc",
                borderRadius: 4,
                width: 180,
              }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              border: "2px dashed #bdbdbd",
              borderRadius: 2,
              p: 4,
              textAlign: "center",
              bgcolor: "#fafafa",
              cursor: "pointer",
              mb: 2,
            }}
            onDrop={handleDropFiles}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("file-upload-input")?.click()}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: "#bdbdbd", mb: 1 }} />
            <Typography variant="body1" sx={{ mb: 1 }}>
              Drag and drop files here or click to browse
            </Typography>
            <input
              id="file-upload-input"
              type="file"
              multiple
              hidden
              onChange={handleFileInputChange}
            />
            {uploadFiles.length > 0 && (
              <Box mt={2}>
                {uploadFiles.map((file) => (
                  <Box key={file.name} display="flex" alignItems="center" mb={1}>
                    <Typography sx={{ flex: 1 }}>{file.name}</Typography>
                    {uploading ? (
                      <Box width={80} ml={2}>
                        <CircularProgress size={20} />
                      </Box>
                    ) : null}
                  </Box>
                ))}
              </Box>
            )}
            {uploadError && (
              <Typography color="error" sx={{ mt: 2 }}>
                {uploadError}
              </Typography>
            )}
          </Box>
          {currentScopeUid === "" && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
              Note: Uploading to root folder. Subfolder name is required.
            </Typography>
          )}
          {uploadFolderError && (
            <Typography color="error" sx={{ mt: 1 }}>
              {uploadFolderError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={uploading ? <CircularProgress size={18} /> : <CloudUploadIcon />}
            onClick={handleUploadFiles}
            disabled={uploadFiles.length === 0 || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaManagement;
