import { Box, styled } from "@mui/material";
import { PropsWithChildren } from "react";
import "react-toastify/dist/ReactToastify.css";

export const AppLayoutContainerStyled = styled(Box)`
  display: grid;
  height: 100vh;
  grid-template-columns: ${({ theme }) => theme.spacing(64)} 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "header header"
    "sidebar main";
`;

export const AppLayoutContainer = ({ children }: PropsWithChildren) => {
  return <AppLayoutContainerStyled>{children}</AppLayoutContainerStyled>;
};

// Changing this from Box to div to avoid duplicate main element
export const MainContentContainer = styled("div")`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  background-color: ${({ theme: { palette } }) => palette.background.default};
  padding: ${({ theme }) => theme.spacing(1, 3, 6, 3)};
  overflow: auto;
`;
