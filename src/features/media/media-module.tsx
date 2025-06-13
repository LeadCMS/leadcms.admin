import React from "react";
import { addFormRoute, editFormRoute, viewFormRoute } from "lib/router";
import { Outlet, Route, Routes } from "react-router-dom";
import MediaList from "./index";
import MediaAdd from "./add";
import MediaEdit from "./edit";
import MediaView from "./view";

const MediaModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<MediaList />} />
        <Route path={editFormRoute.template} element={<MediaEdit />} />
        <Route path={viewFormRoute.template} element={<MediaView />} />
        <Route path={addFormRoute.template} element={<MediaAdd />} />
      </Routes>
      <Outlet />
    </>
  );
};

export default MediaModule;
