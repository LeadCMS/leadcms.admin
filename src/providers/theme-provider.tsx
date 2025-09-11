import { memo, PropsWithChildren } from "react";
import { createTheme, CssBaseline, ThemeProvider as MUIThemeProvider } from "@mui/material";
import { ThemeOptions } from "@mui/material/styles";

export const themeOptions: ThemeOptions = {
  spacing: 4,
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h3: {
      fontSize: "36px",
      fontWeight: 600,
      lineHeight: "42px",
    },
    subtitle1: {
      fontSize: "16px",
      fontWeight: 500,
      lineHeight: "20px",
    },
    subtitle2: {
      fontSize: "12px",
      fontWeight: 600,
      lineHeight: "16px",
      color: "#6B7280",
    },
  },
  palette: {
    primary: {
      main: "#3878FF",
      light: "#f0f4ff",
      dark: "#2854B2",
    },
    secondary: {
      main: "#0b0b0d",
      light: "#f8faff",
      dark: "#060A10",
    },
    text: {
      primary: "#0b0b0d",
      secondary: "#0b0b0ddb",
      disabled: "rgba(0, 0, 0, 0.38)",
    },
    info: {
      main: "#2196F3",
      light: "#64B6F7",
      dark: "#0B79D0",
      contrastText: "#FFF",
    },
    success: {
      main: "#52AF21",
      light: "#7BC652",
      dark: "#3B7E17",
      contrastText: "#FFF",
    },
    error: {
      main: "#C82828",
      light: "#D55858",
      dark: "#8E1C1C",
      contrastText: "#FFF",
    },
    warning: {
      main: "#ff9800",
      light: "#FFB547",
      dark: "#C77700",
      contrastText: "rgba(0, 0, 0, 0.87)",
    },
    background: {
      default: "#ffffff",
      primary: "#fbfcff",
      primaryHover: "#F1F2F4",
      secondary: "#FAFCFF",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          paddingLeft: "23px",
        },
      },
    },
  },
} as ThemeOptions;

const mainTheme = createTheme(themeOptions);

export const ThemeProvider = memo(function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <>
      <CssBaseline />
      <MUIThemeProvider theme={mainTheme}>{children}</MUIThemeProvider>
    </>
  );
});
