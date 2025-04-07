import { DataList, DateValueFormatter } from "@components/data-list";
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
import { Add, Download, Upload } from "@mui/icons-material";
import { Fragment, useState } from "react";
import { Avatar, Button, ListItemAvatar } from "@mui/material";
import { getAddFormRoute } from "@lib/router";
import { GhostLink } from "@components/ghost-link";
import { useRequestContext } from "@providers/request-provider";
import { buildAbsoluteUrl } from "@lib/network/utils";
import { UserNameListItem, UserNameListItemText } from "./index.styled";

const columns: GridColDef<UserDetailsDto>[] = [
  {
    field: "firstName",
    headerName: "Display",
    flex: 4,
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
    flex: 2,
    valueGetter: DateValueFormatter,
  },
  {
    field: "lastTimeLoggedIn",
    headerName: "Last Active",
    flex: 2,
    valueGetter: DateValueFormatter,
  },
  {
    field: "userName",
    headerName: "User Name",
    flex: 1,
  },
  {
    field: "id",
    headerName: "id",
    flex: 1,
  },
];

export const UserList = () => {
  const { client } = useRequestContext();
  const [gridSettings, setGridSettings] = useLocalStorage<DataListSettings | undefined>(
    UserGridStorageKey,
    undefined,
  );
  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");

  const searchBar = (
    <SearchBar
      setSearchTermOnChange={setSearchTerm}
      searchBoxLabel={searchLabel}
      initialValue={gridSettings?.searchTerm ?? ""}
    ></SearchBar>
  );

  const getUserList = async (mainQuery: string, exportQuery?: string) => {
    try {
      const result = await client.api.usersList();
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  const extraActions = [
    <Fragment key={"import-action"}>
      <Button key={"import-btn"} startIcon={<Upload />} disabled>
        Import
      </Button>
    </Fragment>,
    <Fragment key={"export-action"}>
      <Button key={"export-btn"} startIcon={<Download />} disabled>
        Export
      </Button>
    </Fragment>,
  ];

  const addButton = (
    <Button variant="contained" to={getAddFormRoute()} component={GhostLink} startIcon={<Add />}>
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
      />
    </ModuleWrapper>
  );
};
