import { lazy, Suspense } from "react";
import { ContentList } from "./content-list";
import { Route, Routes } from "react-router-dom";

const ContentEdit = lazy(() => import("./content-edit").then((m) => ({ default: m.ContentEdit })));

export const ContentModule = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path={"/"} element={<ContentList />} />
        <Route path={"/new"} element={<ContentEdit />} />
        <Route path={"/ai-draft"} element={<ContentEdit />} />
        <Route path={"/:sourceId/duplicate"} element={<ContentEdit />} />
        <Route path={"/:sourceId/translate/:targetLanguage/:type"} element={<ContentEdit />} />
        <Route path={"/:sourceId/translate/:targetLanguage"} element={<ContentEdit />} />
        <Route path={"/:id/edit"} element={<ContentEdit />} />
      </Routes>
    </Suspense>
  );
};
