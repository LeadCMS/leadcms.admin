import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "@components/app-layout";
import { coreModuleRoute, rootRoute } from "@lib/router";
import { ModuleLoader } from "@features/module-loader";
import { useLayout } from "@providers/layout-provider";

interface Breadcrumb {
  linkText: string;
  toRoute: string;
  isCategory?: boolean;
}

const menuCategories: Record<string, { category: string; name: string }> = {
  dashboard: { category: "MAIN", name: "Dashboard" },
  content: { category: "CMS", name: "Content" },
  comments: { category: "CMS", name: "Comments" },
  media: { category: "CMS", name: "Media" },
  links: { category: "CMS", name: "Links" },
  contacts: { category: "CRM", name: "Contacts" },
  accounts: { category: "CRM", name: "Accounts" },
  orders: { category: "CRM", name: "Orders" },
  deals: { category: "CRM", name: "Deals" },
  domains: { category: "CRM", name: "Domains" },
  "activity-logs": { category: "CRM", name: "Activity logs" },
  segments: { category: "MARKETING", name: "Segments" },
  campaigns: { category: "MARKETING", name: "Campaigns" },
  sequences: { category: "MARKETING", name: "Sequences" },
  "email-templates": { category: "MARKETING", name: "Email templates" },
  unsubscribes: { category: "MARKETING", name: "Unsubscribes" },
  tasks: { category: "OPERATIONS", name: "Tasks" },
  deployments: { category: "OPERATIONS", name: "Deployments" },
  users: { category: "GENERAL", name: "Users" },
  settings: { category: "GENERAL", name: "Settings" },
  about: { category: "GENERAL", name: "About" },
};

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
      isCategory: true,
    });
    currentBreadcrumb = menuCategories[firstPath].name;
  }
  return { breadcrumbs, currentBreadcrumb };
}

function AppLayoutWithAutoBreadcrumbs({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { fullWidth } = useLayout();
  let propsBreadcrumbs, propsCurrentBreadcrumb;
  if (children && typeof children === "object" && "props" in children && children.props) {
    propsBreadcrumbs = children.props.breadcrumbs;
    propsCurrentBreadcrumb = children.props.currentBreadcrumb;
  }
  const { breadcrumbs, currentBreadcrumb } = useBreadcrumbs(
    location.pathname,
    propsBreadcrumbs,
    propsCurrentBreadcrumb
  );
  return (
    <AppLayout
      breadcrumbs={breadcrumbs}
      currentBreadcrumb={currentBreadcrumb}
      fullWidth={fullWidth}
    >
      {children}
    </AppLayout>
  );
}

export const AuthenticatedLayout = () => (
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
);

export default AuthenticatedLayout;
