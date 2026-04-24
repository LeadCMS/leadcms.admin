import { useState } from "react";
import { useRequestContext } from "providers/request-provider";
import {
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  segmentGridSettingsStorageKey,
  searchLabel,
  SegmentsBreadcrumbLinks,
} from "./constants";
import { DataList, DateValueFormatter, DateValueGetter } from "@components/data-list";
import { GridColDef } from "@mui/x-data-grid";
import { getAddFormRoute } from "lib/router";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";
import { SearchBar } from "@components/search-bar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { Plus, Settings2, Users, Zap, UserPlus } from "lucide-react";
import { GhostLink } from "@components/ghost-link";
import { ModuleWrapper } from "@components/module-wrapper";
import { ToolbarButton } from "@components/tool-bar-button";
// Mock data - in real app this would come from API
export const Segments = () => {
  const { client } = useRequestContext();
  const [gridSettings] = useLocalStorage<DataListSettings | undefined>(
    segmentGridSettingsStorageKey,
    undefined
  );

  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);

  const getSegmentsList = async (mainQuery: string, exportQuery?: string) => {
    void exportQuery;
    const result = await client.api.segmentsList({ query: mainQuery });
    return {
      data: result.data || [],
      headers: {
        get: (key: string) => (key === "x-total-count" ? String(result.data?.length || 0) : null),
      } as unknown as Headers,
    };
  };

  const [columns, setColumns] = useState<GridColDef[]>([
    {
      field: "name",
      headerName: "Segment",
      width: 300,
      renderCell: ({ row }) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            gap: 0.25,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
            {row.name}
          </Typography>
          {row.description && (
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
              {row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "type",
      headerName: "Type",
      width: 140,
      renderCell: ({ row }) => {
        const typeValue = String(row.type || "").toLowerCase();
        const isDynamic = typeValue === "dynamic";
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Chip
              size="small"
              icon={isDynamic ? <Zap size={14} /> : <UserPlus size={14} />}
              label={isDynamic ? "Dynamic" : "Static"}
              variant={isDynamic ? "filled" : "outlined"}
              color={isDynamic ? "primary" : "default"}
            />
          </Box>
        );
      },
    },
    {
      field: "contactCount",
      headerName: "Contacts",
      width: 120,
      renderCell: ({ row }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, height: "100%" }}>
          <Users size={14} />
          <Typography variant="body2">{row.contactCount}</Typography>
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 180,
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "updatedAt",
      headerName: "Updated",
      width: 180,
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
      startIcon={<Settings2 size={18} />}
      onClick={() => setColumnsPanelOpen(true)}
      key="columns"
    >
      Columns
    </ToolbarButton>,
  ];

  const addButton = (
    <Button
      variant="contained"
      to={getAddFormRoute()}
      component={GhostLink}
      startIcon={<Plus size={18} />}
    >
      Add Segment
    </Button>
  );

  return (
    <ModuleWrapper
      breadcrumbs={SegmentsBreadcrumbLinks}
      currentBreadcrumb="Segments"
      leftContainerChildren={searchBar}
      extraActionsContainerChildren={extraActions}
      addButtonContainerChildren={addButton}
    >
      <DataList
        columns={columns}
        setColumns={setColumns}
        gridSettingsStorageKey={segmentGridSettingsStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getSegmentsList}
        initialGridState={{
          sorting: {
            sortModel: [{ field: defaultFilterOrderColumn, sort: defaultFilterOrderDirection }],
          },
        }}
        columnsPanelOpen={columnsPanelOpen}
        setColumnsPanelOpen={setColumnsPanelOpen}
      />
    </ModuleWrapper>
  );
};
