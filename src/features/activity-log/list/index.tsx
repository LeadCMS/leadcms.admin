import { DataList, DateValueFormatter, DateValueGetter } from "@components/data-list";
import { ModuleWrapper } from "@components/module-wrapper";
import { SearchBar } from "@components/search-bar";
import { ActivityLogDetailsDto } from "@lib/network/swagger-client";
import { GridColDef } from "@mui/x-data-grid";
import { useRequestContext } from "@providers/request-provider";
import { useState } from "react";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";
import {
  activityLogGridSettingsStorageKey,
  activityLogListPageBreadcrumb,
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  searchLabel,
} from "../constants";
import { dataListBreadcrumbLinks } from "utils/constants";

const columns: GridColDef<ActivityLogDetailsDto>[] = [
  {
    field: "source",
    headerName: "Source",
    width: 120,
    type: "string",
  },
  {
    field: "sourceId",
    headerName: "SourceId",
    width: 120,
    type: "number",
  },
  {
    field: "type",
    headerName: "Type",
    width: 120,
    type: "string",
  },
  {
    field: "contactId",
    headerName: "ContactId",
    width: 120,
    type: "string",
  },
  {
    field: "ip",
    headerName: "IP",
    width: 120,
    type: "string",
  },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 120,
    valueGetter: DateValueGetter,
    valueFormatter: DateValueFormatter,
  },
];

export const ActivityLogList = () => {
  const { client } = useRequestContext();
  const [gridSettings, setGridSettings] = useLocalStorage<DataListSettings | undefined>(
    activityLogGridSettingsStorageKey,
    undefined
  );

  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const searchBar = (
    <SearchBar
      setSearchTermOnChange={setSearchTerm}
      searchBoxLabel={searchLabel}
      initialValue={gridSettings?.searchTerm ?? ""}
    ></SearchBar>
  );

  const getActivitiesList = async (mainQuery: string) => {
    try {
      const result = await client.api.activityLogsList({
        query: mainQuery,
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  return (
    <ModuleWrapper
      breadcrumbs={dataListBreadcrumbLinks}
      currentBreadcrumb={activityLogListPageBreadcrumb}
      leftContainerChildren={searchBar}
      extraActionsContainerChildren={[]}
    >
      <DataList
        columns={columns}
        gridSettingsStorageKey={activityLogGridSettingsStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getActivitiesList}
        initialGridState={{
          columns: { columnVisibilityModel: {} },
          sorting: {
            sortModel: [{ field: defaultFilterOrderColumn, sort: defaultFilterOrderDirection }],
          },
        }}
        showEditButton={false}
        showViewButton={false}
      ></DataList>
    </ModuleWrapper>
  );
};
