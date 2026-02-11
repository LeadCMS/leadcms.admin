import { SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Edit, ExternalLink } from "lucide-react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { AccountDetailsDto } from "@lib/network/swagger-client";
import { CoreModule, getEditFormRoute } from "@lib/router";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { ModuleWrapper } from "@components/module-wrapper";
import { accountFormBreadcrumbLinks } from "../constants";
import { AccountViewOutletContext } from "./types";

type AccountTabValue = "overview";

const accountDetailsCache = new Map<number, AccountDetailsDto>();

const tabPathMap: Record<AccountTabValue, string> = {
  overview: "details",
};

const getTabFromPathname = (pathname: string): AccountTabValue => {
  return "overview";
};

const getAccountInitials = (account: AccountDetailsDto | null) => {
  if (!account?.name) return "A";
  const parts = account.name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "A";
};

export const AccountViewBase = () => {
  const { state, pathname } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();

  const initialState =
    state && typeof state === "object" && "name" in state ? (state as AccountDetailsDto) : null;
  const [account, setAccount] = useState<AccountDetailsDto | null>(initialState);
  const [tabValue, setTabValue] = useState<AccountTabValue>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const didFetchRef = useRef(false);

  const accountIdFromPath = id ? Number(id) : undefined;
  const accountId = useMemo(() => {
    if (Number.isFinite(accountIdFromPath)) {
      return accountIdFromPath as number;
    }
    if (account?.id && Number.isFinite(account.id)) {
      return account.id;
    }
    return undefined;
  }, [accountIdFromPath, account?.id]);

  const accountName = account?.name || "View Account";

  useEffect(() => {
    setTabValue(getTabFromPathname(pathname));
  }, [pathname]);

  useEffect(() => {
    if (initialState && !account) {
      setAccount(initialState);
    }
  }, [account, initialState]);

  useEffect(() => {
    if (!accountId) return;

    const cached = accountDetailsCache.get(accountId);
    if (cached) {
      setAccount(cached);
      return;
    }

    if (didFetchRef.current) return;
    didFetchRef.current = true;
    setIsLoading(true);

    (async () => {
      try {
        const { data } = await client.api.accountsDetail(accountId);
        accountDetailsCache.set(accountId, data);
        setAccount(data);
      } catch (error) {
        console.log(error);
        notificationsService.error("Could not retrieve account details.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [client, accountId, notificationsService]);

  const handleTabChange = (_event: SyntheticEvent, newValue: AccountTabValue) => {
    setTabValue(newValue);
    navigate(tabPathMap[newValue], {
      state: account ?? initialState ?? undefined,
    });
  };

  const handleEdit = () => {
    if (!accountId) return;
    navigate(`/${CoreModule.accounts}/${getEditFormRoute(accountId)}`, {
      state: account ?? undefined,
    });
  };

  const subtitleParts = [
    account?.cityName,
    account?.countryCode,
    account?.employeesRange && `${account.employeesRange} employees`,
  ].filter((part): part is string => !!part && part.trim().length > 0);

  const outletContext: AccountViewOutletContext = {
    account,
    accountId,
    isLoading,
  };

  return (
    <ModuleWrapper breadcrumbs={accountFormBreadcrumbLinks} currentBreadcrumb={accountName}>
      <Card variant="outlined" sx={{ mt: 4, mb: 3 }}>
        <CardContent
          sx={{
            p: 3,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
            gap: 3,
          }}
        >
          <Avatar
            src={account?.logoUrl || ""}
            sx={{
              width: 72,
              height: 72,
              fontSize: "1.5rem",
            }}
          >
            {getAccountInitials(account)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" fontWeight={700}>
              {accountName}
            </Typography>
            {account?.siteUrl ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                <a
                  href={account.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  {account.siteUrl}
                </a>
              </Typography>
            ) : subtitleParts.length > 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitleParts.join(" · ")}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                No account details yet
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            {account?.siteUrl && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ExternalLink size={16} />}
                component="a"
                href={account.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Website
              </Button>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<Edit size={16} />}
              onClick={handleEdit}
              disabled={!accountId}
            >
              Edit
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab value="overview" label="Overview" />
      </Tabs>
      <Divider />

      <Outlet context={outletContext} />
    </ModuleWrapper>
  );
};
