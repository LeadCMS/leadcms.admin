import { BreadcrumbLink } from "../../types";
import { CoreModule, getCoreModuleRoute, rootRoute } from "@lib/router";

export const blogBreadcrumbLinks: BreadcrumbLink[] = [
  { linkText: "Dashboard", toRoute: rootRoute },
];

export const blogFormBreadcrumbLinks: BreadcrumbLink[] = [
  { linkText: "Dashboard", toRoute: rootRoute },
  { linkText: "Content", toRoute: getCoreModuleRoute(CoreModule.content) },
];
