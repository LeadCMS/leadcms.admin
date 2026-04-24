import { lazy } from "react";

const EmailTemplatesModule = lazy(() =>
  import("./index").then((module) => ({ default: module.EmailTemplatesModule }))
);

export { EmailTemplatesModule };

