import { lazy } from "react";

const OrdersModule = lazy(() =>
  import("./orders-module").then((module) => ({ default: module.OrdersModule }))
);

const OrdersLazy = lazy(() =>
  import("./index").then((module) => ({ default: module.Orders }))
);

export { OrdersModule, OrdersLazy };
