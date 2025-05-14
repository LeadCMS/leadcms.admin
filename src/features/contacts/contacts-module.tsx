import {
  addFormRoute,
  detailsRoute,
  contactLogsRoute,
  editFormRoute,
  viewFormRoute,
} from "lib/router";
import { Outlet, Route, Routes } from "react-router-dom";
import { ContactAdd } from "./add";
import { ContactEdit } from "./edit";
import { ContactsLazy } from "./lazy";
import { ContactView } from "./view/details";
import { ContactBase } from "./view";
import { ContactLogs } from "./view/logs";

export const ContactsModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<ContactsLazy />} />
        <Route path={editFormRoute.template} element={<ContactEdit />} />
        <Route path={viewFormRoute.template} element={<ContactBase />}>
          <Route index element={<ContactView />} />
          <Route path={detailsRoute.template} element={<ContactView />} />
          <Route path={contactLogsRoute.template} element={<ContactLogs />} />
        </Route>
        <Route path={addFormRoute.template} element={<ContactAdd />} />
      </Routes>
      <Outlet />
    </>
  );
};
