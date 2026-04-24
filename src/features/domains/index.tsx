import Avatar from "@mui/material/Avatar";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Button from "@mui/material/Button";

import { DomainDetailsDto } from "lib/network/swagger-client";
import { useRequestContext } from "providers/request-provider";
import { DomainListItem, DomainListItemText } from "./index.styled";
import {
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  modelName,
  searchLabel,
  domainGridSettingsStorageKey,
  domainListPageBreadcrumb,
} from "./constants";
import { DataList, DateValueFormatter, DateValueGetter } from "@components/data-list";
import { GridColDef } from "@mui/x-data-grid";
import { CoreModule, getAddFormRoute } from "lib/router";
import { dataListBreadcrumbLinks } from "utils/constants";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";
import { Fragment, useRef, useState } from "react";
import { getModelByName } from "@lib/network/swagger-models";
import { Result } from "react-spreadsheet-import/types/types";
import { SearchBar } from "@components/search-bar";
import { Plus, Download, Upload, Filter, Settings2 } from "lucide-react";
import { CsvImport } from "@components/spreadsheet-import";
import { GhostLink } from "@components/ghost-link";
import { ModuleWrapper } from "@components/module-wrapper";
import { ToolbarButton } from "@components/tool-bar-button";

export const Domains = () => {
  const { client } = useRequestContext();
  const [gridSettings, setGridSettings] = useLocalStorage<DataListSettings | undefined>(
    domainGridSettingsStorageKey,
    undefined
  );

  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [openImport, setOpenImport] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [importFieldsObject, setImportFieldsObject] = useState<any>();
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const dataExportQuery = useRef("");

  const getDomainList = async (mainQuery: string, exportQuery?: string) => {
    dataExportQuery.current = exportQuery || "";
    const result = await client.api.domainsList({
      query: mainQuery,
    });
    return result;
  };

  const domainsExportApi: (query: string, accept: string) => Promise<Response> = (query, accept) =>
    client.api.domainsExportList({ query }, { headers: { Accept: accept } });

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
    await client.api.domainsImportCreate(importDtoCollection);
  };

  const [columns, setColumns] = useState<GridColDef<DomainDetailsDto>[]>([
    {
      field: "name",
      headerName: "Name",
      width: 220,
      type: "string",
      renderCell: ({ row }) => (
        <DomainListItem>
          <ListItemAvatar>
            <Avatar
              sizes="64"
              // Use local favicons if available, fallback to Google service
              src={row.faviconUrl || `http://www.google.com/s2/favicons?domain=${row.name}&sz=32`}
              sx={{
                width: 32,
                height: 32,
              }}
            ></Avatar>
          </ListItemAvatar>
          <DomainListItemText primary={`${row.name || ""}`} secondary={row.url} />
        </DomainListItem>
      ),
    },
    {
      field: "title",
      headerName: "Title",
      width: 120,
      type: "string",
    },
    {
      field: "description",
      headerName: "Description",
      width: 180,
      type: "string",
    },
    {
      field: "url",
      headerName: "Url",
      width: 120,
      type: "string",
    },
    {
      field: "dnsCheck",
      headerName: "Dns Check",
      width: 120,
      type: "singleSelect",
      align: "left",
      headerAlign: "left",
      valueOptions: ["true", "false", "null"],
    },
    {
      field: "free",
      headerName: "Free",
      width: 120,
      type: "singleSelect",
      align: "left",
      headerAlign: "left",
      valueOptions: ["true", "false", "null"],
    },
    {
      field: "disposable",
      headerName: "Disposable",
      width: 140,
      type: "singleSelect",
      align: "left",
      headerAlign: "left",
      valueOptions: ["true", "false", "null"],
    },
    {
      field: "contactCount",
      headerName: "Contacts",
      width: 120,
      type: "number",
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 120,
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
          endRoute={CoreModule.domains}
        ></CsvImport>
      )}
    </Fragment>,
    <Fragment key={"export-action"}>
      <ToolbarButton
        key={"export-btn"}
        startIcon={<Download size={18} />}
        onClick={handleExportOpen}
      >
        Export
      </ToolbarButton>
    </Fragment>,
  ];

  const addButton = (
    <Button
      variant="contained"
      to={getAddFormRoute()}
      component={GhostLink}
      startIcon={<Plus size={18} />}
    >
      Add domain
    </Button>
  );

  return (
    <ModuleWrapper
      breadcrumbs={dataListBreadcrumbLinks}
      currentBreadcrumb={domainListPageBreadcrumb}
      leftContainerChildren={searchBar}
      extraActionsContainerChildren={extraActions}
      addButtonContainerChildren={addButton}
    >
      <DataList
        columns={columns}
        setColumns={setColumns}
        gridSettingsStorageKey={domainGridSettingsStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getDomainList}
        initialGridState={{
          columns: { columnVisibilityModel: { dnsCheck: false, free: false, disposable: false } },
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
        exportApiCall={domainsExportApi}
      ></DataList>
    </ModuleWrapper>
  );
};
