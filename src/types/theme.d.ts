import { Theme as MuiTheme } from "@mui/material/styles";
// or "@material-ui/core/styles" for older versions

import "@mui/material/styles";

// Add custom theme properties
declare module "@mui/material/styles" {
  interface Theme extends MuiTheme {
    palette: MuiTheme["palette"] & {
      background: MuiTheme["palette"]["background"] & {
        primary?: string;
        primaryHover?: string;
        secondary?: string;
      };
    };
  }
  interface ThemeOptions {
    palette?: {
      background?: {
        primary?: string;
        primaryHover?: string;
        secondary?: string;
      };
    };
  }
}

// Export empty to make this a module
export {};
