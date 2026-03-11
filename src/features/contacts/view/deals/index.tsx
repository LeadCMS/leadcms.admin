import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { BriefcaseBusiness, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { DealDetailsDto } from "@lib/network/swagger-client";
import { useConfig } from "@providers/config-provider";
import { useNotificationsService, useCurrencyFormatter } from "@hooks";
import { showApiError } from "@utils/api-error-parser";
import { getWhereFilterQuery } from "@providers/query-provider";
import { useRequestContext } from "@providers/request-provider";
import { ENTITY_KEYS, hasEntity } from "@utils/entity-availability";
import { getFormattedDateOnly } from "utils/general-helper";
import { ContactViewOutletContext } from "../types";

const getDealStageColor = (stage?: string | null) => {
  const normalizedStage = (stage || "").toLowerCase();

  if (normalizedStage.includes("closed") || normalizedStage.includes("won")) {
    return "success" as const;
  }
  if (normalizedStage.includes("negotiation")) {
    return "warning" as const;
  }
  if (normalizedStage.includes("proposal")) {
    return "info" as const;
  }
  if (normalizedStage.includes("qualification")) {
    return "secondary" as const;
  }
  return "default" as const;
};

export const ContactDeals = () => {
  const { contactId } = useOutletContext<ContactViewOutletContext>();
  const { client } = useRequestContext();
  const { config } = useConfig();
  const { notificationsService } = useNotificationsService();
  const { formatMoney } = useCurrencyFormatter();
  const hasDeals = hasEntity(config?.entities, ENTITY_KEYS.deal);
  const [deals, setDeals] = useState<DealDetailsDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDeals = async () => {
      if (!hasDeals || !contactId) {
        setDeals([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const { data } = await client.api.dealsList({
          query: getWhereFilterQuery("contactIds", contactId.toString(), "contains"),
        });

        const loadedDeals = (data || []).filter((deal) => {
          if (!deal.contacts?.length) return true;
          return deal.contacts.some((relatedContact) => relatedContact.id === contactId);
        });

        setDeals(loadedDeals);
      } catch (error) {
        setDeals([]);
        showApiError(error, notificationsService, undefined, "Could not retrieve deals.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDeals();
  }, [client, contactId, hasDeals, notificationsService]);

  if (!hasDeals) {
    return null;
  }

  const handleCreateDealClick = () => {
    notificationsService.info("Deal creation workflow will be enabled" + " with the deals API.");
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Associated Deals
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
            Deals linked to this contact.
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
          ) : deals.length === 0 ? (
            <Box
              sx={{
                py: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: 1,
              }}
            >
              <Box sx={{ color: "text.disabled" }}>
                <BriefcaseBusiness size={44} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600}>
                No deals yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a deal to start tracking pipeline activity for this contact.
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={16} />}
                sx={{ mt: 1 }}
                onClick={handleCreateDealClick}
              >
                Create Deal
              </Button>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {deals.map((deal) => (
                <Card
                  key={deal.id || `${deal.userId}-${deal.expectedCloseDate}`}
                  variant="outlined"
                  sx={{
                    transition: "background-color 0.15s",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: {
                          xs: "flex-start",
                          sm: "center",
                        },
                        flexDirection: {
                          xs: "column",
                          sm: "row",
                        },
                        gap: 1.25,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {deal.dealPipeline?.name || `Deal #${deal.id || "-"}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Owner: {deal.userId || "Unassigned"}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        color={getDealStageColor(deal.pipelineStage?.name)}
                        label={deal.pipelineStage?.name || "Active"}
                      />
                    </Box>
                    <Box
                      sx={{
                        mt: 1.5,
                        display: "flex",
                        gap: 2.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Amount: <strong>{formatMoney(deal.dealValue || 0, 0)}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Close date:{" "}
                        <strong>{getFormattedDateOnly(deal.expectedCloseDate || "")}</strong>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
