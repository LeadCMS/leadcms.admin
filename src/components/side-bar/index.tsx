import { List, useMediaQuery, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { 
  ListItemIconStyled, 
  ListSubheaderStyled, 
  MobileDrawerToggle, 
  SidebarLinkText, 
  SidebarLink, 
  SidebarStyled 
} from "./index.styled";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useRouteParams } from "typesafe-routes";
import { CoreModule, coreModuleRoute, getCoreModuleRoute } from "lib/router";
import { useSidebar } from "@providers/sidebar-provider";

// Import all needed icons
import {
  People,
  Business,
  Inventory,
  Web,
  Link,
  Comment,
  Unsubscribe,
  Person,
  Info,
  Email,
  Book,
  Newspaper,
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
        header: "CMS",
        items: [
          {
            id: "blog",
            label: "Content",
            icon: <Newspaper />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.blog)),
            isSelected: moduleName === CoreModule.blog
          },
          {
            id: "comments",
            label: "Comments",
            icon: <Comment />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.comments)),
            isSelected: moduleName === CoreModule.comments
          },
          {
            id: "links",
            label: "Links",
            icon: <Link />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.links)),
            isSelected: moduleName === CoreModule.links
          }
        ]
      },
      {
        header: "CRM",
        items: [
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
          },
          {
            id: "orders",
            label: "Orders",
            icon: <Inventory />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.orders)),
            isSelected: moduleName === CoreModule.orders
          },
          {
            id: "domains",
            label: "Domains",
            icon: <Web />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.domains)),
            isSelected: moduleName === CoreModule.domains
          },
          {
            id: "activityLogs",
            label: "Activity logs",
            icon: <Book />,
            onClick: navigateTo(getCoreModuleRoute(CoreModule.activityLogs)),
            isSelected: moduleName === CoreModule.activityLogs
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
  
  return (
    <>
      {/* Only show toggle button on mobile */}
      {isMobile && (
        <MobileDrawerToggle onClick={toggleDrawer}>
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </MobileDrawerToggle>
      )}
      
      <SidebarStyled
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : isOpen} // Use isOpen from context
        onClose={toggleDrawer}
      >
        {menuItems && menuItems.map((group) => (
          <List
            key={group.header}
            subheader={<ListSubheaderStyled>{group.header}</ListSubheaderStyled>}
          >
            {group.items && group.items.map((item) => (
              <SidebarLink
                key={item.id}
                onClick={() => {
                  item.onClick();
                  if (isMobile) setMobileOpen(false);
                }}
                selected={item.isSelected}
              >
                <ListItemIconStyled>{item.icon}</ListItemIconStyled>
                <SidebarLinkText primary={item.label} />
              </SidebarLink>
            ))}
          </List>
        ))}
      </SidebarStyled>
    </>
  );
};
