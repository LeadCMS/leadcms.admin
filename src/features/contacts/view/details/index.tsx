import { ReactNode, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Briefcase,
  Building,
  ExternalLink,
  Globe,
  Hash,
  Landmark,
  ListOrdered,
  Mail,
  MailX,
  MapPin,
  Phone,
  Share2,
  ShoppingCart,
  TrendingUp,
  User,
} from "lucide-react";
import { TagChipList } from "@components/tag-chip-list";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ContactHref } from "@features/contacts/index.styled";
import { CoreModule, getViewFormRoute } from "@lib/router";
import { useConfig } from "@providers/config-provider";
import { useCurrencyFormatter } from "@hooks";
import { useRequestContext } from "@providers/request-provider";
import { ENTITY_KEYS, hasEntity } from "@utils/entity-availability";

import {
  getContinentByCode,
  getCountryByCode,
  getFormattedDateOnly,
  getFormattedDateTime,
} from "utils/general-helper";
import { timezones } from "utils/constants";
import { formatTimezoneShort } from "utils/timezone-helpers";
import { ContactViewOutletContext } from "../types";

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

const compactStatCards = (rows: Array<StatItemProps | null | undefined>) =>
  rows.filter((row): row is StatItemProps => !!row && hasRenderableValue(row.value));

const toAbsoluteLink = (url: string | null | undefined) => {
  if (!url || !url.trim()) return "";
  const absoluteUrl =
    url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  return (
    <ContactHref href={absoluteUrl} target="_blank" rel="noopener noreferrer">
      {absoluteUrl}
    </ContactHref>
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

export const ContactView = () => {
  const { contact, contactId, isLoading } = useOutletContext<ContactViewOutletContext>();
  const context = useRequestContext();
  const { config } = useConfig();
  const languages = config?.languages || [];
  const hasOrders = hasEntity(config?.entities, ENTITY_KEYS.order);
  const hasDeals = hasEntity(config?.entities, ENTITY_KEYS.deal);
  const hasSequences = hasEntity(config?.entities, ENTITY_KEYS.sequence);
  const [countryName, setCountryName] = useState<string>("");
  const [continentName, setContinentName] = useState<string>("");
  const enrollments = contact?.enrollments ?? [];

  const { formatMoney } = useCurrencyFormatter();

  useEffect(() => {
    const loadLocationNames = async () => {
      if (!contact) {
        setCountryName("");
        setContinentName("");
        return;
      }

      const [country, continent] = await Promise.all([
        contact.countryCode
          ? getCountryByCode(context, contact.countryCode)
          : Promise.resolve(null),
        contact.continentCode
          ? getContinentByCode(context, contact.continentCode)
          : Promise.resolve(null),
      ]);

      setCountryName(country || "");
      setContinentName(continent || "");
    };

    loadLocationNames();
  }, [contact, context]);

  if (!contact && isLoading) {
    return (
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Loading contact details...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!contact) {
    return (
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Contact details are not available.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const timezoneLabel =
    timezones.find((timezone) => timezone.value === contact.timezone)?.label ||
    (contact.timezone !== null && contact.timezone !== undefined
      ? formatTimezoneShort(contact.timezone)
      : "");

  const emailHref = contact.email ? (
    <ContactHref href={`mailto:${contact.email}`}>{contact.email}</ContactHref>
  ) : (
    ""
  );
  const phoneHref = contact.phone ? (
    <ContactHref href={`tel:${contact.phone}`}>{contact.phone}</ContactHref>
  ) : (
    ""
  );

  const location = [contact.cityName, contact.state, countryName]
    .filter((part): part is string => !!part && part.trim().length > 0)
    .join(", ");

  const companyOrAccount = contact.account?.name || contact.companyName || "";

  const personalRows = compactRows([
    { label: "Full name", value: contact.fullName || "" },
    { label: "Prefix", value: contact.prefix || "" },
    { label: "First name", value: contact.firstName || "" },
    { label: "Middle name", value: contact.middleName || "" },
    { label: "Last name", value: contact.lastName || "" },
    {
      label: "Birthday",
      value: contact.birthday ? getFormattedDateOnly(contact.birthday) : "",
    },
    {
      label: "Language",
      value:
        languages.find((language) => language.code === contact.language)?.name ||
        contact.language ||
        "",
    },
    { label: "Timezone", value: timezoneLabel },
    { label: "Source", value: contact.source || "" },
  ]);

  const addressRows = compactRows([
    { label: "Address line 1", value: contact.address1 || "" },
    { label: "Address line 2", value: contact.address2 || "" },
    { label: "City", value: contact.cityName || "" },
    { label: "State / Province", value: contact.state || "" },
    { label: "ZIP / Postal code", value: contact.zip || "" },
    { label: "Country", value: countryName },
    { label: "Country code", value: contact.countryCode || "" },
    { label: "Continent", value: continentName },
    { label: "Continent code", value: contact.continentCode || "" },
  ]);

  const accountRows = compactRows(
    contact.account
      ? [
          { label: "Name", value: contact.account.name },
          {
            label: "Site",
            value: toAbsoluteLink(contact.account.siteUrl),
          },
          { label: "City", value: contact.account.cityName || "" },
          { label: "Country", value: contact.account.countryCode || "" },
          { label: "Address", value: contact.account.address || "" },
          {
            label: "Employees",
            value: contact.account.employeesRange || "",
          },
          {
            label: "Revenue",
            value: contact.account.revenue != null ? formatMoney(contact.account.revenue, 0) : "",
          },
          { label: "TIN", value: contact.account.tin || "" },
          contact.account.tags?.length
            ? {
                label: "Tags",
                value: (
                  <TagChipList
                    tags={contact.account.tags}
                    containerSx={{ justifyContent: "flex-end" }}
                  />
                ),
              }
            : null,
          { label: "Contacts", value: contact.account.contactCount ?? "" },
          { label: "Domains", value: contact.account.domainsCount ?? "" },
        ]
      : []
  );

  const domainStatusChip = contact.domain
    ? (() => {
        if (contact.domain.disposable) {
          return <Chip size="small" color="error" label="Disposable" />;
        }

        if (contact.domain.free) {
          return <Chip size="small" color="info" label="Free" variant="outlined" />;
        }

        return <Chip size="small" color="success" label="Corporate" variant="outlined" />;
      })()
    : null;

  const domainRows = compactRows(
    contact.domain
      ? [
          {
            label: "Name",
            value: contact.domain.name || contact.domain.url || "-",
          },
          {
            label: "Type",
            value: domainStatusChip,
          },
          {
            label: "Title",
            value: contact.domain.title || "",
          },
          {
            label: "Description",
            value: contact.domain.description || "",
          },
          {
            label: "URL",
            value: toAbsoluteLink(contact.domain.url),
          },
          {
            label: "Favicon URL",
            value: toAbsoluteLink(contact.domain.faviconUrl),
          },
          contact.domain.tags?.length
            ? {
                label: "Tags",
                value: (
                  <TagChipList
                    tags={contact.domain.tags}
                    containerSx={{ justifyContent: "flex-end" }}
                  />
                ),
              }
            : null,
        ]
      : []
  );

  const accountRoute = contact.account?.id
    ? `/${CoreModule.accounts}/${getViewFormRoute(contact.account.id)}`
    : "";
  const domainRoute = contact.domain?.id
    ? `/${CoreModule.domains}/${getViewFormRoute(contact.domain.id)}`
    : "";
  const getEnrollmentRoute = (sequenceId?: number | null, enrollmentId?: number | null) =>
    sequenceId && enrollmentId
      ? `/${CoreModule.sequences}/${sequenceId}/view/enrollments/${enrollmentId}`
      : "";

  const socialRows = compactRows(
    Object.entries(contact.socialMedia || {}).map(([key, value]) => ({
      label: fieldLabel(key),
      value: toAbsoluteLink(value),
    }))
  );

  const attributionRows = compactRows([
    contact.tags?.length
      ? {
          label: "Tags",
          value: <TagChipList tags={contact.tags} containerSx={{ justifyContent: "flex-end" }} />,
        }
      : null,
    contact.utms?.source
      ? {
          label: "UTM Source",
          value: contact.utms.source,
        }
      : null,
    contact.utms?.medium
      ? {
          label: "UTM Medium",
          value: contact.utms.medium,
        }
      : null,
    contact.utms?.campaign
      ? {
          label: "UTM Campaign",
          value: contact.utms.campaign,
        }
      : null,
    contact.utms?.content
      ? {
          label: "UTM Content",
          value: contact.utms.content,
        }
      : null,
    contact.utms?.term
      ? {
          label: "UTM Term",
          value: contact.utms.term,
        }
      : null,
    contact.utms?.id
      ? {
          label: "UTM ID",
          value: contact.utms.id,
        }
      : null,
  ]);

  const visitorDetailsRows = compactRows([
    contact.ipAddress
      ? {
          label: "IP address",
          value: contact.ipAddress,
        }
      : null,
    contact.userDeviceSummary
      ? {
          label: "User device",
          value: contact.userDeviceSummary,
        }
      : null,
  ]);

  const unsubscribeRows = compactRows(
    contact.unsubscribe
      ? [
          {
            label: "Date",
            value: contact.unsubscribe.createdAt
              ? getFormattedDateTime(contact.unsubscribe.createdAt)
              : "",
          },
          {
            label: "Reason",
            value: contact.unsubscribe.reason || "",
          },
          {
            label: "Source",
            value: contact.unsubscribe.source || "",
          },
        ]
      : []
  );

  const quickStatRows = compactRows([
    hasOrders
      ? {
          label: "Last order date",
          value: contact.lastOrderDate ? getFormattedDateTime(contact.lastOrderDate) : "",
        }
      : null,
    {
      label: "Member since",
      value: contact.createdAt ? getFormattedDateTime(contact.createdAt) : "",
    },
    {
      label: "Updated at",
      value: contact.updatedAt ? getFormattedDateTime(contact.updatedAt) : "",
    },
  ]);

  const statCards = compactStatCards([
    hasOrders
      ? {
          label: "Revenue",
          value:
            contact.totalRevenue !== null && contact.totalRevenue !== undefined
              ? formatMoney(contact.totalRevenue)
              : formatMoney(0),
          icon: <TrendingUp size={18} />,
        }
      : null,
    hasOrders
      ? {
          label: "Orders",
          value: contact.ordersCount ?? 0,
          icon: <ShoppingCart size={18} />,
        }
      : null,
    hasDeals
      ? {
          label: "Deals",
          value: contact.dealsCount ?? 0,
          icon: <Briefcase size={18} />,
        }
      : null,
  ]);

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2.5 }}>
                    Contact Information
                  </Typography>
                  <Grid container spacing={3}>
                    {compactRows([
                      {
                        label: "Email",
                        value: emailHref,
                      },
                      {
                        label: "Phone",
                        value: phoneHref,
                      },
                      {
                        label: "Company",
                        value: companyOrAccount,
                      },
                      {
                        label: "Location",
                        value: location,
                      },
                      {
                        label: "Job title",
                        value: contact.jobTitle || "",
                      },
                      {
                        label: "Department",
                        value: contact.department || "",
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
                            {item.label === "Email" && <Mail size={18} />}
                            {item.label === "Phone" && <Phone size={18} />}
                            {item.label === "Company" && <Building size={18} />}
                            {item.label === "Location" && <MapPin size={18} />}
                            {item.label === "Job title" && <Briefcase size={18} />}
                            {item.label === "Department" && <Building size={18} />}
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
                              sx={{ wordBreak: "break-word" }}
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
                  title="Personal Information"
                  icon={<User size={18} />}
                  rows={personalRows}
                />
                <SectionCard title="Address" icon={<MapPin size={18} />} rows={addressRows} />
                {accountRows.length > 0 && (
                  <SectionCard
                    title="Account Details"
                    icon={<Landmark size={18} />}
                    rows={accountRows}
                    linkTo={accountRoute || undefined}
                  />
                )}
                {domainRows.length > 0 && (
                  <SectionCard
                    title="Domain Details"
                    icon={<Globe size={18} />}
                    rows={domainRows}
                    linkTo={domainRoute || undefined}
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
                    {statCards.map((card) => (
                      <StatCard
                        key={card.label}
                        label={card.label}
                        value={card.value}
                        icon={card.icon}
                      />
                    ))}
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: "grid", rowGap: 1.25 }}>
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

            {hasSequences && enrollments.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          color: "text.secondary",
                          display: "flex",
                        }}
                      >
                        <ListOrdered size={18} />
                      </Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Sequence Enrollments
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "grid",
                        rowGap: 1.5,
                      }}
                    >
                      {enrollments.map((enrollment) => (
                        <Box
                          key={enrollment.id}
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              component="a"
                              href={getEnrollmentRoute(enrollment.sequenceId, enrollment.id)}
                              sx={{
                                color: "primary.main",
                                textDecoration: "none",
                                "&:hover": {
                                  textDecoration: "underline",
                                },
                              }}
                            >
                              {`Sequence #${enrollment.sequenceId}`}
                            </Typography>
                            <Chip
                              size="small"
                              label={enrollment.status}
                              color={
                                enrollment.status === "Active"
                                  ? "success"
                                  : enrollment.status === "Completed"
                                  ? "info"
                                  : "default"
                              }
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Enrolled:{" "}
                            {enrollment.enteredAt
                              ? getFormattedDateTime(enrollment.enteredAt)
                              : "—"}
                          </Typography>
                          {enrollment.exitReason && enrollment.exitReason !== "None" && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                              }}
                            >
                              Exit reason: {enrollment.exitReason}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {socialRows.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <SectionCard title="Social Media" icon={<Share2 size={18} />} rows={socialRows} />
              </Grid>
            )}

            {unsubscribeRows.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <SectionCard
                  title="Unsubscribe Details"
                  icon={<MailX size={18} />}
                  rows={unsubscribeRows}
                />
              </Grid>
            )}

            {visitorDetailsRows.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <SectionCard
                  title="Visitor Details"
                  icon={<Globe size={18} />}
                  rows={visitorDetailsRows}
                />
              </Grid>
            )}

            {attributionRows.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <SectionCard
                  title="Tags & Attribution"
                  icon={<Hash size={18} />}
                  rows={attributionRows}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
