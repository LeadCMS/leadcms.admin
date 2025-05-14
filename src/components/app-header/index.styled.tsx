import { AppBar, styled, Toolbar } from "@mui/material";
import { Logout } from "@mui/icons-material";

export const AppBarStyled = styled(AppBar)`
  grid-area: header;
  position: static;
  padding-right: ${({ theme }) => theme.spacing(3)};
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

export const AppBarToolbar = styled(Toolbar)`
  justify-content: space-between;
  min-height: 64px;
`;

export const LogoutStyled = styled(Logout)`
  vertical-align: middle;
  cursor: pointer;
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
    <LogoImg 
      src="/images/icon-192x192.png" 
      alt="LeadCMS Logo" 
    />
  </LogoContainer>
);
