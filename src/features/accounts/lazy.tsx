import { lazy } from "react";

const AccountsModule = lazy(() =>
  import("./accounts-module").then((module) => ({ default: module.AccountsModule }))
);

const AccountsLazy = lazy(() =>
  import("./index").then((module) => ({ default: module.Accounts }))
);

export { AccountsModule, AccountsLazy };
