import { styled } from "@mui/material/styles";

export const AppLayoutWrapper = styled("div")`
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
`;

export const HeaderArea = styled("header")`
  position: sticky;
  top: 0;
  z-index: 1100;
  height: 64px;
  width: 100%;
`;

export const SidebarArea = styled("aside")`
  position: relative;
  height: calc(100vh - 64px);
  overflow-y: auto;
`;

export const MainColumn = styled("div")`
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  min-width: 0;
  height: 100vh;
  overflow: hidden;
`;

export const MainContent = styled("main")<{ fullWidth?: boolean }>`
  flex: 1 1 0%;
  overflow-y: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: ${({ theme, fullWidth }) => (fullWidth ? 0 : theme.spacing(2))};
  background-color: ${({ theme }) => theme.palette.background.primary};
  box-sizing: border-box;
`;

export const SkipLink = styled("a")`
  position: absolute;
  top: -40px;
  left: 0;
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.primary.contrastText};
  padding: ${({ theme }) => theme.spacing(1, 2)};
  text-decoration: none;
  z-index: 9999;
  font-weight: 600;
  border-radius: 0 0 ${({ theme }) => theme.spacing(1)} 0;
  transition: top 0.2s ease;

  &:focus {
    top: 0;
    outline: 2px solid ${({ theme }) => theme.palette.primary.dark};
    outline-offset: 2px;
  }
`;
