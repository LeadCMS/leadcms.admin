import {
  getAddFormRoute,
  getEditFormRoute,
  getViewFormRoute,
} from "lib/router";
import { Outlet, Route, Routes } from "react-router-dom";
import { ContactAdd } from "./add";
import { ContactEdit } from "./edit";
import { ContactsLazy } from "./lazy";
import { ContactView } from "./view/details";
import { ContactCommunications } from "./view/communications";
import { ContactActivity } from "./view/activity";
import { ContactOrders } from "./view/orders";
import { ContactDeals } from "./view/deals";
import { ContactBase } from "./view";

export const ContactsModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<ContactsLazy />} />
        <Route path={getEditFormRoute()} element={<ContactEdit />} />
        <Route path={getViewFormRoute()} element={<ContactBase />}>
          <Route index element={<ContactView />} />
          <Route path="details" element={<ContactView />} />
          <Route path="communications" element={<ContactCommunications />} />
          <Route path="activity" element={<ContactActivity />} />
          <Route path="orders" element={<ContactOrders />} />
          <Route path="deals" element={<ContactDeals />} />
          {/* Legacy paths retained for compatibility */}
          <Route path="logs" element={<ContactActivity />} />
          <Route path="invoices" element={<ContactOrders />} />
        </Route>
        <Route path={getAddFormRoute()} element={<ContactAdd />} />
      </Routes>
      <Outlet />
    </>
  );
};
