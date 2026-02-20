import { DataList, DateValueFormatter, DateValueGetter } from "@components/data-list";
import { ModuleWrapper } from "@components/module-wrapper";
import { SearchBar } from "@components/search-bar";
import { ToolbarButton } from "@components/tool-bar-button";
import { ContactDetailsDto, UnsubscribeDetailsDto } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { GridColDef } from "@mui/x-data-grid";
import { useRef, useState } from "react";
import { Download, Filter, Settings2 } from "lucide-react";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";
import { dataListBreadcrumbLinks } from "utils/constants";
import {
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  searchLabel,
  unsubscribeGridSettingsStorageKey,
  unsubscribeListPageBreadcrumb,
} from "../constants";

/** Extended type to include the included Contact relation */
interface UnsubscribeWithContact extends UnsubscribeDetailsDto {
  contact?: ContactDetailsDto;
}

export const UnsubscribesList = () => {
  const { client } = useRequestContext();
  const [gridSettings] = useLocalStorage<DataListSettings | undefined>(
    unsubscribeGridSettingsStorageKey,
    undefined
  );

  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [openExport, setOpenExport] = useState(false);
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const dataExportQuery = useRef("");

  const getUnsubscribesList = async (mainQuery: string, exportQuery?: string) => {
    try {
      dataExportQuery.current = exportQuery || "";
      const includeFilter = "filter[include]=Contact";
      const fullQuery = [mainQuery, includeFilter].filter(Boolean).join("&");
      const result = await client.api.unsubscribesList({
        query: fullQuery,
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const unsubscribesExportApi: (query: string, accept: string) => Promise<Response> = (
    query,
    accept
  ) => client.api.unsubscribesExportList({ query }, { headers: { Accept: accept } });

  const handleExportOpen = () => {
    openExport ? setOpenExport(false) : setOpenExport(true);
  };

  const [columns, setColumns] = useState<GridColDef<UnsubscribeWithContact>[]>([
    {
      field: "id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "contact.fullName",
      headerName: "Contact Name",
      width: 180,
      type: "string",
      valueGetter: (_value: unknown, row: UnsubscribeWithContact) => {
        const c = row.contact;
        if (!c) return "";
        const full = `${c.firstName || ""} ${c.lastName || ""}`.trim();
        return full || "";
      },
    },
    {
      field: "contact.email",
      headerName: "Contact Email",
      width: 220,
      type: "string",
      valueGetter: (_value: unknown, row: UnsubscribeWithContact) => row.contact?.email || "",
    },
    {
      field: "contactId",
      headerName: "Contact ID",
      width: 100,
      type: "number",
    },
    {
      field: "reason",
      headerName: "Reason",
      width: 200,
      type: "string",
    },
    {
      field: "source",
      headerName: "Source",
      width: 160,
      type: "string",
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 150,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
  ]);

  const searchBar = (
    <SearchBar
      setSearchTermOnChange={setSearchTerm}
      searchBoxLabel={searchLabel}
      initialValue={gridSettings?.searchTerm ?? ""}
    />
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
        ".MuiButton-startIcon": {
          marginRight: 0,
          marginLeft: 0,
        },
      }}
    />,
    <ToolbarButton
      key="columns-btn"
      startIcon={<Settings2 size={18} />}
      onClick={() => setColumnsPanelOpen((open) => !open)}
    >
      Columns
    </ToolbarButton>,
    <ToolbarButton key="export-btn" startIcon={<Download size={18} />} onClick={handleExportOpen}>
      Export
    </ToolbarButton>,
  ];

  return (
    <ModuleWrapper
      breadcrumbs={dataListBreadcrumbLinks}
      currentBreadcrumb={unsubscribeListPageBreadcrumb}
      leftContainerChildren={searchBar}
      extraActionsContainerChildren={extraActions}
    >
      <DataList
        columns={columns}
        setColumns={setColumns}
        gridSettingsStorageKey={unsubscribeGridSettingsStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getUnsubscribesList}
        initialGridState={{
          columns: { columnVisibilityModel: {} },
          sorting: {
            sortModel: [
              {
                field: defaultFilterOrderColumn,
                sort: defaultFilterOrderDirection,
              },
            ],
          },
        }}
        filterPanelOpen={filterPanelOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        columnsPanelOpen={columnsPanelOpen}
        setColumnsPanelOpen={setColumnsPanelOpen}
        onExportOpen={openExport}
        onExportClose={handleExportOpen}
        exportApiCall={unsubscribesExportApi}
        onBulkDelete={async (ids) => {
          await client.api.unsubscribesBulkDelete(ids.map(Number));
        }}
        bulkDeleteEntityName="unsubscribe"
      />
    </ModuleWrapper>
  );
};
