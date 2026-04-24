import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";

export type onCloseFunc = () => void;

interface ErrorDetailsModalProps {
  isOpen: boolean;
  errorDetails: React.ReactNode;
  onClose: onCloseFunc;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactNode;
  },
  ref: React.Ref<unknown>
) {
  return <Fade ref={ref} {...props} />;
});

export const ErrorDetailsModal = ({ isOpen, onClose, errorDetails }: ErrorDetailsModalProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted={false}
      disablePortal={false}
      aria-labelledby="error-dialog-title"
      aria-describedby="error-dialog-content"
    >
      <DialogTitle id="error-dialog-title">
        <Typography>Error Details</Typography>
      </DialogTitle>
      <DialogContent id="error-dialog-content">{errorDetails}</DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>OK</Button>
      </DialogActions>
    </Dialog>
  );
};
