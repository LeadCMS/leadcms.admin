import { Ref, useEffect, useImperativeHandle, useState } from "react";
import { HttpResponse, ProblemDetails, RequestParams } from "@lib/network/swagger-client";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import {
  DataGrid,
  getGridStringOperators,
  GridColDef,
  GridColumnVisibilityModel,
  GridFilterModel,
  GridSortModel,
} from "@mui/x-data-grid";
import { totalCountHeaderName } from "@providers/query-provider";
import {
  DtoSchema,
  camelCaseToTitleCase,
  BasicTypeForGeneric,
  GenericDataGridSettings,
} from "@components/generic-components/common";
import { ActionButtonContainer } from "@components/data-table/index.styled";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import dayjs from "dayjs";
import useLocalStorage from "use-local-storage";

export interface GenericDataGridProps<T extends BasicTypeForGeneric> {
  key: string;
  getItemsFn: (
    query?: { query?: string },
    params?: RequestParams,
  ) => Promise<HttpResponse<T[], void | ProblemDetails>>;
  schema: DtoSchema;
  detailsNavigate?: (item: T) => void;
  editNavigate?: (item: T) => void;
  searchText?: string;
  initiallyShownColumns?: string[];
}

export interface GenericDataGridRef {
  getExportFilters: () => any;
}

export function GenericDataGrid<T extends BasicTypeForGeneric>(
  {
    key,
    getItemsFn,
    schema,
    detailsNavigate,
    editNavigate,
    searchText,
    initiallyShownColumns,
  }: GenericDataGridProps<T>,
  ref: Ref<GenericDataGridRef>,
) {
  const { setBusy, isBusy } = useModuleWrapperContext();

  const [gridSettings, setGridSettings] = useLocalStorage<GenericDataGridSettings>(
    `data-grid-${key}`,
    {
      sortColumn: "id",
      sortDirection: "desc",
      columnVisibilityModel: {},
    },
  );

  const actionsColumn: GridColDef = {
    field: "_actions",
    headerName: "Actions",
    width: 120,
    align: "center",
    headerAlign: "center",
    filterable: false,
    sortable: false,
    disableColumnMenu: true,
    renderCell: ({ row }: any) => {
      return (
        <ActionButtonContainer>
          {editNavigate && (
            <IconButton onClick={() => editNavigate(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {detailsNavigate && (
            <IconButton onClick={() => detailsNavigate(row)}>
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          )}
        </ActionButtonContainer>
      );
    },
  };

  const columns: GridColDef[] = [
    ...Object.keys(schema.properties)
      .filter((key) => !schema.properties[key].hide)
      .map((key) => {
        const column: GridColDef = {
          field: key,
          type: schema.properties[key].type,
          width: 200,
          description: schema.properties[key].description,
          headerName: camelCaseToTitleCase(key),
          valueFormatter:
            schema.properties[key].format === "date-time"
              ? (params) => {
                  return params.value ? dayjs(params.value).format("L HH:mm") : undefined;
                }
              : undefined,
          filterOperators: getGridStringOperators().filter(
            (operator) => operator.value === "contains",
          ),
        };
        return column;
      }),
  ].concat([actionsColumn]);

  const [items, setItems] = useState<T[] | undefined>();

  const [totalItemsCount, setTotalItemsCount] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortColumn, setSortColumn] = useState<string>(gridSettings.sortColumn);
  const [sortDirection, setSortDirection] = useState<string>(gridSettings.sortDirection);
  const [whereFilters, setWhereFilters] = useState<{ [x: string]: string }>({});

  const getFilters = () => {
    const query: any = {
      ...whereFilters,
      "filter[limit]": pageSize,
      "filter[order]": sortColumn ? `${sortColumn} ${sortDirection}` : undefined,
      "filter[skip]": pageSize * pageNumber,
    };

    if (searchText) {
      query["query"] = searchText;
    }

    return query;
  };

  useImperativeHandle(ref, () => ({
    getExportFilters: () => {
      const filters = getFilters();
      delete filters["filter[limit]"];
      delete filters["filter[skip]"];
      return filters;
    },
  }));

  useEffect(() => {
    const abortController = new AbortController();

    if (getItemsFn) {
      setBusy(async () => {
        try {
          const { data, headers } = await getItemsFn(getFilters(), {
            signal: abortController.signal,
          });

          setTotalItemsCount(() => parseInt(headers.get(totalCountHeaderName) || "0"));
          setItems(() => data);
        } catch (e) {
          console.log(e);
        }
      });
    }

    return () => {
      abortController.abort("canceled");
    };
  }, [getItemsFn, pageSize, pageNumber, sortColumn, sortDirection, searchText, whereFilters]);

  const handleSortChange = (sortModel: GridSortModel) => {
    if (sortModel.length > 0) {
      setSortColumn(sortModel[sortModel.length - 1].field);
      setSortDirection(sortModel[sortModel.length - 1].sort || "asc");
    } else {
      setSortColumn("id");
      setSortDirection("desc");
    }
  };

  const handleFilterChange = (filterModel: GridFilterModel) => {
    if (filterModel.items.length === 0) {
      return;
    }

    const newWhereFilters: { [x: string]: string } = {};

    for (const item of filterModel.items) {
      newWhereFilters[`filter[where][${item.columnField}][like]`] = item.value;
    }

    setWhereFilters(newWhereFilters);
  };

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    () => {
      if (gridSettings.columnVisibilityModel) {
        return gridSettings.columnVisibilityModel;
      }

      const initialValue: GridColumnVisibilityModel = {};

      const availableColumns = Object.keys(schema.properties).filter(
        (key) => !schema.properties[key].hide,
      );

      for (const columnName of availableColumns) {
        initialValue[columnName] =
          !initiallyShownColumns ||
          initiallyShownColumns.length === 0 ||
          initiallyShownColumns.indexOf(columnName) > -1;
      }

      return initialValue;
    },
  );

  useEffect(() => {
    setGridSettings({
      sortDirection: sortDirection,
      sortColumn: sortColumn,
      columnVisibilityModel: columnVisibilityModel,
    });
  }, [sortDirection, sortColumn, columnVisibilityModel]);

  const customLocaleText = {
    noRowsLabel: isBusy ? "" : "No rows",
  };

  return (
    <DataGrid
      columns={columns || []}
      rows={items || []}
      loading={false}
      localeText={customLocaleText}
      checkboxSelection={false}
      autoHeight={false}
      rowCount={totalItemsCount}
      rowsPerPageOptions={[10, 25, 50, 100]}
      pagination
      page={pageNumber}
      pageSize={pageSize}
      paginationMode="server"
      onPageChange={(newPage) => setPageNumber(newPage)}
      onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
      sortingMode="server"
      onSortModelChange={(newSortModel) => handleSortChange(newSortModel)}
      filterMode="server"
      onFilterModelChange={(newFilterModel) => handleFilterChange(newFilterModel)}
      onColumnVisibilityModelChange={(newModel) => {
        setColumnVisibilityModel(newModel);
      }}
      columnVisibilityModel={columnVisibilityModel}
    />
  );
}
