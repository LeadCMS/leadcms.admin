import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { BriefcaseBusiness, Plus } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useNotificationsService, useCurrencyFormatter } from "@hooks";
import { getFormattedDateOnly } from "utils/general-helper";
import { getDealStageColor, getMockDealsForContact } from "../mock-data";
import { ContactViewOutletContext } from "../types";

export const ContactDeals = () => {
  const { contactId } = useOutletContext<ContactViewOutletContext>();
  const { notificationsService } = useNotificationsService();
  const { formatMoney } = useCurrencyFormatter();
  const deals = getMockDealsForContact(contactId);

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

          {deals.length === 0 ? (
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
              {deals.map((deal, index) => (
                <Card
                  key={deal.id}
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
                          {deal.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Owner: {deal.owner}
                        </Typography>
                      </Box>
                      <Chip size="small" color={getDealStageColor(deal.stage)} label={deal.stage} />
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
                        Amount: <strong>{formatMoney(deal.amount, 0)}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Close date: <strong>{getFormattedDateOnly(deal.closeDate)}</strong>
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
