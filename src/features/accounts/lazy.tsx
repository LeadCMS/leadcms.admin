import { lazy } from "react";

export const AccountsLazy = lazy(() =>
  import("features/accounts").then(({ Accounts }) => ({ default: Accounts })),
);
