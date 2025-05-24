import { List, useMediaQuery, useTheme } from "@mui/material";
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
import { useRouteParams } from "typesafe-routes";
import { CoreModule, coreModuleRoute, getCoreModuleRoute } from "lib/router";
import { useSidebar } from "@providers/sidebar-provider";
import { LogoComponent } from "@components/app-header/index.styled";
import Typography from "@mui/material/Typography";

// Import all needed icons
import {
  People,
  Business,
  Inventory,
  Web,
  Link as LinkIcon,
  Comment,
  Unsubscribe,
  Person,
  Info,
  Email,
  Book,
  Newspaper,
  Dashboard,
  MonetizationOn,
  Image as ImageIcon,
} from "@mui/icons-material";

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
}

export const Sidebar = ({ menuItems, onDrawerStateChange }: SidebarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { moduleName } = useRouteParams(coreModuleRoute);
  const { isOpen, toggle } = useSidebar();
  
  // Notify parent component when drawer state changes
  useEffect(() => {
    if (onDrawerStateChange) {
      onDrawerStateChange(mobileOpen);
    }
  }, [mobileOpen, onDrawerStateChange]);

  // Define default menu items if none provided
  if (!menuItems || menuItems.length === 0) {
    const navigateTo = (route: string) => () => {
      window.location.href = route;
    };

    menuItems = [
      {
        header: "MAIN",
        items: [
          {
            id: "dashboard",
            label: "Dashboard",
            icon: <Dashboard />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.dashboard)),
            isSelected: moduleName === CoreModule.dashboard
          }
        ]
      },
      {
        header: "CMS",
        items: [
          {
            id: "content",
            label: "Content",
            icon: <Newspaper />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.content)),
            isSelected: moduleName === CoreModule.content
          },
          {
            id: "comments",
            label: "Comments",
            icon: <Comment />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.comments)),
            isSelected: moduleName === CoreModule.comments
          },
          {
            id: "media",
            label: "Media",
            icon: <ImageIcon />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.media)),
            isSelected: moduleName === CoreModule.media
          },
          {
            id: "links",
            label: "Links",
            icon: <LinkIcon />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.links)),
            isSelected: moduleName === CoreModule.links
          }
        ]
      },
      {
        header: "CRM",
        items: [
          {
            id: "orders",
            label: "Orders",
            icon: <Inventory />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.orders)),
            isSelected: moduleName === CoreModule.orders
          },
          {
            id: "deals",
            label: "Deals",
            icon: <MonetizationOn />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.deals)),
            isSelected: moduleName === CoreModule.deals
          },
          {
            id: "contacts",
            label: "Contacts",
            icon: <People />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.contacts)),
            isSelected: moduleName === CoreModule.contacts
          },
          {
            id: "accounts",
            label: "Accounts",
            icon: <Business />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.accounts)),
            isSelected: moduleName === CoreModule.accounts
          }
        ]
      },
      {
        header: "MARKETING",
        items: [
          {
            id: "emailTemplates",
            label: "Email templates",
            icon: <Email />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.emailTemplates)),
            isSelected: moduleName === CoreModule.emailTemplates
          },
          {
            id: "unsubscribes",
            label: "Unsubscribes",
            icon: <Unsubscribe />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.unsubscribes)),
            isSelected: moduleName === CoreModule.unsubscribes
          },
          {
            id: "domains",
            label: "Domains",
            icon: <Web />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.domains)),
            isSelected: moduleName === CoreModule.domains
          }
        ]
      },
      {
        header: "GENERAL",
        items: [
          {
            id: "users",
            label: "Users",
            icon: <Person />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.users)),
            isSelected: moduleName === CoreModule.users
          },
          {
            id: "activityLogs",
            label: "Activity logs",
            icon: <Book />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.activityLogs)),
            isSelected: moduleName === CoreModule.activityLogs
          },
          {
            id: "about",
            label: "About",
            icon: <Info />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.about)),
            isSelected: moduleName === CoreModule.about
          }
        ]
      }
    ];
  }

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
          {menuItems && menuItems.map((group) => (
            <List
              key={group.header}
              subheader={<ListSubheaderStyled>{group.header}</ListSubheaderStyled>}
            >
              {group.items && group.items.map((menuItem) => (
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
          ))}
        </SidebarMenuScrollArea>
      </SidebarStyled>
    </>
  );
};
