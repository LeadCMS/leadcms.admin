import {
  Drawer,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  styled,
  IconButton,
} from "@mui/material";

export const SidebarTopContainer = styled("div")<{
  isMobile?: boolean;
  isOpen?: boolean;
}>(({ theme, isMobile, isOpen }) => `
  display: flex;
  align-items: center;
  height: 64px;
  min-height: 64px;
  max-height: 64px;
  padding-left: 16px;
  padding-right: 16px;
  border-bottom: 1px solid ${theme.palette.mode === "dark"
    ? theme.palette.secondary.light
    : theme.palette.divider};
  background: ${theme.palette.mode === "dark"
    ? theme.palette.secondary.main
    : theme.palette.background.default};
  z-index: 1;
  .sidebar-logo {
    display: none;
  }
  .sidebar-app-name {
    font-weight: bold;
    font-size: 1.25rem;
    color: ${theme.palette.primary.main};
    margin-left: ${(isMobile && isOpen) ? "40px" : "0"};
    transition: margin 0.2s;
  }
  @media (min-width: ${theme.breakpoints.values.md}px) {
    .sidebar-logo {
      display: block;
      margin-right: 8px;
    }
    .sidebar-app-name {
      margin-left: 0;
    }
  }
  @media (max-width: ${theme.breakpoints.values.md - 1}px) {
    .sidebar-logo {
      display: none;
    }
  }
`);

export const SidebarMenuScrollArea = styled("div")`
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

export const SidebarStyled = styled(Drawer)<{ isCollapsed?: boolean }>(
  ({ theme, isCollapsed }) => `
  width: ${isCollapsed ? "72px" : "260px"};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  .MuiDrawer-paper {
    width: ${isCollapsed ? "72px" : "260px"};
    display: flex;
    flex-direction: column;
    height: 100vh;
    box-sizing: border-box;
    border-right: 1px solid ${theme.palette.divider};
    background-color: ${theme.palette.background.default};
    position: fixed;
    top: 0;
    padding-bottom: 0;
    transition: width 0.3s ease;
    overflow-x: hidden;
  }
`
);

export const MobileDrawerToggle = styled(IconButton)`
  position: fixed;
  top: ${({ theme }) => theme.spacing(2)};
  left: ${({ theme }) => theme.spacing(2)};
  z-index: 1201;
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: white;
  &:hover {
    background-color: ${({ theme }) => theme.palette.primary.dark};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    display: none;
  }
`;

export const ListSubheaderStyled = styled(ListSubheader)<{ isCollapsed?: boolean }>`
  font-size: ${({ theme }) => theme.typography.subtitle1.fontSize};
  display: ${({ isCollapsed }) => isCollapsed ? "none" : "block"};
`;

export const SidebarLink = styled(ListItemButton)<{ isCollapsed?: boolean }>`
  border-radius: ${({ theme }) => theme.spacing(16)};
  height: ${({ theme }) => theme.spacing(10)};
  margin-top: ${({ theme }) => theme.spacing(1)};
  margin-left: ${({ theme, isCollapsed }) => isCollapsed ? theme.spacing(1) : "0"};
  margin-right: ${({ theme, isCollapsed }) => isCollapsed ? theme.spacing(1) : "0"};
  color: ${({ theme: { palette } }) => palette.text.secondary};
  min-width: ${({ isCollapsed }) => isCollapsed ? "56px" : "auto"};
  justify-content: ${({ isCollapsed }) => isCollapsed ? "center" : "flex-start"};
  padding-left: ${({ theme, isCollapsed }) => isCollapsed ? "0" : theme.spacing(2)};
  :hover {
    background-color: ${({ theme: { palette } }) => palette.background.primaryHover};
  }

  &.Mui-selected {
    color: ${({ theme: { palette } }) => palette.primary.main};
    background-color: ${({ theme: { palette } }) => palette.background.primary};
  }
` as typeof ListItemButton;

export const SidebarLinkText = styled(ListItemText)<{ isCollapsed?: boolean }>`
  .MuiTypography-root {
    font-weight: 600;
  }
  display: ${({ isCollapsed }) => isCollapsed ? "none" : "block"};
` as typeof ListItemText;

export const ListItemIconStyled = styled(ListItemIcon)`
  min-width: ${({ theme }) => theme.spacing(10)};
` as typeof ListItemIcon;
