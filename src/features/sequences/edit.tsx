import { useParams } from "react-router-dom";
import { SequenceForm } from "./sequence-form";

export const SequenceEdit = () => {
  const { id } = useParams<{ id: string }>();
  return <SequenceForm mode="edit" sequenceId={Number(id)} />;
};
