import { useOutletContext } from "react-router-dom";
import { useNotificationsService } from "@hooks";
import { DealsList } from "@components/deals-list";
import { ContactViewOutletContext } from "../types";

export const ContactDeals = () => {
  const { contactId } = useOutletContext<ContactViewOutletContext>();
  const { notificationsService } = useNotificationsService();

  const handleCreateDealClick = () => {
    notificationsService.info("Deal creation workflow will be enabled" + " with the deals API.");
  };

  return (
    <DealsList
      entityId={contactId}
      filterField="contacts.id"
      filterOperator="equals"
      description="Deals linked to this contact."
      emptyDescription="Create a deal to start tracking pipeline activity for this contact."
      onCreateDeal={handleCreateDealClick}
    />
  );
};
