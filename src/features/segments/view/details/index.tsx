import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { ModuleWrapper } from "@components/module-wrapper";
import { SegmentsBreadcrumbLinks } from "../../constants";
import { getFieldById, getOperatorDisplayName } from "../../types";
import { useRequestContext } from "providers/request-provider";
import {
  ContactDetailsDto,
  SegmentDetailsDto as ApiSegmentDetailsDto,
  SegmentRule,
} from "lib/network/swagger-client";
import { CoreModule } from "@lib/router";
import { DataView } from "components/data-view";
import { DataManagementBlock } from "@components/data-management";
import { useParams } from "react-router-dom";
import { getFormattedDateOnly } from "utils/general-helper";

export const SegmentView = () => {
  const { id } = useParams<{ id: string }>();
  const { client } = useRequestContext();

  const [segment, setSegment] = useState<ApiSegmentDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<ContactDetailsDto[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Load segment data
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

  // Load contacts for the segment
  useEffect(() => {
    const loadContacts = async () => {
      if (!segment) return;

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
  }, [segment, client]);

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
    const field = getFieldById(rule.fieldId);
    const fieldLabel = field?.name || rule.fieldId;
    const operatorLabel = getOperatorDisplayName(rule.operator);
    const valueLabel =
      rule.value === null || rule.value === undefined || rule.value === ""
        ? ""
        : ` ${String(rule.value)}`;
    return `${fieldLabel} ${operatorLabel}${valueLabel}`;
  };

  const renderRules = (rules: SegmentRule[]) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      {rules.map((rule) => (
        <Typography key={rule.id} variant="body2">
          {formatRuleText(rule)}
        </Typography>
      ))}
    </Box>
  );

  const normalizedType = String(segment.type || "").toLowerCase();
  const includeRules = segment.definition?.includeRules?.rules ?? [];
  const excludeRules = segment.definition?.excludeRules?.rules ?? [];

  const typeLabel = normalizedType === "dynamic" ? "Dynamic" : "Static";
  const segmentInfoRows = [
    { label: "Name", value: segment.name || "" },
    { label: "Description", value: segment.description || "" },
    {
      label: "Type",
      value: <Chip size="small" label={typeLabel} variant="outlined" color="default" />,
    },
    { label: "Contacts", value: segment.contactCount ?? 0 },
    {
      label: "Created",
      value: segment.createdAt ? getFormattedDateOnly(segment.createdAt) : "",
    },
    {
      label: "Updated",
      value: segment.updatedAt ? getFormattedDateOnly(segment.updatedAt) : "Never",
    },
  ];

  const definitionRows =
    normalizedType === "dynamic"
      ? [
          {
            label: "Include rules",
            value: includeRules.length > 0 ? renderRules(includeRules) : "No rules defined",
          },
          {
            label: "Exclude rules",
            value: excludeRules.length > 0 ? renderRules(excludeRules) : "-",
          },
        ]
      : [
          { label: "Type", value: "Static segment" },
          { label: "Contacts", value: segment.contactIds?.length ?? segment.contactCount ?? 0 },
        ];

  const hasContacts = (segment.contactCount ?? 0) > 0 || (segment.contactIds?.length ?? 0) > 0;
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
      <Grid container spacing={3} marginTop={4} paddingRight={4}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Grid marginBottom={3}>
            <DataView header="Segment info" rows={segmentInfoRows} />
          </Grid>
          <Grid marginBottom={3}>
            <DataView header="Definition" rows={definitionRows} />
          </Grid>
          <Grid marginBottom={3}>
            <DataManagementBlock
              header="Data Management"
              description="Please be aware that what has been deleted can never be brought back."
              entity="segment"
              handleDeleteAsync={(idVal) => client.api.segmentsDelete(idVal as number)}
              itemId={segment.id!}
              successNavigationRoute={CoreModule.segments}
            ></DataManagementBlock>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <Grid marginBottom={3}>
            <Card>
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  Contacts
                </Typography>
                {loadingContacts ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : contacts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </ModuleWrapper>
  );
};
