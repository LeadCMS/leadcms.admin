import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const SIDEBAR_STORAGE_KEY = "sidebar-collapsed-state";

interface SidebarContextType {
  isOpen: boolean;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  toggleCollapse: () => void;
  toggleMobile: () => void;
  open: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const getInitialCollapsedState = (): boolean => {
  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : false;
  } catch {
    return false;
  }
};

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsedState);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(isCollapsed));
    } catch (error) {
      console.error("Failed to save sidebar state:", error);
    }
  }, [isCollapsed]);

  const toggle = () => setIsOpen((prev) => !prev);
  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isCollapsed,
        isMobileOpen,
        toggle,
        toggleCollapse,
        toggleMobile,
        open,
        close,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
