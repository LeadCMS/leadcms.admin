import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
  Button,
  Fade,
} from "@mui/material";
import { RestoreDataProps } from "./types";
import React from "react";
import { TransitionProps } from "@mui/material/transitions";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Fade ref={ref} {...props} />;
});

export const RestoreDataModal = ({ isOpen, onClose }: RestoreDataProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={() => onClose(false)}
      TransitionComponent={Transition}
      keepMounted
    >
      <DialogTitle>{"Restore Draft Version"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Would you like to restore the locally saved draft version and continue editing?
        </DialogContentText>
        <DialogContentText>&nbsp;</DialogContentText>
        <DialogContentText>
          Any unsaved changes made after the last save will be lost. Click &apos;Restore&apos; to
          continue editing the draft, or &apos;Cancel&apos; to discard the draft and start a new
          one.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button onClick={() => onClose(true)}>Restore</Button>
      </DialogActions>
    </Dialog>
  );
};
