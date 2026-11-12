import { useOutletContext } from "react-router-dom";
import { DealsList } from "@components/deals-list";
import { AccountViewOutletContext } from "../types";

export const AccountDeals = () => {
  const { accountId } = useOutletContext<AccountViewOutletContext>();

  return (
    <DealsList
      entityId={accountId}
      filterField="accountId"
      filterOperator="equals"
      description="Deals linked to this company."
      emptyDescription="Deals linked to this company will appear here."
    />
  );
};
