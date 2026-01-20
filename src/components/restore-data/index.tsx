import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Fade from "@mui/material/Fade";
import { RestoreDataProps } from "./types";
import React from "react";
import { TransitionProps } from "@mui/material/transitions";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Fade ref={ref} {...props} />;
});

export const RestoreDataModal = ({ isOpen, onClose }: RestoreDataProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={() => onClose(false)}
      TransitionComponent={Transition}
      keepMounted={false}
      disablePortal={false}
      aria-labelledby="restore-dialog-title"
      aria-describedby="restore-dialog-description"
    >
      <DialogTitle id="restore-dialog-title">{"Restore Draft Version"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="restore-dialog-description">
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
