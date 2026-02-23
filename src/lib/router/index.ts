import { Parser, route, intParser } from "typesafe-routes";

export const enum CoreModule {
  dashboard = "dashboard",
  contacts = "contacts",
  links = "links",
  comments = "comments",
  content = "content",
  media = "media",
  accounts = "accounts",
  orders = "orders",
  deals = "deals",
  domains = "domains",
  segments = "segments",
  unsubscribes = "unsubscribes",
  users = "users",
  about = "about",
  emailTemplates = "email-templates",
  activityLogs = "activity-logs",
  settings = "settings",
  tasks = "tasks",
  deployments = "deployments",
  campaigns = "campaigns",
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
  {}
);

export const editFormRoute = route(
  ":id/edit",
  {
    id: intParser,
  },
  {}
);

export const viewFormRoute = route(
  ":id/view",
  {
    id: intParser,
  },
  {}
);

export const addFormRoute = route("add", {}, {});

export const importFormRoute = route("import", {}, {});

export const detailsRoute = route("details", {}, {});

export const contactInvoicesRoute = route("invoices", {}, {});

export const contactLogsRoute = route("logs", {}, {});

export const contactCommunicationsRoute = route("communications", {}, {});

export const contactActivityRoute = route("activity", {}, {});

export const contactOrdersRoute = route("orders", {}, {});

export const contactDealsRoute = route("deals", {}, {});

export const getCoreModuleRoute = (moduleName: CoreModule) => coreModuleRoute({ moduleName }).$;

export const getEditFormRoute = (id: number) => editFormRoute({ id: id }).$;

export const getViewFormRoute = (id: number) => viewFormRoute({ id: id }).$;

export const getAddFormRoute = () => addFormRoute({}).$;

export const getImportFormRoute = () => importFormRoute({}).$;

export const rootRoute = "/";

export const defaultModuleRoute = "/content";
