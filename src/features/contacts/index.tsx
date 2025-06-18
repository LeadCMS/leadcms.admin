import { Avatar, Button, IconButton, ListItemAvatar } from "@mui/material";
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
import { Fragment, useRef, useState } from "react";
import { Plus, Download, Upload, Filter, Settings2 } from "lucide-react";      
import { GhostLink } from "@components/ghost-link";
import { CsvImport } from "@components/spreadsheet-import";
import { getModelByName } from "lib/network/swagger-models";
import { Result } from "react-spreadsheet-import/types/types";
import { CsvExport } from "@components/export";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";

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

  const [columns, setColumns] =  useState<GridColDef<ContactDetailsDto>[] >([
    {
      field: "prefix",
      headerName: "Prefix",
      minWidth:80,
      type: "string",
    },
    {
      field: "firstName",
      headerName: "Name",
      minWidth: 250,
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
      field: "middleName",
      headerName: "Middle Name",
      minWidth: 120,
      type: "string",
    },
    {
      field: "lastName",
      headerName: "Last Name",
      minWidth: 120,
      type: "string",
    },
    {
      field: "birthday",
      headerName: "Birthday",
      minWidth: 120,
      type: "date",
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "jobTitle",
      headerName: "Job Title",
      minWidth: 100,
      type: "string",
    },
    {
      field: "companyName",
      headerName: "Company Name",
      minWidth: 100,
      type: "string",
    },
    {
      field: "department",
      headerName: "Department",
      minWidth: 100,
      type: "string",
    },
    {
      field: "email",
      headerName: "Email",
      minWidth: 150,
      type: "string",
    },
    {
      field: "address1",
      headerName: "Address 1",
      minWidth: 150,
    },
    {
      field: "address2",
      headerName: "Address 2",
      minWidth: 150,
    },
    {
      field: "phone",
      headerName: "Phone",
      minWidth: 100,
      type: "string",
    },
    {
      field: "createdAt",
      headerName: "Created At",
      minWidth: 100,
      type: "date",
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "language",
      headerName: "Language",
      minWidth: 100,
      type: "string",
    },
  ]);

  const extraActions = [
    <Fragment>
      <SearchBar
      setSearchTermOnChange={setSearchTerm}
      searchBoxLabel={searchLabel}
      initialValue={gridSettings?.searchTerm ?? ""}
      ></SearchBar>
    </Fragment>,
    <Fragment>
      <IconButton
        onClick={() => setFilterPanelOpen(true)}
        color="secondary"
        sx={{
          backgroundColor:theme=> theme.palette.background.primary,
          border: "1px solid", 
          borderColor: "#E4E4E7",
          borderRadius: theme=>theme.spacing(1)
        }}
      >
        <Filter size={18} />
      </IconButton>
    </Fragment>,
    <Fragment>
     <Button
      variant="outlined"
      startIcon={<Settings2 size={18} />}
      onClick={() => setColumnsPanelOpen((open) => !open)}
      color="secondary"
      sx={theme => ({
        backgroundColor: theme.palette.background.primary,
        borderColor: "#E4E4E7",
        "&:hover": {
          backgroundColor: theme.palette.background.primaryHover,
      },
      })}
      >
      Columns
     </Button>
    </Fragment>,
    <Fragment key={"import-action"}>
      <Button key={"import-btn"} 
        startIcon={<Upload size={18}/>} 
        onClick={handleImportOpen} 
        color="secondary" 
        variant="outlined" 
        sx={theme => ({
          backgroundColor: theme.palette.background.primary,
          borderColor: "#E4E4E7",
          "&:hover": {
            backgroundColor: theme.palette.background.primaryHover,
          },
        })}>
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
      <Button key={"export-btn"} 
        startIcon={<Download size={18}/>} 
        onClick={handleExportOpen} 
        color="secondary" 
        variant="outlined" 
        sx={theme => ({
        backgroundColor: theme.palette.background.primary,
        borderColor: "#E4E4E7",
        "&:hover": {
          backgroundColor: theme.palette.background.primaryHover,
        },
        })}
      >
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
    <Button variant="contained" 
      to={getAddFormRoute()} 
      component={GhostLink} 
      startIcon={<Plus size={18}/>} 
      color="secondary" 
    >
      Add contact
    </Button>
  );

  return (
    <ModuleWrapper
      breadcrumbs={dataListBreadcrumbLinks}
      currentBreadcrumb={contactListPageBreadcrumb}
      extraActionsContainerChildren={extraActions}
      addButtonContainerChildren={addButton}
    >
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
            sortModel: [
              { field: defaultFilterOrderColumn, sort: defaultFilterOrderDirection },
            ],
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
