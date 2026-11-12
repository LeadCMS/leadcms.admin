import { useState } from "react";
import { Box, Button, Card, CardContent, Chip, Divider, Typography } from "@mui/material";
import { Check, ShieldQuestion, X } from "lucide-react";
import { ContactDetailsDto, PendingContactUpdate } from "@lib/network/swagger-client";
import { useNotificationsService } from "@hooks";
import { useRequestContext } from "@providers/request-provider";
import { parseApiError, showApiError } from "@utils/api-error-parser";
import { getFormattedDateTime } from "utils/general-helper";

type PendingUpdatesProps = {
  contactId?: number;
  contact: ContactDetailsDto;
  pendingUpdates: PendingContactUpdate[];
  onDecided: () => Promise<void>;
};

type Decision = "accept" | "reject";

type PendingContactField =
  | "firstName"
  | "middleName"
  | "lastName"
  | "companyName"
  | "phone"
  | "phoneRaw"
  | "source";

// Pending update fields are PascalCase; the keys here are lower-cased for a lenient lookup.
const CONTACT_PROPERTIES: Record<string, PendingContactField> = {
  firstname: "firstName",
  middlename: "middleName",
  lastname: "lastName",
  companyname: "companyName",
  phone: "phone",
  phoneraw: "phoneRaw",
  source: "source",
};

// The value the contact holds now, or undefined when the field is not one the contact card knows.
const getCurrentValue = (contact: ContactDetailsDto, field?: string) => {
  const property = CONTACT_PROPERTIES[(field ?? "").toLowerCase()];
  return property ? contact[property] ?? "" : undefined;
};

const getFieldLabel = (field?: string) => (field ?? "").replace(/([a-z])([A-Z])/g, "$1 $2");

const getUpdateKey = (update: PendingContactUpdate) => `${update.field}|${update.createdAt}`;

const ValueText = ({ value }: { value?: string | null }) =>
  value ? (
    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
      {value}
    </Typography>
  ) : (
    <Typography variant="body2" color="text.secondary">
      Empty
    </Typography>
  );

const DetailText = ({ label, value }: { label: string; value?: string | null }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
      {value || "-"}
    </Typography>
  </Box>
);

export const PendingUpdates = ({
  contactId,
  contact,
  pendingUpdates,
  onDecided,
}: PendingUpdatesProps) => {
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const [isDeciding, setIsDeciding] = useState(false);

  const decide = async (update: PendingContactUpdate, decision: Decision) => {
    if (!contactId || !update.field || !update.createdAt) return;

    const label = getFieldLabel(update.field);
    const body = { field: update.field, createdAt: update.createdAt };

    setIsDeciding(true);
    try {
      if (decision === "accept") {
        await client.api.contactsPendingUpdatesAcceptCreate(contactId, body);
        notificationsService.success(`Change of ${label} accepted.`);
      } else {
        await client.api.contactsPendingUpdatesRejectCreate(contactId, body);
        notificationsService.success(`Change of ${label} rejected.`);
      }
      await onDecided();
    } catch (error) {
      const { status } = parseApiError(error);
      if (status === 409) {
        notificationsService.error(
          `The change of ${label} was replaced by a newer one. ` +
            "The contact has been reloaded, please review it again."
        );
      } else {
        showApiError(
          error,
          notificationsService,
          undefined,
          `Could not ${decision} the change of ${label}.`
        );
      }
      // The record may be gone or replaced, so show the current state.
      if (status === 404 || status === 409) {
        await onDecided();
      }
    } finally {
      setIsDeciding(false);
    }
  };

  if (pendingUpdates.length === 0) return null;

  return (
    <Card variant="outlined" sx={{ mb: 3, borderColor: "warning.main", borderWidth: 1.5 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <ShieldQuestion size={20} />
          <Typography variant="subtitle1" fontWeight={600}>
            Pending changes
          </Typography>
          <Chip label={pendingUpdates.length} color="warning" size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These changes were submitted for this contact but not applied. Accept a change to write it
          to the contact, or reject it to discard it.
        </Typography>
        {pendingUpdates.map((update, index) => {
          const currentValue = getCurrentValue(contact, update.field);
          const changedSinceProposed =
            currentValue !== undefined && currentValue !== (update.oldValue ?? "");

          return (
            <Box key={getUpdateKey(update)}>
              {index > 0 && <Divider sx={{ my: 2 }} />}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {getFieldLabel(update.field)}
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                      gap: 2,
                      mb: 1.5,
                    }}
                  >
                    {currentValue !== undefined && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Current value
                        </Typography>
                        <ValueText value={currentValue} />
                      </Box>
                    )}
                    {(currentValue === undefined || changedSinceProposed) && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Value when proposed
                        </Typography>
                        <ValueText value={update.oldValue} />
                      </Box>
                    )}
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Proposed value
                      </Typography>
                      <ValueText value={update.proposedValue} />
                    </Box>
                  </Box>
                  {changedSinceProposed && (
                    <Typography variant="body2" color="warning.main" sx={{ mb: 1.5 }}>
                      Changed since this was proposed; accepting overwrites the current value.
                    </Typography>
                  )}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                      gap: 2,
                    }}
                  >
                    <DetailText label="Source" value={update.source} />
                    <DetailText label="IP address" value={update.ip} />
                    <DetailText label="User-Agent" value={update.userAgent} />
                    <DetailText
                      label="Date"
                      value={update.createdAt ? getFormattedDateTime(update.createdAt) : null}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Check size={16} />}
                    onClick={() => decide(update, "accept")}
                    disabled={isDeciding}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<X size={16} />}
                    onClick={() => decide(update, "reject")}
                    disabled={isDeciding}
                  >
                    Reject
                  </Button>
                </Box>
              </Box>
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
};
