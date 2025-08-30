import { createContext, useContext, useState, ReactNode } from "react";
import { ContentDetailsDto } from "@lib/network/swagger-client";

interface TranslationDraftContextType {
  translationDraft: ContentDetailsDto | null;
  setTranslationDraft: (draft: ContentDetailsDto | null) => void;
  clearTranslationDraft: () => void;
  hasTranslationDraft: boolean;
}

const TranslationDraftContext = createContext<TranslationDraftContextType | undefined>(undefined);

export const TranslationDraftProvider = ({ children }: { children: ReactNode }) => {
  const [translationDraft, setTranslationDraftState] = useState<ContentDetailsDto | null>(null);

  const setTranslationDraft = (draft: ContentDetailsDto | null) => {
    setTranslationDraftState(draft);
  };

  const clearTranslationDraft = () => {
    setTranslationDraftState(null);
  };

  const hasTranslationDraft = translationDraft !== null;

  return (
    <TranslationDraftContext.Provider
      value={{
        translationDraft,
        setTranslationDraft,
        clearTranslationDraft,
        hasTranslationDraft,
      }}
    >
      {children}
    </TranslationDraftContext.Provider>
  );
};

export const useTranslationDraft = (): TranslationDraftContextType => {
  const context = useContext(TranslationDraftContext);
  if (context === undefined) {
    throw new Error("useTranslationDraft must be used within a TranslationDraftProvider");
  }
  return context;
};
