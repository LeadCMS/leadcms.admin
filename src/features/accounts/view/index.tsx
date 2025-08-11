import { ModuleWrapper } from "@components/module-wrapper";
import { AccountDetailsDto } from "@lib/network/swagger-client";
import { Divider, ListItem, ListItemAvatar, Tab, Tabs } from "@mui/material";
import { useEffect, useRef, useState } from "react";
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

  return (
    <ModuleWrapper breadcrumbs={accountFormBreadcrumbLinks} currentBreadcrumb={accountName}>
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
