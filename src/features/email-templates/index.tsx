import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { EmailTemplatesList } from "./list";

const EmailTemplateEdit = lazy(() =>
  import("./edit").then((m) => ({ default: m.EmailTemplateEdit }))
);

export const EmailTemplatesModule = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path={"/"} element={<EmailTemplatesList />} />
        <Route path={"/:id/view"} element={<EmailTemplateEdit readonly />} />
        <Route path={"/:id/edit"} element={<EmailTemplateEdit />} />
        <Route path={"/:sourceId/duplicate"} element={<EmailTemplateEdit />} />
        <Route
          path={"/:sourceId/translate/:targetLanguage/:type"}
          element={<EmailTemplateEdit />}
        />
        <Route path={"/:sourceId/translate/:targetLanguage"} element={<EmailTemplateEdit />} />
        <Route path={"/add"} element={<EmailTemplateEdit />} />
        <Route path={"/ai-draft"} element={<EmailTemplateEdit />} />
      </Routes>
    </Suspense>
  );
};
