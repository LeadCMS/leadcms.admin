import { useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRequestContext } from "providers/request-provider";
import { useNotificationsService } from "@hooks";
import { useCurrencyFormatter } from "@hooks";
import { CoreModule, getCoreModuleRoute, getEditFormRoute } from "lib/router";
import { GhostLink } from "@components/ghost-link";
import { ModuleWrapper } from "@components/module-wrapper";
import { DataList, DateValueFormatter, DateValueGetter } from "@components/data-list";
import { SearchBar } from "@components/search-bar";
import { TagChipList } from "@components/tag-chip-list";
import { CountPill, RevenueCell } from "@components/metric-cells";
import { ContactHref } from "@features/contacts/index.styled";
import { sequenceFormBreadcrumbLinks, sequenceViewHeader } from "./constants";
import {
  ContactDetailsDto,
  SequenceDetailsDto,
  SequenceDeliveryDetailsDto,
  SequenceEnrollmentDetailsDto,
  SequenceStatisticsDto,
} from "lib/network/swagger-client";
import { getWhereFilterQuery } from "@providers/query-provider";
import type { PrimaryCurrencyConfig } from "@utils/currency-formatter";
import { formatTimezoneShort } from "@utils/timezone-helpers";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { GridColDef } from "@mui/x-data-grid";
import {
  Users,
  Send,
  Clock,
  Edit,
  Copy,
  Pause,
  Play,
  Info,
  Loader2,
  Calendar,
  Mail,
  CheckCircle2,
  Archive,
} from "lucide-react";
import { showApiError } from "@utils/api-error-parser";

const enrollmentGridSettingsStorageKey = "sequence-enrollments-grid-settings-v3";
const deliveryGridSettingsStorageKey = "sequence-deliveries-grid-settings-v3";

type SequenceEnrollmentRow = SequenceEnrollmentDetailsDto & {
  contact?: ContactDetailsDto | null;
};

type SequenceDeliveryRow = SequenceDeliveryDetailsDto & {
  contact?: ContactDetailsDto | null;
};

type SequenceStatus = NonNullable<SequenceDetailsDto["status"]>;

const statusConfig: Record<
  SequenceStatus,
  {
    label: string;
    color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  }
> = {
  Draft: { label: "Draft", color: "default" },
  Active: { label: "Active", color: "success" },
  Paused: { label: "Paused", color: "warning" },
  Archived: { label: "Archived", color: "default" },
};

const getStatusIcon = (status: SequenceStatus) => {
  switch (status) {
    case "Active":
      return (
        <Box
          component={Loader2}
          size={14}
          sx={{
            animation: "seq-view-spin 1s linear infinite",
            "@keyframes seq-view-spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": {
                transform: "rotate(360deg)",
              },
            },
          }}
        />
      );
    case "Paused":
      return <Pause size={14} />;
    case "Archived":
      return <CheckCircle2 size={14} />;
    default:
      return <Clock size={14} />;
  }
};

const enrollmentStatusConfig: Record<
  string,
  {
    color: "default" | "info" | "success" | "error" | "warning";
  }
> = {
  Active: { color: "info" },
  Completed: { color: "success" },
  Exited: { color: "default" },
};

const deliveryStatusConfig: Record<
  string,
  {
    color: "default" | "info" | "success" | "error" | "warning";
  }
> = {
  Scheduled: { color: "info" },
  Sent: { color: "success" },
  Failed: { color: "error" },
  Skipped: { color: "warning" },
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

const formatStepTiming = (step: NonNullable<SequenceDetailsDto["steps"]>[number]) => {
  const delayValue = step.timing?.delay?.value ?? 0;
  const delayUnit = step.timing?.delay?.unit ?? "days";
  const parts = [`Delay: ${delayValue} ${delayUnit}`];

  if (step.timing?.sendAt) {
    parts.push(`Send at ${step.timing.sendAt}`);
  }

  if (step.timing?.allowedWeekDays && step.timing.allowedWeekDays.length > 0) {
    parts.push(`Days: ${step.timing.allowedWeekDays.join(", ")}`);
  } else {
    parts.push("Days: Any");
  }

  return parts.join(" · ");
};

const contactIncludeQuery = "filter[include]=Contact";

const formatUtcOffset = (offsetMinutes: number | null | undefined) => {
  if (offsetMinutes == null) {
    return "—";
  }

  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const minutes = String(abs % 60).padStart(2, "0");

  return `UTC${sign}${hours}:${minutes}`;
};

const getContactDisplayName = (
  contact?: ContactDetailsDto | null,
  fallbackContactId?: number | null
) => {
  const displayName = contact?.fullName?.trim();
  if (displayName) {
    return displayName;
  }

  const contactId = contact?.id ?? fallbackContactId;
  return contactId ? `Contact #${contactId}` : "—";
};

const getContactRoute = (contactId?: number | null) => {
  if (!contactId) {
    return "";
  }

  return `${getCoreModuleRoute(CoreModule.contacts)}/${contactId}/view`;
};

const getContactEmailTypeBadge = (contact?: ContactDetailsDto | null) => {
  const isDisposable = contact?.domain?.disposable === true;
  const isFree = contact?.domain?.free === true;
  const isCorporate =
    Boolean(contact?.domain) &&
    contact?.domain?.disposable === false &&
    contact?.domain?.free === false;

  const badgeSx = {
    height: 18,
    fontSize: "0.65rem",
    "& .MuiChip-label": {
      px: 0.75,
    },
  };

  if (isDisposable) {
    return {
      element: <Chip component="span" size="small" color="error" label="Disposable" sx={badgeSx} />,
      tooltip: "Disposable: identified using publicly available lists of disposable email domains.",
    };
  }

  if (isFree) {
    return {
      element: (
        <Chip
          component="span"
          size="small"
          color="info"
          label="Free"
          variant="outlined"
          sx={badgeSx}
        />
      ),
      tooltip: "Free: domain matches a known public email provider.",
    };
  }

  if (isCorporate) {
    return {
      element: (
        <Chip
          component="span"
          size="small"
          color="success"
          label="Corporate"
          variant="outlined"
          sx={badgeSx}
        />
      ),
      tooltip:
        "Corporate: domain is not on the list of publicly known free providers, " +
        "so it is likely corporate.",
    };
  }

  return null;
};

const formatBrowserDateTime = (iso?: string | null) => {
  if (!iso) {
    return null;
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateTimeAtOffset = (iso: string, offsetMinutes: number) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const shiftedDate = new Date(date.getTime() + offsetMinutes * 60_000);
  return shiftedDate.toLocaleString(undefined, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
};

const renderDualTimezoneDateCell = (
  iso: string | null | undefined,
  offsetMinutes: number | null | undefined,
  icon: ReactNode,
  iconColor: string,
  tooltipContext: string
) => {
  const sourceValue = iso ?? "";
  const browserLabel = formatBrowserDateTime(iso);
  if (!browserLabel) {
    return "-";
  }

  if (offsetMinutes == null) {
    return browserLabel;
  }

  const contactLabel = formatDateTimeAtOffset(sourceValue, offsetMinutes);
  const timezoneLabel = formatTimezoneShort(offsetMinutes);
  const tooltipTitle = contactLabel
    ? "Top: shown in your local PC/browser time. " +
      `Bottom: contact local time (${timezoneLabel}), ${tooltipContext}.`
    : "Top: shown in your local PC/browser time.";

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
          <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.6 }}>
            {browserLabel}
          </Typography>
          {contactLabel && (
            <Typography
              variant="caption"
              sx={{
                mt: 1.25,
                color: "text.secondary",
                lineHeight: 1.2,
                display: "block",
              }}
            >
              {contactLabel} {timezoneLabel}
            </Typography>
          )}
        </Box>
      </Box>
    </Tooltip>
  );
};

interface SequenceContactAutocompleteProps {
  sequenceId?: number;
  label: string;
  value: ContactDetailsDto | null;
  onChange: (value: ContactDetailsDto | null) => void;
}

const SequenceContactAutocomplete = ({
  sequenceId,
  label,
  value,
  onChange,
}: SequenceContactAutocompleteProps) => {
  const { client } = useRequestContext();
  const [contactOptions, setContactOptions] = useState<ContactDetailsDto[]>([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const contactSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSequenceContacts = useCallback(
    async (queryText?: string) => {
      if (!sequenceId) {
        setContactOptions([]);
        return;
      }

      setContactLoading(true);
      try {
        const response = await client.api.sequencesContactsList(sequenceId, {
          query: queryText || undefined,
        });
        const contacts = response.data || [];
        setContactOptions(queryText ? contacts : contacts.slice(0, 10));
      } catch {
        setContactOptions([]);
      } finally {
        setContactLoading(false);
      }
    },
    [client, sequenceId]
  );

  useEffect(() => {
    if (!sequenceId) {
      setContactOptions([]);
      return;
    }

    void fetchSequenceContacts();
  }, [fetchSequenceContacts, sequenceId]);

  useEffect(() => {
    if (contactSearchTimerRef.current) {
      clearTimeout(contactSearchTimerRef.current);
    }

    contactSearchTimerRef.current = setTimeout(
      () => {
        void fetchSequenceContacts(contactSearchQuery || undefined);
      },
      contactSearchQuery ? 400 : 0
    );

    return () => {
      if (contactSearchTimerRef.current) {
        clearTimeout(contactSearchTimerRef.current);
      }
    };
  }, [contactSearchQuery, fetchSequenceContacts]);

  useEffect(() => {
    if (!value?.id) {
      return;
    }

    setContactOptions((prev) => {
      if (prev.some((contact) => contact.id === value.id)) {
        return prev;
      }

      return [value, ...prev];
    });
  }, [value]);

  return (
    <Autocomplete
      size="small"
      options={contactOptions}
      getOptionLabel={(option) => getContactDisplayName(option, option.id)}
      value={value}
      loading={contactLoading}
      onInputChange={(_event, nextValue, reason) => {
        if (reason === "input" || reason === "clear") {
          setContactSearchQuery(nextValue);
        }
      }}
      onOpen={() => {
        void fetchSequenceContacts(contactSearchQuery || undefined);
      }}
      onChange={(_event, nextValue) => onChange(nextValue)}
      isOptionEqualToValue={(left, right) => left.id === right.id}
      noOptionsText="No contacts found in sequence"
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Box>
            <Typography variant="body2">{getContactDisplayName(option, option.id)}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.email || "—"}
            </Typography>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="Name or email"
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {contactLoading ? <CircularProgress color="inherit" size={16} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      sx={{ minWidth: 260 }}
    />
  );
};

const getContactColumns = <TRow extends { contact?: ContactDetailsDto | null; contactId?: number }>(
  primaryCurrency: PrimaryCurrencyConfig | null | undefined
): GridColDef<TRow>[] => [
  {
    field: "contact.fullName",
    headerName: "Contact",
    minWidth: 280,
    valueGetter: (_value: unknown, row: TRow) =>
      getContactDisplayName(row.contact, row.contactId ?? row.contact?.id),
    renderCell: (params) => {
      const contact = params.row.contact;
      const contactLabel = getContactDisplayName(contact, params.row.contactId);
      const contactRoute = getContactRoute(contact?.id ?? params.row.contactId);
      const emailTypeBadge = getContactEmailTypeBadge(contact);

      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            py: 0,
          }}
        >
          <Avatar
            src={contact?.avatarUrl || undefined}
            sx={{
              width: 32,
              height: 32,
              flexShrink: 0,
            }}
          />
          <Box
            sx={{
              minWidth: 0,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 0.25,
              overflow: "hidden",
            }}
          >
            {contactRoute ? (
              <Typography
                component={GhostLink}
                to={contactRoute}
                variant="body2"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  fontWeight: 500,
                  lineHeight: 1.25,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {contactLabel}
              </Typography>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  lineHeight: 1.25,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {contactLabel}
              </Typography>
            )}
            {contact?.email ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <Box
                  component={ContactHref}
                  href={`mailto:${contact.email}`}
                  sx={{
                    minWidth: 0,
                    flex: 1,
                    fontSize: "0.875rem",
                    lineHeight: 1.2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {contact.email}
                </Box>
                {emailTypeBadge && (
                  <Tooltip title={emailTypeBadge.tooltip} arrow>
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {emailTypeBadge.element}
                    </Box>
                  </Tooltip>
                )}
              </Box>
            ) : null}
          </Box>
        </Box>
      );
    },
  },
  {
    field: "contact.email",
    headerName: "Email",
    minWidth: 220,
    valueGetter: (_value: unknown, row: TRow) => row.contact?.email || "—",
  },
  {
    field: "contact.companyName",
    headerName: "Company",
    minWidth: 180,
    valueGetter: (_value: unknown, row: TRow) => row.contact?.companyName || "—",
  },
  {
    field: "contact.phone",
    headerName: "Phone",
    minWidth: 160,
    valueGetter: (_value: unknown, row: TRow) => row.contact?.phone || "—",
  },
  {
    field: "contact.timezone",
    headerName: "Timezone",
    minWidth: 130,
    valueGetter: (_value: unknown, row: TRow) => formatUtcOffset(row.contact?.timezone),
  },
  {
    field: "contact.language",
    headerName: "Language",
    minWidth: 120,
    valueGetter: (_value: unknown, row: TRow) => row.contact?.language || "—",
  },
  {
    field: "contact.ordersCount",
    headerName: "Orders",
    width: 110,
    type: "number",
    valueGetter: (_value: unknown, row: TRow) => row.contact?.ordersCount ?? 0,
    renderCell: (params) => <CountPill value={params.value as number | null | undefined} />,
  },
  {
    field: "contact.totalRevenue",
    headerName: "Revenue",
    minWidth: 140,
    type: "number",
    align: "right",
    headerAlign: "right",
    valueGetter: (_value: unknown, row: TRow) => row.contact?.totalRevenue ?? null,
    renderCell: (params) => (
      <RevenueCell
        value={params.value as number | null | undefined}
        primaryCurrency={primaryCurrency}
      />
    ),
  },
  {
    field: "contact.tags",
    headerName: "Tags",
    minWidth: 220,
    valueGetter: (_value: unknown, row: TRow) => (row.contact?.tags || []).join(", "),
    renderCell: (params) => {
      const tags = params.row.contact?.tags;
      if (!tags?.length) {
        return "";
      }

      return (
        <TagChipList
          tags={tags}
          truncateToFit
          truncateMaxRows={2}
          containerSx={{
            height: "100%",
            width: "100%",
            minWidth: 0,
            alignItems: "center",
            alignContent: "center",
          }}
        />
      );
    },
  },
];

const getSequenceStepDisplayName = (
  step?: NonNullable<SequenceDetailsDto["steps"]>[number] | null,
  fallbackIndex?: number | null
) => {
  const stepName = step?.name?.trim();
  if (stepName) {
    return stepName;
  }

  if (fallbackIndex != null) {
    return `Step ${fallbackIndex + 1}`;
  }

  return "—";
};

const buildEnrollmentColumns = (
  primaryCurrency: PrimaryCurrencyConfig | null | undefined
): GridColDef<SequenceEnrollmentRow>[] => {
  const contactColumns = getContactColumns<SequenceEnrollmentRow>(primaryCurrency);
  const contactColumnsByField = new Map(
    contactColumns.map((column) => [String(column.field), column])
  );
  const getColumn = (field: string) => {
    const column = contactColumnsByField.get(field);
    if (!column) {
      throw new Error(`Missing sequence enrollment column: ${field}`);
    }
    return column;
  };

  return [
    getColumn("contact.fullName"),
    getColumn("contact.timezone"),
    {
      field: "enrollmentReason",
      headerName: "Reason",
      minWidth: 220,
      valueGetter: (_value, row) => row.enrollmentReason || "—",
    },
    {
      field: "enteredAt",
      headerName: "Entered",
      minWidth: 240,
      align: "center",
      headerAlign: "center",
      valueGetter: DateValueGetter,
      renderCell: ({ row }) =>
        renderDualTimezoneDateCell(
          row.enteredAt,
          row.contact?.timezone,
          <Clock size={14} />,
          "info.main",
          "when this enrollment was entered for the contact"
        ),
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 140,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={row.status || "Unknown"}
          color={enrollmentStatusConfig[row.status || ""]?.color || "default"}
          variant="outlined"
        />
      ),
    },
    {
      field: "lastCompletedStepName",
      headerName: "Last Completed Step",
      minWidth: 180,
      valueGetter: (_value, row) => row.lastCompletedStepName || "—",
    },
    {
      field: "completedAt",
      headerName: "Completed",
      minWidth: 180,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "exitedAt",
      headerName: "Exited",
      minWidth: 180,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    getColumn("contact.email"),
    getColumn("contact.companyName"),
    getColumn("contact.phone"),
    getColumn("contact.language"),
    getColumn("contact.ordersCount"),
    getColumn("contact.totalRevenue"),
    getColumn("contact.tags"),
    {
      field: "enrollmentSource",
      headerName: "Source",
      minWidth: 140,
      valueGetter: (_value, row) => row.enrollmentSource || "—",
    },
    {
      field: "exitReason",
      headerName: "Exit Reason",
      minWidth: 160,
      valueGetter: (_value, row) =>
        row.exitReason && row.exitReason !== "None" ? row.exitReason : "—",
    },
    {
      field: "createdAt",
      headerName: "Created",
      minWidth: 180,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
  ];
};

const buildDeliveryColumns = (
  primaryCurrency: PrimaryCurrencyConfig | null | undefined,
  sequence: SequenceDetailsDto | null
): GridColDef<SequenceDeliveryRow>[] => {
  const contactColumns = getContactColumns<SequenceDeliveryRow>(primaryCurrency);
  const contactColumnsByField = new Map(
    contactColumns.map((column) => [String(column.field), column])
  );
  const getColumn = (field: string) => {
    const column = contactColumnsByField.get(field);
    if (!column) {
      throw new Error(`Missing sequence delivery column: ${field}`);
    }
    return column;
  };

  return [
    getColumn("contact.fullName"),
    getColumn("contact.timezone"),
    {
      field: "sequenceStepId",
      headerName: "Step",
      minWidth: 220,
      valueGetter: (_value, row) => {
        const step = sequence?.steps?.find((item) => item.id === row.sequenceStepId);
        if (!step) {
          return row.sequenceStepId ? `Step #${row.sequenceStepId}` : "—";
        }
        return getSequenceStepDisplayName(step, step.position ?? 0);
      },
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 140,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          label={row.status || "Unknown"}
          color={deliveryStatusConfig[row.status || ""]?.color || "default"}
          variant="outlined"
        />
      ),
    },
    {
      field: "scheduledAt",
      headerName: "Scheduled",
      minWidth: 240,
      align: "center",
      headerAlign: "center",
      valueGetter: DateValueGetter,
      renderCell: ({ row }) =>
        renderDualTimezoneDateCell(
          row.scheduledAt,
          row.contact?.timezone,
          <Calendar size={14} />,
          "info.main",
          "when this delivery is scheduled for the contact"
        ),
    },
    {
      field: "sentAt",
      headerName: "Sent",
      minWidth: 240,
      align: "center",
      headerAlign: "center",
      valueGetter: DateValueGetter,
      renderCell: ({ row }) =>
        renderDualTimezoneDateCell(
          row.sentAt,
          row.contact?.timezone,
          <Send size={14} />,
          "success.main",
          "when this delivery was sent to the contact"
        ),
    },
    {
      field: "skipReason",
      headerName: "Skip Reason",
      minWidth: 160,
      valueGetter: (_value, row) => row.skipReason || "—",
    },
    {
      field: "errorMessage",
      headerName: "Error",
      minWidth: 240,
      valueGetter: (_value, row) => row.errorMessage || "—",
    },
    getColumn("contact.email"),
    getColumn("contact.companyName"),
    getColumn("contact.phone"),
    getColumn("contact.language"),
    getColumn("contact.ordersCount"),
    getColumn("contact.totalRevenue"),
    getColumn("contact.tags"),
    {
      field: "sequenceEnrollmentId",
      headerName: "Enrollment ID",
      minWidth: 140,
      valueGetter: (_value, row) => row.sequenceEnrollmentId ?? "—",
    },
    {
      field: "emailLogId",
      headerName: "Email Log ID",
      minWidth: 140,
      valueGetter: (_value, row) => row.emailLogId ?? "—",
    },
    {
      field: "createdAt",
      headerName: "Created",
      minWidth: 180,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
  ];
};

export const SequenceView = () => {
  const { id } = useParams<{ id: string }>();
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const { primaryCurrency } = useCurrencyFormatter();
  const navigate = useNavigate();

  const [sequence, setSequence] = useState<SequenceDetailsDto | null>(null);
  const [statistics, setStatistics] = useState<SequenceStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [confirmAction, setConfirmAction] = useState<"activate" | "pause" | "archive" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [enrollmentSearchTerm, setEnrollmentSearchTerm] = useState("");
  const [enrollmentContactFilter, setEnrollmentContactFilter] = useState<ContactDetailsDto | null>(
    null
  );
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<
    "" | "Active" | "Completed" | "Exited"
  >("");
  const [enrollmentRefreshFlag, setEnrollmentRefreshFlag] = useState(0);
  const [deliverySearchTerm, setDeliverySearchTerm] = useState("");
  const [deliveryContactFilter, setDeliveryContactFilter] = useState<ContactDetailsDto | null>(
    null
  );
  const [deliveryStepFilter, setDeliveryStepFilter] = useState<number | "">("");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<
    "" | "Scheduled" | "Sent" | "Failed" | "Skipped"
  >("");
  const [deliveryRefreshFlag, setDeliveryRefreshFlag] = useState(0);
  const [deliveryTotalCount, setDeliveryTotalCount] = useState(0);
  const [enrollmentColumns, setEnrollmentColumns] = useState<GridColDef<SequenceEnrollmentRow>[]>(
    () => buildEnrollmentColumns(primaryCurrency)
  );
  const [deliveryColumns, setDeliveryColumns] = useState<GridColDef<SequenceDeliveryRow>[]>(() =>
    buildDeliveryColumns(primaryCurrency, sequence)
  );

  useEffect(() => {
    setEnrollmentColumns(buildEnrollmentColumns(primaryCurrency));
  }, [primaryCurrency]);

  useEffect(() => {
    setDeliveryColumns(buildDeliveryColumns(primaryCurrency, sequence));
  }, [primaryCurrency, sequence]);

  const loadSequence = useCallback(async () => {
    if (!id) return;
    try {
      const result = await client.api.sequencesDetail(Number(id));
      setSequence(result.data);
    } catch {
      notificationsService.error("Failed to load sequence.");
    } finally {
      setLoading(false);
    }
  }, [id, client, notificationsService]);

  const loadStatistics = useCallback(async () => {
    if (!id) return;
    try {
      const result = await client.api.sequencesStatisticsList(Number(id));
      setStatistics(result.data);
    } catch {
      // statistics may not be available
    }
  }, [id, client]);

  const loadDeliveryTotalCount = useCallback(async () => {
    if (!id) return;
    try {
      const result = await client.api.sequencesDeliveriesList(Number(id), {
        query: `${contactIncludeQuery}&filter[limit]=1`,
      });
      const headerValue =
        (result as unknown as { headers?: Headers }).headers?.get("x-total-count") || null;
      setDeliveryTotalCount(Number(headerValue || result.data?.length || 0));
    } catch {
      setDeliveryTotalCount(0);
    }
  }, [id, client]);

  useEffect(() => {
    loadSequence();
    loadStatistics();
    loadDeliveryTotalCount();
  }, [loadSequence, loadStatistics, loadDeliveryTotalCount]);

  useEffect(() => {
    setEnrollmentRefreshFlag((prev) => prev + 1);
  }, [enrollmentContactFilter?.id, enrollmentStatusFilter]);

  useEffect(() => {
    setDeliveryRefreshFlag((prev) => prev + 1);
  }, [deliveryContactFilter?.id, deliveryStepFilter, deliveryStatusFilter]);

  const handleActivate = async () => {
    if (!sequence?.id) return;
    setActionLoading(true);
    try {
      await client.api.sequencesActivateCreate(sequence.id);
      notificationsService.success("Sequence activated.");
      loadSequence();
      loadStatistics();
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to activate sequence.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    if (!sequence?.id) return;
    setActionLoading(true);
    try {
      await client.api.sequencesPauseCreate(sequence.id);
      notificationsService.success("Sequence paused.");
      loadSequence();
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to pause sequence.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!sequence?.id) return;
    setActionLoading(true);
    try {
      await client.api.sequencesArchiveCreate(sequence.id);
      notificationsService.success("Sequence archived.");
      loadSequence();
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to archive sequence.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!sequence) return;
    setActionLoading(true);
    try {
      await client.api.sequencesCreate({
        name: `${sequence.name} (Copy)`,
        description: sequence.description || undefined,
        language: sequence.language,
        stopOnReply: sequence.stopOnReply,
        useContactTimeZone: sequence.useContactTimeZone,
        timeZone: sequence.timeZone,
        enrollment: sequence.enrollment || undefined,
        steps: (sequence.steps || []).map((step) => ({
          emailTemplateId: step.emailTemplateId as number,
          name: step.name?.trim() || `Step ${(step.position ?? 0) + 1}`,
          position: step.position,
          type: step.type,
          timing: step.timing as {
            delay?: {
              value?: number;
              unit?: string;
            };
            sendAt?: string | null;
            allowedWeekDays?: string[] | null;
          },
        })),
      });
      notificationsService.success("Sequence duplicated.");
      navigate(getCoreModuleRoute(CoreModule.sequences));
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to duplicate sequence.");
    } finally {
      setActionLoading(false);
    }
  };

  const closeActionConfirm = () => {
    if (actionLoading) return;
    setConfirmAction(null);
  };

  const actionDialogConfig = (() => {
    switch (confirmAction) {
      case "activate":
        return {
          title: "Activate Sequence",
          message: "Are you sure you want to activate this sequence?",
          confirmLabel: "Activate",
          confirmColor: "success" as const,
          loadingLabel: "Activating...",
        };
      case "pause":
        return {
          title: "Pause Sequence",
          message: "Are you sure you want to pause this sequence?",
          confirmLabel: "Pause",
          confirmColor: "warning" as const,
          loadingLabel: "Pausing...",
        };
      case "archive":
        return {
          title: "Archive Sequence",
          message:
            "Are you sure you want to archive this sequence? Active enrollments will be exited.",
          confirmLabel: "Archive",
          confirmColor: "error" as const,
          loadingLabel: "Archiving...",
        };
      default:
        return null;
    }
  })();

  const handleConfirmedAction = async () => {
    const action = confirmAction;
    if (!action) return;

    if (action === "activate") {
      await handleActivate();
      setConfirmAction(null);
      return;
    }

    if (action === "pause") {
      await handlePause();
      setConfirmAction(null);
      return;
    }

    await handleArchive();
    setConfirmAction(null);
  };

  const getEnrollmentsList = async (mainQuery: string) => {
    if (!id) return null;

    const contactQuery = enrollmentContactFilter?.id
      ? getWhereFilterQuery("contactId", String(enrollmentContactFilter.id), "equals").replace(
          /^&/,
          ""
        )
      : "";
    const statusQuery = enrollmentStatusFilter
      ? getWhereFilterQuery("status", enrollmentStatusFilter, "equals").replace(/^&/, "")
      : "";
    const fullQuery = [mainQuery, contactIncludeQuery, contactQuery, statusQuery]
      .filter(Boolean)
      .join("&");

    const result = await client.api.sequencesEnrollmentsList(Number(id), {
      query: fullQuery,
    });

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

  const getDeliveriesList = async (mainQuery: string) => {
    if (!id) return null;

    const contactFilter = deliveryContactFilter?.id
      ? getWhereFilterQuery("contactId", String(deliveryContactFilter.id), "equals").replace(
          /^&/,
          ""
        )
      : "";
    const stepFilter =
      deliveryStepFilter !== ""
        ? getWhereFilterQuery("sequenceStepId", String(deliveryStepFilter), "equals").replace(
            /^&/,
            ""
          )
        : "";
    const statusFilter = deliveryStatusFilter
      ? getWhereFilterQuery("status", deliveryStatusFilter, "equals").replace(/^&/, "")
      : "";

    const fullQuery = [mainQuery, contactIncludeQuery, contactFilter, stepFilter, statusFilter]
      .filter(Boolean)
      .join("&");
    const result = await client.api.sequencesDeliveriesList(Number(id), {
      query: fullQuery,
    });

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

  if (loading) {
    return (
      <ModuleWrapper
        breadcrumbs={sequenceFormBreadcrumbLinks}
        currentBreadcrumb={sequenceViewHeader}
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

  if (!sequence) {
    return (
      <ModuleWrapper
        breadcrumbs={sequenceFormBreadcrumbLinks}
        currentBreadcrumb={sequenceViewHeader}
      >
        <Alert severity="error">Sequence not found</Alert>
      </ModuleWrapper>
    );
  }

  const status = sequence.status || "Draft";
  const isEditable = status === "Draft" || status === "Paused";
  const isActivatable = status === "Draft" || status === "Paused";
  const isPausable = status === "Active";

  const activeCount = statistics?.activeEnrollmentCount ?? sequence.activeEnrollmentCount ?? 0;
  const completedCount =
    statistics?.completedEnrollmentCount ?? sequence.completedEnrollmentCount ?? 0;
  const exitedCount = statistics?.exitedEnrollmentCount ?? sequence.exitedEnrollmentCount ?? 0;
  const sentCount = statistics?.sentCount ?? sequence.sentCount ?? 0;
  const stepsCount = statistics?.stepsCount ?? sequence.steps?.length ?? 0;
  const totalEnrollments = activeCount + completedCount + exitedCount;
  const orderedSteps = [...(sequence.steps || [])].sort(
    (left, right) => (left.position || 0) - (right.position || 0)
  );
  const fallbackDeliveryTotal = orderedSteps.reduce(
    (total, step) =>
      total +
      (step.scheduledCount ?? 0) +
      (step.sentCount ?? 0) +
      (step.failedCount ?? 0) +
      (step.skippedCount ?? 0),
    0
  );
  const totalDeliveries = deliveryTotalCount || fallbackDeliveryTotal;

  const formatDateOnly = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString();
  };

  const subtitleParts = [
    `${stepsCount} step${stepsCount !== 1 ? "s" : ""}`,
    sequence.createdAt && `Created: ${formatDateOnly(sequence.createdAt)}`,
  ]
    .filter(Boolean)
    .join(" \u00B7 ");

  const sequenceInfoRows = compactRows([
    {
      label: "Description",
      value: sequence.description || "",
    },
    {
      label: "Language",
      value: sequence.language || "",
    },
    {
      label: "Stop on Reply",
      value: sequence.stopOnReply ? "Yes" : "No",
    },
    {
      label: "Use Contact Timezone",
      value: sequence.useContactTimeZone ? "Yes" : "No",
    },
    {
      label: "Created",
      value: sequence.createdAt ? formatDateOnly(sequence.createdAt) : "",
    },
    {
      label: "Updated",
      value: sequence.updatedAt ? formatDateOnly(sequence.updatedAt) : "",
    },
    {
      label: "Last Activated",
      value: sequence.lastActivatedAt ? formatDateOnly(sequence.lastActivatedAt) : "",
    },
  ]);

  const enrollmentRows = compactRows([
    {
      label: "Enrollment Modes",
      value: (
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            flexWrap: "wrap",
          }}
        >
          {(sequence.enrollment?.modes || []).map((mode) => (
            <Chip
              key={mode}
              label={mode === "segment" ? "Segment" : mode === "manual" ? "Manual" : "API"}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      ),
    },
    {
      label: "Re-entry Policy",
      value:
        sequence.enrollment?.reentryPolicy === "OnceEver"
          ? "Once ever"
          : sequence.enrollment?.reentryPolicy === "AllowAfterCompletion"
          ? "Allow after completion"
          : sequence.enrollment?.reentryPolicy === "Always"
          ? "Always"
          : "",
    },
  ]);

  return (
    <ModuleWrapper breadcrumbs={sequenceFormBreadcrumbLinks} currentBreadcrumb={sequenceViewHeader}>
      {/* Header card */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 0.5,
                }}
              >
                <Typography variant="h5" fontWeight={600}>
                  {sequence.name}
                </Typography>
                <Chip
                  size="small"
                  icon={getStatusIcon(status as SequenceStatus)}
                  label={statusConfig[status as SequenceStatus]?.label || status}
                  color={statusConfig[status as SequenceStatus]?.color || "default"}
                  variant="outlined"
                />
              </Box>
              {subtitleParts && (
                <Typography variant="body2" color="text.secondary">
                  {subtitleParts}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {isEditable && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit size={14} />}
                  onClick={() =>
                    navigate(
                      `${getCoreModuleRoute(CoreModule.sequences)}/${getEditFormRoute(
                        sequence.id as number
                      )}`
                    )
                  }
                >
                  Edit
                </Button>
              )}
              {isActivatable && (
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  startIcon={<Play size={14} />}
                  onClick={() => setConfirmAction("activate")}
                  disabled={actionLoading}
                >
                  Activate
                </Button>
              )}
              {isPausable && (
                <Button
                  variant="outlined"
                  size="small"
                  color="warning"
                  startIcon={<Pause size={14} />}
                  onClick={() => setConfirmAction("pause")}
                  disabled={actionLoading}
                >
                  Pause
                </Button>
              )}
              <Button
                variant="outlined"
                size="small"
                startIcon={<Copy size={14} />}
                onClick={() => void handleDuplicate()}
                disabled={actionLoading}
              >
                Duplicate
              </Button>
              {status !== "Archived" && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<Archive size={14} />}
                  onClick={() => setConfirmAction("archive")}
                  disabled={actionLoading}
                >
                  Archive
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Tabs value={tabValue} onChange={(_event, value) => setTabValue(value)}>
        <Tab value={0} label="Overview" />
        <Tab
          value={1}
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <span>Enrollments</span>
              {totalEnrollments > 0 && (
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
                  {totalEnrollments.toLocaleString()}
                </Box>
              )}
            </Box>
          }
        />
        <Tab
          value={2}
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <span>Deliveries</span>
              {totalDeliveries > 0 && (
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
                  {totalDeliveries.toLocaleString()}
                </Box>
              )}
            </Box>
          }
        />
      </Tabs>
      <Divider />

      {tabValue === 0 && (
        <Box sx={{ py: 3 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                label="Active"
                value={activeCount.toLocaleString()}
                icon={<Users size={18} />}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                label="Completed"
                value={completedCount.toLocaleString()}
                icon={<CheckCircle2 size={18} />}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                label="Exited"
                value={exitedCount.toLocaleString()}
                icon={<Clock size={18} />}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                label="Emails Sent"
                value={sentCount.toLocaleString()}
                icon={<Send size={18} />}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard
                title="Sequence Info"
                icon={<Info size={18} />}
                rows={sequenceInfoRows}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionCard title="Enrollment" icon={<Users size={18} />} rows={enrollmentRows} />
            </Grid>
          </Grid>

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
                  <Mail size={18} />
                </Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Steps
                </Typography>
              </Box>

              {orderedSteps.length === 0 ? (
                <Alert severity="info">No steps configured yet.</Alert>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {orderedSteps.map((step, idx) => (
                    <Card key={step.id || idx} variant="outlined">
                      <CardContent sx={{ p: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              bgcolor: "primary.main",
                              color: "primary.contrastText",
                              fontSize: 14,
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {idx + 1}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {getSequenceStepDisplayName(step, idx)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatStepTiming(step)}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.75,
                                flexWrap: "wrap",
                                mt: 1,
                              }}
                            >
                              <Chip
                                size="small"
                                label={`Scheduled: ${(step.scheduledCount ?? 0).toLocaleString()}`}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                label={`Sent: ${(step.sentCount ?? 0).toLocaleString()}`}
                                color="success"
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                label={`Failed: ${(step.failedCount ?? 0).toLocaleString()}`}
                                color="error"
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                label={`Skipped: ${(step.skippedCount ?? 0).toLocaleString()}`}
                                color="warning"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                          <Chip
                            label="Email"
                            size="small"
                            variant="outlined"
                            icon={<Mail size={12} />}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ py: 3 }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
              mb: 2,
            }}
          >
            <SearchBar
              setSearchTermOnChange={setEnrollmentSearchTerm}
              searchBoxLabel="Search enrollments"
              initialValue={enrollmentSearchTerm}
            />
            <SequenceContactAutocomplete
              sequenceId={sequence.id}
              label="Contact"
              value={enrollmentContactFilter}
              onChange={setEnrollmentContactFilter}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={enrollmentStatusFilter}
                label="Status"
                onChange={(event) =>
                  setEnrollmentStatusFilter(
                    event.target.value as "" | "Active" | "Completed" | "Exited"
                  )
                }
              >
                <MenuItem value="">All statuses</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Exited">Exited</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <DataList
            columns={enrollmentColumns}
            setColumns={setEnrollmentColumns as React.Dispatch<React.SetStateAction<GridColDef[]>>}
            gridSettingsStorageKey={`${enrollmentGridSettingsStorageKey}-${id || "0"}`}
            defaultFilterOrderColumn="enteredAt"
            defaultFilterOrderDirection="desc"
            searchText={enrollmentSearchTerm}
            getModelDataList={getEnrollmentsList}
            initialGridState={{
              sorting: {
                sortModel: [
                  {
                    field: "enteredAt",
                    sort: "desc",
                  },
                ],
              },
              columns: {
                columnVisibilityModel: {
                  "contact.email": false,
                  "contact.companyName": false,
                  "contact.phone": false,
                  "contact.language": false,
                  "contact.ordersCount": false,
                  "contact.totalRevenue": false,
                  "contact.tags": false,
                  enrollmentSource: false,
                  exitReason: false,
                  createdAt: false,
                },
              },
            }}
            showActionsColumn={false}
            enableRowSelection={false}
            refreshFlag={enrollmentRefreshFlag}
          />
        </Box>
      )}

      {tabValue === 2 && (
        <Box sx={{ py: 3 }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
              mb: 2,
            }}
          >
            <SearchBar
              setSearchTermOnChange={setDeliverySearchTerm}
              searchBoxLabel="Search deliveries"
              initialValue={deliverySearchTerm}
            />
            <SequenceContactAutocomplete
              sequenceId={sequence.id}
              label="Contact"
              value={deliveryContactFilter}
              onChange={setDeliveryContactFilter}
            />
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Step</InputLabel>
              <Select
                value={deliveryStepFilter}
                label="Step"
                onChange={(event) => setDeliveryStepFilter(event.target.value as number | "")}
              >
                <MenuItem value="">All steps</MenuItem>
                {orderedSteps.map((step, idx) => (
                  <MenuItem key={step.id || idx} value={step.id || ""}>
                    {getSequenceStepDisplayName(step, idx)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={deliveryStatusFilter}
                label="Status"
                onChange={(event) =>
                  setDeliveryStatusFilter(
                    event.target.value as "" | "Scheduled" | "Sent" | "Failed" | "Skipped"
                  )
                }
              >
                <MenuItem value="">All statuses</MenuItem>
                <MenuItem value="Scheduled">Scheduled</MenuItem>
                <MenuItem value="Sent">Sent</MenuItem>
                <MenuItem value="Failed">Failed</MenuItem>
                <MenuItem value="Skipped">Skipped</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <DataList
            columns={deliveryColumns}
            setColumns={setDeliveryColumns as React.Dispatch<React.SetStateAction<GridColDef[]>>}
            gridSettingsStorageKey={`${deliveryGridSettingsStorageKey}-${id || "0"}`}
            defaultFilterOrderColumn="scheduledAt"
            defaultFilterOrderDirection="desc"
            searchText={deliverySearchTerm}
            getModelDataList={getDeliveriesList}
            initialGridState={{
              sorting: {
                sortModel: [
                  {
                    field: "scheduledAt",
                    sort: "desc",
                  },
                ],
              },
              columns: {
                columnVisibilityModel: {
                  "contact.email": false,
                  "contact.companyName": false,
                  "contact.phone": false,
                  "contact.language": false,
                  "contact.ordersCount": false,
                  "contact.totalRevenue": false,
                  "contact.tags": false,
                  sequenceEnrollmentId: false,
                  emailLogId: false,
                  createdAt: false,
                },
              },
            }}
            showActionsColumn={false}
            enableRowSelection={false}
            refreshFlag={deliveryRefreshFlag}
          />
        </Box>
      )}

      {/* Action confirmation dialog */}
      <Dialog open={Boolean(confirmAction)} onClose={closeActionConfirm}>
        <DialogTitle>{actionDialogConfig?.title || "Confirm Action"}</DialogTitle>
        <DialogContent>
          <DialogContentText>{actionDialogConfig?.message || ""}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionConfirm} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleConfirmedAction()}
            color={actionDialogConfig?.confirmColor || "primary"}
            variant="contained"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} /> : undefined}
          >
            {actionLoading
              ? actionDialogConfig?.loadingLabel
              : actionDialogConfig?.confirmLabel || "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </ModuleWrapper>
  );
};
