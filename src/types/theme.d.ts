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
  }
}

// For styled-components
declare module "styled-components" {
  export interface DefaultTheme extends MuiTheme {
    // Your theme properties
  }
}

// Export empty to make this a module
export {};
