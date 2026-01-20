import { lazy } from "react";

const ContactsModule = lazy(() =>
  import("./contacts-module").then((module) => ({ default: module.ContactsModule }))
);

const ContactsLazy = lazy(() =>
  import("./index").then((module) => ({ default: module.Contacts }))
);

export { ContactsModule, ContactsLazy };
