import { AppBar, styled, Toolbar } from "@mui/material";

export const AppBarStyled = styled(AppBar)`
  position: sticky;
  top: 0;
  z-index: 1100;
  height: 64px;
  background-color: ${({ theme }) => theme.palette.background.default};
  border-bottom: 1px solid
  ${({ theme }) =>
    theme.palette.mode === "dark" ? theme.palette.secondary.light : theme.palette.divider};
  box-shadow: none;
  display: flex;
  justify-content: center;
`;

export const AppBarToolbar = styled(Toolbar)`
  min-height: 64px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

export const LogoImg = styled("img")`
  width: 32px;
  height: 32px;
  display: flex;
`;

export const LogoContainer = styled("div")`
  display: flex;
  align-items: center;
`;

export const LogoComponent = () => (
  <LogoContainer>
    <LogoImg src="/images/icon-192x192.png" alt="LeadCMS Logo" />
  </LogoContainer>
);
