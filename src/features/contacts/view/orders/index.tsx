import { useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useNotificationsService } from "@hooks";
import { OrderDetailsDto } from "@lib/network/swagger-client";
import { getWhereFilterQuery } from "@providers/query-provider";
import { useRequestContext } from "@providers/request-provider";
import { getViewFormRoute } from "@lib/router";
import { ContactViewOutletContext } from "../types";

export const ContactOrders = () => {
  const { contactId } = useOutletContext<ContactViewOutletContext>();
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDetailsDto[]>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
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
        console.log(error);
        setOrders([]);
        notificationsService.error("Server error: could not retrieve orders.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [client, contactId, notificationsService]);

  const formatCurrency = useMemo(
    () => (amount?: number, currency?: string) => {
      if (amount === null || amount === undefined) return "-";
      const code = currency || "USD";
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: code,
        maximumFractionDigits: 2,
      }).format(amount);
    },
    []
  );

  const getStatusColor = (status?: OrderDetailsDto["status"]) => {
    switch (status) {
      case "Paid":
        return "success" as const;
      case "Pending":
        return "warning" as const;
      case "Cancelled":
      case "Failed":
        return "error" as const;
      case "Refunded":
        return "info" as const;
      default:
        return "default" as const;
    }
  };

  const handleOpenOrder = (row: OrderDetailsDto) => {
    if (!row.id) return;
    navigate(`/orders/${getViewFormRoute(row.id)}`, { state: row });
  };

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
            <Typography variant="body2" color="text.secondary">
              Loading orders...
            </Typography>
          ) : orders && orders.length > 0 ? (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              {orders.map((order) => (
                <Card
                  key={order.id}
                  variant="outlined"
                  sx={{
                    cursor: "pointer",
                    transition: "background-color 0.15s",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                  onClick={() => handleOpenOrder(order)}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        justifyContent: "space-between",
                        gap: 1.5,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                          {order.orderNumber || order.refNo || "Order"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.refNo ? `Ref: ${order.refNo}` : ""}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Chip
                          size="small"
                          color={getStatusColor(order.status)}
                          label={order.status || "Unknown"}
                        />
                        <ArrowRight size={18} />
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        mt: 1.5,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1.5,
                        color: "text.secondary",
                      }}
                    >
                      <Typography variant="caption">
                        {formatCurrency(order.total, order.currency)}
                      </Typography>
                      <Typography variant="caption">•</Typography>
                      <Typography variant="caption">Qty: {order.quantity ?? "-"}</Typography>
                      <Typography variant="caption">•</Typography>
                      <Typography variant="caption">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
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
