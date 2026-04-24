import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { DeleteButtonContainer } from "./index.styled";
import { Trash2, Edit } from "lucide-react";
import { useCoreModuleNavigation, useNotificationsService } from "@hooks";
import { HttpResponse, ProblemDetails } from "@lib/network/swagger-client";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { execDeleteWithToast } from "utils/general-helper";
import { useParams, useNavigate } from "react-router-dom";
import { ModuleRouteParams } from "@lib/router";

type DataDeleteProps = {
  header: string;
  description: string;
  itemId: number | string;
  entity: string;
  successNavigationRoute: string;
  handleDeleteAsync: (id: number | string) => Promise<HttpResponse<void, void | ProblemDetails>>;
  showEditButton?: boolean;
  showOnlyButtons?: boolean;
  onDeleted?: () => void;
};

type DataDeleteConfProps = {
  entity: string;
  setIsConfirmed: (isConfirmed: boolean) => void;
  openConfirmation: boolean;
  setOpenConfirmation: (open: boolean) => void;
};

export const DataDeleteConfirmation = ({
  entity,
  setIsConfirmed,
  openConfirmation,
  setOpenConfirmation,
}: DataDeleteConfProps) => {
  const handleConfirmationClose = () => {
    setOpenConfirmation(false);
  };

  const handleConfirmation = async () => {
    setOpenConfirmation(false);
    setIsConfirmed(true);
  };

  return (
    <>
      <Dialog
        open={openConfirmation}
        onClose={handleConfirmationClose}
        keepMounted={false}
        disablePortal={false}
        aria-labelledby="delete-confirmation-title"
        aria-describedby="delete-confirmation-description"
      >
        <DialogTitle id="delete-confirmation-title">{`Deleting ${entity}`}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-confirmation-description">
            {`Are you sure you want to delete this ${entity}?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmationClose} autoFocus variant="outlined">
            No
          </Button>
          <Button onClick={handleConfirmation} autoFocus variant="outlined" color="error">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const DataManagementBlock = ({
  header,
  description,
  itemId,
  entity,
  successNavigationRoute,
  handleDeleteAsync,
  showEditButton = true,
  showOnlyButtons = false,
  onDeleted,
}: DataDeleteProps) => {
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const handleNavigation = useCoreModuleNavigation();
  const navigate = useNavigate();
  const { moduleName } = useParams<ModuleRouteParams>();

  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (isConfirmed) {
      (async () => {
        await execDeleteWithToast(deleteRecord, notificationsService, entity, showErrorModal);
      })();
    }
  }, [isConfirmed]);

  const handleDelete = () => {
    setOpenConfirmation(true);
  };

  const deleteRecord = async () => {
    try {
      setIsDeleting(true);
      await handleDeleteAsync(itemId);
      if (onDeleted) {
        onDeleted();
      }
      handleNavigation(successNavigationRoute);
    } catch (error) {
      setIsDeleting(false);
      throw error;
    }
  };

  const editRecord = async () => {
    navigate(`/${moduleName}/${itemId}/edit`);
  };

  return (
    <>
      {showOnlyButtons ? (
        <Box sx={{ display: "flex", width: "100%" }}>
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
            <Button
              disabled={isDeleting}
              startIcon={<Trash2 />}
              color="error"
              onClick={handleDelete}
              variant="outlined"
              size="large"
            >
              Delete
            </Button>
          </Box>
          {showEditButton && (
            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <Button startIcon={<Edit />} variant="outlined" size="large" onClick={editRecord}>
                Edit
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Grid>
              <Typography gutterBottom variant="h6" component="div">
                {header}
              </Typography>
            </Grid>
            <Grid>
              <Typography>{description}</Typography>
            </Grid>
          </CardContent>
          <CardActions>
            <DeleteButtonContainer>
              <Button
                disabled={isDeleting}
                startIcon={<Trash2 />}
                variant="contained"
                color="error"
                onClick={handleDelete}
                size="small"
              >
                {`Delete ${entity}`}
              </Button>
            </DeleteButtonContainer>
            {showEditButton && (
              <DeleteButtonContainer>
                <Button startIcon={<Edit />} size="small" variant="contained" onClick={editRecord}>
                  {`Edit ${entity}`}
                </Button>
              </DeleteButtonContainer>
            )}
          </CardActions>
        </Card>
      )}
      <DataDeleteConfirmation
        entity={entity}
        openConfirmation={openConfirmation}
        setIsConfirmed={setIsConfirmed}
        setOpenConfirmation={setOpenConfirmation}
      ></DataDeleteConfirmation>
    </>
  );
};
