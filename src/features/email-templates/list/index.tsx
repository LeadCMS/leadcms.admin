import { DataList, DateValueFormatter } from "@components/data-list";
import { CsvExport } from "@components/export";
import { GhostLink } from "@components/ghost-link";
import { ModuleWrapper } from "@components/module-wrapper";
import { SearchBar } from "@components/search-bar";
import { EmailTemplateDetailsDto } from "@lib/network/swagger-client";
import { getAddFormRoute } from "@lib/router";
import { Add, Download } from "@mui/icons-material";
import Button from "@mui/material/Button";
import { GridColDef } from "@mui/x-data-grid";
import { useRequestContext } from "@providers/request-provider";
import { Fragment, useRef, useState } from "react";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";
import {
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  emailTemplateGridSettingsStorageKey,
  emailTemplateListPageBreadcrumb,
  searchLabel,
} from "../constants";
import { dataListBreadcrumbLinks } from "utils/constants";

const columns: GridColDef<EmailTemplateDetailsDto>[] = [
  {
    field: "id",
    headerName: "id",
    flex: 1,
  },
  {
    field: "name",
    headerName: "Name",
    flex: 2,
    type: "string",
  },
  {
    field: "subject",
    headerName: "Subject",
    flex: 2,
    type: "string",
  },
  {
    field: "fromEmail",
    headerName: "Sender Email",
    flex: 2,
    type: "string",
  },
  {
    field: "fromName",
    headerName: "Sender Name",
    flex: 2,
    type: "string",
  },
  {
    field: "language",
    headerName: "Language",
    flex: 2,
    type: "string",
  },
  {
    field: "createdAt",
    headerName: "Created At",
    flex: 2,
    valueGetter: DateValueFormatter,
  },
  {
    field: "updatedAt",
    headerName: "Updated At",
    flex: 2,
    valueGetter: DateValueFormatter,
  },
];

export const EmailTemplatesList = () => {
  const { client } = useRequestContext();
  const [gridSettings, setGridSettings] = useLocalStorage<DataListSettings | undefined>(
    emailTemplateGridSettingsStorageKey,
    undefined,
  );

  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [openExport, setOpenExport] = useState(false);
  const dataExportQuery = useRef("");

  const getContactList = async (mainQuery: string, exportQuery?: string) => {
    try {
      dataExportQuery.current = exportQuery || "";
      const result = await client.api.emailTemplatesList({
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

  const handleExportOpen = () => {
    openExport ? setOpenExport(false) : setOpenExport(true);
  };

  const searchBar = (
    <SearchBar
      setSearchTermOnChange={setSearchTerm}
      searchBoxLabel={searchLabel}
      initialValue={gridSettings?.searchTerm ?? ""}
    ></SearchBar>
  );

  const extraActions = [
    <Fragment key={"export-action"}>
      <Button key={"export-btn"} startIcon={<Download />} onClick={handleExportOpen}>
        Export
      </Button>
      {openExport && (
        <CsvExport
          exportAsync={exportContactsAsync}
          closeExport={handleExportOpen}
          fileName={"email-templates"}
        ></CsvExport>
      )}
    </Fragment>,
  ];

  const addButton = (
    <Button variant="contained" to={getAddFormRoute()} component={GhostLink} startIcon={<Add />}>
      Add template
    </Button>
  );

  return (
    <ModuleWrapper
      breadcrumbs={dataListBreadcrumbLinks}
      currentBreadcrumb={emailTemplateListPageBreadcrumb}
      leftContainerChildren={searchBar}
      extraActionsContainerChildren={extraActions}
      addButtonContainerChildren={addButton}
    >
      <DataList
        columns={columns}
        gridSettingsStorageKey={emailTemplateGridSettingsStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getContactList}
        initialGridState={{
          columns: { columnVisibilityModel: {} },
          sorting: {
            sortModel: [{ field: defaultFilterOrderColumn, sort: defaultFilterOrderDirection }],
          },
        }}
      ></DataList>
    </ModuleWrapper>
  );
};
