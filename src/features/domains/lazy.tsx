import { lazy } from "react";

export const DomainsLazy = lazy(() =>
  import("features/domains").then(({ Domains }) => ({ default: Domains })),
);
