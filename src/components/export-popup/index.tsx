import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { GridColDef, GridColumnVisibilityModel, GridValidRowModel } from "@mui/x-data-grid";
import { X } from "lucide-react";

interface ExportPopupProps<TModel extends GridValidRowModel> {
  open: boolean;
  onClose: () => void;
  onExport: (exportScope: string, fileFormat: string, selectedColumns: string[]) => void;
  columns: GridColDef<TModel>[];
  selectedCount: number;
  columnVisibilityModel?: GridColumnVisibilityModel;
  exporting?: boolean;
  errorMessage?: string | null;
}

export const ExportPopup = <TModel extends GridValidRowModel>({
  open,
  onClose,
  onExport,
  columns,
  selectedCount,
  columnVisibilityModel = {},
  exporting = false,
  errorMessage = null,
}: ExportPopupProps<TModel>) => {
  const [exportScope, setExportScope] = useState("all");
  const [fileFormat, setFileFormat] = useState("csv");
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns.map((c) => c.field));
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLocalError(null);
      const visible = columns.filter((col) => columnVisibilityModel[col.field] !== false);
      setSelectedColumns(visible.map((c) => c.field));
    }
  }, [open, columns, columnVisibilityModel]);

  useEffect(() => {
    setLocalError(errorMessage ?? null);
  }, [errorMessage]);

  const handleColumnToggle = (field: string) => {
    setSelectedColumns((cols) => {
      const toggled = cols.includes(field) ? cols.filter((f) => f !== field) : [...cols, field];
      return columns.map((col) => col.field).filter((f) => toggled.includes(f));
    });
  };

  const handleExport = () => onExport(exportScope, fileFormat, selectedColumns);

  const exportDisabled =
    exporting ||
    (exportScope === "selected" && selectedCount === 0) ||
    selectedColumns.length === 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth sx={{ borderRadius: 2, p: 2 }}>
      <Box sx={{ p: 0 }}>
        <DialogTitle sx={{ fontSize: "1.1rem", fontWeight: 600, pb: 0 }}>
          Export Records
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={exporting}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <X size={20} />
        </IconButton>
      </Box>
      <DialogContent sx={{ pt: 3 }}>
        {localError && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {errorMessage}
          </Alert>
        )}
        <Box sx={{ width: "100%", mb: 3 }}>
          <FormControl component="fieldset" sx={{ mb: 0 }}>
            <Typography sx={{ mb: 1, fontWeight: 500, fontSize: "0.9rem" }}>
              Export Scope
            </Typography>
            <RadioGroup
              value={exportScope}
              onChange={(e) => setExportScope(e.target.value)}
              sx={{ gap: 0 }}
            >
              <FormControlLabel
                sx={{ mb: 0, p: 0 }}
                value="all"
                control={
                  <Radio
                    sx={{
                      "& .MuiSvgIcon-root": { fontSize: 16 },
                    }}
                  />
                }
                label={<Typography sx={{ fontSize: "0.9rem" }}>All Records</Typography>}
              />
              <FormControlLabel
                value="filtered"
                control={
                  <Radio
                    sx={{
                      "& .MuiSvgIcon-root": { fontSize: 16 },
                    }}
                  />
                }
                label={<Typography sx={{ fontSize: "0.9rem" }}>Filtered Records</Typography>}
              />
              <FormControlLabel
                value="selected"
                sx={{ p: 0 }}
                control={
                  <Radio
                    sx={{
                      "& .MuiSvgIcon-root": { fontSize: 16, p: 0 },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{ fontSize: "0.9rem" }}
                  >{`Selected Records (${selectedCount})`}</Typography>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>
        <Box sx={{ width: "100%", mb: 2 }}>
          <FormControl component="fieldset" sx={{ mb: 1 }}>
            <Typography sx={{ mb: 1, fontWeight: 500, fontSize: "0.9rem" }}>File Format</Typography>
            <RadioGroup value={fileFormat} onChange={(e) => setFileFormat(e.target.value)} row>
              <FormControlLabel
                value="csv"
                control={
                  <Radio
                    sx={{
                      "& .MuiSvgIcon-root": { fontSize: 16 },
                    }}
                  />
                }
                label={<Typography sx={{ fontSize: "0.9rem" }}>CSV</Typography>}
              />
              <FormControlLabel
                value="json"
                control={
                  <Radio
                    sx={{
                      "& .MuiSvgIcon-root": { fontSize: 16 },
                    }}
                  />
                }
                label={<Typography sx={{ fontSize: "0.9rem" }}>JSON</Typography>}
              />
            </RadioGroup>
          </FormControl>
        </Box>
        <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
          <Typography sx={{ mb: 2, fontWeight: 500, fontSize: "0.9rem" }}>
            Columns to Export
          </Typography>
          <Box
            sx={{
              maxHeight: 200,
              overflowY: "auto",
              border: 1,
              borderColor: "divider",
              p: 1,
              borderRadius: 1,
              pl: 2,
            }}
          >
            <FormGroup sx={{ mt: 0.5, ml: 1 }}>
              {columns.map((col) => (
                <FormControlLabel
                  key={col.field}
                  control={
                    <Checkbox
                      sx={{
                        "& .MuiSvgIcon-root": { fontSize: 18 },
                        p: 2,
                      }}
                      checked={selectedColumns.includes(col.field)}
                      onChange={() => handleColumnToggle(col.field)}
                    />
                  }
                  label={<span style={{ fontSize: "0.9rem" }}>{col.headerName}</span>}
                />
              ))}
            </FormGroup>
          </Box>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" disabled={exporting}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          color="primary"
          disabled={exportDisabled}
          startIcon={exporting ? <CircularProgress size={16} /> : undefined}
        >
          {exporting ? "Exporting..." : "Export"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
