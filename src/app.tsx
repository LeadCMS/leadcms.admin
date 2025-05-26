import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "providers/theme-provider";
import { AppLayout } from "@components/app-layout";
import { coreModuleRoute, rootRoute } from "@lib/router";
import { ModuleLoader } from "@features/module-loader";
import { RequestProvider } from "@providers/request-provider";
import { AuthProvider } from "@providers/auth-provider";
import { ToastContainer } from "react-toastify";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { UserProvider } from "@providers/user-provider";
import { ErrorDetailsModalProvider } from "@providers/error-details-modal-provider";
import { ConfigProvider } from "@providers/config-provider";
import "react-toastify/dist/ReactToastify.css";

export const App = () => {
  // Define menu categories for breadcrumbs
  const menuCategories: Record<string, { category: string; name: string }> = {
    dashboard: { category: "MAIN", name: "Dashboard" },
    content: { category: "CMS", name: "Content" },
    comments: { category: "CMS", name: "Comments" },
    links: { category: "CMS", name: "Links" },
    contacts: { category: "CRM", name: "Contacts" },
    accounts: { category: "CRM", name: "Accounts" },
    orders: { category: "CRM", name: "Orders" },
    deals: { category: "CRM", name: "Deals" },
    domains: { category: "CRM", name: "Domains" },
    "activity-logs": { category: "CRM", name: "Activity logs" },
    "email-templates": { category: "MARKETING", name: "Email templates" },
    unsubscribes: { category: "MARKETING", name: "Unsubscribes" },
    users: { category: "GENERAL", name: "Users" },
    about: { category: "GENERAL", name: "About" }
  };

  interface Breadcrumb {
    linkText: string;
    toRoute: string;
    isCategory?: boolean;
  }

  function useBreadcrumbs(
    pathname: string,
    propsBreadcrumbs?: Breadcrumb[],
    propsCurrentBreadcrumb?: string
  ) {
    if (propsBreadcrumbs && propsBreadcrumbs.length > 0) {
      return { breadcrumbs: propsBreadcrumbs, currentBreadcrumb: propsCurrentBreadcrumb || "" };
    }
    const paths = pathname.split("/").filter(Boolean);
    const firstPath = paths[0];
    const breadcrumbs: Breadcrumb[] = [];
    let currentBreadcrumb = "";
    if (firstPath && menuCategories[firstPath]) {
      breadcrumbs.push({
        linkText: menuCategories[firstPath].category,
        toRoute: `/${firstPath}`,
        isCategory: true
      });
      currentBreadcrumb = menuCategories[firstPath].name;
    }
    return { breadcrumbs, currentBreadcrumb };
  }

  function AppLayoutWithAutoBreadcrumbs({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    let propsBreadcrumbs, propsCurrentBreadcrumb;
    if (
      children &&
      typeof children === "object" &&
      "props" in children &&
      children.props
    ) {
      propsBreadcrumbs = children.props.breadcrumbs;
      propsCurrentBreadcrumb = children.props.currentBreadcrumb;
    }
    const { breadcrumbs, currentBreadcrumb } = useBreadcrumbs(
      location.pathname,
      propsBreadcrumbs,
      propsCurrentBreadcrumb
    );
    return (
      <AppLayout breadcrumbs={breadcrumbs} currentBreadcrumb={currentBreadcrumb}>
        {children}
      </AppLayout>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ConfigProvider>
        <ThemeProvider>
          <AuthProvider>
            <RequestProvider>
              <ToastContainer />
              <UserProvider>
                <ErrorDetailsModalProvider>
                  <BrowserRouter
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true
                    }}
                  >
                    <Routes>
                      <Route
                        path={rootRoute}
                        element={
                          <AppLayoutWithAutoBreadcrumbs>
                            <Outlet />
                          </AppLayoutWithAutoBreadcrumbs>
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
      </ConfigProvider>
    </LocalizationProvider>
  );
};
