import { Avatar, Button, ListItemAvatar } from "@mui/material";
import { ContactDetailsDto, ContactImportDto } from "lib/network/swagger-client";
import { useRequestContext } from "providers/request-provider";
import { ContactHref, ContactNameListItem, ContactNameListItemText } from "./index.styled";
import {
  contactGridSettingsStorageKey,
  contactListPageBreadcrumb,
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  modelName,
  searchLabel,
} from "./constants";
import { DataList, DateValueFormatter, DateValueGetter } from "@components/data-list";
import { GridColDef } from "@mui/x-data-grid";
import { CoreModule, getAddFormRoute } from "lib/router";
import { dataListBreadcrumbLinks } from "utils/constants";
import { ModuleWrapper } from "@components/module-wrapper";
import { SearchBar } from "@components/search-bar";
import { useRef, useState } from "react";
import { Plus, Download, Upload, Filter, Settings2 } from "lucide-react";
import { GhostLink } from "@components/ghost-link";
import { CsvImport } from "@components/spreadsheet-import";
import { getModelByName } from "lib/network/swagger-models";
import { Result } from "react-spreadsheet-import/types/types";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";
import { ToolbarButton } from "@components/tool-bar-button";

export const Contacts = () => {
  const { client } = useRequestContext();
  const [gridSettings] = useLocalStorage<DataListSettings | undefined>(
    contactGridSettingsStorageKey,
    undefined
  );

  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [openImport, setOpenImport] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [importFieldsObject, setImportFieldsObject] = useState<any>();
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const dataExportQuery = useRef("");

  const getContactList = async (mainQuery: string, exportQuery?: string) => {
    try {
      dataExportQuery.current = exportQuery || "";
      const includeFilter = "filter[include]=Account";
      const fullQuery = mainQuery ? `${mainQuery}&${includeFilter}` : includeFilter;
      const result = await client.api.contactsList({
        query: fullQuery,
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const contactsExportApi: (query: string, accept: string) => Promise<Response> = (query, accept) =>
    client.api.contactsExportList({ query }, { headers: { Accept: accept } });

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
    const importDtoCollection: ContactImportDto[] = data.validData;
    await client.api.contactsImportCreate(importDtoCollection);
  };

  const [columns, setColumns] = useState<GridColDef<ContactDetailsDto>[]>([
    {
      field: "prefix",
      headerName: "Prefix",
      width: 80,
      type: "string",
    },
    {
      field: "firstName",
      headerName: "Name",
      width: 250,
      type: "string",
      renderCell: ({ row }) => (
        <ContactNameListItem sx={{ paddingY: 0 }}>
          <ListItemAvatar>
            <Avatar src={row.avatarUrl}></Avatar>
          </ListItemAvatar>
          <ContactNameListItemText
            primary={`${row.firstName || ""} ${row.lastName || ""}`}
            secondary={<ContactHref href={`mailto:${row.email}`}>{row.email}</ContactHref>}
          />
        </ContactNameListItem>
      ),
    },
    {
      field: "account",
      headerName: "Account",
      width: 200,
      type: "string",
      sortable: true,
      valueGetter: (value, row) => row.account?.name || "",
      sortComparator: (v1, v2, param1, param2) => {
        const accountId1 = param1.api.getRow(param1.id)?.accountId || 0;
        const accountId2 = param2.api.getRow(param2.id)?.accountId || 0;
        return accountId1 - accountId2;
      },
    },
    {
      field: "middleName",
      headerName: "Middle Name",
      width: 120,
      type: "string",
    },
    {
      field: "lastName",
      headerName: "Last Name",
      width: 120,
      type: "string",
    },
    {
      field: "birthday",
      headerName: "Birthday",
      width: 120,
      type: "date",
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "jobTitle",
      headerName: "Job Title",
      width: 100,
      type: "string",
    },
    {
      field: "companyName",
      headerName: "Company Name",
      width: 100,
      type: "string",
    },
    {
      field: "department",
      headerName: "Department",
      width: 100,
      type: "string",
    },
    {
      field: "email",
      headerName: "Email",
      width: 150,
      type: "string",
    },
    {
      field: "address1",
      headerName: "Address 1",
      width: 150,
    },
    {
      field: "address2",
      headerName: "Address 2",
      width: 150,
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 100,
      type: "string",
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 100,
      type: "date",
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "language",
      headerName: "Language",
      width: 100,
      type: "string",
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
    <ToolbarButton key="import-btn" startIcon={<Upload size={18} />} onClick={handleImportOpen}>
      Import
    </ToolbarButton>,
    <ToolbarButton key="export-btn" startIcon={<Download size={18} />} onClick={handleExportOpen}>
      Export
    </ToolbarButton>,
  ];

  const addButton = (
    <Button
      variant="contained"
      to={getAddFormRoute()}
      component={GhostLink}
      startIcon={<Plus size={18} />}
      color="primary"
    >
      Add contact
    </Button>
  );

  return (
    <ModuleWrapper
      breadcrumbs={dataListBreadcrumbLinks}
      currentBreadcrumb={contactListPageBreadcrumb}
      extraActionsContainerChildren={extraActions}
      leftContainerChildren={searchBar}
      addButtonContainerChildren={addButton}
    >
      {importFieldsObject && (
        <CsvImport
          isOpen={openImport}
          onClose={handleImportClose}
          onUpload={handleFileUpload}
          object={importFieldsObject}
          endRoute={CoreModule.contacts}
        />
      )}
      <DataList
        columns={columns}
        setColumns={setColumns}
        gridSettingsStorageKey={contactGridSettingsStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getContactList}
        initialGridState={{
          columns: { columnVisibilityModel: { lastName: false, email: false } },
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
        exportApiCall={contactsExportApi}
      ></DataList>
    </ModuleWrapper>
  );
};
