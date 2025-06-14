import React from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import MediaList from "./index";

const MediaModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<MediaList />} />
      </Routes>
      <Outlet />
    </>
  );
};

export default MediaModule;
