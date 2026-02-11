import {
  addFormRoute,
  contactActivityRoute,
  contactCommunicationsRoute,
  contactDealsRoute,
  contactInvoicesRoute,
  contactOrdersRoute,
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
        <Route path={editFormRoute.template} element={<ContactEdit />} />
        <Route path={viewFormRoute.template} element={<ContactBase />}>
          <Route index element={<ContactView />} />
          <Route path={detailsRoute.template} element={<ContactView />} />
          <Route path={contactCommunicationsRoute.template} element={<ContactCommunications />} />
          <Route path={contactActivityRoute.template} element={<ContactActivity />} />
          <Route path={contactOrdersRoute.template} element={<ContactOrders />} />
          <Route path={contactDealsRoute.template} element={<ContactDeals />} />
          {/* Legacy paths retained for compatibility */}
          <Route path={contactLogsRoute.template} element={<ContactActivity />} />
          <Route path={contactInvoicesRoute.template} element={<ContactOrders />} />
        </Route>
        <Route path={addFormRoute.template} element={<ContactAdd />} />
      </Routes>
      <Outlet />
    </>
  );
};
