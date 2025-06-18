import React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GridColDef, GridColumnVisibilityModel } from "@mui/x-data-grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import { GripVertical } from "lucide-react";
import { X } from "lucide-react";

type ColumnsPanelProps = {
  open?: boolean;
  columns: GridColDef[];
  setColumns: (cols: GridColDef[]) => void;
  columnVisibilityModel: GridColumnVisibilityModel;
  setColumnVisibilityModel: (model: GridColumnVisibilityModel) => void;
  onClose? : () => void;
  onColumnsReorder?: (cols: GridColDef[]) => void;
};

function SortableItem({
  col,
  visibilityModel,
  setVisibilityModel,
}: {
  col: GridColDef;
  visibilityModel: GridColumnVisibilityModel;
  setVisibilityModel: (model: GridColumnVisibilityModel) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: col.field });

  return (
    <Box
      ref={setNodeRef}
      {...attributes}
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: isDragging ? "grey.200" : "grey.100",
        borderRadius: 1,
        px: 1.5,
        py: 1,
        mb: 1,
        boxShadow: isDragging ? 3 : 0,
        cursor: "pointer",
        userSelect: "none",
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <Box
        {...listeners}
        sx={{
          cursor: "grab",
          mr: 1.5,
          color: "grey.500",
          display: "flex",
          alignItems: "center",
        }}
        title="Drag"
      >
        <GripVertical size={20} />
      </Box>
      <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
        <Checkbox
          size="small"
          checked={visibilityModel[col.field] !== false}
          onChange={e =>
            setVisibilityModel({
              ...visibilityModel,
              [col.field]: e.target.checked,
            })
          }
          sx={{ mr: 1 }}
        />
        <Typography variant="body2">{col.headerName}</Typography>
      </Box>
    </Box>
  );
}

export const ColumnsPanel: React.FC<ColumnsPanelProps> = ({
  open,
  columns,
  setColumns,
  columnVisibilityModel,
  setColumnVisibilityModel,
  onClose,
  onColumnsReorder
}) => {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = columns.findIndex(col => col.field === active.id);
    const newIndex = columns.findIndex(col => col.field === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
    const newCols = arrayMove(columns, oldIndex, newIndex);
    if (onColumnsReorder) onColumnsReorder(newCols);
    else setColumns(newCols);
  }
  };

   const handleShowAll = () => {
    const allVisible: GridColumnVisibilityModel = {};
    columns.forEach(col => {
      allVisible[col.field] = true;
    });
    setColumnVisibilityModel(allVisible);
  };


  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open ?? false}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ display: "flex", pb:0, }}>
        <Box sx={{ display: "flex", pr: 3 ,flexDirection:"column" }}>
        <Box sx={{ display: "flex", mb:3}}>
        <Typography variant="h6" sx={{ flex: 1}}>
          Manage Columns
        </Typography>
        <IconButton
          size="small"
          edge="end"
          onClick={onClose}
          aria-label="close"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <X size={20} />
        </IconButton>
         </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0, fontSize:"0.85rem"}}>
        Select which columns to display and drag to reorder them.
        </Typography>
        <Box sx={{ display:"flex", justifyContent:"flex-end", p:0}}>
             <Button variant="text" color="secondary" onClick={handleShowAll} sx={{fontSize:"0.85rem"}}>
          Show All
        </Button>
        </Box>
         
        </Box>
      </DialogTitle>
      <DialogContent sx={{ maxHeight: 400, p: 4 }}>
        
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={columns.map(col => col.field)} strategy={verticalListSortingStrategy}>
            <Box sx={{ minHeight: 32 }}>
              {columns.map((col) => (
                <SortableItem
                  key={col.field}
                  col={col}
                  visibilityModel={columnVisibilityModel}
                  setVisibilityModel={setColumnVisibilityModel}
                />
              ))}
            </Box>
          </SortableContext>
        </DndContext>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};