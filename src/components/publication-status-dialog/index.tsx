import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Stack from "@mui/material/Stack";
import { DatePicker } from "@mui/x-date-pickers";
import { Calendar, X } from "lucide-react";
import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";

export type PublicationStatus = "draft" | "published" | "planned";

export interface PublicationStatusDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (
    status: PublicationStatus,
    publishedAt: string | null,
    dontShowAgain: boolean
  ) => void;
  currentPublishedAt: string | null;
  contentTitle?: string;
}

export const PublicationStatusDialog = ({
  open,
  onClose,
  onConfirm,
  currentPublishedAt,
  contentTitle = "Untitled",
}: PublicationStatusDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<PublicationStatus>("draft");
  const [publishedAt, setPublishedAt] = useState<Dayjs | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Determine current status based on publishedAt value
  const getCurrentStatus = (): PublicationStatus => {
    if (!currentPublishedAt) return "draft";
    const publishDate = dayjs(currentPublishedAt);
    const now = dayjs();
    return publishDate.isAfter(now) ? "planned" : "published";
  };

  // Initialize state when dialog opens
  useEffect(() => {
    if (open) {
      const status = getCurrentStatus();
      setSelectedStatus(status);
      setPublishedAt(currentPublishedAt ? dayjs(currentPublishedAt) : null);
      setDontShowAgain(false);
    }
  }, [open, currentPublishedAt]);

  const handleStatusChange = (status: PublicationStatus) => {
    setSelectedStatus(status);

    if (status === "published") {
      setPublishedAt(dayjs().startOf("day"));
    } else if (status === "planned") {
      // If switching to planned but no date set, suggest tomorrow
      if (!publishedAt || publishedAt.isBefore(dayjs())) {
        setPublishedAt(dayjs().add(1, "day").startOf("day"));
      }
    } else if (status === "draft") {
      setPublishedAt(null);
    }
  };

  const handleConfirm = () => {
    let finalPublishedAt: string | null = null;

    if (selectedStatus === "published") {
      finalPublishedAt = (publishedAt || dayjs()).startOf("day").toISOString();
    } else if (selectedStatus === "planned" && publishedAt) {
      finalPublishedAt = publishedAt.startOf("day").toISOString();
    }

    onConfirm(selectedStatus, finalPublishedAt, dontShowAgain);
  };

  const isPlannedDateValid =
    selectedStatus !== "planned" ||
    (publishedAt && publishedAt.startOf("day").isAfter(dayjs().startOf("day")));

  const getStatusDescription = () => {
    switch (selectedStatus) {
      case "draft":
        return (
          "Content will not be visible on the website and will be excluded from " +
          "site deployments. You can continue editing and publish later."
        );
      case "published":
        return (
          "Content will be included in the next site deployment and become " +
          "visible on the website."
        );
      case "planned":
        return publishedAt
          ? `Content will be included in site deployments that occur after ${publishedAt.format(
              "MMMM D, YYYY"
            )}.`
          : "Content will be included in site deployments after the date you specify.";
      default:
        return "";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="publication-status-dialog-title"
    >
      <DialogTitle id="publication-status-dialog-title">
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Calendar size={24} />
            Publication Status
          </Box>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>&quot;{contentTitle}&quot;</strong>{" "}
              {getCurrentStatus() === "draft"
                ? "has no publication date"
                : getCurrentStatus() === "planned"
                ? "is scheduled for future publication"
                : "will be saved as published"}
              . Choose how you&apos;d like to handle this content:
            </Typography>
          </Box>

          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ mb: 2 }}>
              Publication Status
            </FormLabel>
            <RadioGroup
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value as PublicationStatus)}
            >
              <FormControlLabel
                value="draft"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">📝 Save as Draft</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      Keep content private for now
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="published"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">🌐 Publish Now</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      Mark content as published (available on next site deployment)
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="planned"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">⏰ Schedule for Later</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      Set a future publication date (will be included in site deployments after this
                      date)
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
          {selectedStatus === "planned" && (
            <Box sx={{ pl: 4 }}>
              <DatePicker
                label="Publication Date"
                value={publishedAt}
                onChange={setPublishedAt}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !isPlannedDateValid,
                    helperText: !isPlannedDateValid ? "Please select a future date" : undefined,
                  },
                }}
                minDate={dayjs().add(1, "day")}
              />
            </Box>
          )}
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">{getStatusDescription()}</Typography>
          </Alert>
          <FormControlLabel
            control={
              <Checkbox
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                Don&apos;t show this dialog again (you can manually manage publication dates)
              </Typography>
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={!isPlannedDateValid}
        >
          Save Content
        </Button>
      </DialogActions>
    </Dialog>
  );
};
