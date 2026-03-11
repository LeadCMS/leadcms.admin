import { useEffect, useState } from "react";
import { Alert, Box, IconButton, Tooltip } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { Settings2 } from "lucide-react";
import { DataList } from "@components/data-list";
import { useCurrencyFormatter } from "@hooks";
import { ContactDetailsDto } from "lib/network/swagger-client";
import { useConfig } from "@providers/config-provider";
import { useRequestContext } from "providers/request-provider";
import { ENTITY_KEYS, hasEntity } from "@utils/entity-availability";
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
  const { config } = useConfig();
  const { primaryCurrency } = useCurrencyFormatter();
  const hasOrders = hasEntity(config?.entities, ENTITY_KEYS.order);
  const hasDeals = hasEntity(config?.entities, ENTITY_KEYS.deal);

  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [columns, setColumns] = useState<GridColDef<ContactDetailsDto>[]>(() =>
    getSegmentContactColumns(primaryCurrency, { hasDeals, hasOrders })
  );

  useEffect(() => {
    setColumns(getSegmentContactColumns(primaryCurrency, { hasDeals, hasOrders }));
  }, [hasDeals, hasOrders, primaryCurrency]);

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
