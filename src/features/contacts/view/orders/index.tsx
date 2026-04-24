import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useConfig } from "@providers/config-provider";
import { useNotificationsService, useCurrencyFormatter } from "@hooks";
import { showApiError } from "@utils/api-error-parser";
import { DateValueFormatter, DateValueGetter } from "@components/data-list";
import { ActionButtonContainer } from "@features/contacts/index.styled";
import { OrderDetailsDto } from "@lib/network/swagger-client";
import { getWhereFilterQuery } from "@providers/query-provider";
import { useRequestContext } from "@providers/request-provider";
import { ENTITY_KEYS, hasEntity } from "@utils/entity-availability";
import { getViewFormRoute } from "@lib/router";
import { ContactViewOutletContext } from "../types";

export const ContactOrders = () => {
  const { contactId } = useOutletContext<ContactViewOutletContext>();
  const { client } = useRequestContext();
  const { config } = useConfig();
  const { notificationsService } = useNotificationsService();
  const { formatByCode, formatMoney } = useCurrencyFormatter();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDetailsDto[]>();
  const [isLoading, setIsLoading] = useState(true);
  const hasOrders = hasEntity(config?.entities, ENTITY_KEYS.order);

  useEffect(() => {
    const loadOrders = async () => {
      if (!hasOrders) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      if (!contactId) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const { data } = await client.api.ordersList({
          query: getWhereFilterQuery("contactId", contactId.toString(), "equals"),
        });
        setOrders(data || []);
      } catch (error) {
        setOrders([]);
        showApiError(error, notificationsService, undefined, "Could not retrieve orders.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [client, contactId, hasOrders, notificationsService]);

  if (!hasOrders) {
    return null;
  }

  const handleForwardClick = (row: OrderDetailsDto) => {
    if (!row.id) return;
    navigate(`/orders/${getViewFormRoute(row.id)}`, { state: row });
  };

  const columns: GridColDef<OrderDetailsDto>[] = [
    {
      field: "orderNumber",
      headerName: "Order No",
      flex: 2,
    },
    {
      field: "refNo",
      headerName: "Ref No",
      flex: 2,
    },
    {
      field: "createdAt",
      headerName: "Created Date",
      flex: 2,
      type: "date",
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "total",
      headerName: "Amount",
      flex: 2,
      renderCell: ({ value, row }) =>
        value != null
          ? row.currency
            ? formatByCode(value, row.currency)
            : formatMoney(value)
          : "",
    },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 2,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      align: "right",
      headerAlign: "right",
      filterable: false,
      sortable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <ActionButtonContainer>
          <IconButton onClick={() => handleForwardClick(row)}>
            <ArrowRight size={20} />
          </IconButton>
        </ActionButtonContainer>
      ),
    },
  ];

  return (
    <Box sx={{ mt: 3 }}>
      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
            Orders
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Purchase history for this contact.
          </Typography>
          {isLoading ? (
            <Box
              sx={{
                py: 6,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={32} />
            </Box>
          ) : orders && orders.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", height: 420 }}>
              <DataGrid
                columns={columns}
                rows={orders}
                checkboxSelection={false}
                pagination={undefined}
                hideFooter={true}
                sx={{ flex: 1 }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                py: 6,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <ShoppingCart size={40} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                No orders found for this contact.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
