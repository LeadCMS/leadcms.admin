import { useState, useEffect, useCallback } from "react";
import { useRequestContext } from "providers/request-provider";
import {
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  campaignGridSettingsStorageKey,
  searchLabel,
  campaignListPageBreadcrumb,
} from "./constants";
import { dataListBreadcrumbLinks } from "utils/constants";
import { DataList, DateValueGetter } from "@components/data-list";
import { GridColDef } from "@mui/x-data-grid";
import {
  CoreModule,
  getAddFormRoute,
  getCoreModuleRoute,
  getEditFormRoute,
  getViewFormRoute,
} from "lib/router";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";
import { SearchBar } from "@components/search-bar";
import { useNotificationsService } from "@hooks";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Eye,
  Pause,
  Play,
  Plus,
  Settings2,
  Mail,
  Calendar,
  Send,
  CheckCircle2,
  Clock,
  Ban,
  Loader2,
  Download,
  Edit,
  MoreHorizontal,
  Trash2,
  Copy,
} from "lucide-react";
import { GhostLink } from "@components/ghost-link";
import { ModuleWrapper } from "@components/module-wrapper";
import { ToolbarButton } from "@components/tool-bar-button";
import { CampaignDetailsDto } from "lib/network/swagger-client";
import { useGlobalLanguageFilter } from "@providers/global-language-filter-provider";
import { getWhereFilterQuery } from "@providers/query-provider";
import { showApiError } from "@utils/api-error-parser";

type CampaignStatus = NonNullable<CampaignDetailsDto["status"]>;

const statusConfig: Record<
  CampaignStatus,
  {
    label: string;
    color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  }
> = {
  Draft: { label: "Draft", color: "default" },
  Scheduled: { label: "Scheduled", color: "info" },
  Sending: { label: "Sending", color: "info" },
  Sent: { label: "Sent", color: "success" },
  Cancelled: { label: "Cancelled", color: "default" },
  Paused: { label: "Paused", color: "warning" },
};

const getStatusIcon = (status: CampaignStatus) => {
  switch (status) {
    case "Draft":
      return <Clock size={14} />;
    case "Scheduled":
      return <Calendar size={14} />;
    case "Sending":
      return (
        <Box
          component={Loader2}
          size={14}
          sx={{
            animation: "campaign-index-status-spin 1s linear infinite",
            "@keyframes campaign-index-status-spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
      );
    case "Sent":
      return <CheckCircle2 size={14} />;
    case "Cancelled":
      return <Ban size={14} />;
    case "Paused":
      return <Clock size={14} />;
    default:
      return <Mail size={14} />;
  }
};

const formatDateTime = (dateValue: string | null | undefined) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTimezoneOffset = (timezoneOffsetMinutes: number) => {
  const utcMinutes = -timezoneOffsetMinutes;
  const sign = utcMinutes >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(utcMinutes);
  const hours = Math.floor(absoluteMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (absoluteMinutes % 60).toString().padStart(2, "0");
  return `UTC${sign}${hours}:${minutes}`;
};

const getTimezoneDescription = (campaign: CampaignDetailsDto) =>
  formatTimezoneOffset(campaign.timeZone ?? 0);

const formatScheduledWithTimezone = (campaign: CampaignDetailsDto) => {
  if (!campaign.scheduledAt) return "—";

  const date = new Date(campaign.scheduledAt);
  if (Number.isNaN(date.getTime())) return "—";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
};

export const Campaigns = () => {
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const navigate = useNavigate();
  const { selectedLanguage, isLanguageFilterActive } = useGlobalLanguageFilter();
  const [gridSettings] = useLocalStorage<DataListSettings | undefined>(
    campaignGridSettingsStorageKey,
    undefined
  );

  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [confirmCampaignAction, setConfirmCampaignAction] = useState<
    "launch" | "pause" | "resume" | "cancel" | "delete" | null
  >(null);
  const [confirmCampaign, setConfirmCampaign] = useState<CampaignDetailsDto | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuCampaign, setMenuCampaign] = useState<CampaignDetailsDto | null>(null);

  // Trigger refresh when global language filter changes
  useEffect(() => {
    setRefreshFlag((prev) => prev + 1);
  }, [selectedLanguage]);

  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    sending: 0,
    sent: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const result = await client.api.campaignsList();
      const campaigns = result.data || [];
      setStats({
        total: campaigns.length,
        scheduled: campaigns.filter((c) => c.status === "Scheduled").length,
        sending: campaigns.filter((c) => c.status === "Sending").length,
        sent: campaigns.filter((c) => c.status === "Sent").length,
      });
    } catch {
      // Stats are non-critical
    }
  }, [client]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const getCampaignsList = async (mainQuery: string) => {
    let languageQuery = "";
    if (isLanguageFilterActive && selectedLanguage !== "all") {
      languageQuery = getWhereFilterQuery("language", selectedLanguage, "equals");
    }
    const fullQuery = [mainQuery, languageQuery].filter(Boolean).join("&");
    const result = await client.api.campaignsList({
      query: fullQuery,
    });
    return {
      data: result.data || [],
      headers: {
        get: (key: string) => (key === "x-total-count" ? String(result.data?.length || 0) : null),
      } as unknown as Headers,
    };
  };

  const campaignsExportApi: (query: string, accept: string) => Promise<Response> = (
    query,
    accept
  ) => client.api.campaignsExportList({ query }, { headers: { Accept: accept } });

  const handleCampaignAction = async (
    action: () => Promise<unknown>,
    successMessage: string,
    errorMessage: string
  ) => {
    try {
      await action();
      notificationsService.success(successMessage);
      loadStats();
      setRefreshFlag((prev) => prev + 1);
    } catch (error) {
      showApiError(error, notificationsService, undefined, errorMessage);
    }
  };

  const handleExportOpen = () => {
    setOpenExport((prev) => !prev);
  };

  const handleDuplicate = async (campaign: CampaignDetailsDto) => {
    try {
      const detail = await client.api.campaignsDetail(campaign.id as number);
      const src = detail.data;
      await client.api.campaignsCreate({
        name: `Copy of ${src.name}`,
        description: src.description || undefined,
        emailTemplateId: src.emailTemplateId,
        segmentIds: src.segmentIds || [],
        excludeSegmentIds: src.excludeSegmentIds || undefined,
        timeZone: src.timeZone || undefined,
        useContactTimeZone: src.useContactTimeZone,
        language: src.language || undefined,
      });
      notificationsService.success("Campaign duplicated.");
      loadStats();
      setRefreshFlag((prev) => prev + 1);
    } catch {
      notificationsService.error("Failed to duplicate campaign.");
    }
  };

  const openCampaignActionConfirm = (
    action: "launch" | "pause" | "resume" | "cancel" | "delete",
    campaign: CampaignDetailsDto,
    event?: React.MouseEvent<HTMLElement>
  ) => {
    event?.stopPropagation();
    setConfirmCampaignAction(action);
    setConfirmCampaign(campaign);
  };

  const closeCampaignActionConfirm = () => {
    setConfirmCampaignAction(null);
    setConfirmCampaign(null);
  };

  const getCampaignViewRoute = (id: number) =>
    `${getCoreModuleRoute(CoreModule.campaigns)}/${getViewFormRoute(id)}`;

  const getCampaignEditRoute = (id: number) =>
    `${getCoreModuleRoute(CoreModule.campaigns)}/${getEditFormRoute(id)}`;

  const confirmDialogConfig = (() => {
    switch (confirmCampaignAction) {
      case "launch":
        return {
          title: "Launch Campaign",
          message:
            "Are you sure you want to launch this campaign? This will start campaign delivery.",
          confirmLabel: "Launch",
          confirmColor: "success" as const,
        };
      case "pause":
        return {
          title: "Pause Campaign",
          message: "Are you sure you want to pause this campaign?",
          confirmLabel: "Pause",
          confirmColor: "warning" as const,
        };
      case "resume":
        return {
          title: "Resume Campaign",
          message: "Are you sure you want to resume this campaign?",
          confirmLabel: "Resume",
          confirmColor: "success" as const,
        };
      case "cancel":
        return {
          title: "Cancel Campaign",
          message: "Are you sure you want to cancel this campaign? This action cannot be undone.",
          confirmLabel: "Cancel Campaign",
          confirmColor: "error" as const,
        };
      case "delete":
        return {
          title: "Delete Campaign",
          message: "Are you sure you want to delete this campaign? This action cannot be undone.",
          confirmLabel: "Delete",
          confirmColor: "error" as const,
        };
      default:
        return null;
    }
  })();

  const handleConfirmedCampaignAction = async () => {
    if (!confirmCampaign?.id || !confirmCampaignAction) return;

    const currentCampaign = confirmCampaign;
    const currentAction = confirmCampaignAction;
    closeCampaignActionConfirm();

    if (currentAction === "launch") {
      await handleCampaignAction(
        () =>
          client.api.campaignsLaunchCreate(currentCampaign.id as number, {
            sendNow: !currentCampaign.scheduledAt,
            scheduledAt: currentCampaign.scheduledAt || undefined,
            timeZone: currentCampaign.timeZone || undefined,
            useContactTimeZone: currentCampaign.useContactTimeZone,
          }),
        currentCampaign.scheduledAt
          ? "Campaign scheduled successfully."
          : "Campaign launched successfully.",
        "Failed to launch campaign."
      );
      return;
    }

    if (currentAction === "pause") {
      await handleCampaignAction(
        () => client.api.campaignsPauseCreate(currentCampaign.id as number),
        "Campaign paused.",
        "Failed to pause campaign."
      );
      return;
    }

    if (currentAction === "resume") {
      await handleCampaignAction(
        () => client.api.campaignsResumeCreate(currentCampaign.id as number),
        "Campaign resumed.",
        "Failed to resume campaign."
      );
      return;
    }

    if (currentAction === "cancel") {
      await handleCampaignAction(
        () => client.api.campaignsCancelCreate(currentCampaign.id as number),
        "Campaign cancelled.",
        "Failed to cancel campaign."
      );
      return;
    }

    if (currentAction === "delete") {
      await handleCampaignAction(
        () => client.api.campaignsDelete(currentCampaign.id as number),
        "Campaign deleted.",
        "Failed to delete campaign."
      );
      return;
    }
  };

  const [columns, setColumns] = useState<GridColDef<CampaignDetailsDto>[]>([
    {
      field: "name",
      headerName: "Campaign",
      width: 280,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            gap: 0.25,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
            {row.name}
          </Typography>
          {row.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                lineHeight: 1.3,
                maxWidth: 250,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: ({ row }) => {
        const status = row.status || "Draft";
        const config = statusConfig[status];
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Chip
              size="small"
              icon={getStatusIcon(status)}
              label={config?.label || status}
              color={config?.color || "default"}
              variant="outlined"
            />
          </Box>
        );
      },
    },
    {
      field: "totalRecipients",
      headerName: "Recipients",
      width: 120,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">{row.totalRecipients?.toLocaleString() ?? "—"}</Typography>
        </Box>
      ),
    },
    {
      field: "sentCount",
      headerName: "Sent",
      width: 100,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">{row.sentCount?.toLocaleString() ?? "—"}</Typography>
        </Box>
      ),
    },
    {
      field: "failedCount",
      headerName: "Failed",
      width: 100,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">{row.failedCount?.toLocaleString() ?? "—"}</Typography>
        </Box>
      ),
    },
    {
      field: "scheduledAt",
      headerName: "Scheduled",
      width: 280,
      align: "center",
      headerAlign: "center",
      valueGetter: DateValueGetter,
      renderCell: ({ row }) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body2">{formatScheduledWithTimezone(row)}</Typography>
          {row.scheduledAt && (
            <Typography variant="caption" color="text.secondary">
              {getTimezoneDescription(row)}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "language",
      headerName: "Language",
      width: 120,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">{row.language || "—"}</Typography>
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 180,
      valueGetter: DateValueGetter,
      renderCell: ({ row }) => (
        <Typography variant="body2">{formatDateTime(row.createdAt)}</Typography>
      ),
    },
    {
      field: "updatedAt",
      headerName: "Updated",
      width: 180,
      valueGetter: DateValueGetter,
      renderCell: ({ row }) => (
        <Typography variant="body2">{formatDateTime(row.updatedAt)}</Typography>
      ),
    },
    {
      field: "campaignControls",
      headerName: "Actions",
      width: 210,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        const status = row.status || "Draft";
        if (!row.id) return null;

        const isLaunchable = status === "Draft";
        const isPausable = status === "Sending";
        const isResumable = status === "Paused";
        const isCancellable = status === "Scheduled";

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, height: "100%" }}>
            {isLaunchable && (
              <IconButton
                size="small"
                color="success"
                onClick={(event) => {
                  openCampaignActionConfirm("launch", row, event);
                }}
              >
                <Play size={16} />
              </IconButton>
            )}
            {isPausable && (
              <IconButton
                size="small"
                color="warning"
                onClick={(event) => {
                  openCampaignActionConfirm("pause", row, event);
                }}
              >
                <Pause size={16} />
              </IconButton>
            )}
            {isResumable && (
              <IconButton
                size="small"
                color="success"
                onClick={(event) => {
                  openCampaignActionConfirm("resume", row, event);
                }}
              >
                <Play size={16} />
              </IconButton>
            )}

            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                navigate(getCampaignViewRoute(row.id as number));
              }}
            >
              <Eye size={16} />
            </IconButton>

            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                navigate(getCampaignEditRoute(row.id as number));
              }}
            >
              <Edit size={16} />
            </IconButton>

            {isCancellable && (
              <IconButton
                size="small"
                color="error"
                onClick={(event) => {
                  openCampaignActionConfirm("cancel", row, event);
                }}
              >
                <Ban size={16} />
              </IconButton>
            )}

            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                setMenuAnchorEl(event.currentTarget);
                setMenuCampaign(row);
              }}
            >
              <MoreHorizontal size={16} />
            </IconButton>
          </Box>
        );
      },
    },
  ]);

  const searchBar = (
    <SearchBar
      setSearchTermOnChange={setSearchTerm}
      searchBoxLabel={searchLabel}
      initialValue={gridSettings?.searchTerm ?? ""}
    />
  );

  const extraActions = [
    <ToolbarButton
      startIcon={<Settings2 size={18} />}
      onClick={() => setColumnsPanelOpen(true)}
      key="columns"
    >
      Columns
    </ToolbarButton>,
    <ToolbarButton key="export-btn" startIcon={<Download size={18} />} onClick={handleExportOpen}>
      Export
    </ToolbarButton>,
  ];

  const addButton = (
    <Button
      variant="contained"
      to={getAddFormRoute()}
      component={GhostLink}
      startIcon={<Plus size={18} />}
    >
      Create Campaign
    </Button>
  );

  const statsCards = (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 6, sm: 3 }}>
        <Card variant="outlined">
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                  display: "flex",
                }}
              >
                <Mail size={16} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <Card variant="outlined">
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: "info.lighter",
                  display: "flex",
                }}
              >
                <Calendar size={16} color="var(--mui-palette-info-main)" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                  {stats.scheduled}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Scheduled
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <Card variant="outlined">
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: "warning.lighter",
                  display: "flex",
                }}
              >
                <Send size={16} color="var(--mui-palette-warning-main)" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                  {stats.sending}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sending
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <Card variant="outlined">
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: "success.lighter",
                  display: "flex",
                }}
              >
                <CheckCircle2 size={16} color="var(--mui-palette-success-main)" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                  {stats.sent}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sent
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <ModuleWrapper
      breadcrumbs={dataListBreadcrumbLinks}
      currentBreadcrumb={campaignListPageBreadcrumb}
      leftContainerChildren={searchBar}
      extraActionsContainerChildren={extraActions}
      addButtonContainerChildren={addButton}
    >
      {statsCards}
      <DataList
        columns={columns}
        setColumns={setColumns}
        gridSettingsStorageKey={campaignGridSettingsStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getCampaignsList}
        initialGridState={{
          sorting: {
            sortModel: [
              {
                field: defaultFilterOrderColumn,
                sort: defaultFilterOrderDirection,
              },
            ],
          },
        }}
        columnsPanelOpen={columnsPanelOpen}
        setColumnsPanelOpen={setColumnsPanelOpen}
        onExportOpen={openExport}
        onExportClose={handleExportOpen}
        exportApiCall={campaignsExportApi}
        refreshFlag={refreshFlag}
        showActionsColumn={false}
      />

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => {
          setMenuAnchorEl(null);
          setMenuCampaign(null);
        }}
      >
        <MenuItem
          onClick={() => {
            if (menuCampaign) {
              const campaign = menuCampaign;
              setMenuAnchorEl(null);
              setMenuCampaign(null);
              void handleDuplicate(campaign);
            }
          }}
        >
          <ListItemIcon>
            <Copy size={16} />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuCampaign) {
              setMenuAnchorEl(null);
              openCampaignActionConfirm("delete", menuCampaign);
              setMenuCampaign(null);
            }
          }}
        >
          <ListItemIcon>
            <Trash2 size={16} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={Boolean(confirmCampaignAction)} onClose={closeCampaignActionConfirm}>
        <DialogTitle>{confirmDialogConfig?.title || "Confirm Action"}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialogConfig?.message || ""}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCampaignActionConfirm}>No</Button>
          <Button
            onClick={() => void handleConfirmedCampaignAction()}
            color={confirmDialogConfig?.confirmColor || "primary"}
            variant="contained"
          >
            {confirmDialogConfig?.confirmLabel || "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </ModuleWrapper>
  );
};
