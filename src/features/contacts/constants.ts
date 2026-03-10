import { CoreModule, getCoreModuleRoute } from "lib/router";
import { dataListBreadcrumbLinks } from "utils/constants";
import { BreadcrumbLink } from "types";

export const defaultFilterOrderColumn = "firstName";

export const defaultFilterOrderDirection = "asc";

export const searchLabel = "Search contacts";

export const modelName = "contact";

export const contactListPageBreadcrumb = "Contacts";

export const contactFormBreadcrumbLinks: BreadcrumbLink[] = [
  ...dataListBreadcrumbLinks,
  { linkText: contactListPageBreadcrumb, toRoute: getCoreModuleRoute(CoreModule.contacts) },
];

export const contactEditHeader = "Edit Contact";

export const contactAddHeader = "Add Contact";

export const contactViewHeader = "View Contact";

export const contactGridSettingsStorageKey = "contactDataListSettings";

export const contactSegmentFilterStorageKey = "contactSegmentFilter";
