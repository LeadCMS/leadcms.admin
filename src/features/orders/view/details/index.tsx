import { ReactNode, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import {
  Banknote,
  Building,
  DollarSign,
  ExternalLink,
  Hash,
  Package,
  ShoppingCart,
  Tag,
  TrendingUp,
  User,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CoreModule, getViewFormRoute } from "@lib/router";
import { useRequestContext } from "@providers/request-provider";
import { getCountryByCode, getFormattedDateTime } from "utils/general-helper";
import { OrderViewOutletContext } from "../types";
import { useCurrencyFormatter } from "@hooks";

type DetailRow = {
  label: string;
  value: ReactNode;
};

type SectionProps = {
  title: ReactNode;
  icon?: ReactNode;
  rows: DetailRow[];
  linkTo?: string;
};

type StatItemProps = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
};

const hasRenderableValue = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const compactRows = (rows: Array<DetailRow | null | undefined>) =>
  rows.filter((row): row is DetailRow => !!row && hasRenderableValue(row.value));

const StatCard = ({ label, value, icon }: StatItemProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 1,
        bgcolor: theme.palette.mode === "dark" ? "action.hover" : "grey.50",
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: 1.5,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            bgcolor: "primary.main",
            opacity: 0.12,
          }}
        />
        <Box
          sx={{
            color: "primary.main",
            display: "flex",
            position: "relative",
          }}
        >
          {icon}
        </Box>
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

const SectionCard = ({ title, icon, rows, linkTo }: SectionProps) => {
  const navigate = useNavigate();
  if (rows.length === 0) return null;

  const content = (
    <CardContent sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {icon && (
            <Box
              sx={{
                color: "text.secondary",
                display: "flex",
              }}
            >
              {icon}
            </Box>
          )}
          {typeof title === "string" ? (
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
          ) : (
            title
          )}
        </Box>
        {linkTo && (
          <Box sx={{ color: "text.secondary", display: "flex" }}>
            <ExternalLink size={16} />
          </Box>
        )}
      </Box>
      <Box sx={{ display: "grid", rowGap: 1.5 }}>
        {rows.map((row) => (
          <Box
            key={`${title}-${row.label}`}
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" color="text.secondary" component="div">
              {row.label}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={500}
              component="div"
              sx={{
                textAlign: "right",
                wordBreak: "break-word",
              }}
            >
              {row.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </CardContent>
  );

  return (
    <Card variant="outlined">
      {linkTo ? (
        <CardActionArea
          component="div"
          role="link"
          tabIndex={0}
          onClick={() => navigate(linkTo)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              navigate(linkTo);
            }
          }}
        >
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
};

export const OrderView = () => {
  const { order, orderId, contact, orderItems, isLoading } =
    useOutletContext<OrderViewOutletContext>();
  const context = useRequestContext();
  const [contactCountry, setContactCountry] = useState("");

  const { formatMoney, formatByCode } = useCurrencyFormatter();

  const fmtMoney = (val: number | null | undefined) => {
    if (val === null || val === undefined) {
      return formatMoney(0);
    }
    return order?.currency ? formatByCode(val, order.currency) : formatMoney(val);
  };

  useEffect(() => {
    const loadCountry = async () => {
      if (!contact?.countryCode) {
        setContactCountry("");
        return;
      }
      const country = await getCountryByCode(context, contact.countryCode);
      setContactCountry(country || "");
    };
    loadCountry();
  }, [contact, context]);

  if (!order && isLoading) {
    return (
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Loading order details...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Order details are not available.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const contactLocation = contact
    ? [contact.cityName, contact.state, contactCountry]
        .filter((p): p is string => !!p && p.trim().length > 0)
        .join(", ")
    : "";

  const contactRoute = contact?.id ? `/${CoreModule.contacts}/${getViewFormRoute(contact.id)}` : "";

  const customerRows = compactRows(
    contact
      ? [
          {
            label: "Name",
            value: contact.fullName || "",
          },
          {
            label: "Email",
            value: contact.email || "",
          },
          {
            label: "Phone",
            value: contact.phone || "",
          },
          {
            label: "Company",
            value: contact.companyName || "",
          },
          {
            label: "Location",
            value: contactLocation,
          },
          {
            label: "Address",
            value: contact.address1 || "",
          },
        ]
      : []
  );

  const orderDetailRows = compactRows([
    {
      label: "Order number",
      value: order.orderNumber || "",
    },
    {
      label: "Reference no",
      value: order.refNo || "",
    },
    {
      label: "Currency",
      value: order.currency || "",
    },
    {
      label: "Exchange rate",
      value: order.exchangeRate != null ? String(order.exchangeRate) : "",
    },
    {
      label: "Affiliate",
      value: order.affiliateName || "",
    },
    {
      label: "Source",
      value: order.source || "",
    },
    {
      label: "Test order",
      value: order.testOrder ? (
        <Chip label="Yes" size="small" color="warning" variant="outlined" />
      ) : (
        ""
      ),
    },
    {
      label: "Tags",
      value: order.tags?.join(", ") || "",
    },
  ]);

  const quickStatRows = compactRows([
    {
      label: "Order date",
      value: order.createdAt ? getFormattedDateTime(order.createdAt) : "",
    },
    {
      label: "Last updated",
      value: order.updatedAt ? getFormattedDateTime(order.updatedAt) : "",
    },
  ]);

  const totalRevenue = fmtMoney(order.total);
  const totalItems = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2.5 }}>
                    Order Information
                  </Typography>
                  <Grid container spacing={3}>
                    {compactRows([
                      {
                        label: "Order No",
                        value: order.orderNumber || "",
                      },
                      {
                        label: "Reference",
                        value: order.refNo || "",
                      },
                      {
                        label: "Currency",
                        value: order.currency || "",
                      },
                      {
                        label: "Status",
                        value: order.status || "",
                      },
                      {
                        label: "Source",
                        value: order.source || "",
                      },
                      {
                        label: "Affiliate",
                        value: order.affiliateName || "",
                      },
                    ]).map((item) => (
                      <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              color: "text.secondary",
                              mt: 0.5,
                              flexShrink: 0,
                            }}
                          >
                            {item.label === "Order No" && <Hash size={18} />}
                            {item.label === "Reference" && <Tag size={18} />}
                            {item.label === "Currency" && <DollarSign size={18} />}
                            {item.label === "Status" && <Package size={18} />}
                            {item.label === "Source" && <Building size={18} />}
                            {item.label === "Affiliate" && <User size={18} />}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              sx={{
                                wordBreak: "break-word",
                              }}
                            >
                              {item.value}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 3,
                  alignItems: "start",
                  gridAutoFlow: "row dense",
                }}
              >
                <SectionCard
                  title="Order Details"
                  icon={<ShoppingCart size={18} />}
                  rows={orderDetailRows}
                />
                {customerRows.length > 0 && (
                  <SectionCard
                    title="Customer"
                    icon={<User size={18} />}
                    rows={customerRows}
                    linkTo={contactRoute || undefined}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    Quick Stats
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 1.5,
                      mb: 2.5,
                    }}
                  >
                    <StatCard label="Total" value={totalRevenue} icon={<TrendingUp size={18} />} />
                    <StatCard
                      label="Items"
                      value={orderItems.length}
                      icon={<ShoppingCart size={18} />}
                    />
                    <StatCard label="Quantity" value={totalItems} icon={<Package size={18} />} />
                    <StatCard
                      label="Commission"
                      value={fmtMoney(order.commission)}
                      icon={<Banknote size={18} />}
                    />
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box
                    sx={{
                      display: "grid",
                      rowGap: 1.25,
                    }}
                  >
                    {quickStatRows.map((row) => (
                      <Box
                        key={`quick-${row.label}`}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {row.label}
                        </Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ textAlign: "right" }}>
                          {row.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
