import { DataList, DateValueFormatter, DateValueGetter } from "@components/data-list";
import { ModuleWrapper } from "@components/module-wrapper";
import { SearchBar } from "@components/search-bar";
import { ToolbarButton } from "@components/tool-bar-button";
import { RedirectDetailsDto } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { GridColDef } from "@mui/x-data-grid";
import { useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { Download, Filter, Pencil, Plus, Settings2, Trash2, Zap } from "lucide-react";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";
import { dataListBreadcrumbLinks } from "utils/constants";
import { useNotificationsService } from "@hooks";
import { parseApiError, showApiError } from "@utils/api-error-parser";
import {
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  KIND_LABELS,
  redirectGridSettingsStorageKey,
  redirectListPageBreadcrumb,
  searchLabel,
  SOURCE_TYPE_LABELS,
  TARGET_TYPE_LABELS,
} from "../constants";
import { RedirectDialog } from "../dialog";
import { useConfig } from "@providers/config-provider";

function formatSource(row: RedirectDetailsDto, hasMultipleLanguages: boolean): string {
  switch (row.sourceType) {
    case "InternalPath":
      return row.fromPath ?? "";
    case "ContentSlug":
      return hasMultipleLanguages
        ? `${row.fromLanguage ?? ""}/${row.fromSlug ?? ""}`
        : row.fromSlug ?? "";
    case "ContentId":
      return row.fromContentId != null ? `Content #${row.fromContentId}` : "";
    default:
      return "";
  }
}

function formatTarget(row: RedirectDetailsDto, hasMultipleLanguages: boolean): string {
  switch (row.targetType) {
    case "ExternalUrl":
      return row.toUrl ?? "";
    case "InternalPath":
      return row.toPath ?? "";
    case "ContentSlug":
      return hasMultipleLanguages
        ? `${row.toLanguage ?? ""}/${row.toSlug ?? ""}`
        : row.toSlug ?? "";
    case "ContentId":
      return row.toContentId != null ? `Content #${row.toContentId}` : "";
    default:
      return "";
  }
}

export const RedirectsList = () => {
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const { config } = useConfig();
  const hasMultipleLanguages = (config?.languages?.length || 0) > 1;
  const [gridSettings] = useLocalStorage<DataListSettings | undefined>(
    redirectGridSettingsStorageKey,
    undefined
  );

  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [openExport, setOpenExport] = useState(false);
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const dataExportQuery = useRef("");

  const [redirectDialogOpen, setRedirectDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingRedirectId, setEditingRedirectId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const getRedirectsList = async (mainQuery: string, exportQuery?: string) => {
    dataExportQuery.current = exportQuery || "";
    return client.api.redirectsList({ query: mainQuery });
  };

  const redirectsExportApi: (query: string, accept: string) => Promise<Response> = (
    query,
    accept
  ) => client.api.redirectsExportList({ query }, { headers: { Accept: accept } });

  const handleExportOpen = () => {
    setOpenExport((prev) => !prev);
  };

  const handleAddRedirect = () => {
    setDialogMode("create");
    setEditingRedirectId(null);
    setRedirectDialogOpen(true);
  };

  const handleEditRedirect = (id: number) => {
    setDialogMode("edit");
    setEditingRedirectId(id);
    setRedirectDialogOpen(true);
  };

  const handleDialogSaved = async () => {
    setRedirectDialogOpen(false);
    setEditingRedirectId(null);
    setRefreshFlag((prev) => prev + 1);
  };

  const handleDeleteRedirect = (id: number) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirmed = async () => {
    if (deleteConfirmId == null) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    try {
      await client.api.redirectsDelete(id);
      notificationsService.success("Redirect deleted.");
      setRefreshFlag((prev) => prev + 1);
    } catch (e) {
      const parsed = parseApiError(e);
      if (parsed.status === 404) {
        notificationsService.error("This redirect no longer exists.");
        setRefreshFlag((prev) => prev + 1);
      } else {
        showApiError(e, notificationsService);
      }
    }
  };

  const handleAutoDiscover = async () => {
    setIsDiscovering(true);
    try {
      const result = await client.api.redirectsDiscoverCreate({
        query: dataExportQuery.current,
      });
      const total = result.headers.get("x-total-count") ?? "0";
      notificationsService.success(`Discovery complete. ${total} redirect(s) found.`);
      setRefreshFlag((prev) => prev + 1);
    } catch (e) {
      showApiError(e, notificationsService, undefined, "Auto-discovery failed.");
    } finally {
      setIsDiscovering(false);
    }
  };

  const [columns, setColumns] = useState<GridColDef<RedirectDetailsDto>[]>([
    {
      field: "sourceType",
      headerName: "Source Type",
      width: 140,
      valueFormatter: ({ value }) => SOURCE_TYPE_LABELS[String(value)] ?? value,
    },
    {
      field: "_source",
      headerName: "From",
      width: 220,
      sortable: false,
      valueGetter: (_value: unknown, row: RedirectDetailsDto) =>
        formatSource(row, hasMultipleLanguages),
    },
    {
      field: "targetType",
      headerName: "Target Type",
      width: 140,
      valueFormatter: ({ value }) => TARGET_TYPE_LABELS[String(value)] ?? value,
    },
    {
      field: "_target",
      headerName: "To",
      width: 220,
      sortable: false,
      valueGetter: (_value: unknown, row: RedirectDetailsDto) =>
        formatTarget(row, hasMultipleLanguages),
    },
    {
      field: "kind",
      headerName: "Kind",
      width: 160,
      valueFormatter: ({ value }) => KIND_LABELS[String(value)] ?? value,
    },
    {
      field: "isAutoDiscovered",
      headerName: "Origin",
      width: 120,
      renderCell: ({ value }) => (
        <Chip
          label={value ? "Auto" : "Manual"}
          size="small"
          color={value ? "default" : "primary"}
          variant="outlined"
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 160,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "_actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <IconButton size="small" onClick={() => row.id != null && handleEditRedirect(row.id)}>
            <Pencil size={16} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => row.id != null && handleDeleteRedirect(row.id)}
          >
            <Trash2 size={16} />
          </IconButton>
        </Box>
      ),
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
      key="discover-btn"
      startIcon={<Zap size={18} />}
      onClick={handleAutoDiscover}
      disabled={isDiscovering}
    >
      {isDiscovering ? "Discovering..." : "Auto-Discover"}
    </ToolbarButton>,
    <ToolbarButton
      key="filter-btn"
      startIcon={<Filter size={18} />}
      onClick={() => setFilterPanelOpen(true)}
      sx={{
        minWidth: 0,
        py: 2,
        px: 2,
        ".MuiButton-startIcon": { marginRight: 0, marginLeft: 0 },
      }}
    />,
    <ToolbarButton
      key="columns-btn"
      startIcon={<Settings2 size={18} />}
      onClick={() => setColumnsPanelOpen((open) => !open)}
    >
      Columns
    </ToolbarButton>,
    <ToolbarButton key="export-btn" startIcon={<Download size={18} />} onClick={handleExportOpen}>
      Export
    </ToolbarButton>,
  ];

  return (
    <ModuleWrapper
      breadcrumbs={dataListBreadcrumbLinks}
      currentBreadcrumb={redirectListPageBreadcrumb}
      leftContainerChildren={searchBar}
      extraActionsContainerChildren={extraActions}
      addButtonContainerChildren={
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={handleAddRedirect}>
          Add Redirect
        </Button>
      }
    >
      <DataList
        columns={columns}
        setColumns={setColumns}
        gridSettingsStorageKey={redirectGridSettingsStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getRedirectsList}
        initialGridState={{
          columns: { columnVisibilityModel: {} },
          sorting: {
            sortModel: [
              {
                field: defaultFilterOrderColumn,
                sort: defaultFilterOrderDirection,
              },
            ],
          },
        }}
        filterPanelOpen={filterPanelOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        columnsPanelOpen={columnsPanelOpen}
        setColumnsPanelOpen={setColumnsPanelOpen}
        onExportOpen={openExport}
        onExportClose={handleExportOpen}
        exportApiCall={redirectsExportApi}
        onBulkDelete={async (ids) => {
          await client.api.redirectsBulkDelete(ids.map(Number));
        }}
        bulkDeleteEntityName="redirect"
        refreshFlag={refreshFlag}
        showActionsColumn={false}
        showEditButton={false}
        showViewButton={false}
      />
      <RedirectDialog
        open={redirectDialogOpen}
        mode={dialogMode}
        redirectId={editingRedirectId}
        onClose={() => {
          setRedirectDialogOpen(false);
          setEditingRedirectId(null);
        }}
        onSaved={handleDialogSaved}
        onDeleted={handleDialogSaved}
      />
      <Dialog open={deleteConfirmId != null} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>Delete Redirect</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this redirect? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirmed} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </ModuleWrapper>
  );
};
