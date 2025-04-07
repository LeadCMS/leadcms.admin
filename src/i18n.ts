import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import JSON translation files
import pageTypesEN from "./locales/en/pageTypes.json";

// the translations
const resources = {
  en: {
    pageTypes: pageTypesEN
  }
};

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    // have a common namespace used around the full app
    ns: ["pageTypes"],
    defaultNS: "pageTypes"
  });

export default i18n;
