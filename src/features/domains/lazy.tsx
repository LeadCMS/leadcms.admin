import { lazy } from "react";

const DomainsModule = lazy(() =>
  import("./domains-module").then((module) => ({ default: module.DomainsModule }))
);

const DomainsLazy = lazy(() =>
  import("./index").then((module) => ({ default: module.Domains }))
);

export { DomainsModule, DomainsLazy };
