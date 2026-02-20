import { Route, Routes } from "react-router-dom";
import { EmailTemplatesList } from "./list";
import { EmailTemplateEdit } from "./edit";

export const EmailTemplatesModule = () => {
  return (
    <Routes>
      <Route path={"/"} element={<EmailTemplatesList />} />
      <Route path={"/:id/view"} element={<EmailTemplateEdit readonly />} />
      <Route path={"/:id/edit"} element={<EmailTemplateEdit />} />
      <Route path={"/:sourceId/duplicate"} element={<EmailTemplateEdit />} />
      <Route path={"/add"} element={<EmailTemplateEdit />} />
    </Routes>
  );
};
