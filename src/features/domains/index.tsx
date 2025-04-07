import { Avatar, ListItemAvatar } from "@mui/material";
import { DomainDetailsDto, DomainImportDto } from "lib/network/swagger-client";
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
import { DataList, DateValueFormatter } from "@components/data-list";
import { GridColDef } from "@mui/x-data-grid";
import { CoreModule, getAddFormRoute } from "lib/router";
import { dataListBreadcrumbLinks } from "utils/constants";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";
import { Fragment, useRef, useState } from "react";
import { getModelByName } from "@lib/network/swagger-models";
import { Result } from "@wavepoint/react-spreadsheet-import/types/types";
import { SearchBar } from "@components/search-bar";
import { Button } from "@mui/material";
import { Add, Download, Upload } from "@mui/icons-material";
import { CsvImport } from "@components/spreadsheet-import";
import { CsvExport } from "@components/export";
import { GhostLink } from "@components/ghost-link";
import { ModuleWrapper } from "@components/module-wrapper";

export const Domains = () => {
  const { client } = useRequestContext();
  const [gridSettings, setGridSettings] = useLocalStorage<DataListSettings | undefined>(
    domainGridSettingsStorageKey,
    undefined,
  );

  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [openImport, setOpenImport] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [importFieldsObject, setImportFieldsObject] = useState<any>();
  const dataExportQuery = useRef("");

  const getDomainList = async (mainQuery: string, exportQuery?: string) => {
    try {
      dataExportQuery.current = exportQuery || "";
      const result = await client.api.domainsList({
        query: mainQuery,
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const exportDomainsAsync = async () => {
    const response = await client.api.domainsExportList({
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
    await client.api.domainsImportCreate(importDtoCollection);
  };

  const columns: GridColDef<DomainDetailsDto>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 4,
      type: "string",
      renderCell: ({ row }) => (
        <DomainListItem>
          <ListItemAvatar>
            <Avatar
              sizes="64"
              src={"http://www.google.com/s2/favicons?domain=" + row.name + "&sz=32"}
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
      flex: 2,
      type: "string,",
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      type: "string",
    },
    {
      field: "url",
      headerName: "Url",
      flex: 2,
      type: "string",
    },
    {
      field: "dnsCheck",
      headerName: "Dns Check",
      flex: 2,
      type: "singleSelect",
      align: "left",
      headerAlign: "left",
      valueOptions: ["true", "false", "null"],
    },
    {
      field: "free",
      headerName: "Free",
      flex: 2,
      type: "singleSelect",
      align: "left",
      headerAlign: "left",
      valueOptions: ["true", "false", "null"],
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 2,
      type: "date",
      valueGetter: DateValueFormatter,
    },
  ];

  const searchBar = (
    <SearchBar
      setSearchTermOnChange={setSearchTerm}
      searchBoxLabel={searchLabel}
      initialValue={gridSettings?.searchTerm ?? ""}
    ></SearchBar>
  );

  const extraActions = [
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
          endRoute={CoreModule.domains}
        ></CsvImport>
      )}
    </Fragment>,
    <Fragment key={"export-action"}>
      <Button key={"export-btn"} startIcon={<Download />} onClick={handleExportOpen}>
        Export
      </Button>
      {openExport && (
        <CsvExport
          exportAsync={exportDomainsAsync}
          closeExport={handleExportOpen}
          fileName={"domains"}
        ></CsvExport>
      )}
    </Fragment>,
  ];

  const addButton = (
    <Button variant="contained" to={getAddFormRoute()} component={GhostLink} startIcon={<Add />}>
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
        gridSettingsStorageKey={domainGridSettingsStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getDomainList}
        initialGridState={{
          columns: { columnVisibilityModel: { dnsCheck: false, free: false } },
          sorting: {
            sortModel: [{ field: defaultFilterOrderColumn, sort: defaultFilterOrderDirection }],
          },
        }}
      ></DataList>
    </ModuleWrapper>
  );
};
