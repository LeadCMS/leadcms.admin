import { getAddFormRoute, getEditFormRoute, getViewFormRoute } from "lib/router";
import { Outlet, Route, Routes } from "react-router-dom";
import { Sequences } from "./index";
import { SequenceAdd } from "./add";
import { SequenceEdit } from "./edit";
import { SequenceView } from "./view";
import { SequenceEnrollmentView } from "./enrollment-view";

export const SequencesModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<Sequences />} />
        <Route path={getAddFormRoute()} element={<SequenceAdd />} />
        <Route path={getEditFormRoute()} element={<SequenceEdit />} />
        <Route path={getViewFormRoute()} element={<SequenceView />} />
        <Route path=":id/view/enrollments/:enrollmentId" element={<SequenceEnrollmentView />} />
      </Routes>
      <Outlet />
    </>
  );
};
