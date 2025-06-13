import React, { useState } from "react";
import { Button } from "@mui/material";
import { MediaDetailsDto } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { DataList, DateValueFormatter, DateValueGetter } from "@components/data-list";
import { GridColDef } from "@mui/x-data-grid";
import { getAddFormRoute } from "@lib/router";
import { ModuleWrapper } from "@components/module-wrapper";
import {
  mediaGridSettingsStorageKey,
  mediaListBreadcrumbLinks,
  mediaListCurrentBreadcrumb,
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  searchLabel,
} from "./constants";
import { SearchBar } from "@components/search-bar";
import { Plus } from "lucide-react";
import { GhostLink } from "@components/ghost-link";
import { getContentCoverImageUrl } from "@lib/network/utils";

export const Media = () => {
  const { client } = useRequestContext();
  const [gridSettings] = useState<any>();
  const [searchTerm, setSearchTerm] = useState<string>(gridSettings?.searchTerm ?? "");

  const getMediaList = async (mainQuery: string) => {
    try {
      const result = await client.api.mediaList({ query: mainQuery });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const columns: GridColDef<MediaDetailsDto>[] = [
    {
      field: "media",
      headerName: "Media",
      flex: 2,
      renderCell: ({ row }) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={getContentCoverImageUrl(row.location)}
            alt={row.name}
            style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }}
            onError={e => {
              const target = e.currentTarget;
              if (target.src !== "/images/placeholder.svg") {
                target.src = "/images/placeholder.svg";
              }
            }}
          />
          <span style={{ wordBreak: "break-all" }}>{row.name}</span>
        </div>
      ),
      sortable: false,
      filterable: false,
      minWidth: 200,
    },
    { field: "scopeUid", headerName: "ScopeUid", width: 120 },
    { field: "extension", headerName: "Extension", width: 100 },
    { field: "mimeType", headerName: "Mime Type", width: 160 },
    { field: "size", headerName: "Size", width: 120 },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 180,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      width: 180,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
  ];

  const searchBar = (
    <SearchBar
      setSearchTermOnChange={setSearchTerm}
      searchBoxLabel={searchLabel}
      initialValue={gridSettings?.searchTerm ?? ""}
    />
  );

  const addButton = (
    <Button variant="contained" to={getAddFormRoute()} component={GhostLink} startIcon={<Plus />}>
      Add media
    </Button>
  );

  return (
    <ModuleWrapper
      breadcrumbs={mediaListBreadcrumbLinks}
      currentBreadcrumb={mediaListCurrentBreadcrumb}
      leftContainerChildren={searchBar}
      addButtonContainerChildren={addButton}
    >
      <DataList
        columns={columns}
        gridSettingsStorageKey={mediaGridSettingsStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getMediaList}
        initialGridState={{
          columns: { columnVisibilityModel: {} },
          sorting: {
            sortModel: [
              { field: defaultFilterOrderColumn, sort: defaultFilterOrderDirection },
            ],
          },
        }}
      />
    </ModuleWrapper>
  );
};

export default Media;
