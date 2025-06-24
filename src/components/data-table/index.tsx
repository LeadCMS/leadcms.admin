import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridFilterModel,
  GridSortModel,
} from "@mui/x-data-grid";
import type { GridValidRowModel } from "@mui/x-data-grid/models/gridRows";
import { ActionButtonContainer, DataTableContainer } from "./index.styled";
import { GridInitialStateCommunity } from "@mui/x-data-grid/models/gridStateCommunity";
import { Edit, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getEditFormRoute, getViewFormRoute } from "lib/router";
import { IconButton } from "@mui/material";
import { GridDataFilterState } from "types";

type DataTableProps = {
  columns: GridColDef[];
  data?: GridValidRowModel[];
  autoHeight: boolean;
  pageSize?: number | undefined;
  totalRowCount: number | undefined;
  rowsPerPageOptions: number[] | undefined;
  pageNumber: number | undefined;
  dataViewMode: "client" | "server";
  setFilterState: ((filterState: GridDataFilterState) => void) | undefined;
  initialState?: GridInitialStateCommunity | undefined;
  disablePagination: boolean;
  disableColumnFilter: boolean;
  showActionsColumn: boolean;
  disableEditRoute: boolean;
  disableViewRoute: boolean;
};

export const DataTableGrid = ({
  columns,
  data,
  autoHeight,
  pageSize,
  totalRowCount,
  rowsPerPageOptions,
  pageNumber,
  dataViewMode,
  setFilterState,
  initialState,
  disableColumnFilter,
  disablePagination,
  showActionsColumn,
  disableEditRoute,
  disableViewRoute,
}: DataTableProps) => {
  const empty: readonly GridValidRowModel[] = [];

  const actionsColumn: GridColDef = {
    field: "actions",
    headerName: "Actions",
    flex: 1,
    align: "right",
    headerAlign: "right",
    filterable: false,
    sortable: false,
    disableColumnMenu: true,
    renderCell: ({ row }: { row: GridValidRowModel }) => {
      return (
        <ActionButtonContainer>
          <IconButton disabled={disableEditRoute} onClick={() => handleEditClick(row)}>
            <Edit size={20} />
          </IconButton>
          <IconButton disabled={disableViewRoute} onClick={() => handleForwardClick(row)}>
            <ArrowRight size={20} />
          </IconButton>
        </ActionButtonContainer>
      );
    },
  };

  const navigate = useNavigate();

  const handleEditClick = (row: GridValidRowModel) => {
    if (row.id !== undefined && row.id !== null) {
      navigate(getEditFormRoute(row.id), { state: row });
    }
  };

  const handleForwardClick = (row: GridValidRowModel) => {
    if (row.id !== undefined && row.id !== null) {
      navigate(getViewFormRoute(row.id), { state: row });
    }
  };

  const handlePaginationModelChange = (model: { page: number; pageSize: number }) => {
    if (setFilterState) {
      setFilterState({
        pageNumber: model.page,
        skipLimit: model.page * model.pageSize,
        filterLimit: model.pageSize,
      });
    }
  };

  const handleSortChange = (sortModel: GridSortModel) => {
    if (dataViewMode === "client") {
      return;
    }

    if (setFilterState) {
      if (sortModel.length > 0) {
        setFilterState({
          sortColumn: sortModel[sortModel.length - 1].field,
          sortOrder: sortModel[sortModel.length - 1].sort || "asc",
        });
      } else {
        setFilterState({
          sortOrder: "asc",
        });
      }
    }
  };

  const handleFilterChange = (filterModel: GridFilterModel) => {
    if (!setFilterState) {
      return;
    }

    if (filterModel.items.length === 0) {
      setFilterState({
        whereField: undefined,
        whereFieldValue: undefined,
        whereOperator: undefined,
      });
      return;
    }

    const filterModelItem = filterModel.items[0];
    const column = filterModelItem.field;
    const columnValue = filterModelItem.value;
    const operator = filterModelItem.operator;

    if (column) {
      setFilterState({
        whereFieldValue: columnValue,
        whereField: column,
        whereOperator: operator,
      });
    }
  };

  const handleColumnVisibilityModelChange = (newModel: GridColumnVisibilityModel) => {
    if (setFilterState) {
      setFilterState({
        columnVisibilityModel: newModel,
      });
    }
  };

  const gridFinalizedColumns = showActionsColumn ? columns.concat(actionsColumn) : columns;

  return (
    <DataTableContainer>
      <DataGrid
        columns={gridFinalizedColumns}
        rows={data ?? empty}
        loading={!data}
        checkboxSelection={false}
        autoHeight={autoHeight}
        rowCount={totalRowCount}
        pageSizeOptions={rowsPerPageOptions}
        pagination
        paginationModel={{
          page: pageNumber || 0,
          pageSize: pageSize || 25,
        }}
        hideFooter={disablePagination}
        disableColumnFilter={disableColumnFilter}
        paginationMode={dataViewMode}
        onPaginationModelChange={handlePaginationModelChange}
        sortingMode={dataViewMode}
        onSortModelChange={(newSortModel) => handleSortChange(newSortModel)}
        filterMode={dataViewMode}
        onFilterModelChange={(newFilterModel) => handleFilterChange(newFilterModel)}
        onColumnVisibilityModelChange={(newModel) => handleColumnVisibilityModelChange(newModel)}
        initialState={initialState}
      />
    </DataTableContainer>
  );
};
