import { Box, TextField, MenuItem, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Stack, FormLabel,IconButton } from "@mui/material";
import { GridColDef} from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

type CustomFilterBarProps = {
  columns: GridColDef[];
  whereFilters: Array<{ whereField: string; whereOperator: string; whereFieldValue: string }>;
  addFilter: (args: { whereField?: string; whereOperator?: string; whereFieldValue?: string }, removeIdx?: number, editIdx?: number) => void;
  removeFilter: (index: number) => void;
  filterPanelOpen?: boolean;
  setFilterPanelOpen?: (open: boolean) => void;
  clearAllFilters: () => void;
};

export function CustomFilterBar({ columns, whereFilters, addFilter, removeFilter, filterPanelOpen, setFilterPanelOpen,clearAllFilters } : CustomFilterBarProps) {
  const [field, setField] = useState(columns[0]?.field);
  const [operator, setOperator] = useState("contains");
  const [value, setValue] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);

  useEffect(() => {
}, [editIdx]);

  const operatorOptions = [
    { value: "contains", label: "Contains" },
    { value: "equals", label: "Equals" },
    { value: "startsWith", label: "Starts With" },
    { value: "endsWith", label: "Ends With" },
    { value: "isEmpty", label: "Is Empty" },
    { value: "isNotEmpty", label: "Is Not Empty" },
    { value: "not", label: "!=" },
    { value: "after", label: ">" },               
    { value: "onOrAfter", label: "≥" },            
    { value: "before", label: "<" },              
    { value: "onOrBefore", label: "≤" }, 
  ];

  const requiresValue = !["isEmpty", "isNotEmpty"].includes(operator);

  const canApply =
    field && (requiresValue ? !!value : ["isEmpty", "isNotEmpty"].includes(operator));
    
  const handleClose = () => {
    setFilterPanelOpen?.(false);
    setField(columns[0]?.field);
    setOperator("contains");
    setValue("");
    setEditIdx(null);
  }

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
      { whereField: field, whereOperator: operator, whereFieldValue: value },
       undefined,
      editIdx !== null ? editIdx : undefined
    );
    setField(columns[0]?.field);
    setOperator("contains");
    setValue("");
    setEditIdx(null);
    setFilterPanelOpen?.(false);
  };

  return (
  <>
    <Box display="flex" sx={{backgroundColor:"#fafbfd", mb:4}} >
      {whereFilters.map((f, idx) => (
          <Chip
            key={idx}
            label={
          <span style={{ fontWeight: 600 }}>
          {`${f.whereField} ${f.whereOperator} ${f.whereFieldValue}`} </span>}
            onClick={() => onChipClick(idx)}
            onDelete={() => removeFilter(idx)}
            deleteIcon={<X size={15} />}
            sx={{ ml: 2 }}
            color={editIdx === idx ? "primary" : "default"}
            variant={editIdx === idx ? "filled" : "outlined"}
          />
      ))}
        {whereFilters.length > 0 && (
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
      )}
    </Box>
    <Dialog open={filterPanelOpen ?? false} onClose={handleClose} maxWidth="xs" fullWidth  
    PaperProps={{
    sx: { borderRadius: 2}
    }}>
     <DialogTitle  sx={{backgroundColor:"#fafbfd", paddingBottom:3, fontSize:"1.1rem", fontWeight:"bold"}} >{editIdx !== null ? "Edit Filter" : "Add Filter"}
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
      <DialogContent  sx={{backgroundColor:"#fafbfd", padding:2}} >
       <Box 
        sx={{
        p: 4,
        borderRadius: 0,
        backgroundColor: "#fafbfd",
        mx: "auto",
        }}>
        <Stack spacing={5}>
          <Box sx={{width:"100%",mb: 2, display:"flex", flexDirection:"column"}}>
          <FormLabel sx={{mb: 2, fontWeight: "600", fontSize:"0.9rem" }}>Field</FormLabel>
          <TextField
            select
            value={field || columns[0]?.field || ""}
            onChange={e => setField(e.target.value)}
            style={{ minWidth: 120 }}
            sx={{
              "& .MuiSelect-select": {
                padding: 2.5,
                minHeight: "unset",
                fontSize: "0.95rem"
              }
            }}
          >
          {columns.map(col => (
              <MenuItem key={col.field} value={col.field}>
                {col.headerName}
              </MenuItem>
            ))}
          </TextField>
          </Box>
          <Box sx={{width:"100%",mb: 2, display:"flex", flexDirection:"column"}}>
          <FormLabel  sx={{mb: 2, fontWeight: "600", fontSize:"0.9rem" }}>Operator</FormLabel>
          <TextField
            select
            value={operator}
            onChange={e => setOperator(e.target.value)}
            style={{ minWidth: 120 }}
            sx={{
              "& .MuiSelect-select": {
                padding: 2.5,
                minHeight: "unset",
                fontSize: "0.95rem"
              }
            }}
          >
            {operatorOptions.map(op => (
              <MenuItem key={op.value} value={op.value}>
                {op.label}
              </MenuItem>
            ))}
          </TextField>
          </Box>
          <Box sx={{width:"100%",mb: 2, display:"flex", flexDirection:"column"}}>
          <FormLabel  sx={{mb: 2, fontWeight: "600", fontSize:"0.9rem" }}>Value</FormLabel>
          <TextField
            value={value}
            onChange={e => setValue(e.target.value)}
            style={{ minWidth: 180 }}
            disabled={operator === "isEmpty" || operator === "isNotEmpty"}
            sx={{
              "& .MuiInputBase-input": {
                padding: 2.5,
                minHeight: "unset",
                fontSize: "0.95rem"
              }
            }}
          />
          </Box>
        </Stack>
      </Box>

    </DialogContent>
      <DialogActions sx={{mr:4, mb:3, backgroundColor:"#fafbfd"}}>
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