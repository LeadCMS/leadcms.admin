import {
  List,
  useMediaQuery,
  useTheme,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useEffect, useCallback } from "react";
import { PanelLeftOpen, Menu } from "lucide-react";
import {
  ListItemIconStyled,
  ListSubheaderStyled,
  SidebarLinkText,
  SidebarLink,
  SidebarStyled,
  SidebarTopContainer,
  SidebarMenuScrollArea,
} from "./index.styled";
import { getCoreModuleRoute, CoreModule } from "lib/router";
import { useSidebar } from "@providers/sidebar-provider";
import { LogoComponent } from "@components/app-header/index.styled";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

interface SidebarMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (navigate: (to: string) => void) => void;
  isSelected: boolean;
}

interface SidebarMenuSection {
  header: string;
  items: SidebarMenuItem[];
}

interface SidebarProps {
  menuItems?: SidebarMenuSection[];
  onDrawerStateChange?: (isOpen: boolean) => void;
  isLoading?: boolean;
}

export const Sidebar = ({
  menuItems = [],
  onDrawerStateChange,
  isLoading = false,
}: SidebarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isOpen, isCollapsed, isMobileOpen, toggleCollapse, toggleMobile } = useSidebar();
  const navigate = useNavigate();

  // Notify parent component when drawer state changes
  useEffect(() => {
    if (onDrawerStateChange) {
      onDrawerStateChange(isMobileOpen);
    }
  }, [isMobileOpen, onDrawerStateChange]);

  const navigateToDashboard = useCallback(() => {
    navigate(getCoreModuleRoute(CoreModule.dashboard));
  }, [navigate]);

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
            {!showCollapsed && <Typography className="sidebar-app-name">LeadCMS.ai</Typography>}
          </div>
          {!isMobile && (
            <Tooltip title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <IconButton onClick={toggleCollapse} size="small" sx={{ ml: 1 }}>
                {isCollapsed ? <Menu /> : <PanelLeftOpen />}
              </IconButton>
            </Tooltip>
          )}
        </SidebarTopContainer>
        <SidebarMenuScrollArea sx={{ pt: 3 }}>
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
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
                sx={{ mb: 2 }}
              >
                {group.items.map((menuItem) => (
                  <Tooltip
                    key={menuItem.id}
                    title={showCollapsed ? menuItem.label : ""}
                    placement="right"
                  >
                    <span>
                      <SidebarLink
                        sx={{
                          ...(showCollapsed && {
                            justifyContent: "center",
                            padding: (theme) => theme.spacing(1, 0),
                          }),
                        }}
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          if (typeof menuItem.onClick === "function") {
                            menuItem.onClick(navigate);
                          }
                          if (isMobile) toggleMobile();
                        }}
                        selected={menuItem.isSelected}
                        isCollapsed={showCollapsed}
                      >
                        <ListItemIconStyled>{menuItem.icon}</ListItemIconStyled>
                        <SidebarLinkText primary={menuItem.label} isCollapsed={showCollapsed} />
                      </SidebarLink>
                    </span>
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
