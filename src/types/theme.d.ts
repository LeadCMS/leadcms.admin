import { Palette, PaletteOptions, Theme as MuiTheme, ThemeOptions } from "@mui/material/styles";
/* or "@material-ui/core/styles" for older versions */

import "@mui/material/styles";

// Add custom theme properties
declare module "@mui/material/styles" {
  interface Theme extends MuiTheme {
    mediaQueryPoints: {
      mobileS: string;
      mobileM: string;
      tablet: string;
      laptop: string;
      desktop: string;
      desktopXL: string;
    };
    palette: MuiTheme["palette"];
    background: {
      primary: string;
      primaryHover: string;
    };
  }

  interface ThemeOptions extends MuiTheme {
    mediaQueryPoints?: {
      mobileS?: string;
      mobileM?: string;
      tablet?: string;
      laptop?: string;
      desktop?: string;
      desktopXL?: string;
    };
    palette: MuiTheme["palette"];
    background?: {
      primary?: string;
      primaryHover?: string;
    };
    unstable_sx?: Record<string, unknown>; // Use a more specific type for unstable_sx
  }
}

declare module "@mui/material/styles" {
  interface Alert {
    base?: string;
    main?: string;
    light?: string;
    dark?: string;
    defaultText?: string;
    captionText?: string;
    contrastText?: string;
  }

  interface CustomColorSegment {
    default?: string;
    primary?: string;
    primaryHover?: string;
    secondary?: string;
    secondaryHover?: string;
    tertiary?: string;
    tertiaryHover?: string;
    defaultAlt?: string;
    primaryAlt?: string;
    primaryHoverAlt?: string;
    secondaryAlt?: string;
    secondaryHoverAlt?: string;
    tertiaryAlt?: string;
    tertiaryHoverAlt?: string;
    gammaClr?: string;
    background?: string;
    foreground?: string;
    captionText?: string;
    contrastText?: string;
  }

  type ProgressionCtg = {
    ratingClr: string;
    negatingClr?: string;
    captionClr?: string;
    background?: string;
    foreground?: string;
  };

  interface ProgressSchema {
    85: ProgressionCtg;
    65: ProgressionCtg;
    35: ProgressionCtg;
    10: ProgressionCtg;
    0: ProgressionCtg;
  }

  interface Palette {
    terminal?: {
      background?: string;
      foreground?: string;
      cursor?: string;
      black?: string;
      red?: string;
      green?: string;
      yellow?: string;
      blue?: string;
      magenta?: string;
      cyan?: string;
      white?: string;
    };
  }

  interface Palette {
    terminal?: Palette["terminal"];
    customAlerts?: {
      normal?: Alert;
      complete?: Alert;
      danger?: Alert;
      attention?: Alert;
    };
    customSegments?: {
      MainContainer?: CustomColorSegment;
      SubContainer?: CustomColorSegment;
      TileContainer?: CustomColorSegment;
      GridContainer?: CustomColorSegment;
      TabularGridContainer?: CustomColorSegment;
      TerminalContainer?: CustomColorSegment;
      CardContainer?: CustomColorSegment;
      UserContainer?: CustomColorSegment;
      TitleContainer?: CustomColorSegment;
      ProgressContainer?: ProgressSchema;
    };
  }

  interface PaletteOptions {
    terminal?: Palette["terminal"];
    customAlerts?: {
      normal?: Alert;
      complete?: Alert;
      danger?: Alert;
      attention?: Alert;
    };
    customSegments?: {
      MainContainer?: CustomColorSegment;
      SubContainer?: CustomColorSegment;
      TileContainer?: CustomColorSegment;
      GridContainer?: CustomColorSegment;
      TabularGridContainer?: CustomColorSegment;
      TerminalContainer?: CustomColorSegment;
      CardContainer?: CustomColorSegment;
      UserContainer?: CustomColorSegment;
      TitleContainer?: CustomColorSegment;
      ProgressContainer?: ProgressSchema;
    };
  }
}

// Export empty to make this a module
export {};
