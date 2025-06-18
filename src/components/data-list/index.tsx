import { useEffect, useState } from "react";
import {
  defaultFilterLimit,
  getBasicExportFilterQuery,
  getBasicFilterQuery,
  getWhereFilterQuery,
  totalCountHeaderName,
} from "@providers/query-provider";
import { GridColDef, GridSortDirection, GridValidRowModel, GridColumnVisibilityModel } from "@mui/x-data-grid";
import { GridInitialStateCommunity } from "@mui/x-data-grid/models/gridStateCommunity";
import { DataListContainer } from "./index.styled";
import { DataTableGrid } from "@components/data-table";
import useLocalStorage from "use-local-storage";
import { DataListSettings, GridDataFilterState } from "types";
import { useNotificationsService } from "@hooks";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { CustomFilterBar } from "@components/custom-filter";
import { ColumnsPanel } from "@components/custom-columns-panel";

// Define response type for API model data
interface ModelDataResponse {
  data: unknown[];
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
  getModelDataList: (mainQuery: string, exportQuery?: string) => Promise<ModelDataResponse | null>;
  showEditButton?: boolean;
  showViewButton?: boolean;
  filterPanelOpen?: boolean;
  setFilterPanelOpen?: (open: boolean) => void;
  columnsPanelOpen?: boolean; 
  setColumnsPanelOpen?: (open: boolean) => void;
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
}: dataListProps<TModel>) => {
  const { notificationsService } = useNotificationsService();
  const { setBusy } = useModuleWrapperContext();
  const [gridSettings, setGridSettings] = useLocalStorage<DataListSettings | undefined>(
    gridSettingsStorageKey,
    undefined
  );
  const [modelData, setModelData] = useState<unknown[] | undefined>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRowCount, setTotalRowCount] = useState<number>();

  const [filterState, setFilterState] = useState<GridDataFilterState>();

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>(
      gridSettings?.columnVisibilityModel ?? {}
    );

  const defaultFilterState = {
    filterLimit: defaultFilterLimit,
    sortColumn: defaultFilterOrderColumn,
    sortOrder: defaultFilterOrderDirection,
    whereFilters: [],
    skipLimit: 0,
    pageNumber: 0,
    columnVisibilityModel: initialGridState?.columns?.columnVisibilityModel,
  };

  const whereFilterQuery =
  filterState?.whereFilters?.length
    ? filterState.whereFilters
        .map(f =>
          getWhereFilterQuery(
            f.whereField || "",
            f.whereFieldValue || "",
            f.whereOperator || ""
          )
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

      if (columnOrder && columnOrder.length > 0) {
        setColumns?.(sortColumnsByOrder(columns, columnOrder));
      } else {
        setColumns?.(columns);
      }

      setSearchTerm(searchTerm);
    } else {
      setFilterState(defaultFilterState);
    }
  }, []);

  useEffect(() => {
    setSearchTerm(searchText);
  }, [searchText]);

  useEffect(() => {
    if (filterState) {
      saveGridStateInLocalStorage();
      getDataListAsync();
    }
  }, [searchTerm, filterState]);

  useEffect(() => {
    if (totalRowCount === -1) {
      throw new Error("Server error: x-total-count header is not provided.");
    }
  }, [totalRowCount]);

  useEffect(() => {
    if (!modelData) {
      notificationsService.error("Server error: Data cannot be retrieved from server.");
    }
  }, [modelData]);

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
      });
    }
  };

  function sortColumnsByOrder<T>(
  columns: GridColDef<TModel>[],
  columnOrder: string[]
  ): GridColDef<TModel>[] {
    const ordered = columnOrder
      .map(field => columns.find(col => col.field === field))
      .filter(Boolean) as GridColDef<TModel>[];

    const missing = columns.filter(col => !columnOrder.includes(col.field));
    return [...ordered, ...missing];
  }

  const updateWhereFilters = (
    newFilter?: { whereField?: string; whereOperator?: string; whereFieldValue?: string },
    removeIndex?: number,
    editIdx?: number
  ) => {
    let updatedFilters = [...(filterState?.whereFilters || [])];

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
      columnOrder: newColumns.map(col => col.field),
    }));
  };

  const getDataListAsync = () => {
    setBusy(async () => {
      const result = await getModelDataList(
        `${searchTerm}&${basicFilterQuery || ""}${whereFilterQuery || ""}`,
        `${searchTerm}&${basicExportFilterQuery || ""}${whereFilterQuery || ""}`
      );
      if (result) {
        const { data, headers } = result;
        setTotalResultsCount(headers.get(totalCountHeaderName));
        setModelData(data);
      } else {
        setModelData(undefined);
      }
    });
  };

  const setTotalResultsCount = (headerCount: string | null) => {
    if (headerCount) setTotalRowCount(parseInt(headerCount, 10));
    else setTotalRowCount(-1);
  };

  const gridInitialState = gridSettings && {
    filter:
      gridSettings.whereFilters && gridSettings.whereFilters.length > 0
        ? {
            filterModel: {
              items: gridSettings.whereFilters.map(f => ({
              field: f.whereField,
              operator: f.whereOperator || "eq",
              value: f.whereFieldValue,
            })),
            },
          }
        : undefined,
    sorting: {
      sortModel: [
        { field: gridSettings.sortColumn, sort: gridSettings.sortOrder as GridSortDirection },
      ],
    },
    pagination: {
      paginationModel: {
        page: gridSettings.pageNumber || 0,
        pageSize: gridSettings.filterLimit || defaultFilterLimit,
      },
    },
    columns: { columnVisibilityModel: gridSettings.columnVisibilityModel || {} },
  };

  return filterState && totalRowCount != undefined ? (
    <DataListContainer>
      <CustomFilterBar columns={columns} 
        whereFilters={filterState.whereFilters || []}
        addFilter={(f, undefined, editIdx) => updateWhereFilters(f, undefined, editIdx)}
        removeFilter={idx => updateWhereFilters(undefined, idx)}
        filterPanelOpen={filterPanelOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        clearAllFilters={clearAllFilters}
      />
      {setColumns &&(
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
      <DataTableGrid
        columns={columns}
        data={modelData || []}
        autoHeight={false}
        pageSize={filterState.filterLimit}
        totalRowCount={totalRowCount}
        rowsPerPageOptions={[10, 30, 50, 100]}
        pageNumber={filterState.pageNumber}
        dataViewMode="server"
        setFilterState={updateFilterState}
        initialState={gridInitialState}
        disableColumnFilter={true}
        disablePagination={false}
        showActionsColumn={true}
        disableEditRoute={!showEditButton}
        disableViewRoute={!showViewButton}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={handleColumnVisibilityModelChange}
        />
    </DataListContainer>
  ) : null;
};

export { default as DateValueFormatter } from "./date-value-formatter";
export { default as DateValueGetter } from "./date-value-getter";
