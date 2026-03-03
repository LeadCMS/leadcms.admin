import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Breadcrumbs,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  InputAdornment,
  Checkbox,
  Chip,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSortModel,
  GridRowParams,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import FolderIcon from "@mui/icons-material/Folder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import MovieIcon from "@mui/icons-material/Movie";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import DescriptionIcon from "@mui/icons-material/Description";
import CoPresentIcon from "@mui/icons-material/CoPresent";
import ArchiveIcon from "@mui/icons-material/Archive";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import { useRequestContext } from "@providers/request-provider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import RestoreIcon from "@mui/icons-material/Restore";
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
import {
  SortAsc,
  SortDesc,
  LayoutGrid,
  Table as TableIcon,
  File,
  X,
  Search,
  AlertCircle,
} from "lucide-react";
import { useConfig } from "@providers/config-provider";
import { parseApiError } from "@utils/api-error-parser";

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

function normalizeFolderPath(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

function buildBreadcrumbs(folder: string): { name: string; scopeUid: string }[] {
  if (!folder) return [];
  return folder
    .split("/")
    .filter(Boolean)
    .map((name, idx, arr) => ({
      name,
      scopeUid: arr.slice(0, idx + 1).join("/"),
    }));
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

const isPptxDocument = (mimeType: string, extension: string) => {
  const cleanExt = extension.toLowerCase().replace(/^\./, "");
  return (
    mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    cleanExt === "pptx"
  );
};

const getFileIcon = (mimeType: string, extension: string, type: string): JSX.Element => {
  if (type === "document" && isPptxDocument(mimeType, extension)) {
    return <CoPresentIcon color="warning" />;
  }

  return fileTypeIcons[type] || fileTypeIcons.other;
};

type MediaItem = {
  id: number;
  name: string;
  location: string;
  scopeUid: string;
  description?: string | null;
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
  searchTerm?: string;
  columnVisibilityModel?: Record<string, boolean>;
  columnWidths?: Record<string, number>;
  columnOrder?: string[];
};

const MEDIA_FILTERS_KEY = "media-list-filters";

const MediaManagement = () => {
  const { client } = useRequestContext();
  const { config } = useConfig();
  const navigate = useNavigate();
  const location = useLocation();
  // Wrap the API client for error handling
  const api = useMemo(() => wrapApiClient(client.api), [client.api]);
  const params = new URLSearchParams(location.search);
  const initialFolder = params.get("folder") || "";
  const initialBreadcrumbs = buildBreadcrumbs(initialFolder);
  const [dialog, setDialog] = useState<DialogType>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] =
    useState<{ name: string; scopeUid: string }[]>(initialBreadcrumbs);
  const [currentScopeUid, setCurrentScopeUid] = useState<string>(initialFolder);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItem, setMenuItem] = useState<MediaItem | null>(null);
  const [folderMenuAnchorEl, setFolderMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [folderMenuItem, setFolderMenuItem] = useState<MediaItem | null>(null);
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
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] = useState(false);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [sortAnchorEl, setSortAnchorEl] = useState<HTMLElement | null>(null);
  const [bulkDialog, setBulkDialog] = useState<"optimize" | "reset" | null>(null);
  const [bulkOperationFolder, setBulkOperationFolder] = useState<string>("");
  const [includeSubfolders, setIncludeSubfolders] = useState(false);
  const [isBulkOptimizing, setIsBulkOptimizing] = useState(false);
  const [isBulkResetting, setIsBulkResetting] = useState(false);
  const [isRenameFolderDialogOpen, setIsRenameFolderDialogOpen] = useState(false);
  const [renameFolderSource, setRenameFolderSource] = useState("");
  const [renameFolderTarget, setRenameFolderTarget] = useState("");
  const [renameFolderError, setRenameFolderError] = useState<string | null>(null);
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);
  const [renameTarget, setRenameTarget] = useState<MediaItem | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newScopeUid, setNewScopeUid] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Use undefined as default to distinguish "no stored settings" from "default settings"
  const [storedSettings, setStoredSettings] = useLocalStorage<MediaListFilterSettings | undefined>(
    MEDIA_FILTERS_KEY,
    undefined
  );

  const [sortField, setSortField] = useState(storedSettings?.sortField ?? "name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    storedSettings?.sortDirection ?? "asc"
  );
  const [viewMode, setViewMode] = useState<ViewMode>(storedSettings?.viewMode ?? "tiles");
  const [search, setSearch] = useState<string>(storedSettings?.searchTerm ?? "");
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>(
    storedSettings?.columnVisibilityModel ?? {}
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    storedSettings?.columnWidths ?? {}
  );

  // Track initialization to prevent saving before stored values are loaded
  const [isInitialized, setIsInitialized] = useState(false);

  // Pagination state for files mode
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const paginationKey = viewMode === "files" ? `${pageNumber}:${pageSize}` : "client";

  // For preview navigation - include all files except folders
  const previewableItems = items.filter((item) => {
    const fileType = getFileType(item.mimeType, item.extension);
    return fileType !== "folder";
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
    setBreadcrumbs(buildBreadcrumbs(folder));
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
        const apiError = parseApiError(error, "Failed to load media");
        setItems([]);
        setFetchError(apiError.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [api, currentScopeUid, search, sortField, sortDirection, viewMode, paginationKey]);

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
        const apiError = parseApiError(error, "Failed to search media");
        setItems([]);
        setFetchError(apiError.message);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };
    searchMedia();
  }, [api, search, sortField, sortDirection, viewMode, paginationKey]);

  // Initialize state from stored settings (runs only once on mount)
  useEffect(() => {
    if (storedSettings) {
      // Restore stored values if they exist
      setSortField(storedSettings.sortField ?? "name");
      setSortDirection(storedSettings.sortDirection ?? "asc");
      setViewMode(storedSettings.viewMode ?? "tiles");
      setSearch(storedSettings.searchTerm ?? "");
      setColumnVisibilityModel(storedSettings.columnVisibilityModel ?? {});
      setColumnWidths(storedSettings.columnWidths ?? {});
    }
    // Mark initialization as complete
    setIsInitialized(true);
  }, []);

  // Save settings to localStorage
  const saveGridStateInLocalStorage = useCallback(() => {
    setStoredSettings({
      sortField,
      sortDirection,
      viewMode,
      searchTerm: search,
      columnVisibilityModel,
      columnWidths,
    });
  }, [
    sortField,
    sortDirection,
    viewMode,
    search,
    columnVisibilityModel,
    columnWidths,
    setStoredSettings,
  ]);

  // Persist settings when they change (only after initialization)
  useEffect(() => {
    if (isInitialized) {
      saveGridStateInLocalStorage();
    }
  }, [isInitialized, saveGridStateInLocalStorage]);

  // Navigation for folders
  const handleFolderClick = (item: MediaItem) => {
    setCurrentScopeUid(item.scopeUid);
    setBreadcrumbs((prev) => [...prev, { name: item.name, scopeUid: item.scopeUid }]);
    setSearch("");
    setPageNumber(0);
    setSelectedIds(new Set());
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
    setPageNumber(0);
    setSelectedIds(new Set());
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
  const handleFolderMenuClose = () => {
    setFolderMenuAnchorEl(null);
    setFolderMenuItem(null);
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

  const handleRenameOpen = (item: MediaItem) => {
    setRenameTarget(item);
    setNewFileName(item.name || "");
    setNewScopeUid(item.scopeUid || "");
    setRenameError(null);
    setIsRenameDialogOpen(true);
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

  const refreshMediaList = async (overrideScopeUid?: string) => {
    setLoading(true);
    try {
      const order = getOrderParam();
      const targetScopeUid = overrideScopeUid ?? currentScopeUid;
      const queryParams = {
        scopeUid: targetScopeUid,
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
      const apiError = parseApiError(error, "Failed to refresh media");
      setItems([]);
      setFetchError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkOptimize = async () => {
    setIsBulkOptimizing(true);
    try {
      const response = await api.mediaOptimizeAllCreate({
        folder: bulkOperationFolder || undefined,
        includeSubfolders,
      });
      const updatedCount = response.data?.updated ?? 0;
      notificationsService.success(`Optimized ${updatedCount} image(s)`);
      await refreshMediaList();
    } catch (error) {
      const apiError = parseApiError(error, "Failed to optimize folder");
      notificationsService.error(apiError.message);
    } finally {
      setIsBulkOptimizing(false);
    }
  };

  const handleBulkReset = async () => {
    setIsBulkResetting(true);
    try {
      const response = await api.mediaResetAllCreate({
        folder: bulkOperationFolder || undefined,
        includeSubfolders,
      });
      const updatedCount = response.data?.updated ?? 0;
      notificationsService.success(`Reset ${updatedCount} image(s)`);
      await refreshMediaList();
    } catch (error) {
      const apiError = parseApiError(error, "Failed to reset folder");
      notificationsService.error(apiError.message);
    } finally {
      setIsBulkResetting(false);
    }
  };

  const getRenameFolderClientError = (source: string, target: string) => {
    const normalizedSource = normalizeFolderPath(source);
    const normalizedTarget = normalizeFolderPath(target);
    if (!normalizedSource) return "Current folder is required.";
    if (!normalizedTarget) return "New folder path is required.";
    if (normalizedSource.toLowerCase() === normalizedTarget.toLowerCase()) {
      return "New folder path must be different from current folder.";
    }
    const sourcePrefix = `${normalizedSource.toLowerCase()}/`;
    if (normalizedTarget.toLowerCase().startsWith(sourcePrefix)) {
      return "New folder path cannot be within the current folder.";
    }
    return null;
  };

  const handleRenameFolderOpen = () => {
    const folderPath = folderMenuItem?.scopeUid || currentScopeUid;
    setRenameFolderSource(folderPath);
    setRenameFolderTarget(folderPath);
    setRenameFolderError(null);
    setIsRenameFolderDialogOpen(true);
  };

  const handleRenameFolderConfirm = async () => {
    const clientError = getRenameFolderClientError(renameFolderSource, renameFolderTarget);
    if (clientError) {
      setRenameFolderError(clientError);
      return;
    }

    setIsRenamingFolder(true);
    setRenameFolderError(null);

    const source = normalizeFolderPath(renameFolderSource);
    const target = normalizeFolderPath(renameFolderTarget);

    try {
      const response = await api.mediaRenameFolderCreate({
        folder: source,
        newFolder: target,
      });
      const updatedCount = response.data?.updated ?? 0;
      notificationsService.success(`Renamed ${updatedCount} files.`);
      setIsRenameFolderDialogOpen(false);
      setRenameFolderSource("");
      setRenameFolderTarget("");
      // If we renamed the current folder we're viewing, update to the new path
      // Otherwise, stay in the current parent folder
      if (source === currentScopeUid) {
        setCurrentScopeUid(target);
        setBreadcrumbs(buildBreadcrumbs(target));
        await refreshMediaList(target);
      } else {
        await refreshMediaList(currentScopeUid);
      }
    } catch (error) {
      const apiError = parseApiError(error, "Failed to rename folder");
      const message =
        apiError.status === 422 && apiError.details.length > 0
          ? apiError.details.join(" ")
          : apiError.message;
      setRenameFolderError(message);
      notificationsService.error(message);
    } finally {
      setIsRenamingFolder(false);
    }
  };

  const handleRenameConfirm = async () => {
    if (!renameTarget) return;
    if (!newFileName.trim() || !newScopeUid.trim()) {
      setRenameError("New name and folder are required");
      return;
    }

    setIsRenaming(true);
    setRenameError(null);

    try {
      const response = await api.mediaRenameCreate({
        scopeUid: renameTarget.scopeUid,
        fileName: renameTarget.name,
        newScopeUid: newScopeUid.trim(),
        newFileName: newFileName.trim(),
      });

      notificationsService.success("Media updated");
      await refreshMediaList();
      if (previewFile?.id === renameTarget.id && response.data) {
        setPreviewFile(response.data as MediaItem);
      }
      setIsRenameDialogOpen(false);
      setRenameTarget(null);
    } catch (error) {
      const apiError = parseApiError(error, "Failed to rename media");
      setRenameError(apiError.message);
      notificationsService.error(apiError.message);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    handleMenuClose();
    setDeleteTarget(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteFolderOpen = () => {
    const targetFolder = folderMenuItem?.scopeUid || currentScopeUid;
    setDeleteFolderTarget(targetFolder);
    setIsDeleteFolderDialogOpen(true);
  };

  const handleDeleteFolderConfirm = async () => {
    if (!deleteFolderTarget) return;
    setIsDeletingFolder(true);
    try {
      const response = await api.mediaDeleteFolderCreate({
        folder: deleteFolderTarget,
      });
      const deletedCount = response.data?.updated ?? 0;
      notificationsService.success(`Deleted ${deletedCount} file(s)`);
      setIsDeleteFolderDialogOpen(false);
      setDeleteFolderTarget(null);
      await refreshMediaList();
    } catch (error) {
      const apiError = parseApiError(error, "Failed to delete folder");
      notificationsService.error(apiError.message);
    } finally {
      setIsDeletingFolder(false);
    }
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

  // Multi-select helpers
  const selectableItems = items.filter(
    (item) => getFileType(item.mimeType, item.extension) !== "folder"
  );

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === selectableItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableItems.map((i) => i.id)));
    }
  };

  const selectedItemsList = items.filter((i) => selectedIds.has(i.id));
  const totalUsageCount = selectedItemsList.reduce((sum, i) => sum + (i.usageCount ?? 0), 0);

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkDeleting(true);
    try {
      await api.mediaBulkDelete(Array.from(selectedIds));
      notificationsService.success(`Deleted ${selectedIds.size} file(s)`);
      setSelectedIds(new Set());
      setIsBulkDeleteDialogOpen(false);
      await refreshMediaList();
    } catch (error) {
      const apiError = parseApiError(error, "Failed to delete selected files");
      notificationsService.error(apiError.message);
    } finally {
      setIsBulkDeleting(false);
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
          const parsedError = parseApiError(err, "Upload failed");
          const primaryDetail = parsedError.details[0] || parsedError.message;
          statuses[idx] = {
            file,
            status: "error",
            error: `Failed: ${primaryDetail}`,
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
        const apiError = parseApiError(error, "Failed to refresh media");
        setItems([]);
        setFetchError(apiError.message);
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
      setSelectedIds(new Set());
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
        ...(columnWidths["name"] ? { width: columnWidths["name"] } : { flex: 1 }),
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
                    title={row.description || ""}
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
                  {getFileIcon(row.mimeType, row.extension, type)}
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
        width: columnWidths["size"] || 100,
        renderCell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {formatFileSize(row.size)}
          </Typography>
        ),
      },
      {
        field: "usageCount",
        headerName: "Usage",
        width: columnWidths["usageCount"] || 80,
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
        width: columnWidths["mimeType"] || 140,
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
        width: columnWidths["updatedAt"] || 130,
        renderCell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {formatDate(row.updatedAt || row.createdAt)}
          </Typography>
        ),
      },
      {
        field: "actions",
        headerName: "",
        width: columnWidths["actions"] || 60,
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
  }, [viewMode, columnWidths]);

  const mediaSettings = config?.settings ?? {};
  const preferredFormatSetting = mediaSettings["Media.PreferredFormat"]?.trim();
  const preferredFormatLabel = preferredFormatSetting
    ? preferredFormatSetting.toUpperCase()
    : "the preferred format";
  const maxDimensionsSetting = mediaSettings["Media.Max.Dimensions"]?.trim();
  const maxDimensionsLabel = maxDimensionsSetting || "configured max dimensions";
  const coverDimensionsSetting = mediaSettings["Media.Cover.Dimensions"]?.trim();
  const coverDimensionsLabel = coverDimensionsSetting || "configured cover dimensions";

  const bulkOperationFolderLabel = bulkOperationFolder ? `/${bulkOperationFolder}` : "root folder";
  const renameFolderClientError = getRenameFolderClientError(
    renameFolderSource,
    renameFolderTarget
  );
  const renameFolderDisplayError = renameFolderError || renameFolderClientError;

  return (
    <Box sx={{ p: 5, maxWidth: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 6,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
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
              startAdornment: (
                <InputAdornment position="start" sx={{ p: 0 }}>
                  <IconButton sx={{ p: 0 }}>
                    <Search size={18} />
                  </IconButton>
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end" sx={{ p: 0 }}>
                  <IconButton sx={{ p: 0 }} onClick={() => setSearch("")} aria-label="Clear search">
                    <X size={18} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={(theme) => ({
              minWidth: 400,
              backgroundColor: theme.palette.background.secondary,
              "& .MuiInputBase-input": {
                fontSize: "0.9rem",
                padding: 2,
                "&::placeholder": {
                  fontSize: "0.9rem",
                  opacity: 0.6,
                },
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#E4E4E7",
              },
            })}
          />
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                width: 35,
                height: 35,
              },
            }}
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
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
          <IconButton
            size="small"
            onClick={(event) => setFolderMenuAnchorEl(event.currentTarget)}
            aria-label="Folder actions"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Button variant="contained" onClick={() => setDialog("upload")}>
            Upload
          </Button>
        </Box>
      </Box>
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
      {/* Selection toolbar */}
      {selectedIds.size > 0 && (
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: 1.5,
            px: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            bgcolor: "primary.50",
            border: "1px solid",
            borderColor: "primary.200",
            borderRadius: 2,
          }}
        >
          <Checkbox
            checked={selectedIds.size === selectableItems.length}
            indeterminate={selectedIds.size > 0 && selectedIds.size < selectableItems.length}
            onChange={toggleSelectAll}
            size="small"
          />
          <Chip label={`${selectedIds.size} selected`} size="small" color="primary" />
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setIsBulkDeleteDialogOpen(true)}
          >
            Delete Selected
          </Button>
          <Button size="small" variant="text" onClick={() => setSelectedIds(new Set())}>
            Clear Selection
          </Button>
        </Paper>
      )}
      {/* Content area with loading/error states */}
      {fetchError ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 300,
            py: 6,
            px: 2,
          }}
        >
          <Box
            sx={{
              p: 6,
              textAlign: "center",
              backgroundColor: "grey.50",
              borderRadius: 3,
              border: "2px dashed",
              borderColor: "grey.300",
              maxWidth: 500,
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 3,
                color: "error.main",
              }}
            >
              <AlertCircle size={48} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "grey.700",
              }}
            >
              Error loading media
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "grey.600",
                lineHeight: 1.6,
              }}
            >
              {fetchError}
            </Typography>
          </Box>
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
            const maxMimeTypeLength = 15;
            const mimeTypeDisplay =
              item.mimeType.length > maxMimeTypeLength
                ? `${item.mimeType.slice(0, maxMimeTypeLength)}...`
                : item.mimeType;
            const isMimeTypeTrimmed = mimeTypeDisplay !== item.mimeType;

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
                          title={item.description || ""}
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
                        {getFileIcon(item.mimeType, item.extension, type)}
                      </Box>
                    )}
                  </Box>
                  {/* Selection checkbox for files */}
                  {!isFolder && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        zIndex: 3,
                        opacity: selectedIds.has(item.id) ? 1 : 0,
                        transition: "opacity 0.15s",
                        ".MuiPaper-root:hover &": {
                          opacity: 1,
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(item.id);
                      }}
                    >
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        size="small"
                        sx={{
                          bgcolor: "rgba(255,255,255,0.85)",
                          borderRadius: 1,
                          p: 0.25,
                          "&:hover": {
                            bgcolor: "rgba(255,255,255,1)",
                          },
                        }}
                      />
                    </Box>
                  )}
                  {/* Actions (hover only) */}
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
                      if (isFolder) {
                        setFolderMenuAnchorEl(e.currentTarget);
                        setFolderMenuItem(item);
                      } else {
                        handleMenuOpen(e, item);
                      }
                    }}
                  >
                    <IconButton size="small" sx={{ bgcolor: "white", borderRadius: "50%" }}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
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
                        <Tooltip
                          title={item.mimeType}
                          arrow
                          disableHoverListener={!isMimeTypeTrimmed}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: 12,
                              ml: 2,
                              flexShrink: 1,
                              minWidth: 0,
                              maxWidth: 110,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                              textAlign: "right",
                            }}
                          >
                            {mimeTypeDisplay}
                          </Typography>
                        </Tooltip>
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
            checkboxSelection
            disableRowSelectionOnClick
            isRowSelectable={(params) =>
              getFileType(params.row.mimeType, params.row.extension) !== "folder"
            }
            rowSelectionModel={{
              type: "include",
              ids: new Set(
                Array.from(selectedIds).map((id) => {
                  const row = items.find((i) => i.id === id);
                  return row
                    ? row.location ||
                        `${row.scopeUid || "root"}:${row.name}:${row.mimeType}:${row.createdAt}`
                    : id;
                })
              ),
            }}
            onRowSelectionModelChange={(model: GridRowSelectionModel) => {
              const ids = new Set<number>();
              model.ids.forEach((rowId) => {
                const row = items.find(
                  (i) =>
                    (i.location ||
                      `${i.scopeUid || "root"}:${i.name}:${i.mimeType}:${i.createdAt}`) === rowId
                );
                if (row) ids.add(row.id);
              });
              setSelectedIds(ids);
            }}
            onRowClick={handleRowClick}
            sortingMode="server"
            onSortModelChange={handleGridSortChange}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => {
              setColumnVisibilityModel(newModel);
            }}
            onColumnWidthChange={(params) => {
              setColumnWidths((prev) => ({
                ...prev,
                [params.colDef.field]: params.width,
              }));
            }}
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
        {menuItem && menuItem.mimeType !== "inode/directory" && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              handleRenameOpen(menuItem);
            }}
          >
            <DriveFileRenameOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Move / Rename
          </MenuItem>
        )}
        {/* Only show Rename/Delete for files, not folders */}
        {menuItem && menuItem.mimeType !== "inode/directory" && (
          <MenuItem onClick={() => handleDelete(menuItem)}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        )}
      </Menu>
      <Menu
        anchorEl={folderMenuAnchorEl}
        open={Boolean(folderMenuAnchorEl)}
        onClose={handleFolderMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            handleFolderMenuClose();
            handleRenameFolderOpen();
          }}
          disabled={!(folderMenuItem?.scopeUid || currentScopeUid)}
        >
          <DriveFileRenameOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Rename Folder
        </MenuItem>
        <MenuItem
          onClick={() => {
            const targetFolder = folderMenuItem?.scopeUid || currentScopeUid;
            setBulkOperationFolder(targetFolder);
            handleFolderMenuClose();
            setBulkDialog("optimize");
          }}
        >
          <AutoFixHighIcon fontSize="small" sx={{ mr: 1 }} /> Optimize Folder
        </MenuItem>
        <MenuItem
          onClick={() => {
            const targetFolder = folderMenuItem?.scopeUid || currentScopeUid;
            setBulkOperationFolder(targetFolder);
            handleFolderMenuClose();
            setBulkDialog("reset");
          }}
        >
          <RestoreIcon fontSize="small" sx={{ mr: 1 }} /> Reset Folder
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleFolderMenuClose();
            handleDeleteFolderOpen();
          }}
          disabled={!(folderMenuItem?.scopeUid || currentScopeUid)}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete Folder
        </MenuItem>
      </Menu>
      <Dialog
        open={isRenameFolderDialogOpen}
        onClose={() => {
          if (isRenamingFolder) return;
          setIsRenameFolderDialogOpen(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rename Folder</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2, overflow: "visible" }}
        >
          <TextField
            label="Current folder"
            value={renameFolderSource || "Root"}
            size="small"
            fullWidth
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="New folder path"
            value={renameFolderTarget}
            onChange={(e) => {
              setRenameFolderTarget(e.target.value);
              setRenameFolderError(null);
            }}
            size="small"
            fullWidth
            error={Boolean(renameFolderDisplayError)}
            helperText={renameFolderDisplayError || " "}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "grey.200",
                bgcolor: "grey.50",
              }}
            >
              <Typography variant="body2" color="text.primary">
                Renaming updates folder references in content. The CMS will attempt to update them.
              </Typography>
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "grey.200",
                bgcolor: "grey.50",
              }}
            >
              <Typography variant="body2" color="text.primary">
                Renaming is recursive and affects all nested folders.
              </Typography>
              {renameFolderSource.includes("/") && (
                <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                  To rename a subfolder, use its full path: folder/subfolder → folder/subfolder2.
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsRenameFolderDialogOpen(false)}
            variant="text"
            disabled={isRenamingFolder}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRenameFolderConfirm}
            variant="contained"
            disabled={isRenamingFolder || Boolean(renameFolderClientError)}
            startIcon={isRenamingFolder ? <CircularProgress size={14} /> : undefined}
          >
            {isRenamingFolder ? "Renaming..." : "Rename"}
          </Button>
        </DialogActions>
      </Dialog>
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
              You are about to delete &quot;{deleteTarget?.name}&quot;.
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
      <Dialog
        open={isDeleteFolderDialogOpen}
        onClose={() => {
          if (isDeletingFolder) return;
          setIsDeleteFolderDialogOpen(false);
          setDeleteFolderTarget(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Folder</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              You are about to delete the folder &quot;{deleteFolderTarget || "Root"}&quot; and all
              its contents.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This will permanently delete all media files in this folder and its subfolders. Any
              content linking to these files will return 404 errors.
            </Typography>
            <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
              This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsDeleteFolderDialogOpen(false);
              setDeleteFolderTarget(null);
            }}
            variant="text"
            disabled={isDeletingFolder}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteFolderConfirm}
            variant="contained"
            color="error"
            disabled={isDeletingFolder}
            startIcon={isDeletingFolder ? <CircularProgress size={14} /> : undefined}
          >
            {isDeletingFolder ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isRenameDialogOpen}
        onClose={() => {
          if (isRenaming) return;
          setIsRenameDialogOpen(false);
          setRenameTarget(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Move / Rename</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            This will update the file name and/or folder and attempt to update references. The file
            appears in at least {renameTarget?.usageCount ?? 0} place(s).
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
          {renameError && (
            <Typography variant="body2" color="error">
              {renameError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsRenameDialogOpen(false);
              setRenameTarget(null);
            }}
            variant="text"
            disabled={isRenaming}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRenameConfirm}
            variant="contained"
            disabled={isRenaming}
            startIcon={isRenaming ? <CircularProgress size={14} /> : undefined}
          >
            {isRenaming ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={bulkDialog !== null}
        onClose={() => {
          if (isBulkOptimizing || isBulkResetting) return;
          setBulkDialog(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{bulkDialog === "reset" ? "Reset Folder" : "Optimize Folder"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.200",
              bgcolor: "grey.50",
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
              Target Folder
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {bulkOperationFolderLabel}
            </Typography>
          </Box>
          {bulkDialog === "reset" ? (
            <Typography variant="body2" color="text.secondary">
              {"Reset restores all images in this folder"}
              {" to the original uploaded files. Any optimizations, resizes, or crops will be "}
              {"undone, and we will attempt to update references if file names change."}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {"We will optimize all images in this folder"}
              {". Images are converted to "}
              {preferredFormatLabel}
              {" and resized to stay within "}
              {maxDimensionsLabel}
              {" while keeping aspect ratio. Cover images are fit into a fixed size "}
              {coverDimensionsLabel}
              {"."}
            </Typography>
          )}
          <FormControlLabel
            control={
              <Switch
                checked={includeSubfolders}
                onChange={(e) => setIncludeSubfolders(e.target.checked)}
              />
            }
            label="Include subfolders"
          />
          <Typography variant="caption" color="text.secondary">
            {includeSubfolders
              ? "All nested folders will be included in this action."
              : "Only the current folder will be affected."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setBulkDialog(null)}
            variant="text"
            disabled={isBulkOptimizing || isBulkResetting}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (bulkDialog === "reset") {
                await handleBulkReset();
              } else {
                await handleBulkOptimize();
              }
              setBulkDialog(null);
            }}
            variant="contained"
            disabled={isBulkOptimizing || isBulkResetting}
            startIcon={
              isBulkOptimizing || isBulkResetting ? <CircularProgress size={14} /> : undefined
            }
          >
            {bulkDialog === "reset"
              ? isBulkResetting
                ? "Resetting..."
                : "Reset"
              : isBulkOptimizing
              ? "Optimizing..."
              : "Optimize"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Bulk Delete Dialog */}
      <Dialog
        open={isBulkDeleteDialogOpen}
        onClose={() => {
          if (isBulkDeleting) return;
          setIsBulkDeleteDialogOpen(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Selected Files</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              You are about to delete{" "}
              <Box component="span" sx={{ fontWeight: 600 }}>
                {selectedIds.size}
              </Box>{" "}
              file(s).
            </Typography>
            {totalUsageCount > 0 ? (
              <Typography variant="body2" color="text.secondary">
                These files are collectively used in{" "}
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {totalUsageCount}
                </Box>{" "}
                place(s). Deleting them may cause broken links.
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                These files do not appear to be used anywhere and can likely be deleted safely.
              </Typography>
            )}
            <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
              This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsBulkDeleteDialogOpen(false)}
            variant="text"
            disabled={isBulkDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkDeleteConfirm}
            variant="contained"
            color="error"
            disabled={isBulkDeleting}
            startIcon={isBulkDeleting ? <CircularProgress size={14} /> : undefined}
          >
            {isBulkDeleting ? "Deleting..." : `Delete ${selectedIds.size} File(s)`}
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
        onFileUpdate={(updatedFile) => {
          const updated = updatedFile as MediaItem;
          setPreviewFile(updated);
          setItems((prev) => {
            const idx = prev.findIndex((item) => item.id === updated.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = { ...next[idx], ...updated };
              return next;
            }
            // File was renamed/moved — refresh list in background
            refreshMediaList();
            return prev;
          });
        }}
        onDelete={async (file) => {
          setPreviewOpen(false);
          const item = file as MediaItem;
          const deletePromise = async () => {
            const pathToFile = `${item.scopeUid}/${item.name}`;
            const result = await api.mediaDelete(pathToFile);
            await refreshMediaList();
            return result;
          };
          try {
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
          } catch {
            // error already handled by notificationsService
          }
        }}
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
