import { ReactNode, useState } from "react";
import { AppHeader } from "@components/app-header";
import { Sidebar } from "@components/side-bar";
import { AppLayoutWrapper, MainColumn, MainContent } from "./index.styled";
import { useMediaQuery, useTheme } from "@mui/material";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
  breadcrumbs?: { linkText: string; toRoute: string }[];
  currentBreadcrumb?: string;
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

  // Pass drawer state to Sidebar and update container class
  const handleDrawerToggle = (isOpen: boolean) => {
    setMobileOpen(isOpen);
  };

  const sidebarClass = isMobile && mobileOpen ? "sidebar-visible" : "";
  const sidebarHiddenClass = isMobile && !mobileOpen ? "sidebar-hidden" : "";

  return (
    <AppLayoutWrapper className={`${className} ${sidebarHiddenClass} ${sidebarClass}`}>
      <Sidebar onDrawerStateChange={handleDrawerToggle} />
      <MainColumn>
        <AppHeader breadcrumbs={breadcrumbs} currentBreadcrumb={currentBreadcrumb} />
        <MainContent>{children}</MainContent>
      </MainColumn>
    </AppLayoutWrapper>
  );
};
