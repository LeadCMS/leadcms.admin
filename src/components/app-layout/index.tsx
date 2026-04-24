import { ReactNode, useState } from "react";
import { useParams } from "react-router-dom";
import { AppHeader } from "@components/app-header";
import { Sidebar } from "@components/side-bar";
import { AppLayoutWrapper, MainColumn, MainContent, SkipLink } from "./index.styled";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { buildMenuItems } from "../../utils/build-menu-items";
import { ModuleRouteParams } from "@lib/router";
import { SidebarProvider } from "@providers/sidebar-provider";
import { useConfig } from "@providers/config-provider";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
  breadcrumbs?: { linkText: string; toRoute: string }[];
  currentBreadcrumb?: string;
  fullWidth?: boolean;
}

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (navigate: (to: string) => void) => void;
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
  fullWidth = false,
}: AppLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { moduleName } = useParams<ModuleRouteParams>();
  const { config, loading: configLoading } = useConfig();

  const menuItems = buildMenuItems(
    config?.entities,
    moduleName ?? "",
    config?.capabilities
  ) as SidebarMenuSection[];
  const menuLoading = configLoading;

  // Pass drawer state to Sidebar and update container class

  const handleDrawerToggle = (isOpen: boolean) => {
    setMobileOpen(isOpen);
  };

  const sidebarClass = isMobile && mobileOpen ? "sidebar-visible" : "";
  const sidebarHiddenClass = isMobile && !mobileOpen ? "sidebar-hidden" : "";

  return (
    <SidebarProvider>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <AppLayoutWrapper className={`${className} ${sidebarHiddenClass} ${sidebarClass}`}>
        <Sidebar
          onDrawerStateChange={handleDrawerToggle}
          menuItems={menuItems}
          isLoading={menuLoading}
        />
        <MainColumn>
          <AppHeader breadcrumbs={breadcrumbs} currentBreadcrumb={currentBreadcrumb} />
          <MainContent id="main-content" fullWidth={fullWidth} role="main">
            {children}
          </MainContent>
        </MainColumn>
      </AppLayoutWrapper>
    </SidebarProvider>
  );
};
