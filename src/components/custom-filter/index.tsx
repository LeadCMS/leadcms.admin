import {
  Box,
  TextField,
  MenuItem,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  FormLabel,
  IconButton,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useState, useMemo } from "react";
import { X } from "lucide-react";

type OperatorOption = { value: string; label: string };

const textOperators: OperatorOption[] = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "not", label: "Not equal" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
];

const numberOperators: OperatorOption[] = [
  { value: "equals", label: "=" },
  { value: "not", label: "!=" },
  { value: "after", label: ">" },
  { value: "onOrAfter", label: ">=" },
  { value: "before", label: "<" },
  { value: "onOrBefore", label: "<=" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
];

const dateOperators: OperatorOption[] = [
  { value: "equals", label: "Is" },
  { value: "not", label: "Is not" },
  { value: "after", label: "After" },
  { value: "onOrAfter", label: "On or after" },
  { value: "before", label: "Before" },
  { value: "onOrBefore", label: "On or before" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
];

const singleSelectOperators: OperatorOption[] = [
  { value: "equals", label: "Is" },
  { value: "not", label: "Is not" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
];

const booleanOperators: OperatorOption[] = [{ value: "equals", label: "Is" }];

function getColumnType(col: GridColDef | undefined): string {
  return col?.type || "string";
}

function getOperatorsForType(colType: string): OperatorOption[] {
  switch (colType) {
    case "number":
      return numberOperators;
    case "date":
    case "dateTime":
      return dateOperators;
    case "singleSelect":
      return singleSelectOperators;
    case "boolean":
      return booleanOperators;
    default:
      return textOperators;
  }
}

function getDefaultOperator(colType: string): string {
  switch (colType) {
    case "number":
      return "equals";
    case "date":
    case "dateTime":
      return "equals";
    case "singleSelect":
      return "equals";
    case "boolean":
      return "equals";
    default:
      return "contains";
  }
}

function getOperatorLabel(operatorValue: string, colType: string): string {
  const ops = getOperatorsForType(colType);
  const found = ops.find((o) => o.value === operatorValue);
  return found?.label ?? operatorValue;
}

type CustomFilterBarProps = {
  columns: GridColDef[];
  whereFilters: Array<{
    whereField: string;
    whereOperator: string;
    whereFieldValue: string;
  }>;
  addFilter: (
    args: {
      whereField?: string;
      whereOperator?: string;
      whereFieldValue?: string;
    },
    removeIdx?: number,
    editIdx?: number
  ) => void;
  removeFilter: (index: number) => void;
  filterPanelOpen?: boolean;
  setFilterPanelOpen?: (open: boolean) => void;
  clearAllFilters: () => void;
};

export function CustomFilterBar({
  columns,
  whereFilters,
  addFilter,
  removeFilter,
  filterPanelOpen,
  setFilterPanelOpen,
  clearAllFilters,
}: CustomFilterBarProps) {
  const [field, setField] = useState(columns[0]?.field);
  const [operator, setOperator] = useState(getDefaultOperator(getColumnType(columns[0])));
  const [value, setValue] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const selectedColumn = useMemo(() => columns.find((c) => c.field === field), [columns, field]);
  const colType = getColumnType(selectedColumn);
  const operatorOptions = getOperatorsForType(colType);

  const valueOptions: string[] = useMemo(() => {
    if (!selectedColumn) return [];
    const col = selectedColumn as unknown as Record<string, unknown>;
    const opts = col.valueOptions;
    if (Array.isArray(opts)) {
      return opts.map((o) => (typeof o === "string" ? o : String(o)));
    }
    return [];
  }, [selectedColumn]);

  const noValueRequired = ["isEmpty", "isNotEmpty"].includes(operator);

  const canApply = field && (noValueRequired || (colType === "boolean" ? true : !!value));

  const resetToDefaults = () => {
    const defaultField = columns[0]?.field;
    const defaultColType = getColumnType(columns[0]);
    setField(defaultField);
    setOperator(getDefaultOperator(defaultColType));
    setValue("");
    setEditIdx(null);
  };

  const handleClose = () => {
    setFilterPanelOpen?.(false);
    resetToDefaults();
  };

  const handleFieldChange = (newField: string) => {
    setField(newField);
    const newCol = columns.find((c) => c.field === newField);
    const newType = getColumnType(newCol);
    const newOps = getOperatorsForType(newType);
    const isCurrentOpValid = newOps.some((o) => o.value === operator);
    if (!isCurrentOpValid) {
      setOperator(getDefaultOperator(newType));
    }
    setValue("");
  };

  const onChipClick = (idx: number) => {
    const f = whereFilters[idx];
    setField(f.whereField);
    setOperator(f.whereOperator);
    setValue(f.whereFieldValue);
    setEditIdx(idx);
    setFilterPanelOpen?.(true);
  };

  const handleAddOrEdit = () => {
    addFilter(
      {
        whereField: field,
        whereOperator: operator,
        whereFieldValue: value,
      },
      undefined,
      editIdx !== null ? editIdx : undefined
    );
    resetToDefaults();
    setFilterPanelOpen?.(false);
  };

  const chipLabel = (f: { whereField: string; whereOperator: string; whereFieldValue: string }) => {
    const col = columns.find((c) => c.field === f.whereField);
    const cType = getColumnType(col);
    const fieldLabel = col?.headerName ?? f.whereField;
    const opLabel = getOperatorLabel(f.whereOperator, cType);
    if (["isEmpty", "isNotEmpty"].includes(f.whereOperator)) {
      return `${fieldLabel} ${opLabel}`;
    }
    return `${fieldLabel} ${opLabel} "${f.whereFieldValue}"`;
  };

  const renderValueInput = () => {
    const isDisabled = noValueRequired;

    if (colType === "singleSelect" && valueOptions.length > 0) {
      return (
        <TextField
          select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ minWidth: 180 }}
          disabled={isDisabled}
          sx={{
            "& .MuiSelect-select": {
              padding: 2.5,
              minHeight: "unset",
              fontSize: "0.95rem",
            },
          }}
        >
          {valueOptions.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    if (colType === "date" || colType === "dateTime") {
      return (
        <TextField
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ minWidth: 180 }}
          disabled={isDisabled}
          InputLabelProps={{ shrink: true }}
          sx={{
            "& .MuiInputBase-input": {
              padding: 2.5,
              minHeight: "unset",
              fontSize: "0.95rem",
            },
          }}
        />
      );
    }

    if (colType === "number") {
      return (
        <TextField
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ minWidth: 180 }}
          disabled={isDisabled}
          sx={{
            "& .MuiInputBase-input": {
              padding: 2.5,
              minHeight: "unset",
              fontSize: "0.95rem",
            },
          }}
        />
      );
    }

    return (
      <TextField
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ minWidth: 180 }}
        disabled={isDisabled}
        sx={{
          "& .MuiInputBase-input": {
            padding: 2.5,
            minHeight: "unset",
            fontSize: "0.95rem",
          },
        }}
      />
    );
  };

  return (
    <>
      {whereFilters.length > 0 && (
        <Box display="flex" sx={{ backgroundColor: "#fafbfd", mb: 2 }}>
          {whereFilters.map((f, idx) => (
            <Chip
              key={idx}
              label={<span style={{ fontWeight: 600 }}>{chipLabel(f)}</span>}
              onClick={() => onChipClick(idx)}
              onDelete={() => removeFilter(idx)}
              deleteIcon={<X size={15} />}
              sx={{ ml: 2 }}
              color={editIdx === idx ? "primary" : "default"}
              variant={editIdx === idx ? "filled" : "outlined"}
            />
          ))}
          <Button
            sx={{
              ml: 2,
              backgroundColor: "#f3f4f6",
              color: "#222",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "16px",
              height: 32,
              minWidth: 0,
              px: 2,
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#e5e7eb",
                boxShadow: "none",
              },
            }}
            size="small"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>
        </Box>
      )}
      <Dialog
        open={filterPanelOpen ?? false}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#fafbfd",
            paddingBottom: 3,
            fontSize: "1.1rem",
            fontWeight: "bold",
          }}
        >
          {editIdx !== null ? "Edit Filter" : "Add Filter"}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            size="small"
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#fafbfd", padding: 2 }}>
          <Box
            sx={{
              p: 4,
              borderRadius: 0,
              backgroundColor: "#fafbfd",
              mx: "auto",
            }}
          >
            <Stack spacing={5}>
              <Box
                sx={{
                  width: "100%",
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <FormLabel
                  sx={{
                    mb: 2,
                    fontWeight: "600",
                    fontSize: "0.9rem",
                  }}
                >
                  Field
                </FormLabel>
                <TextField
                  select
                  value={field || columns[0]?.field || ""}
                  onChange={(e) => handleFieldChange(e.target.value)}
                  style={{ minWidth: 120 }}
                  sx={{
                    "& .MuiSelect-select": {
                      padding: 2.5,
                      minHeight: "unset",
                      fontSize: "0.95rem",
                    },
                  }}
                >
                  {columns.map((col) => (
                    <MenuItem key={col.field} value={col.field}>
                      {col.headerName}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <FormLabel
                  sx={{
                    mb: 2,
                    fontWeight: "600",
                    fontSize: "0.9rem",
                  }}
                >
                  Operator
                </FormLabel>
                <TextField
                  select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  style={{ minWidth: 120 }}
                  sx={{
                    "& .MuiSelect-select": {
                      padding: 2.5,
                      minHeight: "unset",
                      fontSize: "0.95rem",
                    },
                  }}
                >
                  {operatorOptions.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      {op.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              {!noValueRequired && (
                <Box
                  sx={{
                    width: "100%",
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <FormLabel
                    sx={{
                      mb: 2,
                      fontWeight: "600",
                      fontSize: "0.9rem",
                    }}
                  >
                    Value
                  </FormLabel>
                  {renderValueInput()}
                </Box>
              )}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ mr: 4, mb: 3, backgroundColor: "#fafbfd" }}>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddOrEdit}
            disabled={!canApply}
            color="secondary"
          >
            {editIdx !== null ? "Apply" : "Add Filter"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
