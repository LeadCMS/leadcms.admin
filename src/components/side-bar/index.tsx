import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {useTheme} from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import { PanelRightOpen, PanelLeftOpen, ChevronDown, ChevronRight } from "lucide-react";
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
import { GhostLink } from "@components/ghost-link";

interface SidebarMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
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

const SIDEBAR_SECTIONS_STORAGE_KEY = "sidebar-sections-state";

const getInitialSectionsState = (menuItems: SidebarMenuSection[]): string[] => {
  try {
    const stored = localStorage.getItem(SIDEBAR_SECTIONS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore errors
  }
  // Default: all sections open
  return menuItems.map((section) => section.header);
};

export const Sidebar = ({
  menuItems = [],
  onDrawerStateChange,
  isLoading = false,
}: SidebarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isOpen, isCollapsed, isMobileOpen, toggleCollapse, toggleMobile } = useSidebar();
  const [openSections, setOpenSections] = useState<string[]>(() =>
    getInitialSectionsState(menuItems)
  );

  // Notify parent component when drawer state changes
  useEffect(() => {
    if (onDrawerStateChange) {
      onDrawerStateChange(isMobileOpen);
    }
  }, [isMobileOpen, onDrawerStateChange]);

  // Persist sections state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_SECTIONS_STORAGE_KEY, JSON.stringify(openSections));
    } catch (error) {
      console.error("Failed to save sidebar sections state:", error);
    }
  }, [openSections]);

  const toggleSection = (sectionHeader: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionHeader)
        ? prev.filter((s) => s !== sectionHeader)
        : [...prev, sectionHeader]
    );
  };

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
        <SidebarTopContainer isMobile={isMobile} isOpen={effectiveOpen} isCollapsed={showCollapsed}>
          {!showCollapsed && (
            <GhostLink
              to={getCoreModuleRoute(CoreModule.dashboard)}
              className="sidebar-logo sidebar-link"
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                flex: 1,
              }}
              aria-label="Go to dashboard"
            >
              <LogoComponent />
              <Typography className="sidebar-app-name">LeadCMS</Typography>
            </GhostLink>
          )}

          {!isMobile && (
            <Tooltip title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <IconButton
                onClick={toggleCollapse}
                size="small"
                sx={{
                  ml: showCollapsed ? 2 : 1,
                  pr: showCollapsed ? 2 : 0,
                }}
              >
                {isCollapsed ? <PanelLeftOpen /> : <PanelRightOpen />}
              </IconButton>
            </Tooltip>
          )}
        </SidebarTopContainer>
        <SidebarMenuScrollArea sx={{ pt: 4 }}>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            menuItems.map((group) => {
              const isSectionOpen = openSections.includes(group.header);
              return (
                <Box key={group.header} sx={{ mb: 2 }}>
                  {!showCollapsed && (
                    <ListSubheaderStyled
                      isCollapsed={false}
                      onClick={() => toggleSection(group.header)}
                      sx={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        userSelect: "none",
                        "&:hover": {
                          backgroundColor: (theme) => theme.palette.action.hover,
                        },
                      }}
                    >
                      <span>{group.header}</span>
                      <Box sx={{ mr: 1 }}>
                        {isSectionOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </Box>
                    </ListSubheaderStyled>
                  )}
                  <Collapse in={showCollapsed || isSectionOpen} timeout="auto" unmountOnExit>
                    <List sx={{ pt: 0 }}>
                      {group.items.map((menuItem) => (
                        <Tooltip
                          key={menuItem.id}
                          title={showCollapsed ? menuItem.label : ""}
                          placement="right"
                        >
                          <SidebarLink
                            component={GhostLink}
                            to={menuItem.route}
                            sx={{
                              ...(showCollapsed && {
                                justifyContent: "center",
                                padding: (theme) => theme.spacing(1, 0),
                              }),
                            }}
                            onClick={isMobile ? () => toggleMobile() : undefined}
                            selected={menuItem.isSelected}
                            isCollapsed={showCollapsed}
                          >
                            <ListItemIconStyled>{menuItem.icon}</ListItemIconStyled>
                            <SidebarLinkText primary={menuItem.label} isCollapsed={showCollapsed} />
                          </SidebarLink>
                        </Tooltip>
                      ))}
                    </List>
                  </Collapse>
                </Box>
              );
            })
          )}
        </SidebarMenuScrollArea>
      </SidebarStyled>
    </>
  );
};
