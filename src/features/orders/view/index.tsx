import { SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Edit, ShoppingCart, User } from "lucide-react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ContactDetailsDto,
  OrderDetailsDto,
  OrderItemDetailsDto,
} from "@lib/network/swagger-client";
import { orderFormBreadcrumbLinks } from "../constants";
import { ModuleWrapper } from "@components/module-wrapper";
import { CoreModule, getEditFormRoute } from "@lib/router";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService, useCurrencyFormatter } from "@hooks";
import { showApiError } from "@utils/api-error-parser";
import { getWhereFilterQuery } from "@providers/query-provider";
import { OrderViewOutletContext } from "./types";

type OrderTabValue = "overview" | "items";

const orderDetailsCache = new Map<number, OrderDetailsDto>();

const tabPathMap: Record<OrderTabValue, string> = {
  overview: "details",
  items: "items",
};

const getTabFromPathname = (pathname: string): OrderTabValue => {
  if (pathname.endsWith("/items")) return "items";
  return "overview";
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "warning";
    case "paid":
      return "success";
    case "cancelled":
      return "error";
    case "refunded":
      return "info";
    case "failed":
      return "error";
    default:
      return "default";
  }
};

export const OrderViewBase = () => {
  const { state, pathname } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const { formatMoney, formatByCode } = useCurrencyFormatter();

  const [order, setOrder] = useState<OrderDetailsDto | null>(null);
  const [contact, setContact] = useState<ContactDetailsDto | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemDetailsDto[]>([]);
  const [tabValue, setTabValue] = useState<OrderTabValue>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const didFetchRef = useRef(false);

  const orderIdFromPath = id ? Number(id) : undefined;
  const orderId = useMemo(() => {
    if (Number.isFinite(orderIdFromPath)) {
      return orderIdFromPath as number;
    }
    return undefined;
  }, [orderIdFromPath]);

  const orderLabel = order ? `Order #${order.orderNumber || order.id}` : "View Order";

  useEffect(() => {
    setTabValue(getTabFromPathname(pathname));
  }, [pathname]);

  const fetchOrderItems = async (oid: number) => {
    try {
      const { data } = await client.api.orderItemsList({
        query: getWhereFilterQuery("orderId", oid.toString(), "equals"),
      });
      setOrderItems(data || []);
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Could not retrieve order items.");
    }
  };

  const refreshOrderItems = async () => {
    if (order?.id) {
      await fetchOrderItems(order.id);
    }
  };

  useEffect(() => {
    if (!orderId) return;

    const cached = orderDetailsCache.get(orderId);
    if (cached) {
      setOrder(cached);
      return;
    }

    if (didFetchRef.current) return;
    didFetchRef.current = true;
    setIsLoading(true);

    (async () => {
      try {
        const { data } = await client.api.ordersDetail(orderId);
        orderDetailsCache.set(orderId, data);
        setOrder(data);
        await fetchOrderItems(data.id!);

        try {
          const currRes = await client.api.ordersCurrenciesList();
          setCurrencies(currRes.data || []);
        } catch {
          // currencies not critical
        }

        if (data.contactId) {
          try {
            const contactRes = await client.api.contactsDetail(data.contactId);
            setContact(contactRes.data);
          } catch {
            // contact may not be accessible
          }
        }
      } catch (error) {
        showApiError(error, notificationsService, undefined, "Could not retrieve order details.");
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, orderId]);

  const handleTabChange = (_event: SyntheticEvent, newValue: OrderTabValue) => {
    setTabValue(newValue);
    navigate(tabPathMap[newValue], { state: order ?? state });
  };

  const handleEdit = () => {
    if (!orderId) return;
    navigate(`/${CoreModule.orders}/${getEditFormRoute(orderId)}`, { state: order ?? undefined });
  };

  const contactName = contact
    ? contact.fullName ||
      [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
      contact.email ||
      ""
    : "";

  const outletContext: OrderViewOutletContext = {
    order,
    orderId,
    contact,
    orderItems,
    isLoading,
    refreshOrderItems,
    currencies,
  };

  return (
    <ModuleWrapper breadcrumbs={orderFormBreadcrumbLinks} currentBreadcrumb={orderLabel}>
      <Card variant="outlined" sx={{ mt: 4, mb: 3 }}>
        <CardContent
          sx={{
            p: 3,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            gap: 3,
          }}
        >
          <Avatar
            sx={{
              width: 72,
              height: 72,
              fontSize: "1.5rem",
              bgcolor: "primary.main",
            }}
          >
            <ShoppingCart size={32} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="h5" fontWeight={700}>
                {orderLabel}
              </Typography>
              {order?.status && (
                <Chip
                  label={order.status}
                  color={getStatusColor(order.status)}
                  size="small"
                  variant="filled"
                />
              )}
              {order?.testOrder && (
                <Chip label="Test Order" color="secondary" size="small" variant="outlined" />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {[
                contactName && `Customer: ${contactName}`,
                order?.total != null &&
                  `Total: ${
                    order.currency
                      ? formatByCode(order.total, order.currency)
                      : formatMoney(order.total)
                  }`,
              ]
                .filter(Boolean)
                .join(" · ") || "Loading order details..."}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {contactName && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<User size={16} />}
                onClick={() => {
                  if (contact?.id) {
                    navigate(`/${CoreModule.contacts}/${contact.id}/view`, { state: contact });
                  }
                }}
                disabled={!contact?.id}
              >
                View Contact
              </Button>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<Edit size={16} />}
              onClick={handleEdit}
              disabled={!orderId}
            >
              Edit
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab value="overview" label="Overview" />
        <Tab
          value="items"
          label={
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <span>Items</span>
              {orderItems.length > 0 && (
                <Box
                  sx={{
                    minWidth: 20,
                    px: 0.75,
                    borderRadius: 999,
                    bgcolor: "action.selected",
                    fontSize: "0.75rem",
                    lineHeight: 1.4,
                    fontWeight: 600,
                  }}
                >
                  {orderItems.length}
                </Box>
              )}
            </Box>
          }
        />
      </Tabs>
      <Divider />

      <Outlet context={outletContext} />
    </ModuleWrapper>
  );
};
