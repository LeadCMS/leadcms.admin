import { Box, Card, CardContent, Typography } from "@mui/material";
import { MessageSquareOff } from "lucide-react";

export const ContactActivity = () => {
  return (
    <Box sx={{ mt: 3 }}>
      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Activity Timeline
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
            Activity logs are currently unavailable for contacts.
          </Typography>
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
              <MessageSquareOff size={44} />
            </Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Activity logs are disabled
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This section will be restored once the backend support is complete.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
