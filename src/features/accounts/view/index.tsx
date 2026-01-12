import { ModuleWrapper } from "@components/module-wrapper";
import { DataManagementBlock } from "@components/data-management";
import { AccountDetailsDto } from "@lib/network/swagger-client";
import { CoreModule } from "@lib/router";
import { Divider, ListItem, ListItemAvatar, Tab, Tabs } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useRequestContext } from "providers/request-provider";
import { accountFormBreadcrumbLinks } from "../constants";
import { AccountNameListItemTextLarge, AccountUrlHref, AvatarContainer } from "../index.styled";

// Prevent duplicate network calls (e.g., in React StrictMode) by caching fetched accounts in-memory
const accountDetailsCache = new Map<number, AccountDetailsDto>();

export const AccountViewBase = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { client } = useRequestContext();

  const [tabValue, setTabValue] = useState("details");
  const [account, setAccount] = useState<AccountDetailsDto | null>(
    (state as AccountDetailsDto) || null
  );
  const didFetchRef = useRef(false);

  const accountIdFromRoute = params.id ? Number(params.id) : undefined;
  const accountId = useMemo(() => {
    if (Number.isFinite(accountIdFromRoute)) return accountIdFromRoute as number;
    if (account?.id && Number.isFinite(account.id)) return account.id;
    return undefined;
  }, [account?.id, accountIdFromRoute]);

  useEffect(() => {
    const load = async () => {
      if (account || didFetchRef.current) return;
      const id = params.id ? Number(params.id) : undefined;
      if (!id) return;
      try {
        // First, try cache to avoid duplicate fetches across remounts
        const cached = accountDetailsCache.get(id);
        if (cached) {
          setAccount(cached);
          return;
        }
        didFetchRef.current = true;
        const { data } = await client.api.accountsDetail(id);
        accountDetailsCache.set(id, data);
        setAccount(data);
      } catch (e) {
        // noop; fall back to minimal header
        console.log(e);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    navigate(newValue, { state: account ?? state });
  };

  const accountName = account?.name || "View Account";

  const actionButtons = accountId ? (
    <DataManagementBlock
      header="Data Management"
      description="Please be aware that what has been deleted can never be brought back."
      entity="account"
      handleDeleteAsync={(idVal) => client.api.accountsDelete(Number(idVal))}
      itemId={accountId}
      successNavigationRoute={CoreModule.accounts}
      showOnlyButtons={true}
      onDeleted={() => accountDetailsCache.delete(accountId)}
    />
  ) : null;

  return (
    <ModuleWrapper
      breadcrumbs={accountFormBreadcrumbLinks}
      currentBreadcrumb={accountName}
      actionButtons={actionButtons}
    >
      {account && (
        <ListItem>
          <ListItemAvatar>
            <AvatarContainer src={account.logoUrl || ""}></AvatarContainer>
          </ListItemAvatar>
          <AccountNameListItemTextLarge
            primary={account.name || ""}
            secondary={
              account.siteUrl && (
                <AccountUrlHref href={account.siteUrl} target="_blank">
                  {account.siteUrl}
                </AccountUrlHref>
              )
            }
          />
        </ListItem>
      )}
      <Tabs value={tabValue} onChange={handleChange}>
        <Tab value="details" label="Overview" />
      </Tabs>
      <Divider></Divider>
      <Outlet context={{ account }} />
    </ModuleWrapper>
  );
};
