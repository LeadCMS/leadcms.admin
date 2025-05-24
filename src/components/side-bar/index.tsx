import { 
  List, useMediaQuery, useTheme, CircularProgress, IconButton, Tooltip 
} from "@mui/material";
import { useEffect, useCallback } from "react";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import { 
  ListItemIconStyled, 
  ListSubheaderStyled, 
  SidebarLinkText, 
  SidebarLink, 
  SidebarStyled,
  SidebarTopContainer,
  SidebarMenuScrollArea
} from "./index.styled";
import { getCoreModuleRoute, CoreModule } from "lib/router";
import { useSidebar } from "@providers/sidebar-provider";
import { LogoComponent } from "@components/app-header/index.styled";
import Typography from "@mui/material/Typography";

interface SidebarProps {
  menuItems?: {
    header: string;
    items: {
      id: string;
      label: string;
      icon: React.ReactNode;
      onClick: () => void;
      isSelected: boolean;
    }[];
  }[];
  onDrawerStateChange?: (isOpen: boolean) => void;
  isLoading?: boolean;
}

export const Sidebar = ({ 
  menuItems = [], 
  onDrawerStateChange, 
  isLoading = false 
}: SidebarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isOpen, isCollapsed, isMobileOpen, toggleCollapse, toggleMobile } = useSidebar();
  
  // Notify parent component when drawer state changes
  useEffect(() => {
    if (onDrawerStateChange) {
      onDrawerStateChange(isMobileOpen);
    }
  }, [isMobileOpen, onDrawerStateChange]);

  const navigateToDashboard = useCallback(() => {
    window.location.href = getCoreModuleRoute(CoreModule.dashboard);
  }, []);

  const effectiveOpen = isMobile ? isMobileOpen : isOpen;
  const showCollapsed = !isMobile && isCollapsed;
  
  return (
    <>
      <SidebarStyled
        variant={isMobile ? "temporary" : "permanent"}
        open={effectiveOpen}
        onClose={toggleMobile}
        isCollapsed={showCollapsed}
      >
        <SidebarTopContainer isMobile={isMobile} isOpen={effectiveOpen}>
          <div
            className="sidebar-logo sidebar-link"
            style={{ display: "flex", alignItems: "center", cursor: "pointer", flex: 1 }}
            onClick={navigateToDashboard}
            tabIndex={0}
            role="button"
            aria-label="Go to dashboard"
          >
            <LogoComponent />
            {!showCollapsed && (
              <Typography className="sidebar-app-name">
                LeadCMS.ai
              </Typography>
            )}
          </div>
          {!isMobile && (
            <Tooltip title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <IconButton
                onClick={toggleCollapse}
                size="small"
                sx={{ ml: 1 }}
              >
                {isCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
              </IconButton>
            </Tooltip>
          )}
        </SidebarTopContainer>
        <SidebarMenuScrollArea>
          {isLoading ? (
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              height: "100%" 
            }}>
              <CircularProgress />
            </div>
          ) : (
            menuItems.map((group) => (
              <List
                key={group.header}
                subheader={
                  <ListSubheaderStyled isCollapsed={showCollapsed}>
                    {group.header}
                  </ListSubheaderStyled>
                }
              >
                {group.items.map((menuItem) => (
                  <Tooltip 
                    key={menuItem.id}
                    title={showCollapsed ? menuItem.label : ""}
                    placement="right"
                  >
                    <SidebarLink
                      onClick={() => {
                        menuItem.onClick();
                        if (isMobile) toggleMobile();
                      }}
                      selected={menuItem.isSelected}
                      isCollapsed={showCollapsed}
                    >
                      <ListItemIconStyled>{menuItem.icon}</ListItemIconStyled>
                      <SidebarLinkText primary={menuItem.label} isCollapsed={showCollapsed} />
                    </SidebarLink>
                  </Tooltip>
                ))}
              </List>
            ))
          )}
        </SidebarMenuScrollArea>
      </SidebarStyled>
    </>
  );
};
