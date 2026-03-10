import { useState } from "react";
import { Alert, Box, IconButton, Tooltip } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { Settings2 } from "lucide-react";
import { DataList } from "@components/data-list";
import { useCurrencyFormatter } from "@hooks";
import { ContactDetailsDto } from "lib/network/swagger-client";
import { useRequestContext } from "providers/request-provider";
import { getSegmentContactColumns } from "./segment-contact-columns";

interface SegmentContactsTableProps {
  segmentId: number;
  gridSettingsStorageKey: string;
  infoMessage?: string;
}

const includeFilter = "filter[include]=Account&filter[include]=Domain";

export const SegmentContactsTable = ({
  segmentId,
  gridSettingsStorageKey,
  infoMessage,
}: SegmentContactsTableProps) => {
  const { client } = useRequestContext();
  const { primaryCurrency } = useCurrencyFormatter();

  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [columns, setColumns] = useState<GridColDef<ContactDetailsDto>[]>(() =>
    getSegmentContactColumns(primaryCurrency)
  );

  const getSegmentContactsList = async (mainQuery: string) => {
    const fullQuery = [mainQuery, includeFilter].filter(Boolean).join("&");
    return client.api.contactsList({ query: fullQuery, segmentId });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {infoMessage ? <Alert severity="info">{infoMessage}</Alert> : null}
      <Box sx={{ position: "relative" }}>
        <Tooltip title="Manage columns">
          <IconButton
            size="small"
            onClick={() => setColumnsPanelOpen(true)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 2,
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: 1,
            }}
          >
            <Settings2 size={16} />
          </IconButton>
        </Tooltip>

        <DataList
          columns={columns}
          setColumns={setColumns}
          gridSettingsStorageKey={gridSettingsStorageKey}
          defaultFilterOrderColumn="createdAt"
          defaultFilterOrderDirection="desc"
          searchText=""
          getModelDataList={getSegmentContactsList}
          initialGridState={{
            sorting: {
              sortModel: [
                {
                  field: "createdAt",
                  sort: "desc",
                },
              ],
            },
            columns: {
              columnVisibilityModel: {
                firstName: false,
                lastName: false,
                companyName: false,
                phone: false,
                createdAt: false,
                updatedAt: false,
              },
            },
          }}
          columnsPanelOpen={columnsPanelOpen}
          setColumnsPanelOpen={setColumnsPanelOpen}
          showActionsColumn={false}
          enableRowSelection={false}
        />
      </Box>
    </Box>
  );
};
