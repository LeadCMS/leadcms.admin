import { Avatar, Button, ListItemAvatar } from "@mui/material";
import { AccountDetailsDto, AccountImportDto } from "lib/network/swagger-client";
import { useRequestContext } from "providers/request-provider";
import { AccountListItem, AccountListItemText, AccountUrlHref } from "./index.styled";
import {
  accountGridSettingsStorageKey,
  accountListCurrentBreadcrumb,
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  modelName,
  searchLabel,
} from "./constants";
import { DataList, DateValueFormatter, DateValueGetter } from "@components/data-list";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { CoreModule, getAddFormRoute } from "lib/router";
import { ModuleWrapper } from "@components/module-wrapper";
import { dataListBreadcrumbLinks } from "utils/constants";
import { SearchBar } from "@components/search-bar";
import { Fragment, useMemo, useRef, useState } from "react";
import { Plus, Download, Upload, Filter, Settings2 } from "lucide-react";
import { CsvImport } from "@components/spreadsheet-import";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";
import { getModelByName } from "@lib/network/swagger-models";
import { Result } from "react-spreadsheet-import/types/types";
import { GhostLink } from "@components/ghost-link";
import { ToolbarButton } from "@components/tool-bar-button";
import { CountPill, RevenueCell } from "@components/metric-cells";

export const Accounts = () => {
  const { client } = useRequestContext();
  const [gridSettings] = useLocalStorage<DataListSettings | undefined>(
    accountGridSettingsStorageKey,
    undefined
  );

  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [openImport, setOpenImport] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [importFieldsObject, setImportFieldsObject] = useState<ReturnType<typeof getModelByName>>();
  const dataExportQuery = useRef("");

  const getAccountList = async (mainQuery: string, exportQuery?: string) => {
    try {
      dataExportQuery.current = exportQuery || "";
      const result = await client.api.accountsList({
        query: mainQuery,
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const accountsExportApi: (query: string, accept: string) => Promise<Response> = (query, accept) =>
    client.api.accountsExportList({ query }, { headers: { Accept: accept } });

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
    const importDtoCollection: AccountImportDto[] = data.validData;
    await client.api.accountsImportCreate(importDtoCollection);
  };

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }),
    []
  );

  const formatNumberValue = (raw?: number | null) => {
    if (raw === null || raw === undefined) return "";
    const num = Number(raw);
    return Number.isNaN(num) ? "" : numberFormatter.format(num);
  };

  const [columns, setColumns] = useState<GridColDef<AccountDetailsDto>[]>([
    {
      field: "name",
      headerName: "Name",
      width: 250,
      renderCell: ({ row }) => (
        <AccountListItem>
          <ListItemAvatar>
            <Avatar src={row.logoUrl || ""}></Avatar>
          </ListItemAvatar>
          <AccountListItemText
            primary={`${row.name || ""}`}
            secondary={
              <AccountUrlHref href={row.siteUrl || ""} target="_blank">
                {row.siteUrl}
              </AccountUrlHref>
            }
          />
        </AccountListItem>
      ),
    },
    {
      field: "totalRevenue",
      headerName: "Total Revenue",
      width: 160,
      type: "number",
      sortable: true,
      align: "right",
      headerAlign: "right",
      valueGetter: (value, row) => (row as any)?.totalRevenue ?? null,
      renderCell: ({ value }) => <RevenueCell value={value} />,
    },
    {
      field: "dealsCount",
      headerName: "Deals",
      width: 120,
      type: "number",
      sortable: true,
      valueGetter: (value, row) => row.dealsCount ?? 0,
      renderCell: ({ value }) => <CountPill value={value} />,
    },
    {
      field: "ordersCount",
      headerName: "Orders",
      width: 120,
      type: "number",
      sortable: true,
      valueGetter: (value, row) => (row as any)?.ordersCount ?? 0,
      renderCell: ({ value }) => <CountPill value={value} />,
    },
    {
      field: "lastOrderDate",
      headerName: "Last Order",
      width: 150,
      type: "date",
      align: "left",
      headerAlign: "left",
      valueGetter: (value, row) => DateValueGetter((row as any)?.lastOrderDate || null),
      valueFormatter: DateValueFormatter,
    },
    {
      field: "contactCount",
      headerName: "Contacts",
      width: 120,
      type: "number",
    },
    {
      field: "countryCode",
      headerName: "Country",
      width: 120,
      type: "string",
    },
    {
      field: "employeesRange",
      headerName: "Employees Range",
      width: 160,
      type: "string",
    },
    {
      field: "state",
      headerName: "State",
      width: 120,
      type: "string",
    },
    {
      field: "cityName",
      headerName: "City",
      width: 120,
      type: "string",
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 120,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
      type: "date",
    },
    {
      field: "id",
      headerName: "ID",
      width: 100,
      type: "number",
    },
    {
      field: "tin",
      headerName: "TIN",
      width: 140,
      type: "string",
    },
    {
      field: "address",
      headerName: "Address",
      width: 220,
      type: "string",
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      width: 120,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
      type: "date",
    },
    {
      field: "continentCode",
      headerName: "Continent Code",
      width: 120,
      type: "number",
    },
    {
      field: "revenue",
      headerName: "Annual Revenue",
      width: 140,
      type: "number",
      valueFormatter: (
        params: GridRenderCellParams<AccountDetailsDto, number | null | undefined>
      ) => formatNumberValue(params?.value ?? params?.row?.revenue),
      renderCell: (params: GridRenderCellParams<AccountDetailsDto, number | null | undefined>) =>
        formatNumberValue(params.value ?? params.row?.revenue),
    },
    {
      field: "profit",
      headerName: "Profit",
      width: 140,
      type: "number",
      valueFormatter: (
        params: GridRenderCellParams<AccountDetailsDto, number | null | undefined>
      ) => formatNumberValue(params?.value ?? params?.row?.profit),
      renderCell: (params: GridRenderCellParams<AccountDetailsDto, number | null | undefined>) =>
        formatNumberValue(params.value ?? params.row?.profit),
    },
    {
      field: "source",
      headerName: "Source",
      width: 140,
      type: "string",
    },
    {
      field: "domainsCount",
      headerName: "Domains",
      width: 120,
      type: "number",
    },
    {
      field: "tags",
      headerName: "Tags",
      width: 200,
      type: "string",
      valueGetter: (params) => {
        const tags = params && (params as { row?: AccountDetailsDto }).row?.tags;
        return Array.isArray(tags) ? tags : [];
      },
      renderCell: (
        params: GridRenderCellParams<AccountDetailsDto, string[] | undefined>
      ): string => {
        const value = params.value as string[] | undefined;
        return Array.isArray(value) && value.length > 0 ? value.join(", ") : "";
      },
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
      key="filter-btn"
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
      key="columns-btn"
      startIcon={<Settings2 size={18} />}
      onClick={() => setColumnsPanelOpen((open) => !open)}
    >
      Columns
    </ToolbarButton>,
    <Fragment key={"import-action"}>
      <ToolbarButton key={"import-btn"} startIcon={<Upload size={18} />} onClick={handleImportOpen}>
        Import
      </ToolbarButton>
      {importFieldsObject && (
        <CsvImport
          isOpen={openImport}
          onClose={handleImportClose}
          onUpload={handleFileUpload}
          object={importFieldsObject}
          endRoute={CoreModule.accounts}
        ></CsvImport>
      )}
    </Fragment>,
    <ToolbarButton key={"export-btn"} startIcon={<Download size={18} />} onClick={handleExportOpen}>
      Export
    </ToolbarButton>,
  ];

  const addButton = (
    <Button
      variant="contained"
      to={getAddFormRoute()}
      component={GhostLink}
      startIcon={<Plus size={18} />}
    >
      Add account
    </Button>
  );

  return (
    <ModuleWrapper
      breadcrumbs={dataListBreadcrumbLinks}
      currentBreadcrumb={accountListCurrentBreadcrumb}
      leftContainerChildren={searchBar}
      extraActionsContainerChildren={extraActions}
      addButtonContainerChildren={addButton}
    >
      <DataList
        columns={columns}
        setColumns={setColumns}
        gridSettingsStorageKey={accountGridSettingsStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getAccountList}
        initialGridState={{
          columns: {
            columnVisibilityModel: {
              continentCode: false,
            },
          },
          sorting: {
            sortModel: [{ field: defaultFilterOrderColumn, sort: defaultFilterOrderDirection }],
          },
        }}
        filterPanelOpen={filterPanelOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        columnsPanelOpen={columnsPanelOpen}
        setColumnsPanelOpen={setColumnsPanelOpen}
        onExportOpen={openExport}
        onExportClose={handleExportOpen}
        exportApiCall={accountsExportApi}
      ></DataList>
    </ModuleWrapper>
  );
};
