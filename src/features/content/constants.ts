import { BreadcrumbLink } from "../../types";
import { CoreModule, getCoreModuleRoute, rootRoute } from "@lib/router";

export const contentBreadcrumbLinks: BreadcrumbLink[] = [
  { linkText: "Dashboard", toRoute: rootRoute },
];

export const contentFormBreadcrumbLinks: BreadcrumbLink[] = [
  { linkText: "Dashboard", toRoute: rootRoute },
  { linkText: "Content", toRoute: getCoreModuleRoute(CoreModule.content) },
];
