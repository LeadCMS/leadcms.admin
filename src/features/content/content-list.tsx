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
  AlertCircle,
} from "lucide-react";
import { useRequestContext } from "@providers/request-provider";
import { useConfig } from "@providers/config-provider";
import { ModuleWrapper } from "@components/module-wrapper";
import { getContentCoverImageUrl } from "@lib/network/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import Chip from "@mui/material/Chip";
import { Theme, useTheme } from "@mui/material/styles";
import { idToDisplayName } from "./content-types";
import {
  getContentStatus,
  basicStatuses,
  deploymentStatuses,
  getStatusFilterQuery,
} from "@utils/content-status-helper";
import { useNotificationsService } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { parseApiError } from "@utils/api-error-parser";
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
import { ContentTypeFilter } from "@components/content-type-filter";

// Extended config interface to handle settings not in the swagger definition
interface ExtendedConfig {
  settings?: {
    LivePreviewUrlTemplate?: string;
    PreviewUrlTemplate?: string;
    "Deployment.LastSuccessDate"?: string;
  };
  defaultLanguage?: string;
}

type ContentListFilterSettings = {
  whereFilters: Array<{ whereField: string; whereOperator: string; whereFieldValue: string }>;
  sortField: string;
  sortDirection: "asc" | "desc";
  searchTerm?: string;
  selectedContentType?: string | null;
};

const CONTENT_FILTERS_KEY = "content-list-filters";

export const ContentList = () => {
  const { client } = useRequestContext();
  const { config } = useConfig();
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const { selectedLanguage, isLanguageFilterActive } = useGlobalLanguageFilter();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [contentItems, setContentItems] = useState<ContentDetailsDto[]>([]);
  const [contentItemsCount, setContentItemsCount] = useState<number>(0);
  const [statistics, setStatistics] = useState<Record<string, number>>({});
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
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
      selectedContentType: null,
    }
  );
  const [whereFilters, setWhereFilters] = useState(storedSettings.whereFilters);
  const [sortField, setSortField] = useState(storedSettings.sortField);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(storedSettings.sortDirection);
  const [searchTerm, setSearchTerm] = useState(storedSettings?.searchTerm ?? "");

  // Get selectedContentType from URL params or stored settings
  const urlContentType = searchParams.get("contentType");
  const [selectedContentType, setSelectedContentType] = useState<string | null>(
    urlContentType || storedSettings.selectedContentType || null
  );

  // Check if preview features are available from backend config
  const configSettings = (config as ExtendedConfig)?.settings;
  const hasSitePreview = !!configSettings?.PreviewUrlTemplate;
  const defaultLanguage = config?.defaultLanguage;
  const lastReleaseDate = configSettings?.["Deployment.LastSuccessDate"] ?? null;

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
    {
      field: "status",
      headerName: "Status",
      type: "singleSelect",
      valueOptions: (lastReleaseDate ? deploymentStatuses : basicStatuses) as unknown as string[],
    },
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

  // Content type filter handler
  const handleContentTypeChange = (contentType: string | null) => {
    setSelectedContentType(contentType);

    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams);
    if (contentType) {
      newSearchParams.set("contentType", contentType);
    } else {
      newSearchParams.delete("contentType");
    }
    setSearchParams(newSearchParams, { replace: true });
  };

  const buildWhereQuery = () => {
    const queries = whereFilters
      .map((f) => {
        if (f.whereField === "status") {
          return getStatusFilterQuery(f.whereFieldValue as never, lastReleaseDate);
        }
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
    }

    const whereQuery = buildWhereQuery();

    // Add global language filter if active
    let globalLanguageQuery = "";
    if (isLanguageFilterActive && selectedLanguage !== "all") {
      globalLanguageQuery = getWhereFilterQuery("language", selectedLanguage, "equals");
    }

    // Add content type filter if active
    let contentTypeQuery = "";
    if (selectedContentType) {
      contentTypeQuery = getWhereFilterQuery("type", selectedContentType, "equals");
    }

    // Add where filter parameters directly to the filter object
    [whereQuery, globalLanguageQuery, contentTypeQuery].filter(Boolean).forEach((queryString) => {
      const parts = queryString.split(/\s*&\s*/).filter(Boolean);
      for (const part of parts) {
        const eqIdx = part.indexOf("=");
        if (eqIdx > 0) {
          const key = part.substring(0, eqIdx).trim();
          const value = part.substring(eqIdx + 1).trim();
          if (key) filter[key] = value;
        }
      }
    });

    try {
      setLoadError(null);
      const { data, headers } = await client.api.contentWithStatisticsList(filter);

      // Extract content and statistics from response
      const contentData = data?.content || [];
      const statisticsData = data?.statistics || {};

      // Deduplicate by id
      setContentItems((prev) => {
        const map = new Map<number, ContentDetailsDto>();
        prev.forEach((item) => {
          if (item.id != null) map.set(item.id, item);
        });
        contentData.forEach((item: ContentDetailsDto) => {
          if (item.id != null) map.set(item.id, item);
        });
        return Array.from(map.values());
      });

      // Store statistics from API
      setStatistics(statisticsData);

      let totalCount = contentItemsCount;
      if (headers && typeof headers.get === "function") {
        const count = headers.get("x-total-count");
        if (count) totalCount = parseInt(count, 10);
      }
      // Stop pagination if no new items were returned
      if (contentData.length === 0 && totalCount > 0) {
        totalCount = contentItems.length;
      }
      setContentItemsCount(totalCount);
    } catch (e) {
      const apiError = parseApiError(e, "Failed to load content");
      setLoadError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setStoredSettings({
      whereFilters,
      sortField,
      sortDirection,
      searchTerm,
      selectedContentType,
    });
  }, [whereFilters, sortField, sortDirection, searchTerm, selectedContentType, setStoredSettings]);

  useEffect(() => {
    setWhereFilters(storedSettings.whereFilters);
    setSortField(storedSettings.sortField);
    setSortDirection(storedSettings.sortDirection);
  }, [storedSettings]);

  // Initial load and search
  useEffect(() => {
    setContentItems([]);
    setContentItemsCount(0);
    setStatistics({});
    initialLoadRef.current = false;
    scrollTargetRef.current?.scrollTo?.(0, 0);
    fetchData().then(() => {
      initialLoadRef.current = true;
    });
    // eslint-disable-next-line
  }, [searchTerm, whereFilters, sortField, sortDirection, selectedLanguage, selectedContentType]);

  // Auto-load more when content fits on screen without scrollbar
  useEffect(() => {
    if (isLoading || contentItems.length === 0) return;
    if (contentItems.length >= contentItemsCount) return;
    const rafId = requestAnimationFrame(() => {
      const el = document.getElementById("scrollTarget");
      if (el && el.scrollHeight <= el.clientHeight) {
        fetchData();
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [contentItems.length, contentItemsCount, isLoading]);

  // AI Draft handlers
  const handleAIDraftClick = () => {
    navigate("/content/ai-draft", {
      state: selectedContentType ? { defaultContentType: selectedContentType } : undefined,
    });
  };

  // Clear all filters handler
  const handleClearAllFilters = () => {
    setSearchTerm("");
    setWhereFilters([]);
    setSelectedContentType(null);
    clearAllFilters();

    // Clear URL params
    const newSearchParams = new URLSearchParams();
    setSearchParams(newSearchParams, { replace: true });
  };

  // Get language display name
  const getLanguageDisplayName = (languageCode: string) => {
    const language = config?.languages?.find((lang) => lang.code === languageCode);
    return language?.name || languageCode;
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
            to={
              selectedContentType
                ? `/content/new?contentType=${selectedContentType}`
                : "/content/new"
            }
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

      {/* Content Type Filter */}
      <Box sx={{ mb: 3 }}>
        <ContentTypeFilter
          selectedContentType={selectedContentType}
          onContentTypeChange={handleContentTypeChange}
          statistics={statistics}
        />
      </Box>

      {/* Error Display */}
      {loadError && !isLoading && (
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
              Error loading content
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "grey.600",
                lineHeight: 1.6,
              }}
            >
              {loadError}
            </Typography>
          </Box>
        </Box>
      )}

      <NoRecordsDisplay
        visible={!isLoading && contentItemsCount === 0 && !loadError}
        message="No content found"
        activeFilters={{
          searchTerm: searchTerm.trim() || undefined,
          contentType: selectedContentType || undefined,
          customFilters:
            whereFilters.length > 0
              ? whereFilters.map((f) => ({
                  field: f.whereField,
                  operator: f.whereOperator,
                  value: f.whereFieldValue,
                }))
              : undefined,
          languageFilter: isLanguageFilterActive ? selectedLanguage : undefined,
          languageDisplayName: isLanguageFilterActive
            ? getLanguageDisplayName(selectedLanguage)
            : undefined,
        }}
        onClearFilters={handleClearAllFilters}
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
                      lastReleaseDate={lastReleaseDate}
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
  lastReleaseDate?: string | null;
}

const ItemCard = ({
  item,
  onDelete,
  onTranslate,
  hasSitePreview,
  previewUrlTemplate,
  defaultLanguage,
  hasMultipleLanguages = true,
  lastReleaseDate,
}: ItemProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [translateDialogOpen, setTranslateDialogOpen] = useState(false);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const { notificationsService } = useNotificationsService();
  const slug = item.slug.trim();

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

  const contentStatus = getContentStatus(
    item.publishedAt ?? null,
    item.updatedAt,
    lastReleaseDate,
    item.createdAt
  );
  const coverColors = getTypeCoverColors(item.type || "", theme);
  const publishedTooltipTitle = contentStatus.tooltip || "";
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
        height: 420,
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: 1,
        cursor: "pointer",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 6 },
      }}
      variant="outlined"
      onClick={onClickEdit}
    >
      <Box
        sx={{
          position: "relative",
          height: 180,
          flexShrink: 0,
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
        {/* Content status chip */}
        <Tooltip title={publishedTooltipTitle} disableHoverListener={!publishedTooltipTitle} arrow>
          <Chip
            label={contentStatus.status}
            color={contentStatus.color}
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
        {item.coverImageUrl ? (
          <CardMedia
            component="img"
            image={getContentCoverImageUrl(
              item.coverImageUrl,
              item.updatedAt || item.createdAt || undefined
            )}
            alt={item.coverImageAlt || item.title || ""}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              bgcolor: coverColors.bg,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              p: 3,
              pt: 6,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: coverColors.text,
                fontWeight: 700,
                lineHeight: 1.3,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.title}
            </Typography>
            {item.category && (
              <Typography
                variant="caption"
                sx={{
                  color: coverColors.text,
                  opacity: 0.7,
                  mt: 0.5,
                }}
              >
                {item.category}
              </Typography>
            )}
          </Box>
        )}
      </Box>
      <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1, p: 4, pb: 3 }}>
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
            minHeight: "2.6em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.title}
        </Typography>

        {/* Language Badges */}
        <Box sx={{ mb: 2 }}>
          <ContentLanguageBadges content={item} compact={true} shape="square" />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.description}
        </Typography>
        <Box
          sx={{
            mt: "auto",
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
            px: 1.5,
            py: 1,
            borderRadius: 2,
            backgroundColor: "action.hover",
          }}
        >
          <Tooltip title={slug} placement="top-start" arrow>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                flexGrow: 1,
                minWidth: 0,
                fontFamily: "monospace",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {slug}
            </Typography>
          </Tooltip>
        </Box>
      </CardContent>
      <CardActions
        sx={{ justifyContent: "space-between", pl: 4, pr: 4, pt: 0, pb: 3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box display="flex" alignItems="center" gap={1.5} minWidth={0}>
          <Typography variant="body2" color="text.secondary" noWrap title={item.author}>
            {item.author}
          </Typography>
        </Box>
        <Box display="flex" gap={1.5} flexShrink={0}>
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

function getTypeCoverColors(type: string, theme: Theme): { bg: string; text: string } {
  const processedType = type.includes(" ") ? type.toLowerCase().replace(/\s+/g, "-") : type;
  let hash = 0;
  for (let i = 0; i < processedType.length; i++) {
    hash = processedType.charCodeAt(i) + ((hash << 5) - hash);
  }
  let hue = (Math.abs(hash) % 320) + 20;
  if (hue > 360) hue = 360;
  const isDark = theme.palette.mode === "dark";
  return {
    bg: isDark ? `hsl(${hue}, 30%, 18%)` : `hsl(${hue}, 40%, 90%)`,
    text: isDark ? `hsl(${hue}, 50%, 75%)` : `hsl(${hue}, 55%, 30%)`,
  };
}
