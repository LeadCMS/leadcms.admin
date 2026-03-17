import { addFormRoute, editFormRoute, viewFormRoute } from "lib/router";
import { Outlet, Route, Routes } from "react-router-dom";
import { Sequences } from "./index";
import { SequenceAdd } from "./add";
import { SequenceEdit } from "./edit";
import { SequenceView } from "./view";

export const SequencesModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<Sequences />} />
        <Route path={addFormRoute.template} element={<SequenceAdd />} />
        <Route path={editFormRoute.template} element={<SequenceEdit />} />
        <Route path={viewFormRoute.template} element={<SequenceView />} />
      </Routes>
      <Outlet />
    </>
  );
};
