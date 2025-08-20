import { Fragment, useRef, useState } from "react";
import { OrderDetailsDto } from "lib/network/swagger-client";
import { useRequestContext } from "providers/request-provider";
import {
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  orderGridSettingsStorageKey,
  modelName,
  orderListPageBreadcrumb,
  searchLabel,
} from "./constants";
import { DataList, DateValueFormatter, DateValueGetter } from "@components/data-list";
import { GridColDef } from "@mui/x-data-grid";
import { CoreModule, getAddFormRoute } from "lib/router";
import { dataListBreadcrumbLinks } from "utils/constants";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";
import { getModelByName } from "@lib/network/swagger-models";
import { Result } from "react-spreadsheet-import/types/types";
import { SearchBar } from "@components/search-bar";
import { Button, Chip } from "@mui/material";
import { Plus, Upload, Download, Filter, Settings2 } from "lucide-react";
import { CsvImport } from "@components/spreadsheet-import";
import { CsvExport } from "@components/export";
import { GhostLink } from "@components/ghost-link";
import { ModuleWrapper } from "@components/module-wrapper";
import { ToolbarButton } from "@components/tool-bar-button";

export const Orders = () => {
  const { client } = useRequestContext();
  const [gridSettings, setGridSettings] = useLocalStorage<DataListSettings | undefined>(
    orderGridSettingsStorageKey,
    undefined
  );

  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [openImport, setOpenImport] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [importFieldsObject, setImportFieldsObject] = useState<any>();
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const dataExportQuery = useRef("");

  const getOrderList = async (mainQuery: string, exportQuery?: string) => {
    try {
      dataExportQuery.current = exportQuery || "";
      const result = await client.api.ordersList({
        query: mainQuery,
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const exportOrdersAsync = async () => {
    const response = await client.api.ordersExportList({
      query: dataExportQuery.current,
    });

    return response.text();
  };

  const handleImportOpen = () => {
    !importFieldsObject && setImportFieldsObject(getModelByName(modelName));
    setOpenImport(true);
  };

  const handleImportClose = () => {
    setOpenImport(false);
  };

  const handleExportOpen = () => {
    openExport ? setOpenExport(false) : setOpenExport(true);
  };

  const handleFileUpload = async (data: Result<string>) => {
    const importDtoCollection: any[] = data.validData;
    await client.api.ordersImportCreate(importDtoCollection);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "paid":
        return "success";
      case "cancelled":
        return "error";
      case "refunded":
        return "info";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const StatusCell = ({ value }: { value: string }) => (
    <Chip label={value || "Unknown"} color={getStatusColor(value)} size="small" variant="filled" />
  );

  const [columns, setColumns] = useState<GridColDef<OrderDetailsDto>[]>([
    {
      field: "orderNumber",
      headerName: "Order Number",
      minWidth: 120,
      type: "string",
    },
    {
      field: "refNo",
      headerName: "Reference Number",
      minWidth: 120,
      type: "string",
    },
    {
      field: "affiliateName",
      headerName: "Affiliate",
      minWidth: 140,
      type: "string",
    },
    {
      field: "quantity",
      headerName: "Quantity",
      minWidth: 120,
      type: "number",
      align: "left",
      headerAlign: "left",
    },
    {
      field: "total",
      headerName: "Total",
      minWidth: 120,
      type: "number",
      align: "left",
      headerAlign: "left",
    },
    {
      field: "exchangeRate",
      headerName: "Exchange Rate",
      minWidth: 120,
      type: "number",
      align: "left",
      headerAlign: "left",
    },
    {
      field: "currency",
      headerName: "Currency",
      minWidth: 120,
      type: "string",
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      type: "string",
      renderCell: (params) => <StatusCell value={params.value} />,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      minWidth: 140,
      type: "date",
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
  ]);

  const searchBar = (
    <SearchBar
      setSearchTermOnChange={setSearchTerm}
      searchBoxLabel={searchLabel}
      initialValue={gridSettings?.searchTerm ?? ""}
    ></SearchBar>
  );

  const extraActions = [
    <ToolbarButton
      startIcon={<Filter size={18} />}
      onClick={() => setFilterPanelOpen(true)}
      sx={{
        minWidth: 0,
        py: 2,
        px: 2,
        ".MuiButton-startIcon": { marginRight: 0, marginLeft: 0 },
      }}
    ></ToolbarButton>,
    <ToolbarButton
      startIcon={<Settings2 size={18} />}
      onClick={() => setColumnsPanelOpen((open) => !open)}
    >
      Columns
    </ToolbarButton>,
    <Fragment key={"import-action"}>
      <Button key={"import-btn"} startIcon={<Upload />} onClick={handleImportOpen}>
        Import
      </Button>
      {importFieldsObject && (
        <CsvImport
          isOpen={openImport}
          onClose={handleImportClose}
          onUpload={handleFileUpload}
          object={importFieldsObject}
          endRoute={CoreModule.orders}
        ></CsvImport>
      )}
    </Fragment>,
    <Fragment key={"export-action"}>
      <Button key={"export-btn"} startIcon={<Download />} onClick={handleExportOpen}>
        Export
      </Button>
      {openExport && (
        <CsvExport
          exportAsync={exportOrdersAsync}
          closeExport={handleExportOpen}
          fileName={"orders"}
        ></CsvExport>
      )}
    </Fragment>,
  ];

  const addButton = (
    <Button variant="contained" to={getAddFormRoute()} component={GhostLink} startIcon={<Plus />}>
      Add order
    </Button>
  );

  return (
    <ModuleWrapper
      breadcrumbs={dataListBreadcrumbLinks}
      currentBreadcrumb={orderListPageBreadcrumb}
      leftContainerChildren={searchBar}
      extraActionsContainerChildren={extraActions}
      addButtonContainerChildren={addButton}
    >
      <DataList
        columns={columns}
        setColumns={setColumns}
        gridSettingsStorageKey={orderGridSettingsStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getOrderList}
        initialGridState={{
          columns: { columnVisibilityModel: { currency: false, exchangeRate: false } },
          sorting: {
            sortModel: [{ field: defaultFilterOrderColumn, sort: defaultFilterOrderDirection }],
          },
        }}
        filterPanelOpen={filterPanelOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        columnsPanelOpen={columnsPanelOpen}
        setColumnsPanelOpen={setColumnsPanelOpen}
      ></DataList>
    </ModuleWrapper>
  );
};
