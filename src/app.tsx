import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "providers/theme-provider";
import { AppHeader } from "components/app-header";
import { Sidebar } from "@components/side-bar";
import { AppLayoutContainer, MainContentContainer } from "components/layout";
import { coreModuleRoute, rootRoute } from "@lib/router";
import { ModuleLoader } from "@features/module-loader";
import { RequestProvider } from "@providers/request-provider";
import { AuthProvider } from "@providers/auth-provider";
import { ToastContainer } from "react-toastify";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { UserProvider } from "@providers/user-provider";
import { ErrorDetailsModalProvider } from "@providers/error-details-modal-provider";
import "react-toastify/dist/ReactToastify.css";
import "./i18n";

export const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider>
        <AuthProvider>
          <RequestProvider>
            <ToastContainer />
            <UserProvider>
              <ErrorDetailsModalProvider>
                <BrowserRouter>
                  <Routes>
                    <Route
                      path={rootRoute}
                      element={
                        <AppLayoutContainer>
                          <AppHeader />
                          <Sidebar />
                          <MainContentContainer>
                            <Outlet />
                          </MainContentContainer>
                        </AppLayoutContainer>
                      }
                    >
                      <Route path={rootRoute} element={<ModuleLoader />} />
                      <Route path={`${coreModuleRoute.template}/*`} element={<ModuleLoader />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </ErrorDetailsModalProvider>
            </UserProvider>
          </RequestProvider>
        </AuthProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
};
