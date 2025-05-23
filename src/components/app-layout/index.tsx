import { ReactNode, useState } from "react";
import { AppHeader } from "@components/app-header";
import { Sidebar } from "@components/side-bar";
import { ContentArea, HeaderArea, SidebarArea } from "./index.styled";
import { AppLayoutWrapper } from "./index.styled";
import { useMediaQuery, useTheme } from "@mui/material";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export const AppLayout = ({ children, className = "" }: AppLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = location.pathname.startsWith("/auth");

  if (isAuthPage) {
    return <>{children}</>;
  }
  
  // Pass drawer state to Sidebar and update container class
  const handleDrawerToggle = (isOpen: boolean) => {
    setMobileOpen(isOpen);
  };

  const sidebarClass = isMobile && mobileOpen ? "sidebar-visible" : "";
  const sidebarHiddenClass = isMobile && !mobileOpen ? "sidebar-hidden" : "";

  return (
    <AppLayoutWrapper className={`${className} ${sidebarHiddenClass} ${sidebarClass}`}>
      <HeaderArea>
        <AppHeader />
      </HeaderArea>
      <SidebarArea>
        <Sidebar onDrawerStateChange={handleDrawerToggle} />
      </SidebarArea>
      <ContentArea>
        {children}
      </ContentArea>
    </AppLayoutWrapper>
  );
};
