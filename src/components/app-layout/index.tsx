import { ReactNode, useEffect, useState } from "react";
import { AppHeader } from "@components/app-header";
import { Sidebar } from "@components/side-bar";
import { AppLayoutWrapper, MainColumn, MainContent } from "./index.styled";
import { useMediaQuery, useTheme } from "@mui/material";
import { buildMenuItems } from "../../utils/build-menu-items";
import { useRouteParams } from "typesafe-routes";
import { coreModuleRoute } from "@lib/router";
import { useRequestContext } from "@providers/request-provider";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
  breadcrumbs?: { linkText: string; toRoute: string }[];
  currentBreadcrumb?: string;
}

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isSelected: boolean;
};

interface SidebarMenuSection {
  header: string;
  items: MenuItem[];
}

export const AppLayout = ({
  children,
  className = "",
  breadcrumbs = [],
  currentBreadcrumb = "",
}: AppLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<SidebarMenuSection[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const { moduleName } = useRouteParams(coreModuleRoute);
  const { client } = useRequestContext();

  useEffect(() => {
    async function fetchSwaggerAndBuildMenu() {
      setMenuLoading(true);
      try {
        // Use the backend swagger endpoint, e.g. /swagger/v1/swagger.json
        const swaggerUrl = `${client.baseUrl?.replace(/\/$/, "")}/swagger/v1/swagger.json`;
        const items = (await buildMenuItems(swaggerUrl, moduleName))
          .filter(Boolean) as SidebarMenuSection[];
        setMenuItems(items);
      } finally {
        setMenuLoading(false);
      }
    }
    fetchSwaggerAndBuildMenu();
  }, [moduleName, client.baseUrl]);

  // Pass drawer state to Sidebar and update container class
  const handleDrawerToggle = (isOpen: boolean) => {
    setMobileOpen(isOpen);
  };

  const sidebarClass = isMobile && mobileOpen ? "sidebar-visible" : "";
  const sidebarHiddenClass = isMobile && !mobileOpen ? "sidebar-hidden" : "";

  return (
    <AppLayoutWrapper className={`${className} ${sidebarHiddenClass} ${sidebarClass}`}>
      <Sidebar 
        onDrawerStateChange={handleDrawerToggle} 
        menuItems={menuItems} 
        isLoading={menuLoading} 
      />
      <MainColumn>
        <AppHeader breadcrumbs={breadcrumbs} currentBreadcrumb={currentBreadcrumb} />
        <MainContent>{children}</MainContent>
      </MainColumn>
    </AppLayoutWrapper>
  );
};
