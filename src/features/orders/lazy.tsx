import { lazy } from "react";

export const OrdersLazy = lazy(() =>
  import("features/orders").then(({ Orders }) => ({ default: Orders })),
);
