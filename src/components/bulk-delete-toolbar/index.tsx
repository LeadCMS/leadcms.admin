import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
} from "@mui/material";
import { Pencil, Trash2 } from "lucide-react";

export interface BulkDeleteToolbarProps {
  selectedCount: number;
  totalCount: number;
  entityName: string;
  onDelete: () => Promise<void>;
  onDeleteSuccess: () => void;
  onClearSelection: () => void;
  onToggleSelectAll: () => void;
  onModifySelected?: () => void;
  notificationsService?: {
    success: (message: string) => void;
    error: (message: string) => void;
  };
}

export const BulkDeleteToolbar = ({
  selectedCount,
  totalCount,
  entityName,
  onDelete,
  onDeleteSuccess,
  onClearSelection,
  onToggleSelectAll,
  onModifySelected,
  notificationsService,
}: BulkDeleteToolbarProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (selectedCount === 0) return null;

  const plural = selectedCount === 1 ? entityName : `${entityName}s`;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      notificationsService?.success(`Deleted ${selectedCount} ${plural}`);
      onDeleteSuccess();
    } catch {
      notificationsService?.error(`Failed to delete ${plural}. Please try again.`);
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          px: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          bgcolor: "primary.50",
          border: "1px solid",
          borderColor: "primary.200",
          borderRadius: 2,
        }}
      >
        <Checkbox
          checked={selectedCount === totalCount && totalCount > 0}
          indeterminate={selectedCount > 0 && selectedCount < totalCount}
          onChange={onToggleSelectAll}
          size="small"
        />
        <Chip label={`${selectedCount} selected`} size="small" color="primary" />
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<Trash2 size={16} />}
          onClick={() => setIsConfirmOpen(true)}
        >
          Delete Selected
        </Button>
        {onModifySelected && (
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<Pencil size={16} />}
            onClick={onModifySelected}
          >
            Modify Selected
          </Button>
        )}
        <Button size="small" variant="text" onClick={onClearSelection}>
          Clear Selection
        </Button>
      </Paper>

      <Dialog
        open={isConfirmOpen}
        onClose={() => !isDeleting && setIsConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Delete Selected {entityName.charAt(0).toUpperCase()}
          {entityName.slice(1)}s
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              You are about to delete{" "}
              <Box component="span" sx={{ fontWeight: 600 }}>
                {selectedCount}
              </Box>{" "}
              {plural}.
            </Typography>
            <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
              This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmOpen(false)} variant="text" disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="error"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={14} /> : undefined}
          >
            {isDeleting ? "Deleting..." : `Delete ${selectedCount} ${plural}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
