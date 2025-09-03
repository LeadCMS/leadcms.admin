import { lazy } from "react";

const SettingsModule = lazy(() =>
  import("./settings-module").then((module) => ({ default: module.SettingsModule }))
);

export { SettingsModule };
