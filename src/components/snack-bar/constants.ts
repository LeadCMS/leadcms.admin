import type { AlertColor } from "@mui/material/Alert";

export const initialSnackBarParams = {
  message: "",
  isOpen: false,
  severity: "success" as AlertColor,
};

export const fileUnsupportedSnackBarParams = {
  message: "Unsupported file type.",
  isOpen: true,
  severity: "error" as AlertColor,
};

export const uploadFailedSnackBarParams = {
  message: "Upload Failed.",
  isOpen: true,
  severity: "error" as AlertColor,
};

export const uploadSuccessSnackBarParams = {
  message: "Uploaded Successfully.",
  isOpen: true,
  severity: "success" as AlertColor,
};

export const serverErrorSnackBarParams = {
  message: "Server error occurred.",
  isOpen: true,
  severity: "error" as AlertColor,
};

export const noDataErrorSnackBarParams = {
  message: "No data available to upload.",
  isOpen: true,
  severity: "error" as AlertColor,
};
