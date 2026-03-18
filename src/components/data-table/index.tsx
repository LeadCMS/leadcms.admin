import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridSortModel,
  GridRowSelectionModel,
  GridCallbackDetails,
  GridColumnResizeParams,
  GridRow,
} from "@mui/x-data-grid";
import type { GridRowId, GridValidRowModel } from "@mui/x-data-grid/models/gridRows";
import { ActionButtonContainer, DataTableContainer } from "./index.styled";
import { GridInitialStateCommunity } from "@mui/x-data-grid/models/gridStateCommunity";
import { Pencil, Eye, ChevronRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getEditFormRoute, getViewFormRoute } from "lib/router";
import { Box, Collapse, IconButton } from "@mui/material";
import { GridDataFilterState } from "types";
import { forwardRef, ReactNode, useEffect, useState } from "react";

// Custom row component for expandable detail panels
const DetailPanelRow = forwardRef<HTMLDivElement, any>(function DetailPanelRow(props, ref) {
  const { detailPanelExpandedRowIds, getDetailPanelContent, ...gridRowProps } = props;
  const rowId = gridRowProps.rowId;
  const row = gridRowProps.row;
  const isExpanded = detailPanelExpandedRowIds?.has(rowId);

  return (
    <Box ref={ref}>
      <GridRow {...gridRowProps} />
      {getDetailPanelContent && (
        <Collapse in={isExpanded} unmountOnExit>
          <Box
            sx={{
              px: 6,
              py: 2,
              bgcolor: "grey.50",
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            {getDetailPanelContent(row)}
          </Box>
        </Collapse>
      )}
    </Box>
  );
});

type DataTableProps = {
  columns: GridColDef[];
  data?: GridValidRowModel[];
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
  enableRowSelection: boolean;
  disableEditRoute: boolean;
  disableViewRoute: boolean;
  columnVisibilityModel?: GridColumnVisibilityModel;
  onColumnVisibilityModelChange?: (model: GridColumnVisibilityModel) => void;
  onRowSelectionModelChange?: (
    rowSelectionModel: GridRowSelectionModel,
    details: GridCallbackDetails<any>
  ) => void;
  rowSelectionModel?: GridRowSelectionModel;
  columnWidths?: Record<string, number>;
  saveColumnWidths?: (newWidths: Record<string, number>) => void;
  getDetailPanelContent?: (row: GridValidRowModel) => ReactNode;
  detailPanelExpandedRowIds?: Set<GridRowId>;
  onDetailPanelToggle?: (rowId: GridRowId) => void;
};

export const DataTableGrid = ({
  columns,
  data,
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
  enableRowSelection,
  disableEditRoute,
  disableViewRoute,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
  onRowSelectionModelChange,
  rowSelectionModel,
  columnWidths,
  saveColumnWidths,
  getDetailPanelContent,
  detailPanelExpandedRowIds,
  onDetailPanelToggle,
}: DataTableProps) => {
  const empty: readonly GridValidRowModel[] = [];

  const actionsColumn: GridColDef = {
    field: "actions",
    headerName: "Actions",
    minWidth: 100,
    filterable: false,
    sortable: false,
    disableColumnMenu: true,
    renderCell: ({ row }: { row: GridValidRowModel }) => {
      return (
        <ActionButtonContainer>
          <IconButton disabled={disableEditRoute} onClick={() => handleEditClick(row)}>
            <Pencil size={18} />
          </IconButton>
          <IconButton disabled={disableViewRoute} onClick={() => handleForwardClick(row)}>
            <Eye size={18} />
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

  const handleColumnVisibilityModelChange = (newModel: GridColumnVisibilityModel) => {
    if (setFilterState) {
      setFilterState({
        columnVisibilityModel: newModel,
      });
    }
  };

  const [localWidths, setLocalWidths] = useState<Record<string, number>>(columnWidths ?? {});

  useEffect(() => {
    setLocalWidths(columnWidths ?? {});
  }, [columnWidths]);

  const displayedColumns = columns.map((col) =>
    localWidths[col.field] !== undefined ? { ...col, width: localWidths[col.field] } : col
  );

  const hasDetailPanel = !!getDetailPanelContent;

  const expandColumn: GridColDef = {
    field: "__expand__",
    headerName: "",
    width: 50,
    minWidth: 50,
    maxWidth: 50,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    resizable: false,
    renderCell: ({ row }) => {
      const isExpanded = detailPanelExpandedRowIds?.has(row.id);
      return (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDetailPanelToggle?.(row.id);
          }}
        >
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </IconButton>
      );
    },
  };

  const gridFinalizedColumns = [
    ...(hasDetailPanel ? [expandColumn] : []),
    ...displayedColumns,
    ...(showActionsColumn ? [actionsColumn] : []),
  ];

  const handleColumnWidthChange = (params: GridColumnResizeParams) => {
    const newWidths = {
      ...localWidths,
      [params.colDef.field]: params.width,
    };
    setLocalWidths(newWidths);
    if (saveColumnWidths) saveColumnWidths(newWidths);
  };

  return (
    <DataTableContainer>
      <DataGrid
        key={JSON.stringify([(data ?? []).map((row) => (row as any).id)])}
        columns={gridFinalizedColumns}
        rows={data ?? empty}
        loading={!data}
        checkboxSelection={enableRowSelection}
        disableRowSelectionExcludeModel
        disableRowSelectionOnClick
        rowHeight={72}
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
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={
          onColumnVisibilityModelChange ?? handleColumnVisibilityModelChange
        }
        onColumnWidthChange={handleColumnWidthChange}
        onRowSelectionModelChange={onRowSelectionModelChange}
        rowSelectionModel={rowSelectionModel}
        initialState={initialState}
        {...(hasDetailPanel
          ? {
              slots: { row: DetailPanelRow },
              slotProps: {
                row: {
                  detailPanelExpandedRowIds,
                  getDetailPanelContent,
                },
              },
              disableVirtualization: true,
            }
          : {})}
      />
    </DataTableContainer>
  );
};
