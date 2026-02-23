import { CoreModule, getCoreModuleRoute } from "lib/router";
import { dataListBreadcrumbLinks } from "utils/constants";
import { BreadcrumbLink } from "types";

export const defaultFilterOrderColumn = "createdAt";

export const defaultFilterOrderDirection = "desc";

export const searchLabel = "Search campaigns";

export const modelName = "campaign";

export const campaignListPageBreadcrumb = "Campaigns";

export const campaignFormBreadcrumbLinks: BreadcrumbLink[] = [
  ...dataListBreadcrumbLinks,
  {
    linkText: campaignListPageBreadcrumb,
    toRoute: getCoreModuleRoute(CoreModule.campaigns),
  },
];

export const campaignEditHeader = "Edit Campaign";

export const campaignAddHeader = "Create Campaign";

export const campaignViewHeader = "View Campaign";

export const campaignGridSettingsStorageKey = "campaignDataListSettings";
