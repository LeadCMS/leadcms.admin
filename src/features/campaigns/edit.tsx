import { useParams } from "react-router-dom";
import { CampaignForm } from "./campaign-form";

export const CampaignEdit = () => {
  const { id } = useParams<{ id: string }>();
  return <CampaignForm mode="edit" campaignId={Number(id)} />;
};
