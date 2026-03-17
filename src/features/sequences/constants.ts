import { CoreModule, getCoreModuleRoute } from "lib/router";
import { dataListBreadcrumbLinks } from "utils/constants";
import { BreadcrumbLink } from "types";

export const defaultFilterOrderColumn = "createdAt";

export const defaultFilterOrderDirection = "desc";

export const searchLabel = "Search sequences";

export const modelName = "sequence";

export const sequenceListPageBreadcrumb = "Sequences";

export const sequenceFormBreadcrumbLinks: BreadcrumbLink[] = [
  ...dataListBreadcrumbLinks,
  {
    linkText: sequenceListPageBreadcrumb,
    toRoute: getCoreModuleRoute(CoreModule.sequences),
  },
];

export const sequenceEditHeader = "Edit Sequence";

export const sequenceAddHeader = "Create Sequence";

export const sequenceViewHeader = "View Sequence";

export const sequenceGridSettingsStorageKey = "sequenceDataListSettings";
