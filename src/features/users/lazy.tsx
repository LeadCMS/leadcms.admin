import { lazy } from "react";

const UserModule = lazy(() =>
  import("./index").then((module) => ({ default: module.UserModule }))
);

export { UserModule };

