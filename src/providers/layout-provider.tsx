import { createContext, useContext, useState, PropsWithChildren } from "react";

interface LayoutContextType {
  fullWidth: boolean;
  setFullWidth: (fullWidth: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: PropsWithChildren) => {
  const [fullWidth, setFullWidth] = useState(false);

  return (
    <LayoutContext.Provider value={{ fullWidth, setFullWidth }}>{children}</LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};
