import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import useLocalStorage from "use-local-storage";

export type GlobalLanguageFilterValue = string | "all";

interface GlobalLanguageFilterContextType {
  selectedLanguage: GlobalLanguageFilterValue;
  setSelectedLanguage: (language: GlobalLanguageFilterValue) => void;
  isLanguageFilterActive: boolean;
}

const GlobalLanguageFilterContext = createContext<GlobalLanguageFilterContextType | undefined>(
  undefined
);

const GLOBAL_LANGUAGE_FILTER_STORAGE_KEY = "global-language-filter";

export const GlobalLanguageFilterProvider = ({ children }: { children: ReactNode }) => {
  const [storedLanguage, setStoredLanguage] = useLocalStorage<GlobalLanguageFilterValue>(
    GLOBAL_LANGUAGE_FILTER_STORAGE_KEY,
    "all"
  );

  const [selectedLanguage, setSelectedLanguageState] =
    useState<GlobalLanguageFilterValue>(storedLanguage);

  const setSelectedLanguage = (language: GlobalLanguageFilterValue) => {
    setSelectedLanguageState(language);
    setStoredLanguage(language);
  };

  const isLanguageFilterActive = selectedLanguage !== "all";

  useEffect(() => {
    setSelectedLanguageState(storedLanguage);
  }, [storedLanguage]);

  return (
    <GlobalLanguageFilterContext.Provider
      value={{
        selectedLanguage,
        setSelectedLanguage,
        isLanguageFilterActive,
      }}
    >
      {children}
    </GlobalLanguageFilterContext.Provider>
  );
};

export const useGlobalLanguageFilter = (): GlobalLanguageFilterContextType => {
  const context = useContext(GlobalLanguageFilterContext);
  if (context === undefined) {
    throw new Error("useGlobalLanguageFilter must be used within a GlobalLanguageFilterProvider");
  }
  return context;
};
