import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { Plus, Trash2 } from "lucide-react";

export interface BulkEditFieldOption {
  key: string;
  label: string;
  nullable?: boolean;
}

export type BulkEditFieldRenderer = (
  fieldKey: string,
  value: unknown,
  onChange: (value: unknown) => void
) => React.ReactNode;

interface BulkEditDialogProps {
  open: boolean;
  onClose: () => void;
  entityName: string;
  selectedCount: number;
  fieldOptions: BulkEditFieldOption[];
  renderFieldInput: BulkEditFieldRenderer;
  onSave: (fields: Record<string, unknown>) => Promise<void>;
  notificationsService?: {
    success: (message: string) => void;
    error: (message: string) => void;
  };
}

interface FieldEntry {
  key: string;
  value: unknown;
}

const hasValue = (value: unknown, nullable: boolean): boolean => {
  if (nullable) return true;
  if (value === null || value === undefined) return false;
  if (value === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
};

export const BulkEditDialog = ({
  open,
  onClose,
  entityName,
  selectedCount,
  fieldOptions,
  renderFieldInput,
  onSave,
  notificationsService,
}: BulkEditDialogProps) => {
  const [fields, setFields] = useState<FieldEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const usedKeys = fields.map((f) => f.key);
  const availableOptions = fieldOptions.filter((o) => !usedKeys.includes(o.key));

  const addField = () => {
    if (availableOptions.length === 0) return;
    setFields([...fields, { key: availableOptions[0].key, value: null }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateFieldKey = (index: number, newKey: string) => {
    setFields(fields.map((f, i) => (i === index ? { key: newKey, value: null } : f)));
  };

  const updateFieldValue = (index: number, value: unknown) => {
    setFields(fields.map((f, i) => (i === index ? { ...f, value } : f)));
  };

  const isFieldValid = (entry: FieldEntry) => {
    const opt = fieldOptions.find((o) => o.key === entry.key);
    return hasValue(entry.value, opt?.nullable ?? false);
  };

  const canSave = fields.length > 0 && fields.every((f) => isFieldValid(f));

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of fields) {
        payload[f.key] = f.value;
      }
      await onSave(payload);
      const plural = selectedCount === 1 ? entityName : `${entityName}s`;
      notificationsService?.success(`Updated ${selectedCount} ${plural}`);
      handleClose();
    } catch {
      const plural = selectedCount === 1 ? entityName : `${entityName}s`;
      notificationsService?.error(`Failed to update ${plural}. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    setFields([]);
    onClose();
  };

  const plural = selectedCount === 1 ? entityName : `${entityName}s`;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Edit {selectedCount} {plural}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Add fields you want to update. Only the selected fields will be modified.
          </Typography>

          {fields.map((entry, index) => {
            const currentUsedKeys = fields.filter((_, i) => i !== index).map((f) => f.key);
            const selectableOptions = fieldOptions.filter(
              (o) => !currentUsedKeys.includes(o.key) || o.key === entry.key
            );

            return (
              <Box key={index} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                <Autocomplete
                  size="small"
                  sx={{ minWidth: 180 }}
                  options={selectableOptions}
                  getOptionLabel={(o) => o.label}
                  value={fieldOptions.find((o) => o.key === entry.key) ?? undefined}
                  onChange={(_, newVal) => {
                    if (newVal) updateFieldKey(index, newVal.key);
                  }}
                  disableClearable
                  renderInput={(params) => <TextField {...params} label="Field" />}
                />
                <Box sx={{ flex: 1 }}>
                  {renderFieldInput(entry.key, entry.value, (val) => updateFieldValue(index, val))}
                </Box>
                <IconButton size="small" onClick={() => removeField(index)} sx={{ mt: 0.5 }}>
                  <Trash2 size={16} />
                </IconButton>
              </Box>
            );
          })}

          <Button
            size="small"
            variant="outlined"
            startIcon={<Plus size={16} />}
            onClick={addField}
            disabled={availableOptions.length === 0}
            sx={{ alignSelf: "flex-start" }}
          >
            Add Field
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="text" disabled={isSaving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!canSave || isSaving}
          startIcon={isSaving ? <CircularProgress size={14} /> : undefined}
        >
          {isSaving ? "Saving..." : `Update ${selectedCount} ${plural}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
