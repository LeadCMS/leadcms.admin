import { Ref, useEffect, useImperativeHandle, useState } from "react";
import { HttpResponse, ProblemDetails, RequestParams } from "@lib/network/swagger-client";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import {
  DataGrid,
  getGridStringOperators,
  GridColDef,
  GridColumnVisibilityModel,
  GridSortModel,
  GridColType,
  GridValidRowModel,
  GridRowSelectionModel,
  GridColumnResizeParams,
} from "@mui/x-data-grid";
import {
  defaultFilterLimit,
  getWhereFilterQuery,
  totalCountHeaderName,
} from "@providers/query-provider";
import {
  DtoSchema,
  camelCaseToTitleCase,
  BasicTypeForGeneric,
  GenericDataGridSettings,
} from "@components/generic-components/common";
import { ActionButtonContainer, DataTableContainer } from "@components/data-table/index.styled";
import { Box, IconButton, Typography } from "@mui/material";
import { Pencil, Eye, AlertCircle } from "lucide-react";
import dayjs from "dayjs";
import useLocalStorage from "use-local-storage";
import { GridDataFilterState } from "types";
import React from "react";
import { BulkDeleteToolbar } from "@components/bulk-delete-toolbar";
import { useNotificationsService } from "@hooks";
import { parseApiError } from "@utils/api-error-parser";

export interface GenericDataGridProps<T extends BasicTypeForGeneric> {
  key: string;
  getItemsFn: (
    query?: { query?: string },
    params?: RequestParams
  ) => Promise<HttpResponse<T[], void | ProblemDetails>>;
  schema: DtoSchema;
  detailsNavigate?: (item: T) => void;
  editNavigate?: (item: T) => void;
  searchText?: string;
  setSearchText?: (text: string) => void;
  initiallyShownColumns?: string[];
  refreshFlag?: number;
  onBulkDelete?: (ids: (string | number)[]) => Promise<void>;
  bulkDeleteEntityName?: string;
}

export interface GenericDataGridRef {
  getColumnsPanelProps: () => {
    columns: GridColDef[];
    setColumns: (cols: GridColDef[]) => void;
    columnVisibilityModel: GridColumnVisibilityModel;
    setColumnVisibilityModel: (model: GridColumnVisibilityModel) => void;
    onColumnsReorder: (newColumns: GridColDef[]) => void;
  };
  getFiltersPanelProps: () => {
    columns: GridColDef[];
    whereFilters: GridDataFilterState["whereFilters"];
    addFilter: (
      newFilter?: { whereField?: string; whereOperator?: string; whereFieldValue?: string },
      removeIndex?: number,
      editIdx?: number
    ) => void;
    removeFilter: (idx: number) => void;
    clearAllFilters: () => void;
  };
  getExportPanelProps: () => {
    columns: GridColDef[];
    selectedCount: number;
    columnVisibilityModel: GridColumnVisibilityModel;
    whereFilterQuery: string;
    basicFilterQuery: string | undefined;
    selectedRows: any[];
  };
}

export function GenericDataGrid<T extends BasicTypeForGeneric>(
  {
    key,
    getItemsFn,
    schema,
    detailsNavigate,
    editNavigate,
    searchText,
    setSearchText,
    initiallyShownColumns,
    refreshFlag,
    onBulkDelete,
    bulkDeleteEntityName = "record",
  }: GenericDataGridProps<T>,
  ref: Ref<GenericDataGridRef>
) {
  const { setBusy, isBusy } = useModuleWrapperContext();
  const { notificationsService } = useNotificationsService();

  const [gridSettings, setGridSettings] = useLocalStorage<GenericDataGridSettings>(
    `data-grid-${key}`,
    {
      sortColumn: "id",
      columnVisibilityModel: {},
      searchTerm: searchText || "",
    }
  );

  const defaultFilterState = {
    filterLimit: defaultFilterLimit,
    sortColumn: gridSettings.sortColumn || "id",
    sortOrder: gridSettings.sortOrder || "desc",
    whereFilters: [],
    skipLimit: 0,
    pageNumber: 0,
    columnVisibilityModel: gridSettings.columnVisibilityModel ?? {},
  };

  const [filterState, setFilterState] = useState<GridDataFilterState>(defaultFilterState);

  const actionsColumn: GridColDef = {
    field: "_actions",
    headerName: "Actions",
    width: 120,
    align: "center",
    headerAlign: "center",
    filterable: false,
    sortable: false,
    disableColumnMenu: true,
    renderCell: ({ row }: GridValidRowModel) => {
      return (
        <ActionButtonContainer>
          {editNavigate && (
            <IconButton onClick={() => editNavigate(row)}>
              <Pencil size={18} />
            </IconButton>
          )}
          {detailsNavigate && (
            <IconButton onClick={() => detailsNavigate(row)}>
              <Eye size={18} />
            </IconButton>
          )}
        </ActionButtonContainer>
      );
    },
  };

  const [columns, setColumns] = useState<GridColDef[]>(
    [
      ...Object.keys(schema.properties)
        .filter((key) => !schema.properties[key].hide)
        .map((key) => {
          const column: GridColDef = {
            field: key,
            type: mapToGridColType(schema.properties[key].type),
            width: 200,
            description: schema.properties[key].description,
            headerName: camelCaseToTitleCase(key),
            valueFormatter:
              schema.properties[key].format === "date-time"
                ? (value) => {
                    return value ? dayjs(value).format("L HH:mm") : undefined;
                  }
                : undefined,
            filterOperators: getGridStringOperators().filter(
              (operator) => operator.value === "contains"
            ),
          };
          return column;
        }),
    ].concat([actionsColumn])
  );

  const [items, setItems] = useState<T[] | undefined>();
  const [loadError, setLoadError] = useState<string | null>(null);

  const [totalItemsCount, setTotalItemsCount] = useState<number>(0);
  const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    gridSettings.columnWidths ?? {}
  );

  const selectedRows = Array.from(rowSelectionModel.ids);
  const [refreshInternalFlag, setRefreshInternalFlag] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

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
        searchTerm,
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

      if (setSearchText) {
        setSearchText(searchTerm || "");
      }
    } else {
      setFilterState(defaultFilterState);
    }

    // Mark initialization as complete
    setIsInitialized(true);
  }, []);

  function getBasicFilterQueryString(filterState: GridDataFilterState): string {
    return (
      `filter[limit]=${filterState.filterLimit ?? defaultFilterLimit}` +
      `&filter[order]=${filterState.sortColumn ?? "id"} ${filterState.sortOrder ?? "desc"}` +
      `&filter[skip]=${filterState.skipLimit ?? 0}`
    );
  }

  function getWhereFilterQueryString(filterState: GridDataFilterState): string {
    if (filterState.whereFilters && filterState.whereFilters.length) {
      return filterState.whereFilters
        .map((f) =>
          getWhereFilterQuery(f.whereField || "", f.whereFieldValue || "", f.whereOperator || "")
        )
        .filter(Boolean)
        .join("");
    }
    return "";
  }

  function getFiltersQueryObject() {
    const query: Record<string, unknown> = {};

    query["filter[order]"] = `${filterState.sortColumn ?? "id"} ${filterState.sortOrder ?? "desc"}`;
    query["filter[skip]"] = filterState.skipLimit ?? 0;

    const whereFilterQuery = getWhereFilterQueryString(filterState);

    if (whereFilterQuery) {
      const queryString = whereFilterQuery.endsWith("&")
        ? whereFilterQuery.slice(0, -1)
        : whereFilterQuery;
      queryString.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        if (key && value !== undefined) {
          query[key] = decodeURIComponent(value);
        }
      });
    }

    if (searchText) {
      query["query"] = searchText;
    }

    return query;
  }

  const addFilter = (
    newFilter?: { whereField?: string; whereOperator?: string; whereFieldValue?: string },
    removeIndex?: number,
    editIdx?: number
  ) => {
    const updatedFilters = [...(filterState.whereFilters ?? [])];
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
    setFilterState((prev) => ({
      ...prev,
      whereFilters: updatedFilters,
    }));
  };

  const removeFilter = (idx: number) => {
    addFilter(undefined, idx);
  };

  const clearAllFilters = () => {
    setFilterState((prev) => ({
      ...prev,
      whereFilters: [],
    }));
  };

  const basicFilterQuery = getBasicFilterQueryString(filterState);
  const whereFilterQuery = getWhereFilterQueryString(filterState);

  useImperativeHandle(ref, () => ({
    getColumnsPanelProps: () => ({
      columns,
      setColumns,
      columnVisibilityModel,
      setColumnVisibilityModel: handleColumnVisibilityModelChange,
      onColumnsReorder: handleColumnsReorder,
    }),
    getFiltersPanelProps: () => ({
      columns,
      whereFilters: filterState.whereFilters ?? [],
      addFilter,
      removeFilter,
      clearAllFilters,
    }),
    getExportPanelProps: () => ({
      columns: columns.filter((col) => col.field !== "_actions"),
      selectedCount: selectedRows.length,
      selectedRows,
      columnVisibilityModel,
      whereFilterQuery,
      basicFilterQuery,
    }),
  }));

  useEffect(() => {
    // Only fetch data after initialization is complete
    if (!isInitialized) return;

    saveGridStateInLocalStorage();

    if (getItemsFn) {
      setBusy(async () => {
        try {
          setLoadError(null);
          const { data, headers } = await getItemsFn(getFiltersQueryObject());

          setTotalItemsCount(() => parseInt(headers.get(totalCountHeaderName) || "0"));
          setItems(() => data);
        } catch (e) {
          const apiError = parseApiError(e, "Failed to load data");
          setLoadError(apiError.message);
          setItems([]);
        }
      });
    }
  }, [getItemsFn, searchText, filterState, refreshFlag, refreshInternalFlag]);

  useEffect(() => {
    saveGridStateInLocalStorage();
  }, [columnWidths]);

  useEffect(() => {
    if (filterState.columnOrder) {
      setColumns?.(sortColumnsByOrder(columns, filterState.columnOrder));
    }
  }, [filterState.columnOrder]);

  const handleSortChange = (sortModel: GridSortModel) => {
    if (sortModel.length > 0) {
      setFilterState((prev) => ({
        ...prev,
        sortColumn: sortModel[sortModel.length - 1].field,
        sortOrder: sortModel[sortModel.length - 1].sort || "asc",
      }));
    } else {
      setFilterState((prev) => ({
        ...prev,
        sortColumn: "id",
        sortOrder: "desc",
      }));
    }
  };

  const customLocaleText = {
    noRowsLabel: isBusy ? "" : "No rows",
  };

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    filterState.columnVisibilityModel ?? {}
  );

  const handleColumnVisibilityModelChange = (newModel: GridColumnVisibilityModel) => {
    setColumnVisibilityModel(newModel);
    setFilterState((prev) => ({
      ...prev,
      columnVisibilityModel: newModel,
    }));
  };

  const handleColumnsReorder = (newColumns: GridColDef[]) => {
    setColumns(newColumns);
    setFilterState((prev) => ({
      ...prev,
      columnOrder: newColumns.map((col) => col.field),
    }));
  };

  const handleColumnWidthChange = (params: GridColumnResizeParams) => {
    setColumnWidths((prev) => ({
      ...prev,
      [params.colDef.field]: params.width,
    }));
  };

  useEffect(() => {
    if (setColumns) {
      setColumns(
        columns.map((col) =>
          columnWidths[col.field] !== undefined ? { ...col, width: columnWidths[col.field] } : col
        )
      );
    }
  }, [columnWidths]);

  function sortColumnsByOrder<T extends GridValidRowModel>(
    columns: GridColDef<T>[],
    columnOrder: string[]
  ): GridColDef<T>[] {
    const ordered = columnOrder
      .map((field) => columns.find((col) => col.field === field))
      .filter(Boolean) as GridColDef<T>[];

    const missing = columns.filter((col) => !columnOrder.includes(col.field));
    return [...ordered, ...missing];
  }

  const handlePaginationModelChange = (model: { page: number; pageSize: number }) => {
    setFilterState({
      pageNumber: model.page,
      skipLimit: model.page * model.pageSize,
      filterLimit: model.pageSize,
    });
  };

  const saveGridStateInLocalStorage = () => {
    if (filterState) {
      setGridSettings({
        filterLimit: filterState.filterLimit || defaultFilterLimit,
        skipLimit: filterState.skipLimit || 0,
        searchTerm: searchText,
        sortColumn: filterState.sortColumn || defaultFilterState.sortColumn,
        sortOrder: filterState.sortOrder || defaultFilterState.sortOrder,
        whereFilters: filterState.whereFilters || [],
        pageNumber: filterState.pageNumber || 0,
        columnVisibilityModel: filterState.columnVisibilityModel || {},
        columnOrder: filterState.columnOrder || [],
        columnWidths,
      });
    }
  };

  return (
    <DataTableContainer>
      {onBulkDelete && selectedRows.length > 0 && (
        <BulkDeleteToolbar
          selectedCount={selectedRows.length}
          totalCount={(items || []).length}
          entityName={bulkDeleteEntityName}
          onDelete={() => onBulkDelete(selectedRows)}
          onDeleteSuccess={() => {
            setRowSelectionModel({
              type: "include",
              ids: new Set(),
            });
            setRefreshInternalFlag((f) => f + 1);
          }}
          onClearSelection={() =>
            setRowSelectionModel({
              type: "include",
              ids: new Set(),
            })
          }
          onToggleSelectAll={() => {
            if (selectedRows.length === (items || []).length) {
              setRowSelectionModel({
                type: "include",
                ids: new Set(),
              });
            } else {
              setRowSelectionModel({
                type: "include",
                ids: new Set((items || []).map((row) => (row as any).id)),
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
        <DataGrid
          columns={columns || []}
          rows={items || []}
          loading={false}
          localeText={customLocaleText}
          checkboxSelection={true}
          disableRowSelectionOnClick
          rowCount={totalItemsCount}
          pageSizeOptions={[10, 25, 50, 100]}
          pagination
          paginationModel={{
            page: filterState.pageNumber || 0,
            pageSize: filterState.filterLimit || 25,
          }}
          paginationMode="server"
          onPaginationModelChange={handlePaginationModelChange}
          disableColumnFilter={true}
          sortingMode="server"
          onSortModelChange={(newSortModel) => handleSortChange(newSortModel)}
          filterMode="server"
          onColumnVisibilityModelChange={handleColumnVisibilityModelChange}
          columnVisibilityModel={columnVisibilityModel}
          onColumnWidthChange={handleColumnWidthChange}
          onRowSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          rowSelectionModel={rowSelectionModel}
        />
      )}
    </DataTableContainer>
  );
}

// Helper function to map schema types to GridColType
function mapToGridColType(schemaType: string | undefined): GridColType | undefined {
  if (!schemaType) return undefined;

  switch (schemaType) {
    case "string":
      return "string";
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "date":
      return "date";
    case "datetime":
      return "dateTime";
    default:
      return undefined;
  }
}
