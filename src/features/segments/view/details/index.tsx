import { ReactNode, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Edit, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ModuleWrapper } from "@components/module-wrapper";
import { SegmentsBreadcrumbLinks } from "../../constants";
import { getFieldDisplayName, getOperatorDisplayName } from "../../types";
import { useRequestContext } from "providers/request-provider";
import {
  ContactDetailsDto,
  SegmentDetailsDto as ApiSegmentDetailsDto,
  SegmentRule,
} from "lib/network/swagger-client";
import { CoreModule, getEditFormRoute } from "@lib/router";
import { getFormattedDateOnly } from "utils/general-helper";

type DetailRow = { label: string; value: ReactNode };

const SectionCard = ({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: ReactNode;
  rows: DetailRow[];
}) => {
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
          <Box sx={{ color: "text.secondary", display: "flex" }}>{icon}</Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: "grid", rowGap: 1.5 }}>
          {rows.map((row) => (
            <Box
              key={row.label}
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
                sx={{ textAlign: "right", wordBreak: "break-word" }}
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

const compactRows = (rows: DetailRow[]) =>
  rows.filter((r) => {
    if (r.value === null || r.value === undefined) return false;
    if (typeof r.value === "string") return r.value.trim().length > 0;
    if (typeof r.value === "number") return true;
    return true;
  });

export const SegmentView = () => {
  const { id } = useParams<{ id: string }>();
  const { client } = useRequestContext();
  const navigate = useNavigate();

  const [segment, setSegment] = useState<ApiSegmentDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<ContactDetailsDto[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const loadSegment = async () => {
      if (!id) return;
      try {
        const result = await client.api.segmentsDetail(Number(id));
        setSegment(result.data);
      } catch (error) {
        console.error("Failed to load segment:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSegment();
  }, [id, client]);

  useEffect(() => {
    if (tabValue !== 1 || !segment) return;
    const loadContacts = async () => {
      setLoadingContacts(true);
      try {
        const limit =
          segment.contactCount && segment.contactCount > 0 ? segment.contactCount : undefined;
        const listParams = limit ? { limit } : undefined;
        const result = await client.api.segmentsContactsList(segment.id!, listParams);
        setContacts(result.data || []);
      } catch (error) {
        console.error("Failed to load segment contacts:", error);
        setContacts([]);
      } finally {
        setLoadingContacts(false);
      }
    };
    loadContacts();
  }, [tabValue, segment, client]);

  if (loading) {
    return (
      <ModuleWrapper breadcrumbs={SegmentsBreadcrumbLinks} currentBreadcrumb="Segment Details">
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      </ModuleWrapper>
    );
  }

  if (!segment) {
    return (
      <ModuleWrapper breadcrumbs={SegmentsBreadcrumbLinks} currentBreadcrumb="Segment Details">
        <Alert severity="error">Segment not found</Alert>
      </ModuleWrapper>
    );
  }

  const formatRuleText = (rule: SegmentRule) => {
    const fieldLabel = getFieldDisplayName(rule.fieldId);
    const operatorLabel = getOperatorDisplayName(rule.operator);
    const valueLabel =
      rule.value === null || rule.value === undefined || rule.value === ""
        ? ""
        : ` ${String(rule.value)}`;
    return `${fieldLabel} ${operatorLabel}${valueLabel}`;
  };

  const normalizedType = String(segment.type || "").toLowerCase();
  const includeRules = segment.definition?.includeRules?.rules ?? [];
  const excludeRules = segment.definition?.excludeRules?.rules ?? [];
  const typeLabel = normalizedType === "dynamic" ? "Dynamic" : "Static";
  const contactCount = segment.contactCount ?? 0;

  const subtitleParts = [
    segment.description,
    segment.createdAt && `Created: ${getFormattedDateOnly(segment.createdAt)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const segmentInfoRows = compactRows([
    { label: "Name", value: segment.name || "" },
    { label: "Description", value: segment.description || "" },
    { label: "Contacts", value: contactCount },
    {
      label: "Created",
      value: segment.createdAt ? getFormattedDateOnly(segment.createdAt) : "",
    },
    {
      label: "Updated",
      value: segment.updatedAt ? getFormattedDateOnly(segment.updatedAt) : "",
    },
  ]);

  const definitionRows: DetailRow[] =
    normalizedType === "dynamic"
      ? compactRows([
          {
            label: "Include Rules",
            value:
              includeRules.length > 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  {includeRules.map((rule) => (
                    <Typography key={rule.id} variant="body2">
                      {formatRuleText(rule)}
                    </Typography>
                  ))}
                </Box>
              ) : (
                "No rules defined"
              ),
          },
          {
            label: "Exclude Rules",
            value:
              excludeRules.length > 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  {excludeRules.map((rule) => (
                    <Typography key={rule.id} variant="body2">
                      {formatRuleText(rule)}
                    </Typography>
                  ))}
                </Box>
              ) : (
                ""
              ),
          },
        ])
      : [
          { label: "Type", value: "Static segment" },
          {
            label: "Contacts",
            value: segment.contactIds?.length ?? segment.contactCount ?? 0,
          },
        ];

  const hasContacts = contactCount > 0 || (segment.contactIds?.length ?? 0) > 0;
  const emptyContactsMessage =
    normalizedType === "dynamic"
      ? hasContacts
        ? "Contact preview is not available yet."
        : "This segment has no contacts yet."
      : hasContacts
      ? "Contacts will appear here once loaded."
      : "This segment has no contacts yet.";

  return (
    <ModuleWrapper breadcrumbs={SegmentsBreadcrumbLinks} currentBreadcrumb={segment.name}>
      {/* Header Card */}
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
              bgcolor: "primary.main",
            }}
          >
            <Users size={32} />
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
                {segment.name}
              </Typography>
              <Chip label={typeLabel} color="default" size="small" variant="outlined" />
            </Box>
            {subtitleParts ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitleParts}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                No additional details
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Edit size={16} />}
              onClick={() => navigate(`/${CoreModule.segments}/${getEditFormRoute(segment.id!)}`)}
            >
              Edit
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_e, v) => setTabValue(v)}>
        <Tab value={0} label="Overview" />
        <Tab
          value={1}
          label={
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <span>Contacts</span>
              {contactCount > 0 && (
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
                  {contactCount.toLocaleString()}
                </Box>
              )}
            </Box>
          }
        />
      </Tabs>
      <Divider />

      {/* Overview Tab */}
      {tabValue === 0 && (
        <Box sx={{ py: 3 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SectionCard title="Segment Info" icon={<Users size={18} />} rows={segmentInfoRows} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SectionCard title="Definition" icon={<Users size={18} />} rows={definitionRows} />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Contacts Tab */}
      {tabValue === 1 && (
        <Box sx={{ py: 3 }}>
          {loadingContacts ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 4,
              }}
            >
              <CircularProgress />
            </Box>
          ) : contacts.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
              {emptyContactsMessage}
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contact</TableCell>
                  <TableCell>Email</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      {contact.firstName || contact.lastName
                        ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
                        : "Unnamed Contact"}
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      )}
    </ModuleWrapper>
  );
};
