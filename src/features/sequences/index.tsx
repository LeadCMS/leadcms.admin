import { useState, useEffect } from "react";
import { useRequestContext } from "providers/request-provider";
import {
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  sequenceGridSettingsStorageKey,
  searchLabel,
  sequenceListPageBreadcrumb,
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
import { useGlobalLanguageFilter } from "@providers/global-language-filter-provider";
import { getWhereFilterQuery } from "@providers/query-provider";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
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
import {
  Eye,
  Pause,
  Play,
  Plus,
  Settings2,
  Mail,
  Clock,
  CheckCircle2,
  Loader2,
  Edit,
  MoreHorizontal,
  Trash2,
  Copy,
} from "lucide-react";
import { GhostLink } from "@components/ghost-link";
import { ModuleWrapper } from "@components/module-wrapper";
import { ToolbarButton } from "@components/tool-bar-button";
import { SequenceDetailsDto } from "lib/network/swagger-client";
import { showApiError } from "@utils/api-error-parser";

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
    case "Draft":
      return <Clock size={14} />;
    case "Active":
      return (
        <Box
          component={Loader2}
          size={14}
          sx={{
            animation: "seq-status-spin 1s linear infinite",
            "@keyframes seq-status-spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
      );
    case "Paused":
      return <Pause size={14} />;
    case "Archived":
      return <CheckCircle2 size={14} />;
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

export const Sequences = () => {
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const navigate = useNavigate();
  const { selectedLanguage, isLanguageFilterActive } = useGlobalLanguageFilter();
  const [gridSettings] = useLocalStorage<DataListSettings | undefined>(
    sequenceGridSettingsStorageKey,
    undefined
  );

  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [confirmAction, setConfirmAction] = useState<
    "activate" | "pause" | "archive" | "delete" | null
  >(null);
  const [confirmSequence, setConfirmSequence] = useState<SequenceDetailsDto | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuSequence, setMenuSequence] = useState<SequenceDetailsDto | null>(null);

  const buildSequencesListQuery = (query?: string) => {
    const includeFilter = "filter[include]=steps";
    const languageFilter =
      isLanguageFilterActive && selectedLanguage !== "all"
        ? getWhereFilterQuery("language", selectedLanguage, "equals")
        : "";
    return [query, includeFilter, languageFilter].filter(Boolean).join("&");
  };

  useEffect(() => {
    setRefreshFlag((prev) => prev + 1);
  }, [selectedLanguage]);

  const getSequencesList = async (mainQuery: string) => {
    const result = await client.api.sequencesList({
      query: buildSequencesListQuery(mainQuery),
    });
    return {
      data: result.data || [],
      headers: {
        get: (key: string) => (key === "x-total-count" ? String(result.data?.length || 0) : null),
      } as unknown as Headers,
    };
  };

  const handleSequenceAction = async (
    action: () => Promise<unknown>,
    successMessage: string,
    errorMessage: string
  ) => {
    try {
      await action();
      notificationsService.success(successMessage);
      setRefreshFlag((prev) => prev + 1);
    } catch (error) {
      showApiError(error, notificationsService, undefined, errorMessage);
    }
  };

  const handleDuplicate = async (sequence: SequenceDetailsDto) => {
    try {
      const detail = await client.api.sequencesDetail(sequence.id as number);
      const src = detail.data;
      await client.api.sequencesCreate({
        name: `Copy of ${src.name}`,
        description: src.description || undefined,
        language: src.language,
        stopOnReply: src.stopOnReply,
        useContactTimeZone: src.useContactTimeZone,
        timeZone: src.timeZone,
        enrollment: src.enrollment || undefined,
        steps: (src.steps || []).map((step) => ({
          emailTemplateId: step.emailTemplateId as number,
          name: step.name?.trim() || `Step ${((step.position ?? 0) as number) + 1}`,
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
      setRefreshFlag((prev) => prev + 1);
    } catch {
      notificationsService.error("Failed to duplicate sequence.");
    }
  };

  const openActionConfirm = (
    action: "activate" | "pause" | "archive" | "delete",
    sequence: SequenceDetailsDto,
    event?: React.MouseEvent<HTMLElement>
  ) => {
    event?.stopPropagation();
    setConfirmAction(action);
    setConfirmSequence(sequence);
  };

  const closeActionConfirm = () => {
    setConfirmAction(null);
    setConfirmSequence(null);
  };

  const getSequenceViewRoute = (id: number) =>
    `${getCoreModuleRoute(CoreModule.sequences)}/${getViewFormRoute(id)}`;

  const getSequenceEditRoute = (id: number) =>
    `${getCoreModuleRoute(CoreModule.sequences)}/${getEditFormRoute(id)}`;

  const confirmDialogConfig = (() => {
    switch (confirmAction) {
      case "activate":
        return {
          title: "Activate Sequence",
          message: "Are you sure you want to activate this sequence?",
          confirmLabel: "Activate",
          confirmColor: "success" as const,
        };
      case "pause":
        return {
          title: "Pause Sequence",
          message: "Are you sure you want to pause this sequence?",
          confirmLabel: "Pause",
          confirmColor: "warning" as const,
        };
      case "archive":
        return {
          title: "Archive Sequence",
          message:
            "Are you sure you want to archive this sequence? Active enrollments will be exited.",
          confirmLabel: "Archive",
          confirmColor: "error" as const,
        };
      case "delete":
        return {
          title: "Delete Sequence",
          message: "Are you sure you want to delete this sequence? This action cannot be undone.",
          confirmLabel: "Delete",
          confirmColor: "error" as const,
        };
      default:
        return null;
    }
  })();

  const handleConfirmedAction = async () => {
    if (!confirmSequence?.id || !confirmAction) return;
    const seq = confirmSequence;
    const act = confirmAction;
    closeActionConfirm();

    if (act === "activate") {
      await handleSequenceAction(
        () => client.api.sequencesActivateCreate(seq.id as number),
        "Sequence activated.",
        "Failed to activate sequence."
      );
      return;
    }

    if (act === "pause") {
      await handleSequenceAction(
        () => client.api.sequencesPauseCreate(seq.id as number),
        "Sequence paused.",
        "Failed to pause sequence."
      );
      return;
    }

    if (act === "archive") {
      await handleSequenceAction(
        () => client.api.sequencesArchiveCreate(seq.id as number),
        "Sequence archived.",
        "Failed to archive sequence."
      );
      return;
    }

    if (act === "delete") {
      await handleSequenceAction(
        () => client.api.sequencesDelete(seq.id as number),
        "Sequence deleted.",
        "Failed to delete sequence."
      );
      return;
    }
  };

  const [columns, setColumns] = useState<GridColDef<SequenceDetailsDto>[]>([
    {
      field: "name",
      headerName: "Sequence",
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
        const config = statusConfig[status as SequenceStatus];
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
              icon={getStatusIcon(status as SequenceStatus)}
              label={config?.label || status}
              color={config?.color || "default"}
              variant="outlined"
            />
          </Box>
        );
      },
    },
    {
      field: "language",
      headerName: "Language",
      width: 130,
      valueGetter: (_value, row) => row.language || "—",
    },
    {
      field: "stepsCount",
      headerName: "Steps",
      width: 100,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            gap: 0.5,
          }}
        >
          <Mail size={14} />
          <Typography variant="body2">
            {(row as SequenceDetailsDto & { stepsCount?: number }).stepsCount ??
              row.steps?.length ??
              0}
          </Typography>
        </Box>
      ),
    },
    {
      field: "activeEnrollmentCount",
      headerName: "Enrolled",
      width: 120,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">
            {(row.activeEnrollmentCount ?? 0).toLocaleString()}
          </Typography>
        </Box>
      ),
    },
    {
      field: "completedEnrollmentCount",
      headerName: "Completed",
      width: 120,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">
            {(row.completedEnrollmentCount ?? 0).toLocaleString()}
          </Typography>
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
          <Typography variant="body2">{(row.sentCount ?? 0).toLocaleString()}</Typography>
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 180,
      valueGetter: DateValueGetter,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">{formatDateTime(row.createdAt)}</Typography>
        </Box>
      ),
    },
    {
      field: "updatedAt",
      headerName: "Updated",
      width: 180,
      valueGetter: DateValueGetter,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2">{formatDateTime(row.updatedAt)}</Typography>
        </Box>
      ),
    },
    {
      field: "sequenceControls",
      headerName: "Actions",
      width: 210,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        const status = row.status || "Draft";
        if (!row.id) return null;

        const isActivatable = status === "Draft" || status === "Paused";
        const isPausable = status === "Active";
        const isEditable = status === "Draft" || status === "Paused";

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              height: "100%",
            }}
          >
            {isActivatable && (
              <IconButton
                size="small"
                color="success"
                onClick={(event) => {
                  openActionConfirm("activate", row, event);
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
                  openActionConfirm("pause", row, event);
                }}
              >
                <Pause size={16} />
              </IconButton>
            )}

            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                navigate(getSequenceViewRoute(row.id as number));
              }}
            >
              <Eye size={16} />
            </IconButton>

            {isEditable && (
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(getSequenceEditRoute(row.id as number));
                }}
              >
                <Edit size={16} />
              </IconButton>
            )}

            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                setMenuAnchorEl(event.currentTarget);
                setMenuSequence(row);
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
  ];

  const addButton = (
    <Button
      variant="contained"
      to={getAddFormRoute()}
      component={GhostLink}
      startIcon={<Plus size={18} />}
    >
      Create Sequence
    </Button>
  );

  return (
    <ModuleWrapper
      breadcrumbs={dataListBreadcrumbLinks}
      currentBreadcrumb={sequenceListPageBreadcrumb}
      leftContainerChildren={searchBar}
      extraActionsContainerChildren={extraActions}
      addButtonContainerChildren={addButton}
    >
      <DataList
        columns={columns}
        setColumns={setColumns}
        gridSettingsStorageKey={sequenceGridSettingsStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getSequencesList}
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
        refreshFlag={refreshFlag}
        showActionsColumn={false}
      />

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => {
          setMenuAnchorEl(null);
          setMenuSequence(null);
        }}
      >
        <MenuItem
          onClick={() => {
            if (menuSequence) {
              const seq = menuSequence;
              setMenuAnchorEl(null);
              setMenuSequence(null);
              void handleDuplicate(seq);
            }
          }}
        >
          <ListItemIcon>
            <Copy size={16} />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        {menuSequence?.status !== "Archived" && (
          <MenuItem
            onClick={() => {
              if (menuSequence) {
                setMenuAnchorEl(null);
                openActionConfirm("archive", menuSequence);
                setMenuSequence(null);
              }
            }}
          >
            <ListItemIcon>
              <CheckCircle2 size={16} />
            </ListItemIcon>
            <ListItemText>Archive</ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            if (menuSequence) {
              setMenuAnchorEl(null);
              openActionConfirm("delete", menuSequence);
              setMenuSequence(null);
            }
          }}
        >
          <ListItemIcon>
            <Trash2 size={16} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={Boolean(confirmAction)} onClose={closeActionConfirm}>
        <DialogTitle>{confirmDialogConfig?.title || "Confirm Action"}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialogConfig?.message || ""}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionConfirm}>No</Button>
          <Button
            onClick={() => void handleConfirmedAction()}
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
