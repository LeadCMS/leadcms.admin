import { useEffect, useState } from "react";
import {
  defaultFilterLimit,
  getBasicExportFilterQuery,
  getBasicFilterQuery,
  getWhereFilterQuery,
  totalCountHeaderName,
} from "@providers/query-provider";
import { GridColDef, GridSortDirection, GridValidRowModel } from "@mui/x-data-grid";
import { GridInitialStateCommunity } from "@mui/x-data-grid/models/gridStateCommunity";
import { DataListContainer } from "./index.styled";
import { DataTableGrid } from "@components/data-table";
import useLocalStorage from "use-local-storage";
import { DataListSettings, GridDataFilterState } from "types";
import { useNotificationsService } from "@hooks";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";

// Define response type for API model data
interface ModelDataResponse {
  data: unknown[];
  headers: Headers;
}

type dataListProps<TModel extends GridValidRowModel> = {
  columns: GridColDef<TModel>[];
  gridSettingsStorageKey: string;
  searchText: string;
  defaultFilterOrderColumn: string;
  defaultFilterOrderDirection: string;
  initialGridState: GridInitialStateCommunity | undefined;
  getModelDataList: (mainQuery: string, exportQuery?: string) => Promise<ModelDataResponse | null>;
  showEditButton?: boolean;
  showViewButton?: boolean;
};

export const DataList = <TModel extends GridValidRowModel>({
  columns,
  gridSettingsStorageKey,
  searchText,
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  initialGridState,
  getModelDataList,
  showEditButton = true,
  showViewButton = true,
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

  const defaultFilterState = {
    filterLimit: defaultFilterLimit,
    sortColumn: defaultFilterOrderColumn,
    sortOrder: defaultFilterOrderDirection,
    whereField: "",
    whereFieldValue: "",
    whereOperator: "",
    skipLimit: 0,
    pageNumber: 0,
    columnVisibilityModel: initialGridState?.columns?.columnVisibilityModel,
  };

  const whereFilterQuery =
    filterState &&
    getWhereFilterQuery(
      filterState.whereField || "",
      filterState.whereFieldValue || "",
      filterState.whereOperator || ""
    );
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
        whereField,
        whereFieldValue,
        whereOperator,
        pageNumber,
        columnVisibilityModel,
      } = gridSettings;
      setFilterState({
        filterLimit,
        skipLimit,
        sortColumn,
        sortOrder,
        whereField,
        whereFieldValue,
        whereOperator,
        pageNumber,
        columnVisibilityModel,
      });
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
        whereField: filterState.whereField || "",
        whereFieldValue: filterState.whereFieldValue || "",
        whereOperator: filterState.whereOperator || "",
        pageNumber: filterState.pageNumber || 0,
        columnVisibilityModel: filterState.columnVisibilityModel || {},
      });
    }
  };

  const updateFilterState = (state: GridDataFilterState) => {
    const updatedFilterState = {
      ...filterState,
      ...state,
    };
    setFilterState(updatedFilterState);
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
      gridSettings.whereField && gridSettings.whereFieldValue
        ? {
            filterModel: {
              items: [
                {
                  field: gridSettings.whereField,
                  operator: gridSettings.whereOperator || "eq",
                  value: gridSettings.whereFieldValue,
                },
              ],
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
        disableColumnFilter={false}
        disablePagination={false}
        showActionsColumn={true}
        disableEditRoute={!showEditButton}
        disableViewRoute={!showViewButton}
      />
    </DataListContainer>
  ) : null;
};

export { default as DateValueFormatter } from "./date-value-formatter";
export { default as DateValueGetter } from "./date-value-getter";
