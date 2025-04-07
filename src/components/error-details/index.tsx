import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  Typography,
} from "@mui/material";
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
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Fade ref={ref} {...props} />;
});

export const ErrorDetailsModal = ({ isOpen, onClose, errorDetails }: ErrorDetailsModalProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose} TransitionComponent={Transition}>
      <DialogTitle>
        <Typography>Error Details</Typography>
      </DialogTitle>
      <DialogContent>{errorDetails}</DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>OK</Button>
      </DialogActions>
    </Dialog>
  );
};
