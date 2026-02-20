import { CoreModule, getCoreModuleRoute } from "lib/router";
import { dataListBreadcrumbLinks } from "utils/constants";
import { BreadcrumbLink } from "types";

export const defaultFilterOrderColumn = "id";

export const defaultFilterOrderDirection = "desc";

export const searchLabel = "Search unsubscribes";

export const unsubscribeListPageBreadcrumb = "Unsubscribes";

export const unsubscribeFormBreadcrumbLinks: BreadcrumbLink[] = [
  ...dataListBreadcrumbLinks,
  {
    linkText: unsubscribeListPageBreadcrumb,
    toRoute: getCoreModuleRoute(CoreModule.unsubscribes),
  },
];

export const unsubscribeGridSettingsStorageKey = "unsubscribeDataListSettings";
