import { useEffect, useState } from "react";
import {
  defaultFilterLimit,
  getBasicExportFilterQuery,
  getBasicFilterQuery,
  getWhereFilterQuery,
  totalCountHeaderName,
} from "@providers/query-provider";
import { GridColDef, GridSortDirection } from "@mui/x-data-grid";
import { GridInitialStateCommunity } from "@mui/x-data-grid/models/gridStateCommunity";
import { DataListContainer } from "./index.styled";
import { DataTableGrid } from "@components/data-table";
import useLocalStorage from "use-local-storage";
import { DataListSettings, GridDataFilterState } from "types";
import { useNotificationsService } from "@hooks";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";

type dataListProps = {
  columns: GridColDef<any>[];
  gridSettingsStorageKey: string;
  searchText: string;
  defaultFilterOrderColumn: string;
  defaultFilterOrderDirection: string;
  initialGridState: GridInitialStateCommunity | undefined;
  getModelDataList: (mainQuery: string, exportQuery?: string) => any;
  showEditButton?: boolean;
  showViewButton?: boolean;
};

export const DataList = ({
  columns,
  gridSettingsStorageKey,
  searchText,
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  initialGridState,
  getModelDataList,
  showEditButton = true,
  showViewButton = true,
}: dataListProps) => {
  const { notificationsService } = useNotificationsService();
  const { setBusy } = useModuleWrapperContext();
  const [gridSettings, setGridSettings] = useLocalStorage<DataListSettings | undefined>(
    gridSettingsStorageKey,
    undefined,
  );
  const [modelData, setModelData] = useState<any[] | undefined>([]);
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
      filterState.whereField!,
      filterState.whereFieldValue!,
      filterState.whereOperator!,
    );
  const basicFilterQuery =
    filterState &&
    getBasicFilterQuery(
      filterState.filterLimit!,
      filterState.sortColumn!,
      filterState.sortOrder!,
      filterState.skipLimit!,
    );
  const basicExportFilterQuery =
    filterState && getBasicExportFilterQuery(filterState.sortColumn!, filterState.sortOrder!);

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
        filterLimit: filterLimit,
        skipLimit: skipLimit,
        sortColumn: sortColumn,
        sortOrder: sortOrder,
        whereField: whereField,
        whereFieldValue: whereFieldValue,
        whereOperator: whereOperator,
        pageNumber: pageNumber,
        columnVisibilityModel: columnVisibilityModel,
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
    filterState &&
      setGridSettings({
        searchTerm,
        filterLimit: filterState.filterLimit!,
        skipLimit: filterState.skipLimit!,
        sortColumn: filterState.sortColumn!,
        sortOrder: filterState.sortOrder!,
        whereField: filterState.whereField!,
        whereFieldValue: filterState.whereFieldValue!,
        whereOperator: filterState.whereOperator!,
        pageNumber: filterState.pageNumber!,
        columnVisibilityModel: filterState.columnVisibilityModel!,
      });
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
        `${searchTerm}&${basicFilterQuery}${whereFilterQuery}`,
        `${searchTerm}&${basicExportFilterQuery}${whereFilterQuery}`,
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
    filter: {
      filterModel: {
        items: [
          {
            columnField: gridSettings.whereField,
            operatorValue: gridSettings.whereOperator,
            value: gridSettings.whereFieldValue,
          },
        ],
      },
    },
    sorting: {
      sortModel: [
        { field: gridSettings.sortColumn, sort: gridSettings.sortOrder as GridSortDirection },
      ],
    },
    pagination: {
      page: gridSettings.pageNumber,
      pageSize: gridSettings.filterLimit,
    },
    columns: { columnVisibilityModel: gridSettings.columnVisibilityModel },
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
