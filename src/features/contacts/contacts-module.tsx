import { lazy, Suspense } from "react";
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
import { ContactsLazy } from "./lazy";

const ContactAdd = lazy(() => import("./add").then((m) => ({ default: m.ContactAdd })));
const ContactEdit = lazy(() => import("./edit").then((m) => ({ default: m.ContactEdit })));
const ContactBase = lazy(() => import("./view").then((m) => ({ default: m.ContactBase })));
const ContactView = lazy(() => import("./view/details").then((m) => ({ default: m.ContactView })));
const ContactCommunications = lazy(() =>
  import("./view/communications").then((m) => ({ default: m.ContactCommunications }))
);
const ContactActivity = lazy(() =>
  import("./view/activity").then((m) => ({ default: m.ContactActivity }))
);
const ContactOrders = lazy(() =>
  import("./view/orders").then((m) => ({ default: m.ContactOrders }))
);
const ContactDeals = lazy(() => import("./view/deals").then((m) => ({ default: m.ContactDeals })));

export const ContactsModule = () => {
  return (
    <>
      <Suspense fallback={null}>
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
      </Suspense>
      <Outlet />
    </>
  );
};
