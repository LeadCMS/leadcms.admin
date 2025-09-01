import { ContentList } from "./content-list";
import { Route, Routes } from "react-router-dom";
import { ContentEdit } from "./content-edit";

export const ContentModule = () => {
  return (
    <Routes>
      <Route path={"/"} element={<ContentList />} />
      <Route path={"/:id/edit"} element={<ContentEdit />} />
      <Route path={"/new"} element={<ContentEdit />} />
      <Route path={"/:sourceId/duplicate"} element={<ContentEdit />} />
      <Route path={"/:sourceId/translate/:targetLanguage"} element={<ContentEdit />} />
      <Route path={"/:sourceId/translate/:targetLanguage/:type"} element={<ContentEdit />} />
      <Route path={"/ai-draft"} element={<ContentEdit />} />
    </Routes>
  );
};
