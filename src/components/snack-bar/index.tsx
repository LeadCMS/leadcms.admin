import { forwardRef, SyntheticEvent, useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { type AlertColor, type AlertProps } from "@mui/material/Alert";
import { CoreModule } from "lib/router";
import { useCoreModuleNavigation } from "@hooks";

interface SnackbarProps {
  message: string;
  severerity: AlertColor;
  isOpen: boolean;
  navigateTo: CoreModule;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const CustomizedSnackbar = ({ message, severerity, isOpen, navigateTo }: SnackbarProps) => {
  const [open, setOpen] = useState(isOpen);
  const handleNavigation = useCoreModuleNavigation();

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleClose = (event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
    if (severerity === "success") {
      handleNavigation(navigateTo);
    }
  };

  return (
    <Stack spacing={2}>
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={20000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={severerity}>
          {message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};
