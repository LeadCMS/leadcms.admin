import { getAddFormRoute, getEditFormRoute, getViewFormRoute } from "lib/router";
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
        <Route path={getEditFormRoute()} element={<SegmentEdit />} />
        <Route path={getViewFormRoute()} element={<SegmentView />} />
        <Route path={getAddFormRoute()} element={<SegmentAdd />} />
      </Routes>
      <Outlet />
    </>
  );
};
