import React from "react";
import { Button, ButtonProps, useTheme } from "@mui/material";

interface ToolbarButtonProps extends ButtonProps {
  startIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  startIcon,
  children,
  sx,
  ...props
}) => {
  const theme = useTheme();

  return (
    <Button
      variant="outlined"
      color="secondary"
      startIcon={startIcon}
      sx={{
        backgroundColor: theme.palette.background.secondary,
        borderColor: "#E4E4E7",
        "&:hover": {
          backgroundColor: theme.palette.background.primaryHover,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};
