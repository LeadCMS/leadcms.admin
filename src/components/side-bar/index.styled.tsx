import {
  Drawer,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  styled,
  IconButton,
} from "@mui/material";

export const SidebarStyled = styled(Drawer)(
  ({ theme }) => `
  width: 260px;
  flex-shrink: 0;
  
  .MuiDrawer-paper {
    width: 260px;
    overflow-y: auto;
    height: 100vh;
    box-sizing: border-box;
    border-right: 1px solid ${theme.palette.divider};
    background-color: ${theme.palette.background.paper};
    position: fixed;
    top: 64px; // Adjust based on your header height
    padding-bottom: 64px;
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

export const ListSubheaderStyled = styled(ListSubheader)`
  font-size: ${({ theme }) => theme.typography.subtitle1.fontSize};
`;

export const SidebarLink = styled(ListItemButton)`
  border-radius: ${({ theme }) => theme.spacing(16)};
  height: ${({ theme }) => theme.spacing(10)};
  margin-top: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme: { palette } }) => palette.text.secondary};
  :hover {
    background-color: ${({ theme: { palette } }) => palette.background.primaryHover};
  }

  &.Mui-selected {
    color: ${({ theme: { palette } }) => palette.primary.main};
    background-color: ${({ theme: { palette } }) => palette.background.primary};
  }
` as typeof ListItemButton;

export const SidebarLinkText = styled(ListItemText)`
  .MuiTypography-root {
    font-weight: 600;
  }
` as typeof ListItemText;

export const ListItemIconStyled = styled(ListItemIcon)`
  min-width: ${({ theme }) => theme.spacing(10)};
` as typeof ListItemIcon;
