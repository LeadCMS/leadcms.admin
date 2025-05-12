import { Theme as MuiTheme } from "@mui/material/styles";
// or "@material-ui/core/styles" for older versions

import "@mui/material/styles";

// Add custom theme properties
declare module "@mui/material/styles" {
  interface Theme extends MuiTheme {
    palette: MuiTheme["palette"];
    background: {
      primary: string;
      primaryHover: string;
    };
  }
  interface ThemeOptions extends MuiTheme {
    background?: {
      primary?: string;
      primaryHover?: string;
    };
    unstable_sx?: Record<string, unknown>; // Use a more specific type for unstable_sx
  }
}

// Export empty to make this a module
export {};
