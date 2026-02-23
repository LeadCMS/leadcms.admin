import { useEffect, useState } from "react";
import {
  defaultFilterLimit,
  getBasicExportFilterQuery,
  getBasicFilterQuery,
  getWhereFilterQuery,
  totalCountHeaderName,
} from "@providers/query-provider";
import {
  GridColDef,
  GridSortDirection,
  GridValidRowModel,
  GridColumnVisibilityModel,
} from "@mui/x-data-grid";
import { GridInitialStateCommunity } from "@mui/x-data-grid/models/gridStateCommunity";
import { DataListContainer } from "./index.styled";
import { DataTableGrid } from "@components/data-table";
import useLocalStorage from "use-local-storage";
import { DataListSettings, GridDataFilterState } from "types";
import { useNotificationsService } from "@hooks";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { CustomFilterBar } from "@components/custom-filter";
import { ColumnsPanel } from "@components/custom-columns-panel";
import { ExportPopup } from "@components/export-popup";
import type { GridRowSelectionModel } from "@mui/x-data-grid";
import React from "react";
import { buildExportQueryString } from "@components/export";
import { getModuleNameFromUrl } from "@utils/general-helper";
import { downloadExportFile } from "@components/download";
import { BulkDeleteToolbar } from "@components/bulk-delete-toolbar";
import { parseApiError } from "@utils/api-error-parser";
import { AlertCircle } from "lucide-react";
import { Box, Typography } from "@mui/material";

// Define response type for API model data
interface ModelDataResponse<TModel> {
  data: TModel[];
  headers: Headers;
}

type dataListProps<TModel extends GridValidRowModel> = {
  columns: GridColDef<TModel>[];
  setColumns?: (cols: GridColDef<TModel>[]) => void;
  gridSettingsStorageKey: string;
  searchText: string;
  defaultFilterOrderColumn: string;
  defaultFilterOrderDirection: string;
  initialGridState: GridInitialStateCommunity | undefined;
  getModelDataList: (
    mainQuery: string,
    exportQuery?: string
  ) => Promise<ModelDataResponse<TModel> | null>;
  showEditButton?: boolean;
  showViewButton?: boolean;
  filterPanelOpen?: boolean;
  setFilterPanelOpen?: (open: boolean) => void;
  columnsPanelOpen?: boolean;
  setColumnsPanelOpen?: (open: boolean) => void;
  onExportOpen?: boolean;
  onExportClose?: () => void;
  exportApiCall?: (finalQueryString: string, accept: string) => Promise<Response>;
  refreshFlag?: number;
  onBulkDelete?: (ids: (string | number)[]) => Promise<void>;
  bulkDeleteEntityName?: string;
  showActionsColumn?: boolean;
  enableRowSelection?: boolean;
};

export const DataList = <TModel extends GridValidRowModel>({
  columns,
  setColumns,
  gridSettingsStorageKey,
  searchText,
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  initialGridState,
  getModelDataList,
  showEditButton = true,
  showViewButton = true,
  filterPanelOpen,
  setFilterPanelOpen,
  columnsPanelOpen,
  setColumnsPanelOpen,
  onExportOpen = false,
  onExportClose = () => {
    /* noop */
  },
  exportApiCall,
  refreshFlag = 0,
  onBulkDelete,
  bulkDeleteEntityName = "record",
  showActionsColumn = true,
  enableRowSelection = true,
}: dataListProps<TModel>) => {
  const { notificationsService } = useNotificationsService();
  const { setBusy } = useModuleWrapperContext();
  const [gridSettings, setGridSettings] = useLocalStorage<DataListSettings | undefined>(
    gridSettingsStorageKey,
    undefined
  );
  const [modelData, setModelData] = useState<TModel[] | undefined>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRowCount, setTotalRowCount] = useState<number>();

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>(
    gridSettings?.columnVisibilityModel ?? {}
  );

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    gridSettings?.columnWidths ?? {}
  );

  const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  const selectedRows = Array.from(rowSelectionModel.ids);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const defaultFilterState = {
    filterLimit: defaultFilterLimit,
    sortColumn: defaultFilterOrderColumn,
    sortOrder: defaultFilterOrderDirection,
    whereFilters: [],
    skipLimit: 0,
    pageNumber: 0,
    columnVisibilityModel: initialGridState?.columns?.columnVisibilityModel,
  };

  const [filterState, setFilterState] = useState<GridDataFilterState>(defaultFilterState);

  const whereFilterQuery = filterState?.whereFilters?.length
    ? filterState.whereFilters
        .map((f) =>
          getWhereFilterQuery(f.whereField || "", f.whereFieldValue || "", f.whereOperator || "")
        )
        .filter(Boolean)
        .join("")
    : "";

  const basicFilterQuery =
    filterState &&
    getBasicFilterQuery(
      filterState.filterLimit || defaultFilterLimit,
      filterState.sortColumn || defaultFilterOrderColumn,
      filterState.sortOrder || defaultFilterOrderDirection,
      filterState.skipLimit || 0
    );
  const basicExportFilterQuery =
    filterState &&
    getBasicExportFilterQuery(
      filterState.sortColumn || defaultFilterOrderColumn,
      filterState.sortOrder || defaultFilterOrderDirection
    );

  useEffect(() => {
    if (gridSettings) {
      const {
        searchTerm,
        filterLimit,
        skipLimit,
        sortColumn,
        sortOrder,
        whereFilters,
        pageNumber,
        columnVisibilityModel,
        columnOrder,
        columnWidths,
      } = gridSettings;
      setFilterState({
        filterLimit,
        skipLimit,
        sortColumn,
        sortOrder,
        whereFilters,
        pageNumber,
        columnVisibilityModel,
        columnOrder,
      });

      setColumnWidths(columnWidths ?? {});

      if (columnOrder && columnOrder.length > 0) {
        setColumns?.(sortColumnsByOrder(columns, columnOrder));
      } else {
        setColumns?.(columns);
      }

      setSearchTerm(searchTerm);
    } else {
      setFilterState(defaultFilterState);
    }

    // Mark initialization as complete
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    setSearchTerm(searchText);
  }, [searchText]);

  useEffect(() => {
    // Only fetch data after initialization is complete
    if (filterState && isInitialized) {
      saveGridStateInLocalStorage();
      getDataListAsync();
    }
  }, [searchTerm, filterState, refreshFlag]);

  useEffect(() => {
    saveGridStateInLocalStorage();
  }, [columnWidths]);

  useEffect(() => {
    if (totalRowCount === -1) {
      throw new Error("Server error: x-total-count header is not provided.");
    }
  }, [totalRowCount]);

  useEffect(() => {
    if (setColumns) {
      setColumns(
        columns.map((col) =>
          columnWidths[col.field] !== undefined ? { ...col, width: columnWidths[col.field] } : col
        )
      );
    }
  }, [columnWidths]);

  useEffect(() => {
    if (filterState && filterState.columnOrder) {
      setColumns?.(sortColumnsByOrder(columns, filterState.columnOrder));
    }
  }, [filterState.columnOrder]);

  const saveGridStateInLocalStorage = () => {
    if (filterState) {
      setGridSettings({
        searchTerm,
        filterLimit: filterState.filterLimit || defaultFilterLimit,
        skipLimit: filterState.skipLimit || 0,
        sortColumn: filterState.sortColumn || defaultFilterOrderColumn,
        sortOrder: filterState.sortOrder || defaultFilterOrderDirection,
        whereFilters: filterState.whereFilters || [],
        pageNumber: filterState.pageNumber || 0,
        columnVisibilityModel: filterState.columnVisibilityModel || {},
        columnOrder: filterState.columnOrder || [],
        columnWidths,
      });
    }
  };

  const saveColumnWidths = (newWidths: Record<string, number>) => {
    setColumnWidths(newWidths);
  };

  function sortColumnsByOrder<T>(
    columns: GridColDef<TModel>[],
    columnOrder: string[]
  ): GridColDef<TModel>[] {
    const ordered = columnOrder
      .map((field) => columns.find((col) => col.field === field))
      .filter(Boolean) as GridColDef<TModel>[];

    const missing = columns.filter((col) => !columnOrder.includes(col.field));
    return [...ordered, ...missing];
  }

  const updateWhereFilters = (
    newFilter?: { whereField?: string; whereOperator?: string; whereFieldValue?: string },
    removeIndex?: number,
    editIdx?: number
  ) => {
    const updatedFilters = [...(filterState?.whereFilters || [])];

    if (typeof removeIndex === "number") {
      updatedFilters.splice(removeIndex, 1);
    } else if (
      typeof editIdx === "number" &&
      newFilter &&
      newFilter.whereField &&
      newFilter.whereOperator
    ) {
      updatedFilters[editIdx] = newFilter as any;
    } else if (newFilter && newFilter.whereField && newFilter.whereOperator) {
      updatedFilters.push(newFilter as any);
    }

    setFilterState({
      ...filterState,
      whereFilters: updatedFilters,
    });
  };

  const updateFilterState = (state: GridDataFilterState) => {
    const updatedFilterState = {
      ...filterState,
      ...state,
    };
    setFilterState(updatedFilterState);
  };

  const clearAllFilters = () => {
    setFilterState({
      ...filterState,
      whereFilters: [],
    });
  };

  const handleColumnVisibilityModelChange = (newModel: GridColumnVisibilityModel) => {
    setColumnVisibilityModel(newModel);
    setFilterState((prev) => ({
      ...(prev ?? {}),
      columnVisibilityModel: newModel,
    }));
  };

  const handleColumnsReorder = (newColumns: GridColDef[]) => {
    setColumns?.(newColumns);
    setFilterState((prev) => ({
      ...(prev ?? {}),
      columnOrder: newColumns.map((col) => col.field),
    }));
  };

  const getDataListAsync = () => {
    setBusy(async () => {
      try {
        setLoadError(null);
        const result = await getModelDataList(
          `${searchTerm}&${basicFilterQuery || ""}${whereFilterQuery || ""}`,
          `${searchTerm}&${basicExportFilterQuery || ""}${whereFilterQuery || ""}`
        );
        if (result) {
          const { data, headers } = result;
          setTotalResultsCount(headers.get(totalCountHeaderName));
          setModelData(data);
        } else {
          setModelData([]);
          setTotalRowCount(0);
          setLoadError("Data cannot be retrieved from server.");
        }
      } catch (error) {
        const apiError = parseApiError(error, "Failed to load data");
        setLoadError(apiError.message);
        setModelData([]);
        setTotalRowCount(0);
      }
    });
  };

  const setTotalResultsCount = (headerCount: string | null) => {
    if (headerCount) setTotalRowCount(parseInt(headerCount, 10));
    else setTotalRowCount(-1);
  };

  const handleExport = async (scope: string, format: string, cols: string[]) => {
    if (!exportApiCall) {
      setExportError("Export is not available.");
      setExporting(false);
      return;
    }

    setExportError(null);
    setExporting(true);

    try {
      const params = {
        scope,
        format,
        cols,
        selectedRows,
        whereFilterQuery,
        basicFilterQuery: basicExportFilterQuery,
        searchTerm,
      };

      const { finalQueryString, accept } = buildExportQueryString(params);
      const response = await exportApiCall(finalQueryString, accept);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const moduleName = getModuleNameFromUrl();
      downloadExportFile(blob, format, moduleName.toLocaleLowerCase());
      onExportClose();
    } catch (err) {
      let message = "Export failed with unknown error.";
      if (
        err &&
        typeof err === "object" &&
        "statusText" in err &&
        typeof (err as any).statusText === "string"
      ) {
        const statusText = (err as any).statusText;
        const status = (err as any).status;
        message = `Export failed (${status}): ${statusText}`;
      }
      setExportError(message);
    } finally {
      setExporting(false);
    }
  };

  const gridInitialState = gridSettings && {
    sorting: {
      sortModel: [
        {
          field: gridSettings.sortColumn,
          sort: gridSettings.sortOrder as GridSortDirection,
        },
      ],
    },
    pagination: {
      paginationModel: {
        page: gridSettings.pageNumber || 0,
        pageSize: gridSettings.filterLimit || defaultFilterLimit,
      },
    },
    columns: {
      columnVisibilityModel: gridSettings.columnVisibilityModel || {},
    },
  };

  return filterState && totalRowCount != undefined ? (
    <DataListContainer>
      <CustomFilterBar
        columns={columns}
        whereFilters={filterState.whereFilters || []}
        addFilter={(f, _removeIdx, editIdx) => updateWhereFilters(f, _removeIdx, editIdx)}
        removeFilter={(idx) => updateWhereFilters(undefined, idx)}
        filterPanelOpen={filterPanelOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        clearAllFilters={clearAllFilters}
      />
      {setColumns && (
        <ColumnsPanel
          open={columnsPanelOpen}
          columns={columns}
          setColumns={setColumns}
          columnVisibilityModel={columnVisibilityModel}
          setColumnVisibilityModel={handleColumnVisibilityModelChange}
          onColumnsReorder={handleColumnsReorder}
          onClose={() => setColumnsPanelOpen?.(false)}
        />
      )}
      {exportApiCall && (
        <ExportPopup
          open={onExportOpen}
          onClose={onExportClose}
          onExport={handleExport}
          columns={columns}
          selectedCount={selectedRows.length}
          columnVisibilityModel={columnVisibilityModel}
          exporting={exporting}
          errorMessage={exportError}
          hasActiveFilters={!!filterState?.whereFilters?.length}
          hasSearchText={!!(searchTerm && searchTerm.trim() !== "")}
        />
      )}
      {onBulkDelete && selectedRows.length > 0 && (
        <BulkDeleteToolbar
          selectedCount={selectedRows.length}
          totalCount={(modelData || []).length}
          entityName={bulkDeleteEntityName}
          onDelete={() => onBulkDelete(selectedRows)}
          onDeleteSuccess={() => {
            setRowSelectionModel({
              type: "include",
              ids: new Set(),
            });
            getDataListAsync();
          }}
          onClearSelection={() =>
            setRowSelectionModel({
              type: "include",
              ids: new Set(),
            })
          }
          onToggleSelectAll={() => {
            if (selectedRows.length === (modelData || []).length) {
              setRowSelectionModel({
                type: "include",
                ids: new Set(),
              });
            } else {
              setRowSelectionModel({
                type: "include",
                ids: new Set((modelData || []).map((row) => (row as any).id)),
              });
            }
          }}
          notificationsService={notificationsService}
        />
      )}
      {loadError ? (
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
              Error loading data
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
      ) : (
        <DataTableGrid
          columns={columns}
          data={modelData || []}
          pageSize={filterState.filterLimit}
          totalRowCount={totalRowCount}
          rowsPerPageOptions={[10, 30, 50, 100]}
          pageNumber={filterState.pageNumber}
          dataViewMode="server"
          setFilterState={updateFilterState}
          initialState={gridInitialState}
          disableColumnFilter={true}
          disablePagination={false}
          showActionsColumn={showActionsColumn}
          enableRowSelection={enableRowSelection}
          disableEditRoute={!showEditButton}
          disableViewRoute={!showViewButton}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={handleColumnVisibilityModelChange}
          onRowSelectionModelChange={(newModel) => {
            setRowSelectionModel(newModel);
          }}
          rowSelectionModel={rowSelectionModel}
          columnWidths={columnWidths}
          saveColumnWidths={saveColumnWidths}
        />
      )}
    </DataListContainer>
  ) : null;
};

export { default as DateValueFormatter } from "./date-value-formatter";
export { default as DateValueGetter } from "./date-value-getter";
