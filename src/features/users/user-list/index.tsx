import { DataList, DateValueFormatter, DateValueGetter } from "@components/data-list";
import { ModuleWrapper } from "@components/module-wrapper";
import { GridColDef } from "@mui/x-data-grid";
import {
  UserGridStorageKey,
  UsersBreadcrumbLinks,
  UsersListCurrentBreadcrumb,
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  searchLabel,
} from "../constants";
import { SearchBar } from "@components/search-bar";
import { UserDetailsDto } from "@lib/network/swagger-client";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";
import { Plus, Download, Upload, Settings2, Filter } from "lucide-react";
import { Fragment, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import { getAddFormRoute } from "@lib/router";
import { GhostLink } from "@components/ghost-link";
import { useRequestContext } from "@providers/request-provider";
import { buildAbsoluteUrl } from "@lib/network/utils";
import { UserNameListItem, UserNameListItemText } from "./index.styled";
import { ToolbarButton } from "@components/tool-bar-button";

export const UserList = () => {
  const { client } = useRequestContext();
  const [gridSettings, setGridSettings] = useLocalStorage<DataListSettings | undefined>(
    UserGridStorageKey,
    undefined
  );
  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const [columns, setColumns] = useState<GridColDef<UserDetailsDto>[]>([
    {
      field: "firstName",
      headerName: "Display",
      width: 250,
      type: "string",
      renderCell: ({ row }) => (
        <UserNameListItem>
          <ListItemAvatar>
            <Avatar src={buildAbsoluteUrl(row.avatarUrl)}></Avatar>
          </ListItemAvatar>
          <UserNameListItemText primary={row.displayName || ""} secondary={row.email} />
        </UserNameListItem>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 180,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "lastTimeLoggedIn",
      headerName: "Last Active",
      width: 180,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "userName",
      headerName: "User Name",
      width: 180,
    },
    {
      field: "id",
      headerName: "id",
      width: 180,
    },
  ]);

  const searchBar = (
    <SearchBar
      setSearchTermOnChange={setSearchTerm}
      searchBoxLabel={searchLabel}
      initialValue={gridSettings?.searchTerm ?? ""}
    ></SearchBar>
  );

  const getUserList = async (mainQuery: string, _exportQuery?: string) => {
    const result = await client.api.usersList({ query: mainQuery });
    return result;
  };

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
      <ToolbarButton key={"import-btn"} startIcon={<Upload size={18} />} disabled>
        Import
      </ToolbarButton>
    </Fragment>,
    <Fragment key={"export-action"}>
      <ToolbarButton key={"export-btn"} startIcon={<Download size={18} />} disabled>
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
      Add user
    </Button>
  );

  return (
    <ModuleWrapper
      breadcrumbs={UsersBreadcrumbLinks}
      currentBreadcrumb={UsersListCurrentBreadcrumb}
      leftContainerChildren={searchBar}
      extraActionsContainerChildren={extraActions}
      addButtonContainerChildren={addButton}
    >
      <DataList
        columns={columns}
        setColumns={setColumns}
        gridSettingsStorageKey={UserGridStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getUserList}
        initialGridState={{
          columns: { columnVisibilityModel: { continentCode: false } },
          sorting: {
            sortModel: [{ field: defaultFilterOrderColumn, sort: defaultFilterOrderDirection }],
          },
        }}
        filterPanelOpen={filterPanelOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        columnsPanelOpen={columnsPanelOpen}
        setColumnsPanelOpen={setColumnsPanelOpen}
        onBulkDelete={async (ids) => {
          await client.api.usersBulkDelete(ids.map(String));
        }}
        bulkDeleteEntityName="user"
      />
    </ModuleWrapper>
  );
};
