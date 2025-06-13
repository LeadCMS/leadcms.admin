import { CoreModule, getCoreModuleRoute, rootRoute } from "lib/router";
import { BreadcrumbLink } from "types";

export const defaultFilterOrderColumn = "name";

export const defaultFilterOrderDirection = "asc";

export const searchLabel = "Search media";

export const modelName = "media";

export const mediaListBreadcrumbLinks: BreadcrumbLink[] = [
  { linkText: "Dashboard", toRoute: rootRoute },
];

export const mediaFormBreadcrumbLinks: BreadcrumbLink[] = [
  { linkText: "Dashboard", toRoute: rootRoute },
  { linkText: "Media", toRoute: getCoreModuleRoute(CoreModule.media) },
];

export const mediaListCurrentBreadcrumb = "Media";

export const mediaGridSettingsStorageKey = "mediaDataListSettings";

export const mediaEditHeader = "Edit Media";

export const mediaAddHeader = "Add Media";
