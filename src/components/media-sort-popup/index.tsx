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
  { value: "name", label: "Name" },
  { value: "size", label: "Size" },
  { value: "usageCount", label: "Usage" },
  { value: "updatedAt", label: "Updated At" },
  { value: "createdAt", label: "Created At" },
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

export const MediaSortPopup: React.FC<Props> = ({
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
        sx: { minWidth: 140, p: 0, borderRadius: 2, mt: 1 },
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
              borderRadius: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>{option.label}</Box>
            {selectedField === option.value && (
              <Check size={14} color={theme.palette.primary.main} />
            )}
          </Button>
        ))}
      </Stack>
      <Divider />
      <Button
        fullWidth
        color="secondary"
        variant="text"
        onClick={onToggleDirection}
        sx={{
          fontSize: "14px",
          px: 3,
          py: 1.2,
          borderRadius: 0,
        }}
      >
        {direction === "asc" ? "Ascending" : "Descending"}
      </Button>
    </Popover>
  );
};
