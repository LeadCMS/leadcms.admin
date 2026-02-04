import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  CircularProgress,
  Breadcrumbs,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Search, X } from "lucide-react";
import FolderIcon from "@mui/icons-material/Folder";
import { useRequestContext } from "@providers/request-provider";
import { wrapApiClient } from "@lib/network/wrapApiClient";
import { buildAbsoluteUrlWithCacheBust } from "@lib/network/utils";

export type MediaItem = {
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
};

interface ImageSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  onSelectItem?: (item: MediaItem) => void;
  onSelectMultiple?: (imageUrls: string[]) => void;
  initialFolder?: string;
  selectionMode?: "single" | "multiple";
  maxSelection?: number;
}

// Helper for file size formatting
function formatFileSize(size: number | undefined) {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

export const ImageSelectionDialog: React.FC<ImageSelectionDialogProps> = ({
  open,
  onClose,
  onSelect,
  onSelectItem,
  onSelectMultiple,
  initialFolder = "",
  selectionMode = "single",
  maxSelection,
}) => {
  const { client } = useRequestContext();
  const api = useMemo(() => wrapApiClient(client.api), [client.api]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState(initialFolder);
  const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; scopeUid: string }[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);

  const isMultiSelect = selectionMode === "multiple";
  const selectedCount = isMultiSelect ? selectedItems.length : selectedItem ? 1 : 0;

  // Initialize breadcrumbs from initial folder
  useEffect(() => {
    if (initialFolder) {
      const parts = initialFolder.split("/").filter(Boolean);
      setBreadcrumbs(
        parts.map((name, idx) => ({
          name,
          scopeUid: parts.slice(0, idx + 1).join("/"),
        }))
      );
    }
  }, [initialFolder]);

  // Filter items to only show images
  const imageItems = useMemo(
    () => items.filter((item) => item.mimeType.startsWith("image/")),
    [items]
  );

  const folderItems = useMemo(
    () => items.filter((item) => item.mimeType === "inode/directory"),
    [items]
  );

  // Load media for current folder
  const loadMedia = useCallback(
    async (scopeUid: string) => {
      setLoading(true);
      try {
        const response = await api.mediaList({ scopeUid, includeFolders: true });
        const validItems = ((response.data || []) as MediaItem[])
          .filter((item: MediaItem) => item.id !== undefined)
          .map((item: MediaItem) => ({ ...item, id: item.id as number }));
        setItems(validItems);
      } catch (error) {
        console.error("Failed to load media:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  // Search media
  const searchMedia = useCallback(
    async (query: string) => {
      setLoading(true);
      try {
        const response = await api.mediaList({ query });
        const validItems = ((response.data || []) as MediaItem[])
          .filter((item: MediaItem) => item.id !== undefined)
          .map((item: MediaItem) => ({ ...item, id: item.id as number }));
        setItems(validItems);
      } catch (error) {
        console.error("Failed to search media:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  // Load media when folder changes or search is performed
  useEffect(() => {
    if (!open) return;

    if (search) {
      searchMedia(search);
    } else {
      loadMedia(currentFolder);
    }
  }, [open, currentFolder, search, loadMedia, searchMedia]);

  const handleFolderClick = (item: MediaItem) => {
    setCurrentFolder(item.scopeUid);
    setBreadcrumbs((prev) => [...prev, { name: item.name, scopeUid: item.scopeUid }]);
    setSearch("");
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setCurrentFolder("");
      setBreadcrumbs([]);
    } else {
      setCurrentFolder(breadcrumbs[index].scopeUid);
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    }
    setSearch("");
  };

  const handleImageSelect = (item: MediaItem) => {
    if (!isMultiSelect) {
      setSelectedItem(item);
      return;
    }

    setSelectedItems((prev) => {
      const isAlreadySelected = prev.some((selected) => selected.id === item.id);
      if (isAlreadySelected) {
        return prev.filter((selected) => selected.id !== item.id);
      }

      if (maxSelection && prev.length >= maxSelection) {
        return prev;
      }

      return [...prev, item];
    });
  };

  const handleConfirmSelection = () => {
    if (isMultiSelect) {
      if (selectedItems.length > 0) {
        onSelectMultiple?.(selectedItems.map((item) => item.location));
      }
      return;
    }

    if (selectedItem) {
      onSelect(selectedItem.location);
      onSelectItem?.(selectedItem);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {isMultiSelect ? "Select Images" : "Select Image"}
            {isMultiSelect && selectedCount > 0 ? ` (${selectedCount})` : ""}
          </Typography>
          <IconButton onClick={onClose}>
            <X />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2}>
          {/* Search and Navigation */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search images..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <Search size={20} style={{ marginRight: 8, color: "#666" }} />,
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch("")} aria-label="Clear">
                      <X size={18} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>

          {/* Breadcrumbs */}
          {!search && (
            <Grid size={{ xs: 12 }}>
              <Breadcrumbs>
                <Button size="small" onClick={() => handleBreadcrumbClick(-1)}>
                  Root
                </Button>
                {breadcrumbs.map((bc, idx) => (
                  <Button
                    key={`${bc.scopeUid}-${idx}`}
                    size="small"
                    onClick={() => handleBreadcrumbClick(idx)}
                  >
                    {bc.name}
                  </Button>
                ))}
              </Breadcrumbs>
            </Grid>
          )}

          {/* Content Area */}
          <Grid size={{ xs: 12 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
                {/* Folders */}
                {!search && folderItems.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Folders
                    </Typography>
                    <Grid container spacing={2}>
                      {folderItems.map((item) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`${item.id}-${item.scopeUid}`}>
                          <Paper
                            elevation={1}
                            sx={{
                              position: "relative",
                              cursor: "pointer",
                              bgcolor: "#FFF8E1",
                              border: "1px solid #FFE082",
                              borderRadius: 2,
                              overflow: "hidden",
                              transition: "all 0.2s",
                              "&:hover": {
                                elevation: 3,
                                bgcolor: "#FFF59D",
                                transform: "translateY(-2px)",
                              },
                            }}
                            onClick={() => handleFolderClick(item)}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                p: 3,
                                minHeight: 120,
                              }}
                            >
                              <FolderIcon
                                sx={{
                                  fontSize: 48,
                                  color: "#FFA726",
                                  mb: 1,
                                }}
                              />
                              <Typography
                                variant="body2"
                                align="center"
                                noWrap
                                sx={{ fontWeight: 500, maxWidth: "100%" }}
                                title={item.name}
                              >
                                {item.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                {item.id} items
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Images */}
                {imageItems.length > 0 ? (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Images ({imageItems.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {imageItems.map((item) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={`${item.id}-${item.location}`}>
                          <Paper
                            elevation={
                              isMultiSelect
                                ? selectedItems.some((selected) => selected.id === item.id)
                                  ? 3
                                  : 1
                                : selectedItem?.id === item.id
                                ? 3
                                : 1
                            }
                            sx={{
                              position: "relative",
                              cursor: "pointer",
                              border: isMultiSelect
                                ? selectedItems.some((selected) => selected.id === item.id)
                                  ? "2px solid"
                                  : "1px solid #e0e0e0"
                                : selectedItem?.id === item.id
                                ? "2px solid"
                                : "1px solid #e0e0e0",
                              borderColor: isMultiSelect
                                ? selectedItems.some((selected) => selected.id === item.id)
                                  ? "primary.main"
                                  : "#e0e0e0"
                                : selectedItem?.id === item.id
                                ? "primary.main"
                                : "#e0e0e0",
                              borderRadius: 2,
                              overflow: "hidden",
                              transition: "all 0.2s",
                              "&:hover": {
                                elevation: 3,
                                transform: "translateY(-2px)",
                              },
                            }}
                            onClick={() => handleImageSelect(item)}
                          >
                            <Box
                              sx={{
                                position: "relative",
                                paddingBottom: "75%", // 4:3 aspect ratio
                                overflow: "hidden",
                                bgcolor: "#F5F5F5",
                              }}
                            >
                              <Box
                                component="img"
                                src={buildAbsoluteUrlWithCacheBust(
                                  item.location,
                                  item.size,
                                  item.updatedAt
                                )}
                                alt={item.name}
                                title={item.description || ""}
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </Box>
                            <Box p={1.5}>
                              <Typography
                                variant="body2"
                                noWrap
                                title={item.name}
                                sx={{ fontWeight: 500, mb: 0.5 }}
                              >
                                {item.name}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ textTransform: "uppercase" }}
                                >
                                  {item.extension.replace(".", "")}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatFileSize(item.size)}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography color="text.secondary">
                      {search ? "No images found for your search" : "No images in this folder"}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleConfirmSelection} disabled={selectedCount === 0}>
          {isMultiSelect ? "Select Images" : "Select Image"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
