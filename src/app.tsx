import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "providers/theme-provider";
import { RequestProvider } from "@providers/request-provider";
import { AuthProvider } from "@providers/auth-provider";
import { ToastContainer } from "react-toastify";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { UserProvider } from "@providers/user-provider";
import { ErrorDetailsModalProvider } from "@providers/error-details-modal-provider";
import { ConfigProvider } from "@providers/config-provider";
import { GlobalLanguageFilterProvider } from "@providers/global-language-filter-provider";
import { TranslationDraftProvider } from "@providers/translation-draft-provider";
import { LayoutProvider } from "@providers/layout-provider";
import "react-toastify/dist/ReactToastify.css";
import { Auth } from "./features/auth/auth";

const AuthenticatedLayout = lazy(() => import("./authenticated-layout"));

export const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ConfigProvider>
        <GlobalLanguageFilterProvider>
          <TranslationDraftProvider>
            <LayoutProvider>
              <ThemeProvider>
                <AuthProvider>
                  <RequestProvider>
                    <ToastContainer position="top-right" style={{ marginTop: "60px" }} />
                    <UserProvider>
                      <ErrorDetailsModalProvider>
                        <BrowserRouter
                          future={{
                            v7_startTransition: true,
                            v7_relativeSplatPath: true,
                          }}
                        >
                          <Routes>
                            <Route path="/auth/*" element={<Auth />} />
                            <Route
                              path="/*"
                              element={
                                <Suspense fallback={null}>
                                  <AuthenticatedLayout />
                                </Suspense>
                              }
                            />
                          </Routes>
                        </BrowserRouter>
                      </ErrorDetailsModalProvider>
                    </UserProvider>
                  </RequestProvider>
                </AuthProvider>
              </ThemeProvider>
            </LayoutProvider>
          </TranslationDraftProvider>
        </GlobalLanguageFilterProvider>
      </ConfigProvider>
    </LocalizationProvider>
  );
};
