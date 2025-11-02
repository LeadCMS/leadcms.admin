import { Route, Routes } from "react-router-dom";
import { CommentsList } from "./comments-list";

export const CommentsModule = () => {
  return (
    <Routes>
      <Route path="/" element={<CommentsList />} />
    </Routes>
  );
};
