import { List, useMediaQuery, useTheme, CircularProgress } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isOpen, toggle } = useSidebar();
  
  // Notify parent component when drawer state changes
  useEffect(() => {
    if (onDrawerStateChange) {
      onDrawerStateChange(mobileOpen);
    }
  }, [mobileOpen, onDrawerStateChange]);

  const toggleDrawer = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      toggle(); // Use the sidebar context's toggle function
    }
  };

  const navigateToDashboard = useCallback(() => {
    window.location.href = getCoreModuleRoute(CoreModule.dashboard);
  }, []);
  
  return (
    <>
      <SidebarStyled
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : isOpen}
        onClose={toggleDrawer}
      >
        <SidebarTopContainer isMobile={isMobile} isOpen={isMobile ? mobileOpen : isOpen}>
          <div
            className="sidebar-logo sidebar-link"
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={navigateToDashboard}
            tabIndex={0}
            role="button"
            aria-label="Go to dashboard"
          >
            <LogoComponent />
            <Typography className="sidebar-app-name">
              LeadCMS.ai
            </Typography>
          </div>
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
                subheader={<ListSubheaderStyled>{group.header}</ListSubheaderStyled>}
              >
                {group.items.map((menuItem) => (
                  <SidebarLink
                    key={menuItem.id}
                    onClick={() => {
                      menuItem.onClick();
                      if (isMobile) setMobileOpen(false);
                    }}
                    selected={menuItem.isSelected}
                  >
                    <ListItemIconStyled>{menuItem.icon}</ListItemIconStyled>
                    <SidebarLinkText primary={menuItem.label} />
                  </SidebarLink>
                ))}
              </List>
            ))
          )}
        </SidebarMenuScrollArea>
      </SidebarStyled>
    </>
  );
};
