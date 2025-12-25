import { addFormRoute, editFormRoute, viewFormRoute } from "lib/router";
import { Outlet, Route, Routes } from "react-router-dom";
import { Segments } from "./index";
import { SegmentAdd } from "./form/add";
import { SegmentEdit } from "./form/edit";
import { SegmentView } from "./view/details";

export const SegmentsModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<Segments />} />
        <Route path={editFormRoute.template} element={<SegmentEdit />} />
        <Route path={viewFormRoute.template} element={<SegmentView />} />
        <Route path={addFormRoute.template} element={<SegmentAdd />} />
      </Routes>
      <Outlet />
    </>
  );
};
