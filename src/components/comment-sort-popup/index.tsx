import React from "react";
import Popover from "@mui/material/Popover";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { Check } from "lucide-react";

interface SortOption {
  value: string;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: "createdAt", label: "Created At" },
  { value: "updatedAt", label: "Updated At" },
  { value: "body", label: "Body" },
  { value: "status", label: "Status" },
  { value: "language", label: "Language" },
  { value: "publishedAt", label: "Published At" },
];

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  selectedField: string;
  direction: "asc" | "desc";
  onClose: () => void;
  onChangeField: (field: string) => void;
  onToggleDirection: () => void;
};

export const CommentSortPopup: React.FC<Props> = ({
  anchorEl,
  open,
  selectedField,
  direction,
  onClose,
  onChangeField,
  onToggleDirection,
}) => {
  const theme = useTheme();
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      PaperProps={{
        sx: { minWidth: 100, p: 0, borderRadius: 2, mt: 1 },
      }}
    >
      <Stack spacing={1}>
        {SORT_OPTIONS.map((option) => (
          <Button
            key={option.value}
            fullWidth
            color="secondary"
            variant="text"
            onClick={() => {
              onChangeField(option.value);
              onClose();
            }}
            sx={{
              fontSize: "14px",
              px: 3,
              py: 1,
              backgroundColor:
                selectedField === option.value ? theme.palette.primary.light : undefined,
              borderColor: "#E4E4E7",
              color: theme.palette.text.secondary,
              textTransform: "none",
              justifyContent: "flex-start",
              "&:hover": {
                backgroundColor: theme.palette.background.primaryHover,
              },
            }}
          >
            <Box display="flex" alignItems="center" width="100%">
              {selectedField === option.value && <Check size={14} style={{ marginRight: 4 }} />}
              <span>{option.label}</span>
            </Box>
          </Button>
        ))}
        <Divider sx={{ my: 1 }} />
        <Button
          color="secondary"
          variant="text"
          onClick={onToggleDirection}
          fullWidth
          sx={{
            fontSize: "14px",

            px: 3,
            py: 1,

            justifyContent: "flex-start",
          }}
        >
          {direction === "asc" ? "Descending" : "Ascending"}
        </Button>
      </Stack>
    </Popover>
  );
};
