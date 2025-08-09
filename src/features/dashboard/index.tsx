import React from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ToggleButton,
  ToggleButtonGroup,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { ArrowDown, ArrowUp, Building2, FileText, MessageSquare, ShoppingCart } from "lucide-react";
import { useRequestContext } from "@providers/request-provider";
import dayjs, { type Dayjs } from "dayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useTheme, alpha } from "@mui/material/styles";
import { CoreModule, getCoreModuleRoute, getEditFormRoute, getViewFormRoute } from "lib/router";
import { GhostLink } from "@components/ghost-link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import useLocalStorage from "use-local-storage";
import { useConfig } from "@providers/config-provider";
import { getDashboardAvailability } from "@features/dashboard/availability";
import type {
  SalesPerformancePointDto,
  TopAccountDto,
  OrderSummaryDto,
  ContactGrowthPointDto,
  TopContentItemDto,
  CommentSummaryDto,
  CmsMetricsDto,
  ContentGrowthPointDto,
  TopAuthorDto,
  ContentSummaryDto,
} from "lib/network/swagger-client";

type TimeRange =
  | "24h"
  | "7d"
  | "30d"
  | "90d"
  | "6m"
  | "1y"
  | "2y"
  | "3y"
  | "5y"
  | "10y"
  | "all"
  | "custom";
type GroupBy = "Day" | "Week" | "Month" | "Quarter" | "Year";

const nowIso = () => new Date().toISOString();
const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};
const getQuery = (range: TimeRange, groupBy: GroupBy, from: Dayjs | null, to: Dayjs | null) => {
  if (range === "custom") {
    if (!from || !to) return null;
    return { From: from.toDate().toISOString(), To: to.toDate().toISOString(), GroupBy: groupBy };
  }
  switch (range) {
    case "24h":
      return { From: addDays(-1), To: nowIso(), GroupBy: groupBy };
    case "7d":
      return { From: addDays(-7), To: nowIso(), GroupBy: groupBy };
    case "30d":
      return { From: addDays(-30), To: nowIso(), GroupBy: groupBy };
    case "90d":
      return { From: addDays(-90), To: nowIso(), GroupBy: groupBy };
    case "6m":
      return { From: addDays(-182), To: nowIso(), GroupBy: groupBy };
    case "1y":
      return { From: addDays(-365), To: nowIso(), GroupBy: groupBy };
    case "2y":
      return { From: addDays(-365 * 2), To: nowIso(), GroupBy: groupBy };
    case "3y":
      return { From: addDays(-365 * 3), To: nowIso(), GroupBy: groupBy };
    case "5y":
      return { From: addDays(-365 * 5), To: nowIso(), GroupBy: groupBy };
    case "10y":
      return { From: addDays(-365 * 10), To: nowIso(), GroupBy: groupBy };
    case "all":
      // Approximate "All Time" as last 35 years per requirement
      return { From: addDays(-365 * 35), To: nowIso(), GroupBy: groupBy };
  }
  return null;
};

const NumberBadge = ({
  value,
  formatter,
}: {
  value: number | null | undefined;
  formatter?: (n: number) => string;
}) => (
  <Typography variant="h5" sx={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>
    {typeof value === "number" ? (formatter ? formatter(value) : value.toLocaleString()) : "—"}
  </Typography>
);

const ChangeChip = ({ pct }: { pct?: number | null }) => {
  if (pct === null || pct === undefined) return null;
  const positive = pct >= 0;
  const value = `${Math.abs(pct).toFixed(0)}%`;
  return (
    <Chip
      size="small"
      icon={positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
      label={value}
      variant="filled"
      sx={(theme) => ({
        ml: 0,
        px: 0.75,
        height: 22,
        borderRadius: 999,
        bgcolor: positive
          ? alpha(theme.palette.success.main, 0.15)
          : alpha(theme.palette.error.main, 0.15),
        color: positive ? theme.palette.success.main : theme.palette.error.main,
        fontWeight: 600,
        "& .MuiChip-icon": { ml: 0.25 },
      })}
    />
  );
};

type CardProps = React.PropsWithChildren<{
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}>;

const Card: React.FC<CardProps> = ({ title, subtitle, action, children }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 6.25,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 1.25,
      borderRadius: 2,
      borderColor: (t) => t.palette.divider,
      transition: "box-shadow 0.2s, border-color 0.2s",
      "&:hover": { boxShadow: 6 },
    }}
  >
    {(title || action) && (
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <div>
          {title && (
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </div>
        {action}
      </Stack>
    )}
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      {children}
    </Box>
  </Paper>
);

type LineChartPoint = { label: string; a: number; b: number };

const RechartsLine = ({
  data,
  height,
  aLabel = "Orders",
  bLabel = "Revenue",
  aColor,
  bColor,
}: {
  data: LineChartPoint[];
  height?: number;
  aLabel?: string;
  bLabel?: string;
  aColor?: string;
  bColor?: string;
}) => {
  const theme = useTheme();
  const colorA = aColor || theme.palette.primary.main;
  const colorB = bColor || theme.palette.success.main;
  const tooltipFormatter = React.useCallback(
    (val: number | string, name: string): [number | string, string] => {
      return [val, name === "a" ? aLabel : bLabel];
    },
    [aLabel, bLabel]
  );
  const legendFormatter = React.useCallback(
    (value: string) => {
      return value === "a" ? aLabel : bLabel;
    },
    [aLabel, bLabel]
  );
  const boxSx = height
    ? ({ width: "100%", height } as const)
    : ({ width: "100%", flex: 1, minHeight: 300 } as const);
  return (
    <Box sx={boxSx}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 24, bottom: 28, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} allowDecimals={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
          <ReTooltip
            formatter={tooltipFormatter}
            contentStyle={{
              borderRadius: 8,
              borderColor: theme.palette.divider,
              backgroundColor: theme.palette.background.paper,
            }}
          />
          <Legend
            formatter={legendFormatter}
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ paddingTop: 8, textAlign: "center" }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="a"
            stroke={colorA}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 1.5 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="b"
            stroke={colorB}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 1.5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

const MetricTile: React.FC<{
  label: string;
  value?: number | string | null;
  valueFormatter?: (n: number) => string;
  changePct?: number | null;
  loading?: boolean;
}> = ({ label, value, valueFormatter, changePct, loading }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 6.25,
      minHeight: 140,
      display: "flex",
      flexDirection: "column",
      gap: 1.25,
      transition: "box-shadow 0.2s, border-color 0.2s",
      "&:hover": { boxShadow: 6 },
    }}
  >
    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
      {label}
    </Typography>
    {loading ? (
      <Box>
        <Skeleton width={80} height={32} />
        <Skeleton width={120} height={20} />
      </Box>
    ) : (
      <>
        <Box>
          {typeof value === "number" ? (
            <NumberBadge value={value} formatter={valueFormatter} />
          ) : (
            <Typography variant="h4">{value ?? "—"}</Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <ChangeChip pct={changePct ?? undefined} />
          {changePct !== null && changePct !== undefined && (
            <Typography variant="caption" color="text.secondary">
              {"vs. previous period"}
            </Typography>
          )}
        </Stack>
      </>
    )}
  </Paper>
);

const SectionLoader = () => (
  <Stack gap={1}>
    <Skeleton height={20} width={120} />
    <Skeleton height={140} />
  </Stack>
);

const EmptyState = ({ message = "No data" }: { message?: string }) => (
  <Typography variant="body2" color="text.secondary">
    {message}
  </Typography>
);

const formatCurrency = (amount?: number) =>
  typeof amount === "number"
    ? new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(amount)
    : "—";

const errMessage = (e: unknown, fallback: string) => {
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return fallback;
};

// Order status styling, aligned to Orders list page
const getOrderStatusColor = (
  status: string
): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "pending":
      return "warning";
    case "paid":
    case "completed":
      return "success";
    case "cancelled":
      return "error";
    case "refunded":
      return "info";
    case "failed":
      return "error";
    case "processing":
      return "info";
    default:
      return "default";
  }
};

type BarChartPoint = { label: string; v: number };

const RechartsBar = ({
  data,
  height,
  color,
  seriesLabel = "New Contacts",
}: {
  data: BarChartPoint[];
  height?: number;
  color?: string;
  seriesLabel?: string;
}) => {
  const theme = useTheme();
  const fill = color || theme.palette.primary.main;
  const tooltipFormatter = React.useCallback(
    (val: number | string) => [val, seriesLabel],
    [seriesLabel]
  );
  const legendFormatter = React.useCallback(() => seriesLabel, [seriesLabel]);
  const boxSx = height
    ? ({ width: "100%", height } as const)
    : ({ width: "100%", flex: 1, minHeight: 240 } as const);
  return (
    <Box sx={boxSx}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, bottom: 28, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <ReTooltip
            formatter={tooltipFormatter}
            contentStyle={{
              borderRadius: 8,
              borderColor: theme.palette.divider,
              backgroundColor: theme.palette.background.paper,
            }}
          />
          <Legend
            formatter={legendFormatter}
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ paddingTop: 8, textAlign: "center" }}
          />
          <Bar dataKey="v" name={seriesLabel} fill={fill} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

const Dashboard: React.FC = () => {
  const { client } = useRequestContext();
  const { config } = useConfig();
  const availability = React.useMemo(
    () => getDashboardAvailability(config?.entities),
    [config?.entities]
  );
  const [tab, setTab] = React.useState<"crm" | "cms">("crm");
  const [range, setRange] = React.useState<TimeRange>("30d");
  const [groupBy, setGroupBy] = React.useState<GroupBy>("Week");
  const [useCustom, setUseCustom] = React.useState(false);
  const [from, setFrom] = React.useState<Dayjs | null>(null);
  const [to, setTo] = React.useState<Dayjs | null>(null);
  const hydratingRef = React.useRef(false);
  const [ready, setReady] = React.useState(false);

  type DashboardSettings = {
    tab: "crm" | "cms";
    range: TimeRange;
    groupBy: GroupBy;
    useCustom: boolean;
    from: string | null;
    to: string | null;
  };
  const [saved, setSaved] = useLocalStorage<DashboardSettings | undefined>(
    "dashboard.settings",
    undefined
  );

  React.useEffect(() => {
    if (!saved) {
      setReady(true);
      return;
    }
    const currentFrom = from ? from.toDate().toISOString() : null;
    const currentTo = to ? to.toDate().toISOString() : null;
    const same =
      tab === (saved.tab ?? "crm") &&
      range === (saved.range ?? "30d") &&
      groupBy === (saved.groupBy ?? "Week") &&
      useCustom === !!saved.useCustom &&
      currentFrom === (saved.from ?? null) &&
      currentTo === (saved.to ?? null);
    if (same) {
      setReady(true);
      return;
    }
    hydratingRef.current = true;
    setTab(saved.tab ?? "crm");
    setRange(saved.range ?? "30d");
    setGroupBy(saved.groupBy ?? "Week");
    setUseCustom(!!saved.useCustom);
    setFrom(saved.from ? dayjs(saved.from) : null);
    setTo(saved.to ? dayjs(saved.to) : null);
    setTimeout(() => {
      hydratingRef.current = false;
      setReady(true);
    }, 0);
  }, [saved]);

  React.useEffect(() => {
    if (hydratingRef.current) return;
    const next = {
      tab,
      range,
      groupBy,
      useCustom,
      from: from ? from.toDate().toISOString() : null,
      to: to ? to.toDate().toISOString() : null,
    } as const;
    const same =
      saved &&
      saved.tab === next.tab &&
      saved.range === next.range &&
      saved.groupBy === next.groupBy &&
      saved.useCustom === next.useCustom &&
      saved.from === next.from &&
      saved.to === next.to;
    if (!same) setSaved(next);
  }, [tab, range, groupBy, useCustom, from, to, setSaved]);

  // CRM data
  const [metricsLoading, setMetricsLoading] = React.useState(true);
  const [metricsError, setMetricsError] = React.useState<string | null>(null);
  const [metrics, setMetrics] = React.useState<{
    totalContacts?: number;
    contactsChangePct?: number | null;
    totalAccounts?: number;
    accountsChangePct?: number | null;
    totalOrders?: number;
    ordersChangePct?: number | null;
    revenue?: number;
    revenueChangePct?: number | null;
  } | null>(null);

  const [salesLoading, setSalesLoading] = React.useState(true);
  const [salesError, setSalesError] = React.useState<string | null>(null);
  const [sales, setSales] = React.useState<SalesPerformancePointDto[] | null>(null);

  const [topAccountsLoading, setTopAccountsLoading] = React.useState(true);
  const [topAccountsError, setTopAccountsError] = React.useState<string | null>(null);
  const [topAccounts, setTopAccounts] = React.useState<TopAccountDto[] | null>(null);

  const [ordersLoading, setOrdersLoading] = React.useState(true);
  const [ordersError, setOrdersError] = React.useState<string | null>(null);
  const [orders, setOrders] = React.useState<OrderSummaryDto[] | null>(null);

  const [contactGrowthLoading, setContactGrowthLoading] = React.useState(true);
  const [contactGrowthError, setContactGrowthError] = React.useState<string | null>(null);
  const [contactGrowth, setContactGrowth] = React.useState<ContactGrowthPointDto[] | null>(null);

  // CMS data
  const [cmsMetricsLoading, setCmsMetricsLoading] = React.useState(true);
  const [cmsMetricsError, setCmsMetricsError] = React.useState<string | null>(null);
  const [cmsMetrics, setCmsMetrics] = React.useState<CmsMetricsDto | null>(null);

  const [topContentLoading, setTopContentLoading] = React.useState(true);
  const [topContentError, setTopContentError] = React.useState<string | null>(null);
  const [topContent, setTopContent] = React.useState<TopContentItemDto[] | null>(null);

  const [recentCommentsLoading, setRecentCommentsLoading] = React.useState(true);
  const [recentCommentsError, setRecentCommentsError] = React.useState<string | null>(null);
  const [recentComments, setRecentComments] = React.useState<CommentSummaryDto[] | null>(null);

  const [recentContentLoading, setRecentContentLoading] = React.useState(true);
  const [recentContentError, setRecentContentError] = React.useState<string | null>(null);
  const [recentContent, setRecentContent] = React.useState<ContentSummaryDto[] | null>(null);

  const [contentGrowthLoading, setContentGrowthLoading] = React.useState(true);
  const [contentGrowthError, setContentGrowthError] = React.useState<string | null>(null);
  const [contentGrowthCms, setContentGrowthCms] = React.useState<ContentGrowthPointDto[] | null>(
    null
  );

  const [topAuthorsLoading, setTopAuthorsLoading] = React.useState(true);
  const [topAuthorsError, setTopAuthorsError] = React.useState<string | null>(null);
  const [topAuthors, setTopAuthors] = React.useState<TopAuthorDto[] | null>(null);

  const loadCrm = React.useCallback(async () => {
    const q = getQuery(useCustom ? "custom" : range, groupBy, from, to);
    setMetricsLoading(true);
    setSalesLoading(true);
    setTopAccountsLoading(true);
    setOrdersLoading(true);
    setContactGrowthLoading(true);
    setMetricsError(null);
    setSalesError(null);
    setTopAccountsError(null);
    setOrdersError(null);
    setContactGrowthError(null);
    if (!q) {
      setMetricsLoading(false);
      setSalesLoading(false);
      setTopAccountsLoading(false);
      setOrdersLoading(false);
      setContactGrowthLoading(false);
      return;
    }
    try {
      const [m, s, ta, ro, cg] = await Promise.all([
        client.api.dashboardCrmMetricsList(q),
        client.api.dashboardCrmSalesPerformanceList(q),
        client.api.dashboardCrmTopAccountsList({ ...q, limit: 5 }),
        client.api.dashboardCrmRecentOrdersList({ limit: 5 }),
        client.api.dashboardCrmContactGrowthList(q),
      ]);
      setMetrics(m.data);
      setSales(s.data);
      setTopAccounts(ta.data);
      setOrders(ro.data);
      setContactGrowth(cg.data);
    } catch (e: unknown) {
      const msg = errMessage(e, "Failed to load CRM data");
      setMetricsError(msg);
      setSalesError(msg);
      setTopAccountsError(msg);
      setOrdersError(msg);
      setContactGrowthError(msg);
    } finally {
      setMetricsLoading(false);
      setSalesLoading(false);
      setTopAccountsLoading(false);
      setOrdersLoading(false);
      setContactGrowthLoading(false);
    }
  }, [client, range, groupBy, useCustom, from, to]);

  const loadCms = React.useCallback(async () => {
    const q = getQuery(useCustom ? "custom" : range, groupBy, from, to);
    setCmsMetricsLoading(true);
    setTopContentLoading(true);

    setRecentCommentsLoading(true);
    setRecentContentLoading(true);
    setContentGrowthLoading(true);
    setTopAuthorsLoading(true);
    setCmsMetricsError(null);
    setTopContentError(null);

    setRecentCommentsError(null);
    setRecentContentError(null);
    setContentGrowthError(null);
    setTopAuthorsError(null);
    if (!q) {
      setCmsMetricsLoading(false);
      setTopContentLoading(false);

      setRecentCommentsLoading(false);
      setRecentContentLoading(false);
      setContentGrowthLoading(false);
      setTopAuthorsLoading(false);
      return;
    }
    try {
      const [cm, tc, rc, rct, cg, ta] = await Promise.all([
        client.api.dashboardCmsMetricsList(q),
        client.api.dashboardCmsTopContentList({ ...q, limit: 5 }),
        client.api.dashboardCmsRecentCommentsList({ limit: 4 }),
        client.api.dashboardCmsRecentContentList({ limit: 5 }),
        client.api.dashboardCmsContentGrowthList(q),
        client.api.dashboardCmsTopAuthorsList(q),
      ]);
      setCmsMetrics(cm.data);
      setTopContent(tc.data);
      setRecentComments(rc.data);
      setRecentContent(rct.data);
      setContentGrowthCms(cg.data);
      setTopAuthors(ta.data);
    } catch (e: unknown) {
      const msg = errMessage(e, "Failed to load CMS data");
      setCmsMetricsError(msg);
      setTopContentError(msg);
      setRecentCommentsError(msg);
      setRecentContentError(msg);
      setContentGrowthError(msg);
      setTopAuthorsError(msg);
    } finally {
      setCmsMetricsLoading(false);
      setTopContentLoading(false);
      setRecentCommentsLoading(false);
      setRecentContentLoading(false);
      setContentGrowthLoading(false);
      setTopAuthorsLoading(false);
    }
  }, [client, range, groupBy, useCustom, from, to]);

  React.useEffect(() => {
    if (!ready || hydratingRef.current) return;
    if (availability.hasCrmTiles) loadCrm();
    if (availability.hasCmsTiles) loadCms();
  }, [ready, loadCrm, loadCms, availability.hasCrmTiles, availability.hasCmsTiles]);

  // If current tab is unavailable, switch to the available one
  React.useEffect(() => {
    if (tab === "crm" && !availability.hasCrmTiles && availability.hasCmsTiles) {
      setTab("cms");
    } else if (tab === "cms" && !availability.hasCmsTiles && availability.hasCrmTiles) {
      setTab("crm");
    }
  }, [tab, availability.hasCrmTiles, availability.hasCmsTiles]);

  const KeyMetrics = (
    <Grid container spacing={2} sx={{ mb: 2, alignItems: "stretch" }}>
      {availability.crm.revenue && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricTile
            label="Revenue"
            value={typeof metrics?.revenue === "number" ? metrics.revenue : undefined}
            valueFormatter={(n) => formatCurrency(n)}
            changePct={metrics?.revenueChangePct ?? null}
            loading={metricsLoading}
          />
        </Grid>
      )}
      {availability.crm.totalOrders && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricTile
            label="Total Orders"
            value={metrics?.totalOrders ?? undefined}
            changePct={metrics?.ordersChangePct ?? null}
            loading={metricsLoading}
          />
        </Grid>
      )}
      {availability.crm.totalContacts && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricTile
            label="Total Contacts"
            value={metrics?.totalContacts ?? undefined}
            changePct={metrics?.contactsChangePct ?? null}
            loading={metricsLoading}
          />
        </Grid>
      )}
      {availability.crm.totalAccounts && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricTile
            label="Total Accounts"
            value={metrics?.totalAccounts ?? undefined}
            changePct={metrics?.accountsChangePct ?? null}
            loading={metricsLoading}
          />
        </Grid>
      )}
      {metricsError && (
        <Grid size={{ xs: 12 }}>
          <Typography color="error" variant="body2">
            {metricsError}
          </Typography>
        </Grid>
      )}
    </Grid>
  );

  const hasCrmKeyMetrics =
    availability.crm.revenue ||
    availability.crm.totalOrders ||
    availability.crm.totalContacts ||
    availability.crm.totalAccounts;

  const CmsKeyMetrics = (
    <Grid container spacing={2} sx={{ mb: 2, alignItems: "stretch" }}>
      {availability.cms.totalContent && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricTile
            label="Total Content"
            value={cmsMetrics?.totalContent}
            changePct={cmsMetrics?.contentChangePct ?? null}
            loading={cmsMetricsLoading}
          />
        </Grid>
      )}
      {availability.cms.contentUpdates && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricTile
            label="Content Updates"
            value={cmsMetrics?.contentUpdates}
            changePct={cmsMetrics?.contentUpdatesChangePct ?? null}
            loading={cmsMetricsLoading}
          />
        </Grid>
      )}
      {availability.cms.totalMedia && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricTile
            label="Total Media"
            value={cmsMetrics?.totalMedia}
            changePct={cmsMetrics?.mediaChangePct ?? null}
            loading={cmsMetricsLoading}
          />
        </Grid>
      )}
      {availability.cms.totalComments && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricTile
            label="Total Comments"
            value={cmsMetrics?.totalComments}
            changePct={cmsMetrics?.commentsChangePct ?? null}
            loading={cmsMetricsLoading}
          />
        </Grid>
      )}
      {cmsMetricsError && (
        <Grid size={{ xs: 12 }}>
          <Typography color="error" variant="body2">
            {cmsMetricsError}
          </Typography>
        </Grid>
      )}
    </Grid>
  );

  const hasCmsKeyMetrics =
    availability.cms.totalContent ||
    availability.cms.contentUpdates ||
    availability.cms.totalMedia ||
    availability.cms.totalComments;

  const renderedKeyMetrics =
    tab === "crm"
      ? hasCrmKeyMetrics
        ? KeyMetrics
        : null
      : hasCmsKeyMetrics
      ? CmsKeyMetrics
      : null;

  // Only show Sales Performance and Recent Orders if there are any orders with the total value > 0
  const hasPositiveRecentOrderValue = React.useMemo(() => {
    return Array.isArray(orders) && orders.some((o) => (o.amount ?? 0) > 0);
  }, [orders]);

  const hasRevenueFromSales = React.useMemo(() => {
    return Array.isArray(sales) && sales.some((s) => (s.revenue ?? 0) > 0);
  }, [sales]);

  const hasPositiveMetricsRevenue = (metrics?.revenue ?? 0) > 0;

  const shouldShowSalesPerformanceTile =
    availability.crm.salesPerformance &&
    (salesLoading ||
      metricsLoading ||
      ordersLoading ||
      hasPositiveMetricsRevenue ||
      hasRevenueFromSales ||
      hasPositiveRecentOrderValue);

  const shouldShowRecentOrdersTile =
    availability.crm.recentOrders && (ordersLoading || hasPositiveRecentOrderValue);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {availability.hasCrmTiles && availability.hasCmsTiles && (
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="CRM" value="crm" />
            <Tab label="CMS" value="cms" />
          </Tabs>
        )}
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="dash-groupby-label">Group by</InputLabel>
            <Select
              labelId="dash-groupby-label"
              label="Group by"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            >
              <MenuItem value="Day">Day</MenuItem>
              <MenuItem value="Week">Week</MenuItem>
              <MenuItem value="Month">Month</MenuItem>
              <MenuItem value="Quarter">Quarter</MenuItem>
              <MenuItem value="Year">Year</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            size="small"
            value={useCustom ? "custom" : "preset"}
            exclusive
            onChange={(_, v) => {
              if (!v) return;
              const custom = v === "custom";
              setUseCustom(custom);
              if (!custom) {
                setFrom(null);
                setTo(null);
              }
            }}
          >
            <ToggleButton value="preset">Preset</ToggleButton>
            <ToggleButton value="custom">Custom</ToggleButton>
          </ToggleButtonGroup>

          {!useCustom ? (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="dash-range-label">Time range</InputLabel>
              <Select
                labelId="dash-range-label"
                label="Time range"
                value={range}
                onChange={(e) => setRange(e.target.value as TimeRange)}
              >
                <MenuItem value="24h">Last 24 hours</MenuItem>
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
                <MenuItem value="6m">Last 6 months</MenuItem>
                <MenuItem value="1y">Last year</MenuItem>
                <MenuItem value="2y">Last 2 years</MenuItem>
                <MenuItem value="3y">Last 3 years</MenuItem>
                <MenuItem value="5y">Last 5 years</MenuItem>
                <MenuItem value="10y">Last 10 years</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack direction="row" spacing={1} alignItems="center">
                <DatePicker
                  label="From"
                  value={from}
                  onChange={setFrom}
                  slotProps={{ textField: { size: "small" } }}
                />
                <DatePicker
                  label="To"
                  value={to}
                  onChange={setTo}
                  slotProps={{ textField: { size: "small" } }}
                />
              </Stack>
            </LocalizationProvider>
          )}
        </Stack>
      </Box>

      {renderedKeyMetrics}

      {tab === "crm" && availability.hasCrmTiles ? (
        <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
          {shouldShowSalesPerformanceTile && (
            <Grid size={{ xs: 12, md: 8 }}>
              <Card title="Sales Performance" subtitle="Revenue and orders over time">
                {salesLoading ? (
                  <SectionLoader />
                ) : salesError ? (
                  <Typography color="error" variant="body2">
                    {salesError}
                  </Typography>
                ) : sales && sales.length > 0 ? (
                  <RechartsLine
                    data={sales.map((s) => ({
                      label: s.period ?? "",
                      a: s.orders ?? 0,
                      b: s.revenue ?? 0,
                    }))}
                    aLabel="Orders"
                    bLabel="Revenue"
                  />
                ) : (
                  <EmptyState />
                )}
              </Card>
            </Grid>
          )}
          {shouldShowRecentOrdersTile && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Card title="Recent Orders" subtitle="Last 5 orders">
                {ordersLoading ? (
                  <SectionLoader />
                ) : ordersError ? (
                  <Typography color="error" variant="body2">
                    {ordersError}
                  </Typography>
                ) : orders && orders.length > 0 ? (
                  <>
                    <List dense sx={{ mb: 2 }}>
                      {orders.map((o, idx) => {
                        const toHref =
                          typeof o.id === "number"
                            ? `${getCoreModuleRoute(CoreModule.orders)}/${getViewFormRoute(o.id)}`
                            : undefined;
                        return (
                          <ListItem
                            key={o.id ?? idx}
                            sx={{
                              px: 0,
                              cursor: "pointer",
                              "&:hover .list-link-text": { textDecoration: "underline" },
                            }}
                            {...(toHref ? ({ component: GhostLink, to: toHref } as const) : {})}
                          >
                            <ListItemIcon>
                              <ShoppingCart size={18} />
                            </ListItemIcon>
                            <ListItemText
                              primary={o.orderNumber ?? (o.id ? `Order #${o.id}` : "Order")}
                              slotProps={{
                                primary: {
                                  color: "primary",
                                  className: "list-link-text",
                                },
                              }}
                              secondary={
                                <Typography variant="body2">{o.customer ?? ""}</Typography>
                              }
                            />
                            <Stack alignItems="flex-end" spacing={0.5}>
                              <Typography>{formatCurrency(o.amount)}</Typography>
                              <Chip
                                size="small"
                                variant="filled"
                                color={getOrderStatusColor(o.status || "")}
                                label={o.status}
                              />
                            </Stack>
                          </ListItem>
                        );
                      })}
                    </List>
                    <Button
                      fullWidth
                      variant="outlined"
                      to={getCoreModuleRoute(CoreModule.orders)}
                      component={GhostLink}
                    >
                      {"View All Orders"}
                    </Button>
                  </>
                ) : (
                  <EmptyState />
                )}
              </Card>
            </Grid>
          )}

          {availability.crm.contactGrowth && (
            <Grid size={{ xs: 12, md: 8 }}>
              <Card title="Contact Growth" subtitle="New contacts over time">
                {contactGrowthLoading ? (
                  <SectionLoader />
                ) : contactGrowthError ? (
                  <Typography color="error" variant="body2">
                    {contactGrowthError}
                  </Typography>
                ) : contactGrowth && contactGrowth.length > 0 ? (
                  <RechartsBar
                    data={contactGrowth.map((g) => ({
                      label: g.period ?? "",
                      v: g.contacts ?? 0,
                    }))}
                    seriesLabel="New Contacts"
                  />
                ) : (
                  <EmptyState />
                )}
              </Card>
            </Grid>
          )}

          {availability.crm.topAccounts && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Card title="Top Accounts" subtitle="By revenue in period">
                {topAccountsLoading ? (
                  <SectionLoader />
                ) : topAccountsError ? (
                  <Typography color="error" variant="body2">
                    {topAccountsError}
                  </Typography>
                ) : topAccounts && topAccounts.length > 0 ? (
                  <>
                    <List dense sx={{ mb: 2 }}>
                      {topAccounts.map((a, idx) => {
                        const toHref =
                          typeof a.accountId === "number"
                            ? `${getCoreModuleRoute(CoreModule.accounts)}/${getViewFormRoute(
                                a.accountId
                              )}`
                            : undefined;
                        return (
                          <ListItem
                            key={idx}
                            sx={{
                              px: 0,
                              cursor: "pointer",
                              "&:hover .list-link-text": { textDecoration: "underline" },
                            }}
                            secondaryAction={<ChangeChip pct={a.changePct ?? null} />}
                            {...(toHref ? ({ component: GhostLink, to: toHref } as const) : {})}
                          >
                            <ListItemIcon>
                              <Building2 size={18} />
                            </ListItemIcon>
                            <ListItemText
                              primary={a.name}
                              slotProps={{
                                primary: {
                                  color: "primary",
                                  className: "list-link-text",
                                },
                              }}
                              secondary={formatCurrency(a.revenue)}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                    <Button
                      fullWidth
                      variant="outlined"
                      to={getCoreModuleRoute(CoreModule.accounts)}
                      component={GhostLink}
                    >
                      {"View All Accounts"}
                    </Button>
                  </>
                ) : (
                  <EmptyState />
                )}
              </Card>
            </Grid>
          )}
        </Grid>
      ) : availability.hasCmsTiles ? (
        <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
          {availability.cms.contentGrowth && (
            <Grid size={{ xs: 12, md: 8 }}>
              <Card title="Content Growth" subtitle="New content over time">
                {contentGrowthLoading ? (
                  <SectionLoader />
                ) : contentGrowthError ? (
                  <Typography color="error" variant="body2">
                    {contentGrowthError}
                  </Typography>
                ) : contentGrowthCms && contentGrowthCms.length > 0 ? (
                  <RechartsBar
                    data={contentGrowthCms.map((g) => ({
                      label: g.period ?? "",
                      v: g.contents ?? 0,
                    }))}
                    seriesLabel="New Content"
                  />
                ) : (
                  <EmptyState />
                )}
              </Card>
            </Grid>
          )}

          {availability.cms.recentContent && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Card title="Recent Content" subtitle="Last 5 items">
                {recentContentLoading ? (
                  <SectionLoader />
                ) : recentContentError ? (
                  <Typography color="error" variant="body2">
                    {recentContentError}
                  </Typography>
                ) : recentContent && recentContent.length > 0 ? (
                  <>
                    <List dense sx={{ mb: 2 }}>
                      {recentContent.map((c) => {
                        const toHref =
                          typeof c.id === "number"
                            ? `${getCoreModuleRoute(CoreModule.content)}/${getEditFormRoute(c.id)}`
                            : undefined;
                        return (
                          <ListItem
                            key={c.id}
                            sx={{
                              px: 0,
                              cursor: "pointer",
                              "&:hover .list-link-text": { textDecoration: "underline" },
                            }}
                            {...(toHref ? ({ component: GhostLink, to: toHref } as const) : {})}
                          >
                            <ListItemIcon>
                              <FileText size={18} />
                            </ListItemIcon>
                            <ListItemText
                              primary={c.title}
                              slotProps={{
                                primary: {
                                  color: "primary",
                                  className: "list-link-text",
                                },
                              }}
                              secondary={<Typography variant="body2">{c.author ?? ""}</Typography>}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                    <Button
                      fullWidth
                      variant="outlined"
                      to={getCoreModuleRoute(CoreModule.content)}
                      component={GhostLink}
                    >
                      {"View All Content"}
                    </Button>
                  </>
                ) : (
                  <EmptyState />
                )}
              </Card>
            </Grid>
          )}
          {availability.cms.topContent && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card title="Top Content" subtitle="Most viewed / engaged">
                {topContentLoading ? (
                  <SectionLoader />
                ) : topContentError ? (
                  <Typography color="error" variant="body2">
                    {topContentError}
                  </Typography>
                ) : topContent && topContent.length > 0 ? (
                  <List dense>
                    {topContent.map((c) => {
                      const toHref =
                        typeof c.contentId === "number"
                          ? `${getCoreModuleRoute(CoreModule.content)}/${getEditFormRoute(
                              c.contentId
                            )}`
                          : undefined;
                      return (
                        <ListItem
                          key={c.contentId}
                          sx={{
                            px: 0,
                            cursor: "pointer",
                            "&:hover .list-link-text": { textDecoration: "underline" },
                          }}
                          {...(toHref ? ({ component: GhostLink, to: toHref } as const) : {})}
                        >
                          <ListItemIcon>
                            <FileText size={18} />
                          </ListItemIcon>
                          <ListItemText
                            primary={c.title}
                            slotProps={{
                              primary: {
                                color: "primary",
                                className: "list-link-text",
                              },
                            }}
                            secondary={
                              <Typography variant="body2">
                                {typeof c.commentCount === "number"
                                  ? `${c.commentCount} comments`
                                  : ""}
                              </Typography>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <EmptyState />
                )}
              </Card>
            </Grid>
          )}

          {availability.cms.topAuthors && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card title="Top Authors" subtitle="By content created in period">
                {topAuthorsLoading ? (
                  <SectionLoader />
                ) : topAuthorsError ? (
                  <Typography color="error" variant="body2">
                    {topAuthorsError}
                  </Typography>
                ) : topAuthors && topAuthors.length > 0 ? (
                  <List dense>
                    {topAuthors.map((a, idx) => (
                      <ListItem
                        key={idx}
                        sx={{ px: 0 }}
                        secondaryAction={<ChangeChip pct={a.changePct ?? null} />}
                      >
                        <ListItemIcon>
                          <Bullet />
                        </ListItemIcon>
                        <ListItemText
                          primary={a.author}
                          secondary={<Typography variant="body2">{a.count ?? 0} items</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <EmptyState />
                )}
              </Card>
            </Grid>
          )}

          {availability.cms.recentComments && (
            <Grid size={{ xs: 12 }}>
              <Card title="Recent Comments" subtitle="Latest user engagement">
                {recentCommentsLoading ? (
                  <SectionLoader />
                ) : recentCommentsError ? (
                  <Typography color="error" variant="body2">
                    {recentCommentsError}
                  </Typography>
                ) : recentComments && recentComments.length > 0 ? (
                  <List dense>
                    {recentComments.map((c) => {
                      const toHref =
                        typeof c.id === "number"
                          ? `${getCoreModuleRoute(CoreModule.comments)}/${getEditFormRoute(c.id)}`
                          : undefined;
                      return (
                        <ListItem
                          key={c.id}
                          sx={{
                            px: 0,
                            cursor: "pointer",
                            "&:hover .list-link-text": { textDecoration: "underline" },
                          }}
                          {...(toHref ? ({ component: GhostLink, to: toHref } as const) : {})}
                        >
                          <ListItemIcon>
                            <MessageSquare size={18} />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${c.user ?? "Unknown"}`}
                            slotProps={{
                              primary: {
                                color: "primary",
                                className: "list-link-text",
                              },
                            }}
                            secondary={
                              <>
                                <Typography variant="body2">{c.comment}</Typography>
                                {c.article && (
                                  <Typography variant="caption" color="text.secondary">
                                    {c.article}
                                  </Typography>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <EmptyState />
                )}
              </Card>
            </Grid>
          )}
        </Grid>
      ) : (
        <EmptyState message="No dashboard tiles available" />
      )}
    </Box>
  );
};

// Simple icons for list bullets
const Bullet = () => (
  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "text.secondary" }} />
);

export { Dashboard };
export { DashboardModule } from "./dashboard-module";
