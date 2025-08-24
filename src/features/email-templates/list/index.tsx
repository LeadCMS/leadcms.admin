import { DataList, DateValueFormatter, DateValueGetter } from "@components/data-list";
import { GhostLink } from "@components/ghost-link";
import { ModuleWrapper } from "@components/module-wrapper";
import { SearchBar } from "@components/search-bar";
import { EmailTemplateDetailsDto } from "@lib/network/swagger-client";
import { getAddFormRoute } from "@lib/router";
import { Plus, Download, Filter, Settings2 } from "lucide-react";
import Button from "@mui/material/Button";
import { GridColDef } from "@mui/x-data-grid";
import { useRequestContext } from "@providers/request-provider";
import { useRef, useState } from "react";
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
import { ToolbarButton } from "@components/tool-bar-button";

export const EmailTemplatesList = () => {
  const { client } = useRequestContext();
  const [gridSettings, setGridSettings] = useLocalStorage<DataListSettings | undefined>(
    emailTemplateGridSettingsStorageKey,
    undefined
  );

  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [openExport, setOpenExport] = useState(false);
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const dataExportQuery = useRef("");

  const getEmailTemplatesList = async (mainQuery: string, exportQuery?: string) => {
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

  const emailTemplatesExportApi: (query: string, accept: string) => Promise<Response> = (
    query,
    accept
  ) => client.api.emailTemplatesExportList({ query }, { headers: { Accept: accept } });

  const handleExportOpen = () => {
    openExport ? setOpenExport(false) : setOpenExport(true);
  };

  const [columns, setColumns] = useState<GridColDef<EmailTemplateDetailsDto>[]>([
    {
      field: "id",
      headerName: "id",
      minWidth: 100,
    },
    {
      field: "name",
      headerName: "Name",
      minWidth: 140,
      type: "string",
    },
    {
      field: "subject",
      headerName: "Subject",
      minWidth: 120,
      type: "string",
    },
    {
      field: "fromEmail",
      headerName: "Sender Email",
      minWidth: 120,
      type: "string",
    },
    {
      field: "fromName",
      headerName: "Sender Name",
      minWidth: 140,
      type: "string",
    },
    {
      field: "language",
      headerName: "Language",
      minWidth: 120,
      type: "string",
    },
    {
      field: "createdAt",
      headerName: "Created At",
      minWidth: 120,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      flex: 2,
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
        setColumns={setColumns}
        gridSettingsStorageKey={emailTemplateGridSettingsStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getEmailTemplatesList}
        initialGridState={{
          columns: { columnVisibilityModel: {} },
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
        exportApiCall={emailTemplatesExportApi}
      ></DataList>
    </ModuleWrapper>
  );
};
