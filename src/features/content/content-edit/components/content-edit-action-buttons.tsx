import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService, useCoreModuleNavigation } from "@hooks";
import { showApiError } from "@utils/api-error-parser";
import { CoreModule } from "@lib/router";
import { Trash2, XCircle, Save, Copy, Languages, Sparkles } from "lucide-react";

export interface ContentEditActionButtonsProps {
  // Form state
  isSubmitting: boolean;
  wasModified: boolean;
  coverWasModified: boolean;
  isSaving: boolean;
  activeSaveMode: "stay" | "close" | null;
  // Content information
  id?: string | null;
  // Mode flags
  isCreateMode: boolean;
  isDuplicateMode: boolean;
  isTranslationMode: boolean;
  hasMultipleLanguages: boolean;
  hasAIAssistance: boolean;
  // Handlers
  onDelete?: () => void;
  onDuplicate?: () => void;
  onTranslate?: () => void;
  onEditWithAI?: () => void;
  onSave?: () => void;
  onSaveAndClose?: () => void;
}

export const ContentEditActionButtons = ({
  isSubmitting,
  wasModified,
  coverWasModified,
  isSaving,
  activeSaveMode,
  id,
  isCreateMode,
  isDuplicateMode,
  isTranslationMode,
  hasMultipleLanguages,
  hasAIAssistance,
  onDelete,
  onDuplicate,
  onTranslate,
  onEditWithAI,
  onSave,
  onSaveAndClose,
}: ContentEditActionButtonsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const handleNavigation = useCoreModuleNavigation();

  const handleDelete = async () => {
    if (!id) return;
    try {
      await client.api.contentDelete(parseInt(id));
      notificationsService.success("Content deleted successfully");
      handleNavigation(CoreModule.content);
    } catch (error) {
      showApiError(error, notificationsService, undefined, "Failed to delete content");
    }
  };

  const handleDuplicate = () => {
    if (!id) return;
    navigate(`/content/${id}/duplicate`);
  };

  const isSaveLoading = isSaving && activeSaveMode === "stay";
  const isSaveAndCloseLoading = isSaving && activeSaveMode === "close";

  return (
    <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", gap: 2 }}>
      <Box sx={{ pl: { sm: 4 } }}>
        {!isCreateMode && !isDuplicateMode && !isTranslationMode && (
          <>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 />}
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isSubmitting}
              size="medium"
              sx={{ mr: 2 }}
            >
              Delete
            </Button>
          </>
        )}
        {!isCreateMode && !isDuplicateMode && !isTranslationMode && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Copy />}
            onClick={onDuplicate || handleDuplicate}
            disabled={isSubmitting}
            size="medium"
            sx={{ mr: 2 }}
          >
            Duplicate
          </Button>
        )}
        {hasMultipleLanguages && !isCreateMode && !isDuplicateMode && !isTranslationMode && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Languages />}
            onClick={onTranslate}
            disabled={isSubmitting}
            size="medium"
            sx={{ mr: 2 }}
          >
            Translate
          </Button>
        )}
        {hasAIAssistance && !isCreateMode && !isDuplicateMode && !isTranslationMode && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Sparkles />}
            onClick={onEditWithAI}
            disabled={isSubmitting}
            size="medium"
          >
            Edit with AI
          </Button>
        )}

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-content-dialog-title"
          aria-describedby="delete-content-dialog-description"
        >
          <DialogTitle id="delete-content-dialog-title">Delete Content</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-content-dialog-description">
              Are you sure you want to delete this content? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setDeleteDialogOpen(false);
                if (onDelete) {
                  onDelete();
                } else {
                  await handleDelete();
                }
              }}
              color="error"
              variant="contained"
              autoFocus
              disabled={isSubmitting}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Box sx={{ display: "flex", gap: 2, pr: { sm: 4 } }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleNavigation(CoreModule.content)}
          disabled={isSubmitting}
          startIcon={<XCircle />}
          size="medium"
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          color="primary"
          disabled={!(wasModified || coverWasModified) || isSubmitting}
          startIcon={isSaveLoading ? <CircularProgress size={16} /> : <Save />}
          size="medium"
          onClick={onSave}
        >
          {isSaveLoading ? "Saving..." : "Save"}
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!(wasModified || coverWasModified) || isSubmitting}
          startIcon={isSaveAndCloseLoading ? <CircularProgress size={16} /> : <Save />}
          size="medium"
          onClick={onSaveAndClose}
        >
          {isSaveAndCloseLoading ? "Saving..." : "Save and Close"}
        </Button>
      </Box>
    </Box>
  );
};
