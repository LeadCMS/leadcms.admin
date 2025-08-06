import { TypeBackground } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypeBackground {
    primary: string;
    primaryHover: string;
    secondary?: string;
  }
}
