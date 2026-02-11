import { useEffect, useState } from "react";
import { AccountDetailsDto, AccountUpdateDto } from "lib/network/swagger-client";
import { useRequestContext } from "providers/request-provider";
import { AccountForm } from "../form";
import { useRouteParams } from "typesafe-routes";
import { editFormRoute } from "@lib/router";

export const AccountEdit = () => {
  const { client } = useRequestContext();

  const { id } = useRouteParams(editFormRoute);

  const [account, setAccount] = useState<AccountDetailsDto>({ name: "" });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.api.accountsDetail(id);
        setAccount(data);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [client]);

  const handleSave = async (newAccount: AccountDetailsDto) => {
    const updateDto: AccountUpdateDto = {
      ...newAccount,
    };
    await client.api.accountsPartialUpdate(id, updateDto!);
  };

  const handleDelete = async (accountId: number) => {
    await client.api.accountsDelete(accountId);
  };

  return (
    <AccountForm
      account={account}
      handleSave={handleSave}
      handleDelete={handleDelete}
      isEdit={true}
    />
  );
};
