import { ContentList } from "./content-list";
import { Route, Routes } from "react-router-dom";
import { ContentEdit } from "./content-edit";
import { ContentView } from "./content-view";

export const ContentModule = () => {
  return (
    <Routes>
      <Route path={"/"} element={<ContentList />} />
      <Route path={"/:id/view"} element={<ContentView />} />
      <Route path={"/:id/edit"} element={<ContentEdit />} />
      <Route path={"/new"} element={<ContentEdit />} />
    </Routes>
  );
};
