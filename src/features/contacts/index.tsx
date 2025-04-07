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
import { DataList, DateValueFormatter } from "@components/data-list";
import { GridColDef } from "@mui/x-data-grid";
import { CoreModule, getAddFormRoute } from "lib/router";
import { dataListBreadcrumbLinks } from "utils/constants";
import { ModuleWrapper } from "@components/module-wrapper";
import { SearchBar } from "@components/search-bar";
import { Fragment, useRef, useState } from "react";
import { Add, Download, Upload } from "@mui/icons-material";
import { GhostLink } from "@components/ghost-link";
import { CsvImport } from "@components/spreadsheet-import";
import { getModelByName } from "lib/network/swagger-models";
import { Result } from "@wavepoint/react-spreadsheet-import/types/types";
import { CsvExport } from "@components/export";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";

export const Contacts = () => {
  const { client } = useRequestContext();
  const [gridSettings, setGridSettings] = useLocalStorage<DataListSettings | undefined>(
    contactGridSettingsStorageKey,
    undefined,
  );

  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [openImport, setOpenImport] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [importFieldsObject, setImportFieldsObject] = useState<any>();
  const dataExportQuery = useRef("");

  const getContactList = async (mainQuery: string, exportQuery?: string) => {
    try {
      dataExportQuery.current = exportQuery || "";
      const result = await client.api.contactsList({
        query: mainQuery,
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const exportContactsAsync = async () => {
    const response = await client.api.contactsExportList({
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
    const importDtoCollection: ContactImportDto[] = data.validData;
    await client.api.contactsImportCreate(importDtoCollection);
  };

  const columns: GridColDef<ContactDetailsDto>[] = [
    {
      field: "prefix",
      headerName: "Prefix",
      flex: 1,
      type: "string",
    },
    {
      field: "firstName",
      headerName: "Name",
      flex: 4,
      type: "string",
      renderCell: ({ row }) => (
        <ContactNameListItem>
          <ListItemAvatar>
            <Avatar src={row.avatarUrl!}></Avatar>
          </ListItemAvatar>
          <ContactNameListItemText
            primary={`${row.firstName || ""} ${row.lastName || ""}`}
            secondary={<ContactHref href={`mailto:${row.email}`}>{row.email}</ContactHref>}
          />
        </ContactNameListItem>
      ),
    },
    {
      field: "middleName",
      headerName: "Middle Name",
      flex: 2,
      type: "string",
    },
    {
      field: "lastName",
      headerName: "Last Name",
      flex: 2,
      type: "string",
    },
    {
      field: "birthday",
      headerName: "Birthday",
      flex: 2,
      type: "date",
      valueGetter: DateValueFormatter,
    },
    {
      field: "jobTitle",
      headerName: "Job Title",
      flex: 2,
      type: "string",
    },
    {
      field: "companyName",
      headerName: "Company Name",
      flex: 2,
      type: "string",
    },
    {
      field: "department",
      headerName: "Department",
      flex: 2,
      type: "string",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 3,
      type: "string",
    },
    {
      field: "address1",
      headerName: "Address 1",
      flex: 4,
    },
    {
      field: "address2",
      headerName: "Address 2",
      flex: 4,
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 3,
      type: "string",
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 2,
      type: "date",
      valueGetter: DateValueFormatter,
    },
    {
      field: "language",
      headerName: "Language",
      flex: 1,
      type: "string",
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
          endRoute={CoreModule.contacts}
        ></CsvImport>
      )}
    </Fragment>,
    <Fragment key={"export-action"}>
      <Button key={"export-btn"} startIcon={<Download />} onClick={handleExportOpen}>
        Export
      </Button>
      {openExport && (
        <CsvExport
          exportAsync={exportContactsAsync}
          closeExport={handleExportOpen}
          fileName={"contacts"}
        ></CsvExport>
      )}
    </Fragment>,
  ];

  const addButton = (
    <Button variant="contained" to={getAddFormRoute()} component={GhostLink} startIcon={<Add />}>
      Add contact
    </Button>
  );

  return (
    <ModuleWrapper
      breadcrumbs={dataListBreadcrumbLinks}
      currentBreadcrumb={contactListPageBreadcrumb}
      leftContainerChildren={searchBar}
      extraActionsContainerChildren={extraActions}
      addButtonContainerChildren={addButton}
    >
      <DataList
        columns={columns}
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
      ></DataList>
    </ModuleWrapper>
  );
};
