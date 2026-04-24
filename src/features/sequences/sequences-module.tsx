import { lazy, Suspense } from "react";
import { addFormRoute, editFormRoute, viewFormRoute } from "lib/router";
import { Outlet, Route, Routes } from "react-router-dom";
import { Sequences } from "./index";

const SequenceAdd = lazy(() => import("./add").then((m) => ({ default: m.SequenceAdd })));
const SequenceEdit = lazy(() => import("./edit").then((m) => ({ default: m.SequenceEdit })));
const SequenceView = lazy(() => import("./view").then((m) => ({ default: m.SequenceView })));
const SequenceEnrollmentView = lazy(() =>
  import("./enrollment-view").then((m) => ({ default: m.SequenceEnrollmentView }))
);

export const SequencesModule = () => {
  return (
    <>
      <Suspense fallback={null}>
        <Routes>
          <Route index element={<Sequences />} />
          <Route path={addFormRoute.template} element={<SequenceAdd />} />
          <Route path={editFormRoute.template} element={<SequenceEdit />} />
          <Route path={viewFormRoute.template} element={<SequenceView />} />
          <Route path=":id/view/enrollments/:enrollmentId" element={<SequenceEnrollmentView />} />
        </Routes>
      </Suspense>
      <Outlet />
    </>
  );
};
