import { ReactNode, useEffect, useState } from "react";
import { Box, Card, CardContent, Chip, Divider, Grid, Typography, useTheme } from "@mui/material";
import {
  Briefcase,
  Building,
  DollarSign,
  ExternalLink,
  Globe,
  Hash,
  MapPin,
  Share2,
  ShoppingCart,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useRequestContext } from "@providers/request-provider";
import { getContinentByCode, getCountryByCode, getFormattedDateTime } from "utils/general-helper";
import { AccountViewOutletContext } from "../types";
import { AccountUrlHref } from "@features/accounts/index.styled";
import { useCurrencyFormatter } from "@hooks";

type DetailRow = {
  label: string;
  value: ReactNode;
};

type SectionProps = {
  title: ReactNode;
  icon?: ReactNode;
  rows: DetailRow[];
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

const toAbsoluteLink = (url: string | null | undefined) => {
  if (!url || !url.trim()) return "";
  const absoluteUrl =
    url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  return (
    <AccountUrlHref href={absoluteUrl} target="_blank" rel="noopener noreferrer">
      {absoluteUrl}
    </AccountUrlHref>
  );
};

const fieldLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

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

const SectionCard = ({ title, icon, rows }: SectionProps) => {
  if (rows.length === 0) return null;

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2.5,
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
    </Card>
  );
};

export const AccountView = () => {
  const { account, accountId, isLoading } = useOutletContext<AccountViewOutletContext>();
  const context = useRequestContext();
  const [countryName, setCountryName] = useState("");
  const [continentName, setContinentName] = useState("");

  const { formatMoney } = useCurrencyFormatter();

  useEffect(() => {
    const loadLocationNames = async () => {
      if (!account) {
        setCountryName("");
        setContinentName("");
        return;
      }

      const [country, continent] = await Promise.all([
        account.countryCode
          ? getCountryByCode(context, account.countryCode)
          : Promise.resolve(null),
        account.continentCode
          ? getContinentByCode(context, account.continentCode)
          : Promise.resolve(null),
      ]);

      setCountryName(country || "");
      setContinentName(continent || "");
    };

    loadLocationNames();
  }, [account, context]);

  if (!account && isLoading) {
    return (
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Loading account details...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!account) {
    return (
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Account details are not available.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const location = [account.cityName, account.state, countryName]
    .filter((part): part is string => !!part && part.trim().length > 0)
    .join(", ");

  const aboutRows = compactRows([
    { label: "Name", value: account.name || "" },
    {
      label: "Site URL",
      value: toAbsoluteLink(account.siteUrl),
    },
    { label: "TIN", value: account.tin || "" },
    {
      label: "Employees",
      value: account.employeesRange || "",
    },
    {
      label: "Revenue",
      value: account.revenue != null ? formatMoney(account.revenue) : "",
    },
    {
      label: "Profit",
      value: account.profit != null ? formatMoney(account.profit) : "",
    },
    { label: "Source", value: account.source || "" },
  ]);

  const addressRows = compactRows([
    {
      label: "Address",
      value: account.address || "",
    },
    { label: "City", value: account.cityName || "" },
    {
      label: "State / Province",
      value: account.state || "",
    },
    { label: "Country", value: countryName },
    {
      label: "Country code",
      value: account.countryCode || "",
    },
    { label: "Continent", value: continentName },
    {
      label: "Continent code",
      value: account.continentCode || "",
    },
  ]);

  const tagsRow = compactRows([
    {
      label: "Tags",
      value: account.tags?.length ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
            justifyContent: "flex-end",
          }}
        >
          {account.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
      ) : (
        ""
      ),
    },
  ]);

  const otherRows = compactRows([
    ...tagsRow,
    {
      label: "Contacts",
      value: account.contactCount != null ? String(account.contactCount) : "",
    },
    {
      label: "Domains",
      value: account.domainsCount != null ? String(account.domainsCount) : "",
    },
  ]);

  const socialRows = compactRows(
    Object.entries(account.socialMedia || {}).map(([key, value]) => ({
      label: fieldLabel(key),
      value: toAbsoluteLink(value),
    }))
  );

  const quickStatRows = compactRows([
    {
      label: "Last order date",
      value: account.lastOrderDate ? getFormattedDateTime(account.lastOrderDate) : "",
    },
    {
      label: "Member since",
      value: account.createdAt ? getFormattedDateTime(account.createdAt) : "",
    },
    {
      label: "Updated at",
      value: account.updatedAt ? getFormattedDateTime(account.updatedAt) : "",
    },
  ]);

  const revenueDisplay =
    account.totalRevenue != null ? formatMoney(account.totalRevenue) : formatMoney(0);

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2.5 }}>
                    Account Information
                  </Typography>
                  <Grid container spacing={3}>
                    {compactRows([
                      {
                        label: "Name",
                        value: account.name || "",
                      },
                      {
                        label: "Website",
                        value: account.siteUrl ? toAbsoluteLink(account.siteUrl) : "",
                      },
                      {
                        label: "Location",
                        value: location,
                      },
                      {
                        label: "Employees",
                        value: account.employeesRange || "",
                      },
                      {
                        label: "TIN",
                        value: account.tin || "",
                      },
                      {
                        label: "Source",
                        value: account.source || "",
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
                            {item.label === "Name" && <Building size={18} />}
                            {item.label === "Website" && <Globe size={18} />}
                            {item.label === "Location" && <MapPin size={18} />}
                            {item.label === "Employees" && <Users size={18} />}
                            {item.label === "TIN" && <Hash size={18} />}
                            {item.label === "Source" && <Tag size={18} />}
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
                <SectionCard title="About" icon={<Building size={18} />} rows={aboutRows} />
                <SectionCard title="Address" icon={<MapPin size={18} />} rows={addressRows} />
                {otherRows.length > 0 && (
                  <SectionCard title="Other" icon={<Tag size={18} />} rows={otherRows} />
                )}
                {socialRows.length > 0 && (
                  <SectionCard title="Social Media" icon={<Share2 size={18} />} rows={socialRows} />
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
                    <StatCard
                      label="Revenue"
                      value={revenueDisplay}
                      icon={<TrendingUp size={18} />}
                    />
                    <StatCard
                      label="Orders"
                      value={account.ordersCount ?? 0}
                      icon={<ShoppingCart size={18} />}
                    />
                    <StatCard
                      label="Contacts"
                      value={account.contactCount ?? 0}
                      icon={<Users size={18} />}
                    />
                    <StatCard
                      label="Domains"
                      value={account.domainsCount ?? 0}
                      icon={<Globe size={18} />}
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
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{
                            textAlign: "right",
                          }}
                        >
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
