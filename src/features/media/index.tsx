import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Breadcrumbs,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import { DataGrid, GridColDef, GridSortModel, GridRowParams } from "@mui/x-data-grid";
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
import { buildAbsoluteUrl, buildAbsoluteUrlWithCacheBust } from "@lib/network/utils";
import { MediaPreview } from "./media-preview";
import { MediaUploadDialog } from "./media-upload-dialog";
import { useNotificationsService } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { wrapApiClient } from "@lib/network/wrapApiClient";
import type { FileUploadStatus } from "./media-upload-dialog";
import { MediaSortPopup } from "@components/media-sort-popup";
import useLocalStorage from "use-local-storage";
import { ToolbarButton } from "@components/tool-bar-button";
import { DataTableContainer } from "@components/data-table/index.styled";
import { SortAsc, SortDesc, LayoutGrid, Table as TableIcon, File } from "lucide-react";

// Helper for file size formatting
function formatFileSize(size: number | undefined) {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

// Helper for human-readable folder names
function formatFolderName(name: string): string {
  let humanName = name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/-/g, " ")
    .replace(/_/g, " ");

  // Convert to title case
  humanName = humanName
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return humanName;
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
  // Clean extension by removing leading dot if present
  const cleanExt = extension.toLowerCase().replace(/^\./, "");
  if (mimeType === "application/pdf" || cleanExt.match(/^(docx?|xlsx?|pptx?)$/)) return "document";
  if (mimeType === "application/zip" || cleanExt.match(/^(zip|rar|tar|gz)$/)) return "archive";
  // Additional video format detection by extension
  if (cleanExt.match(/^(mp4|webm|ogg|avi|mov|wmv|flv|mkv)$/)) return "video";
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
  usageCount?: number;
};

type DialogType = "new-folder" | "upload" | null;

type ViewMode = "tiles" | "grid" | "files";

type MediaListFilterSettings = {
  sortField: string;
  sortDirection: "asc" | "desc";
  viewMode: ViewMode;
};

const MEDIA_FILTERS_KEY = "media-list-filters";

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
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortAnchorEl, setSortAnchorEl] = useState<HTMLElement | null>(null);

  const [storedSettings, setStoredSettings] = useLocalStorage<MediaListFilterSettings>(
    MEDIA_FILTERS_KEY,
    {
      sortField: "name",
      sortDirection: "asc",
      viewMode: "tiles",
    }
  );
  const [sortField, setSortField] = useState(storedSettings.sortField);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(storedSettings.sortDirection);
  const [viewMode, setViewMode] = useState<ViewMode>(storedSettings.viewMode || "tiles");

  // Pagination state for files mode
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  // For preview navigation - include both images and PDFs
  const previewableItems = items.filter((item) => {
    const fileType = getFileType(item.mimeType, item.extension);
    return fileType === "image" || item.mimeType === "application/pdf";
  });

  const getCurrentPreviewIndex = useCallback(
    () => previewableItems.findIndex((item) => item.id === previewFile?.id),
    [previewableItems, previewFile]
  );

  const handlePreview = (item: MediaItem) => {
    setPreviewFile(item);
    setPreviewOpen(true);
    handleMenuClose();
  };

  // Add replace media handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReplaceMedia = async (item: MediaItem) => {
    // Refresh the media list after successful replacement
    await refreshMediaList();
  };

  const handlePreviewNext = useCallback(() => {
    const idx = getCurrentPreviewIndex();
    if (idx >= 0 && idx < previewableItems.length - 1) {
      setPreviewFile(previewableItems[idx + 1]);
    }
  }, [getCurrentPreviewIndex, previewableItems]);

  const handlePreviewPrev = useCallback(() => {
    const idx = getCurrentPreviewIndex();
    if (idx > 0) {
      setPreviewFile(previewableItems[idx - 1]);
    }
  }, [getCurrentPreviewIndex, previewableItems]);
  // Keyboard navigation for preview
  useEffect(() => {
    if (!previewOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        const isFormField =
          tagName === "INPUT" ||
          tagName === "TEXTAREA" ||
          tagName === "SELECT" ||
          target.isContentEditable;
        if (isFormField) return;
      }
      if (e.key === "ArrowLeft") {
        handlePreviewPrev();
      } else if (e.key === "ArrowRight") {
        handlePreviewNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewOpen, handlePreviewNext, handlePreviewPrev]);

  // Sync currentScopeUid with URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const folder = params.get("folder") || "";
    setCurrentScopeUid(folder);
    setBreadcrumbs(
      folder
        ? folder
            .split("/")
            .filter(Boolean)
            .map((name, idx, arr) => ({
              name,
              scopeUid: arr.slice(0, idx + 1).join("/"),
            }))
        : []
    );
  }, [location.search]);

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
        const order = getOrderParam();
        const includeFolders = viewMode !== "files";
        const queryParams = {
          scopeUid: viewMode === "files" ? undefined : currentScopeUid,
          includeFolders,
          order,
        } as Record<string, string | boolean | number | undefined>;

        // Add pagination for files mode
        if (viewMode === "files") {
          queryParams.skip = pageNumber * pageSize;
          queryParams.limit = pageSize;
        }

        const response = await api.mediaList(queryParams as never);
        const validItems = ((response.data || []) as MediaItem[])
          .filter((item: MediaItem) => item.id !== undefined)
          .map((item: MediaItem) => ({ ...item, id: item.id as number }));
        setItems(validItems);

        // Get total count from headers for files mode pagination
        if (viewMode === "files" && response.headers) {
          const count = response.headers.get("x-total-count");
          setTotalCount(count ? parseInt(count, 10) : validItems.length);
        }

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
  }, [api, currentScopeUid, search, sortField, sortDirection, viewMode, pageNumber, pageSize]);

  // Search
  useEffect(() => {
    if (!search) return;
    const searchMedia = async () => {
      setIsSearching(true);
      setLoading(true);
      try {
        const order = getOrderParam();
        const includeFolders = viewMode !== "files";
        const queryParams = {
          query: search,
          includeFolders,
          order,
        } as Record<string, string | boolean | number | undefined>;

        // Add pagination for files mode
        if (viewMode === "files") {
          queryParams.skip = pageNumber * pageSize;
          queryParams.limit = pageSize;
        }

        const response = await api.mediaList(queryParams as never);
        const validItems = ((response.data || []) as MediaItem[])
          .filter((item: MediaItem) => item.id !== undefined)
          .map((item: MediaItem) => ({ ...item, id: item.id as number }));
        setItems(validItems);

        // Get total count from headers for files mode pagination
        if (viewMode === "files" && response.headers) {
          const count = response.headers.get("x-total-count");
          setTotalCount(count ? parseInt(count, 10) : validItems.length);
        }

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
  }, [api, search, sortField, sortDirection, viewMode, pageNumber, pageSize]);

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

  const handleSortButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };
  const handleSortPopupClose = () => setSortAnchorEl(null);
  const handleSortDirectionToggle = () => setSortDirection((d) => (d === "asc" ? "desc" : "asc"));

  const orderFieldMap: Record<string, string> = {
    name: "Name",
    size: "Size",
    usageCount: "UsageCount",
    updatedAt: "UpdatedAt",
    createdAt: "CreatedAt",
  };

  const getOrderParam = () => {
    const field = orderFieldMap[sortField] || "Name";
    const direction = sortDirection.toUpperCase();
    return `${field} ${direction}`;
  };

  const sortLabel = useMemo(() => {
    switch (sortField) {
      case "name":
        return "Name";
      case "size":
        return "Size";
      case "usageCount":
        return "Usage";
      case "updatedAt":
        return "Updated At";
      case "createdAt":
        return "Created At";
      default:
        return sortField;
    }
  }, [sortField]);

  // Delete logic
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal();

  const refreshMediaList = async () => {
    setLoading(true);
    try {
      const order = getOrderParam();
      const queryParams = {
        scopeUid: currentScopeUid,
        includeFolders: true,
        order,
      } as Record<string, string | boolean | undefined>;
      const response = await api.mediaList(queryParams as never);
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
    setDeleteTarget(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const deletePromise = async () => {
      const pathToFile = `${deleteTarget.scopeUid}/${deleteTarget.name}`;
      const result = await api.mediaDelete(pathToFile);
      await refreshMediaList();
      return result;
    };
    try {
      setIsDeleting(true);
      await notificationsService.promise(deletePromise(), {
        pending: "Deleting media file",
        success: "Media file deleted successfully",
        error: (error) => {
          const errMessage = "Unable to delete media file. An error occurred.";
          const errDetails: string[] = [];
          const errorWithMessage = error as { message?: string } | undefined;
          if (errorWithMessage?.message) {
            errDetails.push(errorWithMessage.message);
          }
          return {
            title: errMessage,
            onClick: errDetails.length > 0 ? () => showErrorModal(errDetails) : undefined,
          };
        },
      });
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
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
          await api.mediaCreate({ File: file, ScopeUid: scopeUid });
          statuses[idx] = { file, status: "success" };
        } catch (err) {
          const apiError = err as { message?: string };
          statuses[idx] = {
            file,
            status: "error",
            error: apiError && apiError.message ? `Failed: ${apiError.message}` : "Unknown error",
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
        const order = getOrderParam();
        const queryParams = {
          scopeUid: currentScopeUid,
          includeFolders: true,
          order,
        } as Record<string, string | boolean | undefined>;
        const response = await api.mediaList(queryParams as never);
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

  useEffect(() => {
    setStoredSettings({
      sortField,
      sortDirection,
      viewMode,
    });
  }, [sortField, sortDirection, viewMode, setStoredSettings]);

  useEffect(() => {
    setSortField(storedSettings.sortField);
    setSortDirection(storedSettings.sortDirection);
    setViewMode(storedSettings.viewMode || "tiles");
  }, [storedSettings]);

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
      // Reset folder navigation and pagination when switching modes
      if (newMode === "files") {
        setCurrentScopeUid("");
        setBreadcrumbs([]);
      }
      setPageNumber(0);
    }
  };

  // Format date for table display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle DataGrid sort model change
  const handleGridSortChange = (sortModel: GridSortModel) => {
    if (sortModel.length > 0) {
      const field = sortModel[0].field;
      const direction = sortModel[0].sort || "asc";
      setSortField(field);
      setSortDirection(direction);
    }
  };

  // Handle row click for grid/files modes
  const handleRowClick = (params: GridRowParams<MediaItem>) => {
    const item = params.row;
    const type = getFileType(item.mimeType, item.extension);
    const isFolder = type === "folder";
    if (isFolder) {
      handleFolderClick(item);
    } else {
      handlePreview(item);
    }
  };

  // Grid columns definition
  const gridColumns: GridColDef<MediaItem>[] = useMemo(() => {
    const baseColumns: GridColDef<MediaItem>[] = [
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 250,
        renderCell: ({ row }) => {
          const type = getFileType(row.mimeType, row.extension);
          const isFolder = type === "folder";
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {type === "image" ? (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    overflow: "hidden",
                    bgcolor: "#f5f5f5",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={
                      buildAbsoluteUrlWithCacheBust(row.location, row.size, row.updatedAt) ||
                      "/images/placeholder.svg"
                    }
                    alt={row.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isFolder ? "#FFF8E1" : "#f5f5f5",
                    borderRadius: 1,
                    flexShrink: 0,
                  }}
                >
                  {fileTypeIcons[type] || fileTypeIcons.other}
                </Box>
              )}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={row.name}
              >
                {row.name}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: "size",
        headerName: "Size",
        width: 100,
        renderCell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {formatFileSize(row.size)}
          </Typography>
        ),
      },
      {
        field: "usageCount",
        headerName: "Usage",
        width: 80,
        renderCell: ({ row }) => {
          const type = getFileType(row.mimeType, row.extension);
          const isFolder = type === "folder";
          return (
            <Typography variant="body2" color="text.secondary">
              {isFolder ? row.id : row.usageCount ?? 0}
            </Typography>
          );
        },
      },
      {
        field: "mimeType",
        headerName: "Type",
        width: 140,
        renderCell: ({ row }) => {
          const type = getFileType(row.mimeType, row.extension);
          return (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              title={row.mimeType}
            >
              {type === "folder" ? "Folder" : row.mimeType}
            </Typography>
          );
        },
      },
      {
        field: "updatedAt",
        headerName: "Updated",
        width: 130,
        renderCell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {formatDate(row.updatedAt || row.createdAt)}
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: "",
        width: 60,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: ({ row }) => {
          const type = getFileType(row.mimeType, row.extension);
          const isFolder = type === "folder";
          return !isFolder ? (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, row);
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          ) : null;
        },
      },
    ];

    // Add folder column for files mode
    if (viewMode === "files") {
      baseColumns.splice(2, 0, {
        field: "scopeUid",
        headerName: "Folder",
        width: 200,
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            title={row.scopeUid}
          >
            {formatFolderName(row.scopeUid) || "Root"}
          </Typography>
        ),
      });
    }

    return baseColumns;
  }, [viewMode]);

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
        <Grid size={{ xs: 12, sm: 4 }} display="flex" alignItems="center" gap={1}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="tiles">
              <Tooltip title="Tiles View">
                <LayoutGrid size={18} />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="grid">
              <Tooltip title="Grid View (with folders)">
                <TableIcon size={18} />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="files">
              <Tooltip title="Files Only">
                <File size={18} />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} display="flex" justifyContent="flex-end" gap={2}>
          {viewMode === "tiles" && (
            <ToolbarButton
              onClick={handleSortButtonClick}
              startIcon={sortDirection === "asc" ? <SortAsc size={18} /> : <SortDesc size={18} />}
              sx={{ gap: 1 }}
            >
              <span>Sort:</span>
              <span>{sortLabel}</span>
            </ToolbarButton>
          )}
          <Button variant="contained" onClick={() => setDialog("upload")}>
            Upload
          </Button>
        </Grid>
      </Grid>
      {/* Breadcrumbs - only show for tiles and grid modes */}
      {viewMode !== "files" && (
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Button size="small" onClick={() => handleBreadcrumbClick(-1)}>
            Root
          </Button>
          {breadcrumbs.map((bc, idx) => (
            <Button key={bc.scopeUid} size="small" onClick={() => handleBreadcrumbClick(idx)}>
              {formatFolderName(bc.name)}
            </Button>
          ))}
        </Breadcrumbs>
      )}
      <MediaSortPopup
        anchorEl={sortAnchorEl}
        open={!!sortAnchorEl}
        selectedField={sortField}
        direction={sortDirection}
        onClose={handleSortPopupClose}
        onChangeField={(field) => {
          setSortField(field);
          handleSortPopupClose();
        }}
        onToggleDirection={handleSortDirectionToggle}
      />
      {/* Content area with loading/error states */}
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
            {isSearching
              ? "No files found for your search"
              : viewMode === "files"
              ? "No files found"
              : "This folder is empty"}
          </Typography>
        </Box>
      ) : viewMode === "tiles" ? (
        /* Tiles View */
        <Grid container spacing={4}>
          {items.map((item) => {
            const type = getFileType(item.mimeType, item.extension);
            const isFolder = type === "folder";
            const folderItemCount = isFolder ? item.id : undefined;
            return (
              <Grid
                key={`${item.scopeUid || "root"}:${item.name}:${item.location || item.id}`}
                size={{ xs: 9.6, sm: 4.8, md: 3.2, lg: 1.92 }}
                sx={{ mb: 3, minWidth: 232, maxWidth: 264 }}
              >
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
                          src={
                            buildAbsoluteUrlWithCacheBust(
                              item.location,
                              item.size,
                              item.updatedAt
                            ) || "/images/placeholder.svg"
                          }
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
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 13 }}>
                          {formatFileSize(item.size)}
                        </Typography>
                        {typeof item.usageCount === "number" && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: 12 }}
                          >
                            | Used:{" "}
                            <Box component="span" sx={{ fontWeight: 600 }}>
                              {item.usageCount}
                            </Box>
                          </Typography>
                        )}
                      </Box>
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
      ) : (
        /* Grid View (with folders) and Files View (files only) - DataGrid layout */
        <DataTableContainer sx={{ minHeight: 400 }}>
          <DataGrid
            rows={items}
            columns={gridColumns}
            getRowId={(row) =>
              row.location ||
              `${row.scopeUid || "root"}:${row.name}:${row.mimeType}:${row.createdAt}`
            }
            loading={loading}
            rowHeight={56}
            disableColumnFilter
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            sortingMode="server"
            onSortModelChange={handleGridSortChange}
            initialState={{
              sorting: {
                sortModel: [{ field: sortField, sort: sortDirection }],
              },
            }}
            pageSizeOptions={[25, 50, 100]}
            paginationModel={{ page: pageNumber, pageSize }}
            onPaginationModelChange={(model) => {
              setPageNumber(model.page);
              setPageSize(model.pageSize);
            }}
            paginationMode={viewMode === "files" ? "server" : "client"}
            rowCount={viewMode === "files" ? totalCount : undefined}
            hideFooter={viewMode === "grid"}
            sx={{
              "& .MuiDataGrid-row": {
                cursor: "pointer",
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor: "#fafcff",
              },
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "#f8faff",
              },
              "& .MuiDataGrid-cell": {
                display: "flex",
                alignItems: "center",
              },
            }}
          />
        </DataTableContainer>
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
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => {
          if (isDeleting) return;
          setIsDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete media</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              You are about to delete &quot{deleteTarget?.name}&quot.
            </Typography>
            {deleteTarget && (deleteTarget.usageCount ?? 0) > 0 ? (
              <Typography variant="body2" color="text.secondary">
                This media is used in{" "}
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {deleteTarget.usageCount}
                </Box>{" "}
                place(s). Deleting it may cause broken links.
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                It seems this media is not used anywhere and can likely be deleted safely.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsDeleteDialogOpen(false);
              setDeleteTarget(null);
            }}
            variant="text"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={14} /> : undefined}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Media Preview Dialog */}
      <MediaPreview
        file={previewFile}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onDownload={(file) => handleDownload(file as MediaItem)}
        onCopyLink={(file) => handleCopyLink(file as MediaItem)}
        onNext={handlePreviewNext}
        onPrev={handlePreviewPrev}
        hasNext={getCurrentPreviewIndex() < previewableItems.length - 1}
        hasPrev={getCurrentPreviewIndex() > 0}
        onReplace={(file) => handleReplaceMedia(file as MediaItem)}
        onFileUpdate={(updatedFile) => setPreviewFile(updatedFile as MediaItem)}
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
