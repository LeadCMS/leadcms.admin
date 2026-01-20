import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";

const aResetStyle = `
  text-decoration: none;
  background-color: transparent;
  color: unset;
  :active {
    color: unset;
  }
`;

export const GhostLink = styled(Link)`
  ${aResetStyle};
`;
