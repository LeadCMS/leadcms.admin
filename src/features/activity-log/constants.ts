import { CoreModule, getCoreModuleRoute } from "lib/router";
import { dataListBreadcrumbLinks } from "utils/constants";
import { BreadcrumbLink } from "types";

export const defaultFilterOrderColumn = "createdAt";

export const defaultFilterOrderDirection = "asc";

export const searchLabel = "Search activities";

export const modelName = "activityLog";

export const activityLogListPageBreadcrumb = "Activity Logs";

export const activityLogFormBreadcrumbLinks: BreadcrumbLink[] = [
  ...dataListBreadcrumbLinks,
  {
    linkText: activityLogListPageBreadcrumb,
    toRoute: getCoreModuleRoute(CoreModule.activityLogs),
  },
];

export const activityLogViewHeader = "View email template";

export const activityLogGridSettingsStorageKey = "activityLogDataListSettings";
