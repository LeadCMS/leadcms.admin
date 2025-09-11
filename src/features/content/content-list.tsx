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
  CircularProgress,
} from "@mui/material";
import { ContentDetailsDto } from "@lib/network/swagger-client";
import { ContentListContainer } from "./index.styled";
import { useEffect, useState, useRef } from "react";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Filter,
  SortAsc,
  SortDesc,
  Languages,
  Sparkles,
} from "lucide-react";
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
import { GridColDef } from "@mui/x-data-grid";
import { getWhereFilterQuery } from "@providers/query-provider";
import { CustomFilterBar } from "@components/custom-filter";
import { ContentSortPopup } from "@components/content-sort-popup";
import useLocalStorage from "use-local-storage";
import NoRecordsDisplay from "@components/no-records-display";
import { SearchBar } from "@components/search-bar";
import { ToolbarButton } from "@components/tool-bar-button";
import { TranslateDialog, TranslationType } from "@components/translate-dialog";
import { useGlobalLanguageFilter } from "@providers/global-language-filter-provider";
import { ContentLanguageBadges } from "@components/content-language-badges";

// Extended config interface to handle settings not in the swagger definition
interface ExtendedConfig {
  settings?: {
    LivePreviewUrlTemplate?: string;
    PreviewUrlTemplate?: string;
  };
  defaultLanguage?: string;
}

type ContentListFilterSettings = {
  whereFilters: Array<{ whereField: string; whereOperator: string; whereFieldValue: string }>;
  sortField: string;
  sortDirection: "asc" | "desc";
  searchTerm?: string;
};

const CONTENT_FILTERS_KEY = "content-list-filters";

export const ContentList = () => {
  const { client } = useRequestContext();
  const { config } = useConfig();
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const { selectedLanguage, isLanguageFilterActive } = useGlobalLanguageFilter();
  const navigate = useNavigate();
  const [contentItems, setContentItems] = useState<ContentDetailsDto[]>([]);
  const [contentItemsCount, setContentItemsCount] = useState<number>(0);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(false);
  const [sortAnchorEl, setSortAnchorEl] = useState<HTMLElement | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const [storedSettings, setStoredSettings] = useLocalStorage<ContentListFilterSettings>(
    CONTENT_FILTERS_KEY,
    {
      whereFilters: [],
      sortField: "updatedAt",
      sortDirection: "desc",
      searchTerm: "",
    }
  );
  const [whereFilters, setWhereFilters] = useState(storedSettings.whereFilters);
  const [sortField, setSortField] = useState(storedSettings.sortField);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(storedSettings.sortDirection);
  const [searchTerm, setSearchTerm] = useState(storedSettings?.searchTerm ?? "");
  const [searching, setSearching] = useState(false);

  // Check if preview features are available from backend config
  const configSettings = (config as ExtendedConfig)?.settings;
  const hasSitePreview = !!configSettings?.PreviewUrlTemplate;
  const defaultLanguage = config?.defaultLanguage;

  const contentFilterColumns: GridColDef[] = [
    { field: "title", headerName: "Title" },
    { field: "description", headerName: "Description" },
    { field: "body", headerName: "Body" },
    { field: "slug", headerName: "Slug" },
    { field: "type", headerName: "Type" },
    { field: "author", headerName: "Author" },
    { field: "language", headerName: "Language" },
    { field: "category", headerName: "Category" },
    { field: "tags", headerName: "Tags" },
    { field: "publishedAt", headerName: "Published At" },
    { field: "createdAt", headerName: "Created At" },
    { field: "updatedAt", headerName: "Updated At" },
  ];

  const addFilter = (
    filter: { whereField?: string; whereOperator?: string; whereFieldValue?: string },
    _removeIdx?: number,
    editIdx?: number
  ) => {
    setWhereFilters((old) => {
      if (typeof editIdx === "number" && editIdx >= 0) {
        const copy = [...old];
        copy[editIdx] = filter as {
          whereField: string;
          whereOperator: string;
          whereFieldValue: string;
        };
        return copy;
      }
      return [
        ...old,
        filter as { whereField: string; whereOperator: string; whereFieldValue: string },
      ];
    });
  };

  const removeFilter = (idx: number) => {
    setWhereFilters((old) => old.filter((_, i) => i !== idx));
  };

  const clearAllFilters = () => setWhereFilters([]);

  const buildWhereQuery = () => {
    const queries = whereFilters
      .map((f) => {
        const query = getWhereFilterQuery(
          f.whereField || "",
          f.whereFieldValue || "",
          f.whereOperator || ""
        );
        return query;
      })
      .filter(Boolean);
    const joined = queries.join("");
    return joined;
  };

  const handleSortButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };
  const handleSortPopupClose = () => setSortAnchorEl(null);
  const handleSortDirectionToggle = () => setSortDirection((d) => (d === "asc" ? "desc" : "asc"));

  // Fetch data logic for InfiniteScroll
  const fetchData = async () => {
    setIsLoading(true);
    const filter: Record<string, unknown> = {
      ["filter[order]"]: `${sortField} ${sortDirection === "asc" ? "" : "desc"}`.trim(),
      "filter[skip]": !initialLoadRef.current ? 0 : contentItems.length,
      "filter[limit]": 20,
      // Include translations if multi-language
      includeTranslations: (config?.languages?.length || 0) > 1,
    };

    if (searchTerm.trim() !== "") {
      filter.query = searchTerm;
      setSearching(true);
    }

    const whereQuery = buildWhereQuery();

    // Add global language filter if active
    let globalLanguageQuery = "";
    if (isLanguageFilterActive && selectedLanguage !== "all") {
      globalLanguageQuery = getWhereFilterQuery("language", selectedLanguage, "equals");
    }

    // Combine all queries
    const combinedQuery = [whereQuery, globalLanguageQuery].filter(Boolean).join("");
    if (combinedQuery) {
      filter.query = (filter.query || "") + combinedQuery;
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
      setSearching(false);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setStoredSettings({
      whereFilters,
      sortField,
      sortDirection,
    });
  }, [whereFilters, sortField, sortDirection]);

  useEffect(() => {
    setWhereFilters(storedSettings.whereFilters);
    setSortField(storedSettings.sortField);
    setSortDirection(storedSettings.sortDirection);
  }, [storedSettings]);

  // Initial load and search
  useEffect(() => {
    setContentItems([]);
    setContentItemsCount(0);
    initialLoadRef.current = false;
    scrollTargetRef.current?.scrollTo?.(0, 0);
    fetchData().then(() => {
      initialLoadRef.current = true;
    });
    // eslint-disable-next-line
  }, [searchTerm, whereFilters, sortField, sortDirection, selectedLanguage]);

  // AI Draft handlers
  const handleAIDraftClick = () => {
    navigate("/content/ai-draft");
  };

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

  // Translate handler
  const handleTranslate = async (
    contentId: number,
    targetLanguage: string,
    translationType: TranslationType
  ) => {
    // Navigate to translation route
    navigate(`/content/${contentId}/translate/${targetLanguage}/${translationType}`);
  };

  const searchBar = (
    <SearchBar
      setSearchTermOnChange={setSearchTerm}
      searchBoxLabel={"Search content..."}
      initialValue={storedSettings?.searchTerm ?? ""}
    ></SearchBar>
  );

  const sortLabel = (() => {
    switch (sortField) {
      case "updatedAt":
        return "Updated At";
      case "publishedAt":
        return "Published At";
      case "createdAt":
        return "Created At";
      case "author":
        return "Author";
      case "title":
        return "Title";
      case "type":
        return "Type";
      default:
        return sortField;
    }
  })();

  const extraActions = [
    <ToolbarButton
      key="sort"
      onClick={handleSortButtonClick}
      startIcon={sortDirection === "asc" ? <SortAsc size={18} /> : <SortDesc size={18} />}
      sx={{
        gap: 1,
      }}
    >
      <span>Sort:</span>
      <span>{sortLabel}</span>
    </ToolbarButton>,
    <ToolbarButton
      key="filter"
      onClick={() => setFilterPanelOpen(true)}
      startIcon={<Filter size={18} />}
      sx={{
        minWidth: 0,
        py: 2,
        px: 2,
        ".MuiButton-startIcon": { marginRight: 0, marginLeft: 0 },
      }}
    />,
  ];

  return (
    <ModuleWrapper
      breadcrumbs={[]}
      currentBreadcrumb={"Content"}
      leftContainerChildren={searchBar}
      extraActionsContainerChildren={extraActions}
      addButtonContainerChildren={
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            to="/content/new"
            component={GhostLink}
            startIcon={<Plus size={18} />}
          >
            Add Content
          </Button>
          {config?.capabilities?.includes("AIAssistance") && (
            <Button
              variant="outlined"
              onClick={handleAIDraftClick}
              startIcon={<Sparkles size={18} />}
            >
              Create with AI
            </Button>
          )}
        </Box>
      }
    >
      <CustomFilterBar
        columns={contentFilterColumns}
        whereFilters={whereFilters}
        addFilter={addFilter}
        removeFilter={removeFilter}
        filterPanelOpen={filterPanelOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        clearAllFilters={clearAllFilters}
      />
      <NoRecordsDisplay
        visible={
          !searching &&
          contentItemsCount === 0 &&
          (searchTerm.trim() !== "" || whereFilters.length > 0)
        }
        message="No content found."
      />

      <ContentSortPopup
        anchorEl={sortAnchorEl}
        open={!!sortAnchorEl}
        selectedField={sortField}
        direction={sortDirection}
        onClose={handleSortPopupClose}
        onChangeField={(f) => {
          setSortField(f);
          handleSortPopupClose();
        }}
        onToggleDirection={handleSortDirectionToggle}
      />

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
                      onTranslate={handleTranslate}
                      hasSitePreview={hasSitePreview}
                      previewUrlTemplate={configSettings?.PreviewUrlTemplate}
                      defaultLanguage={defaultLanguage}
                      hasMultipleLanguages={(config?.languages?.length || 0) > 1}
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
  onTranslate: (id: number, targetLanguage: string, translationType: TranslationType) => void;
  hasSitePreview?: boolean;
  previewUrlTemplate?: string;
  defaultLanguage?: string;
  hasMultipleLanguages?: boolean;
}

const ItemCard = ({
  item,
  onDelete,
  onTranslate,
  hasSitePreview,
  previewUrlTemplate,
  defaultLanguage,
  hasMultipleLanguages = true,
}: ItemProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [translateDialogOpen, setTranslateDialogOpen] = useState(false);
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

  const handleTranslateClick = () => {
    setTranslateDialogOpen(true);
    setAnchorEl(null);
  };

  const handleTranslateConfirm = (targetLanguage: string, translationType: TranslationType) => {
    onTranslate(item.id as number, targetLanguage, translationType);
    setTranslateDialogOpen(false);
  };

  const handlePreview = () => {
    if (hasSitePreview && previewUrlTemplate) {
      const success = openSitePreview(
        item as unknown as Record<string, unknown>,
        previewUrlTemplate,
        defaultLanguage
      );
      if (!success) {
        notificationsService.error(
          "Cannot open site preview. Please ensure all required fields are filled."
        );
      }
    }
    setAnchorEl(null);
  };

  let publishedTooltipTitle = "";
  if (item.publishedAt) {
    const d = new Date(item.publishedAt);
    publishedTooltipTitle = "Published at " + d.toLocaleDateString();
  }
  let metaDateLabel = "Updated:";
  let metaDateValue = "—";
  if (item.updatedAt) {
    metaDateLabel = "Updated:";
    metaDateValue = new Date(item.updatedAt).toLocaleDateString();
  } else if (item.createdAt) {
    metaDateLabel = "Created:";
    metaDateValue = new Date(item.createdAt).toLocaleDateString();
  }

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
        {/* Published/Draft status chip */}
        <Tooltip title={publishedTooltipTitle} disableHoverListener={!item.publishedAt} arrow>
          <Chip
            label={item.publishedAt ? "Published" : "Draft"}
            color={item.publishedAt ? "success" : "warning"}
            variant="filled"
            size="small"
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 2,
              fontWeight: 700,
              fontSize: 12,
              height: 24,
              borderRadius: 1,
              boxShadow: 1,
            }}
          />
        </Tooltip>
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
        <Box display="flex" alignItems="center" gap={1} mb={2.5}>
          <Typography variant="caption" color="text.secondary">
            {metaDateLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {metaDateValue}
          </Typography>
        </Box>
        <Typography
          gutterBottom
          variant="subtitle1"
          fontWeight={600}
          component="div"
          sx={{
            mb: 2,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
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

        {/* Language Badges */}
        <ContentLanguageBadges content={item} compact={true} shape="square" />
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
            {hasMultipleLanguages && (
              <MenuItem onClick={handleTranslateClick}>
                <Languages size={16} style={{ marginRight: 8 }} />
                Translate
              </MenuItem>
            )}
            <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
              <Trash2 size={16} style={{ marginRight: 8 }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>
      </CardActions>

      {hasMultipleLanguages && (
        <TranslateDialog
          open={translateDialogOpen}
          onClose={() => setTranslateDialogOpen(false)}
          onTranslate={handleTranslateConfirm}
          originalLanguage={item.language}
          originalTitle={item.title}
        />
      )}
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
