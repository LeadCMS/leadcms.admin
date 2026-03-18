import { useEffect, useState, useCallback, ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRequestContext } from "providers/request-provider";
import { useNotificationsService } from "@hooks";
import { useConfig } from "@providers/config-provider";
import { CoreModule, getCoreModuleRoute, getEditFormRoute } from "lib/router";
import { ModuleWrapper } from "@components/module-wrapper";
import { campaignFormBreadcrumbLinks, campaignViewHeader } from "./constants";
import {
  CampaignDetailsDto,
  CampaignStatisticsDto,
  CampaignRecipientDetailsDto,
} from "lib/network/swagger-client";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  LinearProgress,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { GridColDef } from "@mui/x-data-grid";
import {
  Users,
  Send,
  XCircle,
  Clock,
  Ban,
  Edit,
  Copy,
  Pause,
  Play,
  Info,
  Calendar,
  Loader2,
} from "lucide-react";

import { formatTimezoneShort, formatTimezoneLong } from "utils/timezone-helpers";
import { showApiError } from "@utils/api-error-parser";
import { ENTITY_KEYS, hasEntity } from "@utils/entity-availability";
import { DataList, DateValueFormatter, DateValueGetter } from "@components/data-list";

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

const recipientStatusColors: Record<
  string,
  "default" | "primary" | "success" | "error" | "warning" | "info"
> = {
  Pending: "default",
  Sending: "info",
  Sent: "success",
  Failed: "error",
  Skipped: "warning",
};

const recipientGridSettingsStorageKey = "campaign-recipients-grid-settings";

const getCampaignStatusIcon = (status: CampaignStatus) => {
  switch (status) {
    case "Sending":
      return (
        <Box
          component={Loader2}
          size={14}
          sx={{
            animation: "campaign-status-spin 1s linear infinite",
            "@keyframes campaign-status-spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
      );
    case "Scheduled":
      return <Calendar size={14} />;
    case "Sent":
      return <Send size={14} />;
    case "Paused":
      return <Pause size={14} />;
    case "Cancelled":
      return <Ban size={14} />;
    default:
      return <Clock size={14} />;
  }
};

type DetailRow = {
  label: string;
  value: ReactNode;
};

const compactRows = (rows: DetailRow[]) =>
  rows.filter((r) => {
    if (r.value === null || r.value === undefined) return false;
    if (typeof r.value === "string") return r.value.trim().length > 0;
    return true;
  });

const StatCard = ({ label, value, icon }: { label: string; value: ReactNode; icon: ReactNode }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 1,
        bgcolor: theme.palette.mode === "dark" ? "action.hover" : "grey.50",
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: 1.5,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            bgcolor: "primary.main",
            opacity: 0.12,
          }}
        />
        <Box
          sx={{
            color: "primary.main",
            display: "flex",
            position: "relative",
          }}
        >
          {icon}
        </Box>
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

const SectionCard = ({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: ReactNode;
  rows: DetailRow[];
}) => {
  if (rows.length === 0) return null;
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              color: "text.secondary",
              display: "flex",
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: "grid", rowGap: 1.5 }}>
          {rows.map((row) => (
            <Box
              key={row.label}
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <Typography variant="body2" color="text.secondary" component="div">
                {row.label}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={500}
                component="div"
                sx={{
                  textAlign: "right",
                  wordBreak: "break-word",
                }}
              >
                {row.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export const CampaignView = () => {
  const { id } = useParams<{ id: string }>();
  const { client } = useRequestContext();
  const { config } = useConfig();
  const { notificationsService } = useNotificationsService();
  const navigate = useNavigate();
  const hasSegments = hasEntity(config?.entities, ENTITY_KEYS.segment);

  const [campaign, setCampaign] = useState<CampaignDetailsDto | null>(null);
  const [statistics, setStatistics] = useState<CampaignStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [confirmCampaignAction, setConfirmCampaignAction] = useState<
    "launch" | "pause" | "resume" | "cancel" | null
  >(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [recipientColumns, setRecipientColumns] = useState<
    GridColDef<CampaignRecipientDetailsDto>[]
  >([
    {
      field: "contact.FullName",
      headerName: "Contact Name",
      width: 240,
      valueGetter: (_value, row) => row.contact?.fullName || "-",
    },
    {
      field: "contact.Email",
      headerName: "Email",
      width: 280,
      valueGetter: (_value, row) => row.contact?.email || "-",
    },
    {
      field: "contact.FirstName",
      headerName: "First Name",
      minWidth: 140,
      valueGetter: (_value, row) => row.contact?.firstName || "-",
    },
    {
      field: "contact.LastName",
      headerName: "Last Name",
      minWidth: 140,
      valueGetter: (_value, row) => row.contact?.lastName || "-",
    },
    {
      field: "contactId",
      headerName: "Contact ID",
      minWidth: 120,
      valueGetter: (_value, row) => row.contactId ?? "-",
    },
    {
      field: "effectiveTimezone",
      headerName: "Timezone",
      minWidth: 120,
      valueGetter: (_value, row) => formatTimezoneShort(row.effectiveTimezone ?? 0),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 140,
      renderCell: ({ row }) => {
        const recipientStatus = row.status || "Unknown";
        const isSending = String(recipientStatus) === "Sending";
        return (
          <Chip
            size="small"
            label={recipientStatus}
            color={recipientStatusColors[recipientStatus] || "default"}
            variant="outlined"
            icon={isSending ? <Loader2 size={14} className="animate-spin" /> : undefined}
          />
        );
      },
    },
    {
      field: "skipReason",
      headerName: "Skip Reason",
      minWidth: 160,
      valueGetter: (_value, row) =>
        row.skipReason && row.skipReason !== "None" ? row.skipReason : "-",
    },
    {
      field: "sentOrExpectedAt",
      headerName: "Sent / Expected At",
      minWidth: 240,
      align: "center",
      headerAlign: "center",
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        const sentValue = row.sentAt;
        const expectedValue = row.expectedSendAtUtc;
        const offsetMin = row.effectiveTimezone ?? 0;

        const formatUtc = (iso: string) => {
          const d = new Date(iso);
          if (Number.isNaN(d.getTime())) return null;
          return d.toLocaleString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        };

        const formatAtOffset = (iso: string) => {
          const d = new Date(iso);
          if (Number.isNaN(d.getTime())) return null;
          const shifted = new Date(d.getTime() + offsetMin * 60_000);
          return shifted.toLocaleString(undefined, {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          });
        };

        const tzLabel = formatTimezoneShort(offsetMin);

        const renderTwoLines = (browserLabel: string, icon: React.ReactNode, iconColor: string) => {
          const clientLabel = formatAtOffset(sentValue || expectedValue || "");
          const tooltipTitle = clientLabel
            ? `Top: recipient local time (${tzLabel}), when email is expected for them. ` +
              "Bottom: shown in your local PC/browser time."
            : "Shown in your local PC/browser time.";
          return (
            <Tooltip title={tooltipTitle} arrow placement="top">
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    color: iconColor,
                    display: "flex",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </Box>
                <Box>
                  {clientLabel && (
                    <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.6 }}>
                      {clientLabel} {tzLabel}
                    </Typography>
                  )}
                  <Typography
                    variant={clientLabel ? "caption" : "body2"}
                    sx={{
                      mt: clientLabel ? 1.25 : 0,
                      color: clientLabel ? "text.secondary" : "text.primary",
                      lineHeight: clientLabel ? 1.2 : 1.6,
                      display: "block",
                    }}
                  >
                    {browserLabel}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          );
        };

        if (sentValue) {
          const label = formatUtc(sentValue);
          if (!label) return "-";
          return renderTwoLines(label, <Send size={14} />, "success.main");
        }

        if (expectedValue) {
          const label = formatUtc(expectedValue);
          if (!label) return "-";
          return renderTwoLines(label, <Calendar size={14} />, "info.main");
        }

        return (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2">-</Typography>
          </Box>
        );
      },
    },
    {
      field: "errorMessage",
      headerName: "Error",
      minWidth: 240,
      valueGetter: (_value, row) => row.errorMessage || "-",
    },
    {
      field: "createdAt",
      headerName: "Created",
      minWidth: 180,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "updatedAt",
      headerName: "Updated",
      minWidth: 180,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
  ]);

  const loadCampaign = useCallback(async () => {
    if (!id) return;
    try {
      const result = await client.api.campaignsDetail(Number(id));
      setCampaign(result.data);
    } catch {
      notificationsService.error("Failed to load campaign.");
    } finally {
      setLoading(false);
    }
  }, [id, client, notificationsService]);

  const loadStatistics = useCallback(async () => {
    if (!id) return;
    try {
      const result = await client.api.campaignsStatisticsList(Number(id));
      setStatistics(result.data);
    } catch {
      // statistics may not be available
    }
  }, [id, client]);

  useEffect(() => {
    loadCampaign();
    loadStatistics();
  }, [loadCampaign, loadStatistics]);

  const getRecipientsList = async (mainQuery: string) => {
    if (!id) return null;
    const result = await client.api.campaignsRecipientsList(Number(id), { query: mainQuery });
    return {
      data: result.data || [],
      headers: {
        get: (key: string) => {
          if (key.toLowerCase() !== "x-total-count") return null;
          const headerValue =
            (result as unknown as { headers?: Headers }).headers?.get("x-total-count") || null;
          return headerValue ?? String(result.data?.length || 0);
        },
      } as unknown as Headers,
    };
  };

  const handleCancel = async () => {
    if (!campaign?.id) return;
    setActionLoading(true);
    try {
      await client.api.campaignsCancelCreate(campaign.id);
      notificationsService.success("Campaign cancelled.");
      loadCampaign();
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to cancel campaign.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    if (!campaign?.id) return;
    setActionLoading(true);
    try {
      await client.api.campaignsPauseCreate(campaign.id);
      notificationsService.success("Campaign paused.");
      loadCampaign();
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to pause campaign.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!campaign?.id) return;
    setActionLoading(true);
    try {
      await client.api.campaignsResumeCreate(campaign.id);
      notificationsService.success("Campaign resumed.");
      loadCampaign();
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to resume campaign.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!campaign) return;
    setActionLoading(true);
    try {
      await client.api.campaignsCreate({
        name: `${campaign.name} (Copy)`,
        description: campaign.description || undefined,
        emailTemplateId: campaign.emailTemplateId,
        segmentIds: campaign.segmentIds,
        excludeSegmentIds: campaign.excludeSegmentIds || undefined,
        timeZone: campaign.timeZone || undefined,
        useContactTimeZone: campaign.useContactTimeZone,
        language: campaign.language || undefined,
      });
      notificationsService.success("Campaign duplicated.");
      navigate(getCoreModuleRoute(CoreModule.campaigns));
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to duplicate campaign.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLaunch = async () => {
    if (!campaign?.id) return;
    setActionLoading(true);
    try {
      await client.api.campaignsLaunchCreate(campaign.id, {
        sendNow: !campaign.scheduledAt,
        scheduledAt: campaign.scheduledAt || undefined,
        timeZone: campaign.timeZone || undefined,
        useContactTimeZone: campaign.useContactTimeZone,
      });
      notificationsService.success(
        campaign.scheduledAt
          ? "Campaign scheduled successfully."
          : "Campaign launched successfully."
      );
      loadCampaign();
      loadStatistics();
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to launch campaign.");
    } finally {
      setActionLoading(false);
    }
  };

  const closeCampaignActionConfirm = () => {
    if (actionLoading) return;
    setConfirmCampaignAction(null);
  };

  const actionDialogConfig = (() => {
    switch (confirmCampaignAction) {
      case "launch":
        return {
          title: "Launch Campaign",
          message:
            "Are you sure you want to launch this campaign? This will start campaign delivery.",
          confirmLabel: "Launch",
          confirmColor: "success" as const,
          loadingLabel: "Launching...",
        };
      case "pause":
        return {
          title: "Pause Campaign",
          message: "Are you sure you want to pause this campaign?",
          confirmLabel: "Pause",
          confirmColor: "warning" as const,
          loadingLabel: "Pausing...",
        };
      case "resume":
        return {
          title: "Resume Campaign",
          message: "Are you sure you want to resume this campaign?",
          confirmLabel: "Resume",
          confirmColor: "success" as const,
          loadingLabel: "Resuming...",
        };
      case "cancel":
        return {
          title: "Cancel Campaign",
          message: "Are you sure you want to cancel this campaign? This action cannot be undone.",
          confirmLabel: "Cancel Campaign",
          confirmColor: "error" as const,
          loadingLabel: "Cancelling...",
        };
      default:
        return null;
    }
  })();

  const handleConfirmedCampaignAction = async () => {
    const action = confirmCampaignAction;
    if (!action) return;

    if (action === "launch") {
      await handleLaunch();
      setConfirmCampaignAction(null);
      return;
    }

    if (action === "pause") {
      await handlePause();
      setConfirmCampaignAction(null);
      return;
    }

    if (action === "resume") {
      await handleResume();
      setConfirmCampaignAction(null);
      return;
    }

    await handleCancel();
    setConfirmCampaignAction(null);
  };

  if (loading) {
    return (
      <ModuleWrapper
        breadcrumbs={campaignFormBreadcrumbLinks}
        currentBreadcrumb={campaignViewHeader}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 4,
          }}
        >
          <CircularProgress />
        </Box>
      </ModuleWrapper>
    );
  }

  if (!campaign) {
    return (
      <ModuleWrapper
        breadcrumbs={campaignFormBreadcrumbLinks}
        currentBreadcrumb={campaignViewHeader}
      >
        <Alert severity="error">Campaign not found</Alert>
      </ModuleWrapper>
    );
  }

  const status = campaign.status || "Draft";
  const isEditable = status === "Draft" || status === "Scheduled" || status === "Paused";
  const isLaunchable = status === "Draft";
  const isCancellable = status === "Scheduled";
  const isPausable = status === "Sending";
  const isResumable = status === "Paused";

  const totalRecipients = statistics?.totalRecipients ?? campaign.totalRecipients ?? 0;
  const sentCount = statistics?.sentCount ?? campaign.sentCount ?? 0;
  const failedCount = statistics?.failedCount ?? campaign.failedCount ?? 0;
  const skippedCount = statistics?.skippedCount ?? campaign.skippedCount ?? 0;

  const deliveryRate = totalRecipients > 0 ? (sentCount / totalRecipients) * 100 : 0;

  const getTimezoneLabel = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "";
    return formatTimezoneLong(value);
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString();
  };

  const subtitleParts = [
    campaign.emailTemplate?.name && `Template: ${campaign.emailTemplate.name}`,
    campaign.scheduledAt && `Scheduled: ${formatDateTime(campaign.scheduledAt)}`,
    campaign.scheduledAt && formatTimezoneShort(campaign.timeZone ?? 0),
    campaign.createdAt && `Created: ${formatDateOnly(campaign.createdAt)}`,
  ]
    .filter(Boolean)
    .join(" \u00B7 ");

  const campaignInfoRows = compactRows([
    {
      label: "Description",
      value: campaign.description || "",
    },
    {
      label: "Template Name",
      value:
        campaign.emailTemplate?.name ||
        (campaign.emailTemplateId ? `Template #${campaign.emailTemplateId}` : ""),
    },
    {
      label: "Template ID",
      value: campaign.emailTemplateId ?? "",
    },
    {
      label: "Subject",
      value: campaign.emailTemplate?.subject || "",
    },
    {
      label: "Language",
      value: campaign.language || "",
    },
    {
      label: "Created",
      value: campaign.createdAt ? formatDateOnly(campaign.createdAt) : "",
    },
    {
      label: "Updated",
      value: campaign.updatedAt ? formatDateOnly(campaign.updatedAt) : "",
    },
  ]);

  const scheduleRows = compactRows([
    {
      label: "Scheduled At",
      value: formatDateTime(campaign.scheduledAt),
    },
    {
      label: "Timezone",
      value: campaign.useContactTimeZone
        ? "Contact's timezone (priority)"
        : getTimezoneLabel(campaign.timeZone),
    },
    {
      label: "Fallback Timezone",
      value: campaign.useContactTimeZone ? getTimezoneLabel(campaign.timeZone) : "",
    },
    {
      label: "Send Started",
      value: formatDateTime(campaign.sendStartedAt),
    },
    {
      label: "Send Completed",
      value: formatDateTime(campaign.sendCompletedAt),
    },
  ]);

  return (
    <ModuleWrapper breadcrumbs={campaignFormBreadcrumbLinks} currentBreadcrumb={campaign.name}>
      {/* Header Card */}
      <Card variant="outlined" sx={{ mt: 4, mb: 3 }}>
        <CardContent
          sx={{
            p: 3,
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
            gap: 3,
          }}
        >
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: "primary.main",
            }}
          >
            <Send size={32} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="h5" fontWeight={700}>
                {campaign.name}
              </Typography>
              <Chip
                icon={getCampaignStatusIcon(status)}
                label={statusConfig[status]?.label || status}
                color={statusConfig[status]?.color || "default"}
                size="small"
                variant="filled"
              />
            </Box>
            {subtitleParts ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitleParts}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                No additional details
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            {isEditable && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Edit size={16} />}
                onClick={() =>
                  navigate(
                    `${getCoreModuleRoute(CoreModule.campaigns)}/${getEditFormRoute(
                      campaign.id ?? 0
                    )}`
                  )
                }
              >
                Edit
              </Button>
            )}
            {isLaunchable && (
              <Button
                variant="outlined"
                size="small"
                color="success"
                startIcon={<Send size={16} />}
                onClick={() => setConfirmCampaignAction("launch")}
                disabled={actionLoading}
              >
                Launch
              </Button>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<Copy size={16} />}
              onClick={handleDuplicate}
              disabled={actionLoading}
            >
              Duplicate
            </Button>
            {isPausable && (
              <Button
                variant="outlined"
                size="small"
                color="warning"
                startIcon={<Pause size={16} />}
                onClick={() => setConfirmCampaignAction("pause")}
                disabled={actionLoading}
              >
                Pause
              </Button>
            )}
            {isResumable && (
              <Button
                variant="outlined"
                size="small"
                color="success"
                startIcon={<Play size={16} />}
                onClick={() => setConfirmCampaignAction("resume")}
                disabled={actionLoading}
              >
                Resume
              </Button>
            )}
            {isCancellable && (
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<Ban size={16} />}
                onClick={() => setConfirmCampaignAction("cancel")}
                disabled={actionLoading}
              >
                Cancel
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v)}>
        <Tab value={0} label="Overview" />
        <Tab
          value={1}
          label={
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <span>Recipients</span>
              {totalRecipients > 0 && (
                <Box
                  sx={{
                    minWidth: 20,
                    px: 0.75,
                    borderRadius: 999,
                    bgcolor: "action.selected",
                    fontSize: "0.75rem",
                    lineHeight: 1.4,
                    fontWeight: 600,
                  }}
                >
                  {totalRecipients.toLocaleString()}
                </Box>
              )}
            </Box>
          }
        />
      </Tabs>
      <Divider />

      {/* Overview Tab */}
      {tabValue === 0 && (
        <Box sx={{ py: 3 }}>
          {/* Stats Row */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                label="Recipients"
                value={totalRecipients.toLocaleString()}
                icon={<Users size={18} />}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Sent" value={sentCount.toLocaleString()} icon={<Send size={18} />} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                label="Failed"
                value={failedCount.toLocaleString()}
                icon={<XCircle size={18} />}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                label="Skipped"
                value={skippedCount.toLocaleString()}
                icon={<Clock size={18} />}
              />
            </Grid>
          </Grid>

          {/* Performance */}
          {sentCount > 0 && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">Delivery Rate</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {deliveryRate.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={deliveryRate}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                    }}
                  />
                </Box>
                {statistics && (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    {(statistics.skippedUnsubscribed ?? 0) > 0 && (
                      <Chip
                        size="small"
                        label={`Unsubscribed: ${statistics.skippedUnsubscribed}`}
                        variant="outlined"
                        color="warning"
                      />
                    )}
                    {(statistics.skippedDuplicate ?? 0) > 0 && (
                      <Chip
                        size="small"
                        label={`Duplicate: ${statistics.skippedDuplicate}`}
                        variant="outlined"
                        color="warning"
                      />
                    )}
                    {(statistics.skippedSuppressed ?? 0) > 0 && (
                      <Chip
                        size="small"
                        label={`Suppressed: ${statistics.skippedSuppressed}`}
                        variant="outlined"
                        color="warning"
                      />
                    )}
                    {(statistics.skippedInvalidEmail ?? 0) > 0 && (
                      <Chip
                        size="small"
                        label={`Invalid Email: ${statistics.skippedInvalidEmail}`}
                        variant="outlined"
                        color="error"
                      />
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SectionCard
                title="Campaign Info"
                icon={<Info size={18} />}
                rows={campaignInfoRows}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SectionCard title="Schedule" icon={<Calendar size={18} />} rows={scheduleRows} />
            </Grid>
          </Grid>

          {hasSegments && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      color: "text.secondary",
                      display: "flex",
                    }}
                  >
                    <Users size={18} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Segments
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {campaign.segmentIds.map((segId) => (
                    <Chip
                      key={segId}
                      label={`Segment #${segId}`}
                      variant="outlined"
                      icon={<Users size={14} />}
                    />
                  ))}
                </Box>
                {campaign.excludeSegmentIds && campaign.excludeSegmentIds.length > 0 && (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                      Excluded Segments
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      {campaign.excludeSegmentIds.map((segId) => (
                        <Chip
                          key={segId}
                          label={`Segment #${segId}`}
                          variant="outlined"
                          color="error"
                        />
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Recipients Tab */}
      {tabValue === 1 && (
        <Box sx={{ py: 3 }}>
          <DataList
            columns={recipientColumns}
            setColumns={setRecipientColumns}
            gridSettingsStorageKey={`${recipientGridSettingsStorageKey}-${id || "0"}`}
            defaultFilterOrderColumn="createdAt"
            defaultFilterOrderDirection="desc"
            searchText=""
            getModelDataList={getRecipientsList}
            initialGridState={{
              sorting: {
                sortModel: [
                  {
                    field: "createdAt",
                    sort: "desc",
                  },
                ],
              },
              columns: {
                columnVisibilityModel: {
                  "contact.FullName": false,
                  "contact.FirstName": false,
                  "contact.LastName": false,
                  contactId: false,
                  createdAt: false,
                  updatedAt: false,
                },
              },
            }}
            showActionsColumn={false}
            enableRowSelection={false}
          />
        </Box>
      )}

      {/* Campaign Action Confirmation Dialog */}
      <Dialog open={Boolean(confirmCampaignAction)} onClose={closeCampaignActionConfirm}>
        <DialogTitle>{actionDialogConfig?.title || "Confirm Action"}</DialogTitle>
        <DialogContent>
          <DialogContentText>{actionDialogConfig?.message || ""}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCampaignActionConfirm} disabled={actionLoading}>
            No
          </Button>
          <Button
            onClick={() => void handleConfirmedCampaignAction()}
            color={actionDialogConfig?.confirmColor || "primary"}
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading
              ? actionDialogConfig?.loadingLabel || "Processing..."
              : actionDialogConfig?.confirmLabel || "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </ModuleWrapper>
  );
};
