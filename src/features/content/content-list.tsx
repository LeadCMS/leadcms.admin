import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Box,
  InputAdornment,
  TextField,
  CircularProgress,
} from "@mui/material";
import { ContentDetailsDto } from "@lib/network/swagger-client";
import { ContentListContainer } from "./index.styled";
import { useEffect, useState, useRef } from "react";
import { Plus, Search, MoreHorizontal, Edit, Copy, Trash2, ExternalLink } from "lucide-react";
import { useRequestContext } from "@providers/request-provider";
import { useConfig } from "@providers/config-provider";
import { ModuleWrapper } from "@components/module-wrapper";
import { getContentCoverImageUrl } from "@lib/network/utils";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import Chip from "@mui/material/Chip";
import { Theme, useTheme } from "@mui/material/styles";
import { idToDisplayName } from "./content-types";
import { useNotificationsService } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { execDeleteWithToast } from "utils/general-helper";
import { GhostLink } from "@components/ghost-link";
import { openSitePreview } from "utils/preview-helper";

// Extended config interface to handle settings not in the swagger definition
interface ExtendedConfig {
  settings?: {
    LivePreviewUrlTemplate?: string;
    PreviewUrlTemplate?: string;
  };
}

export const ContentList = () => {
  const { client } = useRequestContext();
  const { config } = useConfig();
  const { notificationsService } = useNotificationsService();
  const errorDetailsModal = useErrorDetailsModal();
  const showErrorModal =
    errorDetailsModal?.Show ||
    ((data: unknown) => console.error("Error modal not available:", data));
  const [contentItems, setContentItems] = useState<ContentDetailsDto[]>([]);
  const [contentItemsCount, setContentItemsCount] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(false);

  // Check if preview features are available from backend config
  const configSettings = (config as ExtendedConfig)?.settings;
  const hasSitePreview = !!configSettings?.PreviewUrlTemplate;

  // Fetch data logic for InfiniteScroll
  const fetchData = async () => {
    setIsLoading(true);
    const filter: Record<string, unknown> = {
      "filter[order]": "updatedAt desc",
      "filter[skip]": contentItems.length,
      "filter[limit]": 20,
    };
    if (searchText) {
      filter.query = searchText;
      filter["filter[skip]"] = contentItems.length;
    }
    try {
      const { data, headers } = await client.api.contentList(filter);
      // Deduplicate by id
      setContentItems((prev) => {
        const map = new Map<number, ContentDetailsDto>();
        prev.forEach((item) => {
          if (item.id != null) map.set(item.id, item);
        });
        data.forEach((item: ContentDetailsDto) => {
          if (item.id != null) map.set(item.id, item);
        });
        return Array.from(map.values());
      });
      let totalCount = contentItemsCount;
      if (headers && typeof headers.get === "function") {
        const count = headers.get("x-total-count");
        if (count) totalCount = parseInt(count, 10);
      }
      setContentItemsCount(totalCount);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and search
  useEffect(() => {
    setContentItems([]);
    setContentItemsCount(0);
    initialLoadRef.current = false;
    scrollTargetRef.current?.scrollTo?.(0, 0);
    fetchData();
    // eslint-disable-next-line
  }, [searchText]);

  // Action handlers
  const handleDeleteClick = (contentId: number) => {
    setDeleteTarget(contentId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleteDialogOpen(false);

    try {
      await execDeleteWithToast(
        async () => {
          await client.api.contentDelete(deleteTarget);
        },
        notificationsService,
        "content",
        showErrorModal
      );

      // Remove the deleted item from the list with animation
      setContentItems((prevItems) => prevItems.filter((item) => item.id !== deleteTarget));
      setContentItemsCount((prevCount) => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error("Failed to delete content:", error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  // Controls for leftContainerChildren
  const leftControls = (
    <Box display="flex" alignItems="center" gap={2}>
      <TextField
        size="small"
        placeholder="Search content..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={20} />
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: 320, flexGrow: 1, height: 40 }}
      />
    </Box>
  );

  return (
    <ModuleWrapper
      breadcrumbs={[]}
      currentBreadcrumb={"Content"}
      leftContainerChildren={leftControls}
      extraActionsContainerChildren={null}
      addButtonContainerChildren={
        <Button
          variant="contained"
          to="/content/new"
          component={GhostLink}
          startIcon={<Plus />}
          sx={{ height: 40 }}
        >
          {"Add Content"}
        </Button>
      }
    >
      <ContentListContainer>
        {isLoading && contentItems.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <InfiniteScroll
              dataLength={contentItems.length}
              next={fetchData}
              hasMore={contentItemsCount !== contentItems.length}
              loader={contentItems.length < contentItemsCount ? <h4>Loading...</h4> : null}
              hasChildren={true}
              scrollableTarget="scrollTarget"
              style={{ overflow: "unset" }}
            >
              <Grid container spacing={4} id="scrollTarget" ref={scrollTargetRef}>
                {contentItems.map((item) => (
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}
                    key={`content-${item.id}`}
                    sx={{ mb: 3, minWidth: 290, maxWidth: 330 }}
                  >
                    <ItemCard
                      item={item}
                      onDelete={handleDeleteClick}
                      hasSitePreview={hasSitePreview}
                      previewUrlTemplate={configSettings?.PreviewUrlTemplate}
                      key={`content-card-${item.id}`}
                    />
                  </Grid>
                ))}
              </Grid>
            </InfiniteScroll>
          </>
        )}
        {/* Delete dialog */}
        <Dialog open={isDeleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Content</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete
              {deleteTarget ? " this content? " : " selected content? "}
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </ContentListContainer>
    </ModuleWrapper>
  );
};

interface ItemProps {
  item: ContentDetailsDto;
  onDelete: (id: number) => void;
  hasSitePreview?: boolean;
  previewUrlTemplate?: string;
}

const ItemCard = ({ item, onDelete, hasSitePreview, previewUrlTemplate }: ItemProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const { notificationsService } = useNotificationsService();

  const onClickEdit = () => {
    navigate(`/content/${item.id}/edit`);
  };
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleDelete = () => {
    onDelete(item.id as number);
    setAnchorEl(null);
  };

  const handleDuplicate = () => {
    navigate(`/content/${item.id}/duplicate`);
    setAnchorEl(null);
  };

  const handlePreview = () => {
    if (hasSitePreview && previewUrlTemplate) {
      const success = openSitePreview(
        item as unknown as Record<string, unknown>,
        previewUrlTemplate
      );
      if (!success) {
        notificationsService.error(
          "Cannot open site preview. Please ensure all required fields are filled."
        );
      }
    }
    setAnchorEl(null);
  };

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: 414,
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: 1,
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 6 },
      }}
      variant="outlined"
    >
      <Box
        sx={{
          position: "relative",
          height: 180,
          width: "100%",
          overflow: "hidden",
        }}
      >
        {item.type && (
          <Chip
            label={idToDisplayName(item.type)}
            size="small"
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 2,
              fontWeight: 700,
              fontSize: 12,
              height: 24,
              borderRadius: 1,
              backgroundColor: getTypeColor(item.type, theme),
              color: theme.palette.getContrastText(getTypeColor(item.type, theme)),
              boxShadow: 1,
            }}
          />
        )}
        <CardMedia
          component="img"
          image={getContentCoverImageUrl(item.coverImageUrl)}
          alt={item.coverImageAlt || item.title || ""}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
            "&:hover": { transform: "scale(1.05)" },
          }}
        />
        {/* Future: badges/overlays can be placed here */}
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 4, pb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2.5}>
          <Chip
            label={item.language?.toUpperCase() || "-"}
            size="small"
            variant="outlined"
            sx={{ borderRadius: 1, fontSize: 12, height: 24, fontWeight: 700 }}
          />
          <Typography variant="caption" color="text.secondary">
            {item.createdAt && new Date(item.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
        <Typography
          gutterBottom
          variant="subtitle1"
          fontWeight={600}
          component="div"
          noWrap
          sx={{ mb: 2, lineHeight: 1.3, maxHeight: 40 }}
        >
          {item.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2.5,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", pl: 4, pr: 4, pt: 0, pb: 3 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Typography variant="body2" color="text.secondary">
            {item.author}
          </Typography>
        </Box>
        <Box display="flex" gap={1.5}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={onClickEdit}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="More">
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreHorizontal size={20} />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {hasSitePreview && (
              <MenuItem onClick={handlePreview}>
                <ExternalLink size={16} style={{ marginRight: 8 }} />
                Preview on Site
              </MenuItem>
            )}
            <MenuItem onClick={onClickEdit}>
              <Edit size={16} style={{ marginRight: 8 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={handleDuplicate}>
              <Copy size={16} style={{ marginRight: 8 }} />
              Duplicate
            </MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
              <Trash2 size={16} style={{ marginRight: 8 }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>
      </CardActions>
    </Card>
  );
};

// Utility to generate a color from a string (content type)
function getTypeColor(type: string, theme: Theme): string {
  // Ensure we're using the kebab-case ID format for consistent color generation
  const processedType = type.includes(" ") ? type.toLowerCase().replace(/\s+/g, "-") : type;

  let hash = 0;
  for (let i = 0; i < processedType.length; i++) {
    hash = processedType.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Avoid red zone: skip hues between 0-20 and 340-360 (red range)
  let hue = (Math.abs(hash) % 320) + 20; // 20-339
  if (hue > 360) hue = 360;
  const lightness = theme.palette.mode === "dark" ? 32 : 48;
  return `hsl(${hue}, 65%, ${lightness}%)`;
}
