import { memo, PropsWithChildren } from "react";
import { createTheme, CssBaseline, ThemeProvider as MUIThemeProvider } from "@mui/material";
import { ThemeOptions } from "@mui/material/styles";

export const themeOptions: ThemeOptions = {
  spacing: 4,
  mediaQueryPoints: {
    mobileS: "354px",
    mobileM: "480px",
    tablet: "768px",
    laptop: "1024px",
    desktop: "1280px",
    desktopXL: "1536px",
  },
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
    terminal: {
      background: "hsl(220, 13%, 18%)",
      foreground: "hsl(0, 0%, 85%)",
      cursor: "hsl(200, 100%, 60%)",
      black: "hsl(0, 0%, 0%)",
      red: "hsl(0, 70%, 50%)",
      green: "hsl(120, 60%, 40%)",
      yellow: "hsl(45, 100%, 50%)",
      blue: "hsl(210, 100%, 55%)",
      magenta: "hsl(300, 60%, 60%)",
      cyan: "hsl(180, 60%, 60%)",
      white: "hsl(0, 0%, 90%)",
    },
    customAlerts: {
      normal: {
        main: "hsla(210, 88%, 55%, 0.25)",
        light: "hsla(210, 85%, 68%, 0.25)",
        dark: "hsla(213, 89%, 43%, 0.25)",
        contrastText: "hsla(0, 0%, 100%, 1)",
        captionText: "hsla(210, 80%, 35%, 0.5)",
      },
      complete: {
        main: "hsla(97, 68%, 42%, 0.25)",
        light: "hsla(97, 54%, 55%, 0.25)",
        dark: "hsla(97, 66%, 29%, 0.25)",
        contrastText: "hsla(0, 0%, 100%, 1)",
        captionText: "hsla(97, 60%, 22%, 0.5)",
      },
      danger: {
        main: "hsla(0, 67%, 47%, 0.25)",
        light: "hsla(0, 61%, 60%, 0.25)",
        dark: "hsla(0, 67%, 33%, 0.25)",
        contrastText: "hsla(0, 0%, 100%, 1)",
        captionText: "hsla(0, 80%, 30%, 0.5)",
      },
      attention: {
        main: "hsla(36, 100%, 50%, 0.25)",
        light: "hsla(36, 100%, 64%, 0.25)",
        dark: "hsla(36, 100%, 39%, 0.25)",
        contrastText: "hsla(0, 0%, 0%, 0.87)",
        captionText: "hsla(36, 100%, 28%, 0.5)",
      },
    },
    customSegments: {
      MainContainer: {
        default: "#ffffff",
        primary: "#f9fbff",
        primaryHover: "#e6f0ff",
        secondary: "#f1f5ff",
        secondaryHover: "#d9e4ff",
        tertiary: "#cbdcff",
        captionText: "#9aa5b1",
        contrastText: "#1a1f36",
      },
      SubContainer: {
        default: "#f8f9fb",
        primary: "#e9efff",
        primaryHover: "#d6e3ff",
        secondary: "#ced7ff",
        secondaryHover: "#bccaff",
        tertiary: "#a8b9ff",
        captionText: "#7a8495",
        contrastText: "#222a44",
      },
      TileContainer: {
        default: "#f5f7fa",
        primary: "#dce5ff",
        primaryHover: "#c4d1ff",
        secondary: "#abbfff",
        secondaryHover: "#97b0ff",
        tertiary: "#7f9fff",
        captionText: "#6b7385",
        contrastText: "#192a54",
      },
      GridContainer: {
        default: "#f2f4f7",
        primary: "#bac9ff",
        primaryHover: "#a4b7ff",
        secondary: "#7f8eff",
        secondaryHover: "#6d7bff",
        tertiary: "#4655ff",
        captionText: "#4a5270",
        contrastText: "#0f1b44",
      },
      TabularGridContainer: {
        primaryAlt: "#dfe6ff",
        primaryHoverAlt: "#cdd8ff",
        secondaryAlt: "#bac9ff",
        secondaryHoverAlt: "#a4b7ff",
        tertiaryAlt: "#7f8eff",
        tertiaryHoverAlt: "#6d7bff",
        defaultAlt: "#bafff6",
        default: "#f1f3f5",
        primary: "#e3e6e8",
        primaryHover: "#d2d6d9",
        secondary: "#a8adb1",
        secondaryHover: "#7e8489",
        tertiary: "#5a5f63",
        tertiaryHover: "#6b7074",
        gammaClr: "#4e5a6a",
        background: "#2a2f33",
        foreground: "#5c6267",
        captionText: "#3c4043",
        contrastText: "#0f1214",
      },
      TerminalContainer: {
        default: "#f0f2f6",
        primary: "#a1b2ff",
        primaryHover: "#8ea1ff",
        secondary: "#667aff",
        secondaryHover: "#5568ff",
        tertiary: "#3949ff",
        captionText: "#3b4566",
        contrastText: "#0b183d",
      },
      CardContainer: {
        default: "#eff1f5",
        primary: "#EBF2F5",
        primaryAlt: "#FFF",
        primaryHover: "#DAE0E3",
        secondary: "#B8BDBF",
        secondaryHover: "#909496",
        tertiary: "#4E5051",
        tertiaryHover: "#1AEC9C1C",
        captionText: "#353f61",
        contrastText: "#09153a",
      },
      UserContainer: {
        default: "#eceff3",
        primary: "#90CDE3",
        primaryHover: "#44B8E3",
        secondary: "#3d4fff",
        secondaryHover: "#3240ff",
        tertiary: "#40D69D",
        captionText: "#2f3758",
        contrastText: "#081336",
      },
      TitleContainer: {
        default: "#d1d9e6",
        primary: "#394a73",
        secondary: "#273351",
        secondaryHover: "#1e2742",
        tertiary: "#152034",
        captionText: "#b0b9ca",
        contrastText: "#ffffff",
      },
      ProgressContainer: {
        85: {
          ratingClr: "#00FA83",
          negatingClr: "#3D7A5D",
          captionClr: "#11FA83",
          background: "#1F2C1A",
          foreground: "#FFF",
        },
        65: {
          ratingClr: "#FFD700",
          negatingClr: "#A28A00",
          captionClr: "#FFEA70",
          background: "#2F2A1A",
          foreground: "#FFF",
        },
        35: {
          ratingClr: "#F76A1F",
          negatingClr: "#8E4A2D",
          captionClr: "#FB7A30",
          background: "#331C12",
          foreground: "#FFF",
        },
        10: {
          ratingClr: "#FA2517",
          negatingClr: "#AD3932",
          captionClr: "#BF0C00",
          background: "#3C1412",
          foreground: "#FFF",
        },
        0: {
          ratingClr: "#7A1F1A",
          negatingClr: "#521A18",
          captionClr: "#8B211B",
          background: "#2E0C0B",
          foreground: "#FFF",
        },
      },
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
