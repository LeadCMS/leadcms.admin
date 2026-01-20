import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { GridColDef, GridColumnVisibilityModel, GridValidRowModel } from "@mui/x-data-grid";
import { X } from "lucide-react";

interface ExportPopupProps<TModel extends GridValidRowModel> {
  open: boolean;
  onClose: () => void;
  onExport: (exportScope: string, fileFormat: string, selectedColumns: string[]) => void;
  columns: GridColDef<TModel>[];
  selectedCount: number;
  filteredCount?: number;
  columnVisibilityModel?: GridColumnVisibilityModel;
  exporting?: boolean;
  errorMessage?: string | null;
  hasActiveFilters: boolean;
  hasSearchText: boolean;
  hasAdditionalFilteredContext?: boolean;
}

export const ExportPopup = <TModel extends GridValidRowModel>({
  open,
  onClose,
  onExport,
  columns,
  selectedCount,
  filteredCount,
  columnVisibilityModel = {},
  exporting = false,
  errorMessage = null,
  hasActiveFilters,
  hasSearchText,
  hasAdditionalFilteredContext = false,
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

  const isFilteredExportValid = hasActiveFilters || hasSearchText || hasAdditionalFilteredContext;
  const filteredLabel =
    typeof filteredCount === "number" ? `Filtered Records (${filteredCount})` : "Filtered Records";

  const exportDisabled =
    exporting ||
    (exportScope === "selected" && selectedCount === 0) ||
    selectedColumns.length === 0 ||
    (exportScope === "filtered" && !isFilteredExportValid);

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
                label={<Typography sx={{ fontSize: "0.9rem" }}>{filteredLabel}</Typography>}
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
