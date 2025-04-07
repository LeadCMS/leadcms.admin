import { Parser, route, intParser } from "typesafe-routes";

export const enum CoreModule {
  contacts = "contacts",
  links = "links",
  comments = "comments",
  blog = "blog",
  accounts = "accounts",
  orders = "orders",
  domains = "domains",
  unsubscribes = "unsubscribes",
  users = "users",
  about = "about",
  emailTemplates = "email-templates",
  activityLogs = "activity-logs",
}

const coreModuleParser: Parser<CoreModule> = {
  parse: (value) => value as CoreModule,
  serialize: (moduleName) => moduleName,
};

export const coreModuleRoute = route(
  "/:moduleName",
  {
    moduleName: coreModuleParser,
  },
  {},
);

export const editFormRoute = route(
  ":id/edit",
  {
    id: intParser,
  },
  {},
);

export const viewFormRoute = route(
  ":id/view",
  {
    id: intParser,
  },
  {},
);

export const addFormRoute = route("add", {}, {});

export const importFormRoute = route("import", {}, {});

export const detailsRoute = route("details", {}, {});

export const contactInvoicesRoute = route("invoices", {}, {});

export const contactLogsRoute = route("logs", {}, {});

export const getCoreModuleRoute = (moduleName: CoreModule) => coreModuleRoute({ moduleName }).$;

export const getEditFormRoute = (id: number) => editFormRoute({ id: id }).$;

export const getViewFormRoute = (id: number) => viewFormRoute({ id: id }).$;

export const getAddFormRoute = () => addFormRoute({}).$;

export const getImportFormRoute = () => importFormRoute({}).$;

export const rootRoute = "/";

export const defaultModuleRoute = "/blog";
