import { CoreModule, getCoreModuleRoute } from "lib/router";
import { dataListBreadcrumbLinks } from "utils/constants";
import { BreadcrumbLink } from "types";

export const defaultFilterOrderColumn = "id";

export const defaultFilterOrderDirection = "asc";

export const searchLabel = "Search email templates";

export const modelName = "emailTemplate";

export const emailTemplateListPageBreadcrumb = "Email Templates";

export const emailTemplateFormBreadcrumbLinks: BreadcrumbLink[] = [
  ...dataListBreadcrumbLinks,
  {
    linkText: emailTemplateListPageBreadcrumb,
    toRoute: getCoreModuleRoute(CoreModule.emailTemplates),
  },
];

export const emailTemplateEditHeader = "Edit email template";

export const emailTemplateAddHeader = "Add email teplate";

export const emailTemplateViewHeader = "View email template";

export const emailTemplateGridSettingsStorageKey = "emailTemplateDataListSettings";

export const emailTemplateGroupFilterStorageKey = "emailTemplateGroupFilter";
