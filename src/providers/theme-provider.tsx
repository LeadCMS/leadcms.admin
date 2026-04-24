import { memo, PropsWithChildren } from "react";
import { createTheme, ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeOptions } from "@mui/material/styles";

export const themeOptions: ThemeOptions = {
  spacing: 4,
  shape: {
    borderRadius: 8, // Modern rounded corners
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: "#6B7280",
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  palette: {
    mode: "light",
    primary: {
      main: "#3878FF",
      light: "#6B9AFF",
      dark: "#2854B2",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#0F172A",
      light: "#1E293B",
      dark: "#020617",
      contrastText: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
      disabled: "#94A3B8",
    },
    info: {
      main: "#3B82F6",
      light: "#60A5FA",
      dark: "#2563EB",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#10B981",
      light: "#34D399",
      dark: "#059669",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#EF4444",
      light: "#F87171",
      dark: "#DC2626",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#F59E0B",
      light: "#FBBF24",
      dark: "#D97706",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
      primary: "#F8FAFC",
      primaryHover: "#F1F5F9",
      secondary: "#FFFFFF",
    } as any,
    grey: {
      50: "#F8FAFC",
      100: "#F1F5F9",
      200: "#E2E8F0",
      300: "#CBD5E1",
      400: "#94A3B8",
      500: "#64748B",
      600: "#475569",
      700: "#334155",
      800: "#1E293B",
      900: "#0F172A",
    },
  },
  shadows: [
    "none",
    "0px 1px 2px 0px rgba(15, 23, 42, 0.05)", // sm
    "0px 1px 3px 0px rgba(15, 23, 42, 0.1), 0px 1px 2px 0px rgba(15, 23, 42, 0.06)", // md
    "0px 4px 6px -1px rgba(15, 23, 42, 0.1), 0px 2px 4px -1px rgba(15, 23, 42, 0.06)", // lg
    "0px 10px 15px -3px rgba(15, 23, 42, 0.1), 0px 4px 6px -2px rgba(15, 23, 42, 0.05)", // xl
    "0px 20px 25px -5px rgba(15, 23, 42, 0.1), 0px 10px 10px -5px rgba(15, 23, 42, 0.04)", // 2xl
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)", // 3xl
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
    "0px 25px 50px -12px rgba(15, 23, 42, 0.25)",
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 8,
          padding: "8px 16px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0px 4px 6px -1px rgba(15, 23, 42, 0.1), 0px 2px 4px -1px rgba(15, 23, 42, 0.06)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 1px 3px 0px rgba(15, 23, 42, 0.1), 0px 1px 2px 0px rgba(15, 23, 42, 0.06)",
          border: "1px solid #E2E8F0",
          transition: "none",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "24px",
          "&:last-child": {
            paddingBottom: "24px",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#CBD5E1",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: "none",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: "0px 20px 25px -5px rgba(15, 23, 42, 0.1), 0px 10px 10px -5px rgba(15, 23, 42, 0.04)",
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "none",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#F8FAFC",
            borderBottom: "1px solid #E2E8F0",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #F1F5F9",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#F8FAFC",
          },
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
