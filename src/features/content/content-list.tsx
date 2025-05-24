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
import {
  Add,
  MoreHoriz,
  Edit,
  Visibility,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useRequestContext } from "@providers/request-provider";
import { contentBreadcrumbLinks } from "@features/content/constants";
import { ModuleWrapper } from "@components/module-wrapper";
import { getContentCoverImageUrl } from "@lib/network/utils";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import Chip from "@mui/material/Chip";
import { Theme, useTheme } from "@mui/material/styles";

export const ContentList = () => {
  const { client } = useRequestContext();
  const [contentItems, setContentItems] = useState<ContentDetailsDto[]>([]);
  const [contentItemsCount, setContentItemsCount] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(false);

  // Fetch data logic for InfiniteScroll
  const fetchData = async () => {
    setIsLoading(true);
    const filter: Record<string, unknown> = {
      "filter[order]": "createdAt desc",
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
  const handleDelete = (id: number) => {
    setDeleteTarget(id);
    setIsDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = () => {
    // TODO: implement delete logic
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
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: 320, flexGrow: 1, height: 40 }}
      />
    </Box>
  );

  return (
    <ModuleWrapper
      breadcrumbs={contentBreadcrumbLinks}
      currentBreadcrumb={"Content"}
      leftContainerChildren={leftControls}
      extraActionsContainerChildren={null}
      addButtonContainerChildren={
        <Button variant="contained" href="/content/new" startIcon={<Add />} sx={{ height: 40 }}>
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
                    size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    key={`content-${item.id}`}
                    sx={{ mb: 3 }}
                  >
                    <ItemCard
                      item={item}
                      onDelete={handleDelete}
                      key={`content-card-${item.id}`}
                    />
                  </Grid>
                ))}
              </Grid>
            </InfiniteScroll>
          </>
        )}
        {/* Delete dialog */}
        <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
          <DialogTitle>Delete Content</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete
              {deleteTarget ? " this content?" : " selected content?"}
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteDialogOpen(false)} color="primary">
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
}

const ItemCard = ({ item, onDelete }: ItemProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const onClickView = () => {
    navigate(`/content/${item.id}/view`);
  };
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

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: 360,
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
          aspectRatio: "16/9",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {item.type && (
          <Chip
            label={item.type}
            size="small"
            sx={{
              position: "absolute",
              top: 16, // increased from 12
              left: 16, // increased from 12
              zIndex: 2,
              fontWeight: 700,
              fontSize: 12,
              height: 24, // increased from 22
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
          <Tooltip title="View">
            <IconButton size="small" onClick={onClickView}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={onClickEdit}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="More">
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreHoriz fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={onClickView}>View</MenuItem>
            <MenuItem onClick={onClickEdit}>Edit</MenuItem>
            <MenuItem disabled>Duplicate</MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
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
  let hash = 0;
  for (let i = 0; i < type.length; i++) {
    hash = type.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Avoid red zone: skip hues between 0-20 and 340-360 (red range)
  let hue = Math.abs(hash) % 320 + 20; // 20-339
  if (hue > 360) hue = 360;
  const lightness = theme.palette.mode === "dark" ? 32 : 48;
  return `hsl(${hue}, 65%, ${lightness}%)`;
}
