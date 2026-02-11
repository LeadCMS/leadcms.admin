import { addFormRoute, editFormRoute, detailsRoute, viewFormRoute } from "lib/router";
import { Outlet, Route, Routes } from "react-router-dom";
import { OrderAdd } from "./add";
import { OrderEdit } from "./edit";
import { OrdersLazy } from "./lazy";
import { OrderViewBase } from "./view";
import { OrderView } from "./view/details";
import { OrderItems } from "./view/items";

export const OrdersModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<OrdersLazy />} />
        <Route path={editFormRoute.template} element={<OrderEdit />} />
        <Route path={viewFormRoute.template} element={<OrderViewBase />}>
          <Route index element={<OrderView />} />
          <Route path={detailsRoute.template} element={<OrderView />} />
          <Route path="items" element={<OrderItems />} />
        </Route>
        <Route path={addFormRoute.template} element={<OrderAdd />} />
      </Routes>
      <Outlet />
    </>
  );
};
