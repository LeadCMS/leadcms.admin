import React from "react";
import { Box } from "@mui/material";

const NoRecordsDisplay: React.FC<{ visible: boolean; message?: string }> = ({
  visible,
  message,
}) => (
  <Box
    sx={{
      position: "absolute",
      top: 60,
      left: 0,
      width: "100%",
      color: (theme) => theme.palette.text.secondary,
      fontWeight: (theme) => theme.typography.subtitle2.fontWeight,
      textAlign: "center",
      pointerEvents: "none",
      opacity: visible ? 1 : 0,
      transition: "opacity",
      fontSize: (theme) => theme.typography.subtitle1.fontSize,
      zIndex: 10,
    }}
  >
    {message || "No records found"}
  </Box>
);

export default NoRecordsDisplay;
