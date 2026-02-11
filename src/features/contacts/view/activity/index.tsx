import { ReactNode, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { Download, Globe, Mail, MessageSquare } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { getFormattedDateTime } from "utils/general-helper";
import {
  ContactActivityType,
  getMockActivitiesForContact,
  mockContactActivities,
} from "../mock-data";
import { ContactViewOutletContext } from "../types";

const activityLabelMap: Record<ContactActivityType, string> = {
  email_open: "Email Open",
  page_view: "Page View",
  form_submission: "Form Submission",
  download: "Download",
  note: "Note",
};

const activityIconMap: Record<ContactActivityType, ReactNode> = {
  email_open: <Mail size={14} />,
  page_view: <Globe size={14} />,
  form_submission: <MessageSquare size={14} />,
  download: <Download size={14} />,
  note: <MessageSquare size={14} />,
};

export const ContactActivity = () => {
  const { contactId } = useOutletContext<ContactViewOutletContext>();
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [typeFilter, setTypeFilter] = useState<"all" | ContactActivityType>("all");

  const activities = useMemo(() => {
    const items = getMockActivitiesForContact(contactId);
    const filteredItems =
      typeFilter === "all" ? items : items.filter((activity) => activity.type === typeFilter);

    return filteredItems.sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();
      return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
    });
  }, [contactId, sortOrder, typeFilter]);

  const availableTypes = useMemo(
    () =>
      Array.from(
        new Set(
          mockContactActivities
            .filter((activity) => activity.contactId === contactId)
            .map((activity) => activity.type)
        )
      ),
    [contactId]
  );

  const handleSortChange = (event: SelectChangeEvent<"desc" | "asc">) => {
    setSortOrder(event.target.value as "desc" | "asc");
  };

  const handleTypeFilterChange = (event: SelectChangeEvent<"all" | ContactActivityType>) => {
    setTypeFilter(event.target.value as "all" | ContactActivityType);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Activity Timeline
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
            Recent interactions and engagement history for this contact.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              mb: 3,
            }}
          >
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel id="contact-activity-sort-label">Sort</InputLabel>
              <Select
                labelId="contact-activity-sort-label"
                label="Sort"
                value={sortOrder}
                onChange={handleSortChange}
              >
                <MenuItem value="desc">Newest first</MenuItem>
                <MenuItem value="asc">Oldest first</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 190 }}>
              <InputLabel id="contact-activity-type-label">Activity Type</InputLabel>
              <Select
                labelId="contact-activity-type-label"
                label="Activity Type"
                value={typeFilter}
                onChange={handleTypeFilterChange}
              >
                <MenuItem value="all">All activity</MenuItem>
                {availableTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {activityLabelMap[type]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {activities.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No activities found for this contact.
              </Typography>
            </Box>
          ) : (
            <Box>
              {activities.map((activity, index) => {
                const isLast = index === activities.length - 1;
                return (
                  <Box
                    key={activity.id}
                    sx={{
                      position: "relative",
                      pl: 4,
                      pb: isLast ? 0 : 3,
                    }}
                  >
                    {!isLast && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: 8.5,
                          top: 12,
                          bottom: -4,
                          width: 1,
                          bgcolor: "divider",
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: 2,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {activityIconMap[activity.type]}
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      {activity.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activityLabelMap[activity.type]} • {getFormattedDateTime(activity.timestamp)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
