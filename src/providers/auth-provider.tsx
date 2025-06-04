import { memo, PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import {
  PublicClientApplication,
  Configuration,
  InteractionStatus,
} from "@azure/msal-browser";
import { MsalProvider, useMsal} from "@azure/msal-react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useConfig } from "@providers/config-provider";

function RequireAuth({ children }: PropsWithChildren) {

  const { isTokenLoaded ,localToken} = useAuthState();
  const { accounts, inProgress  } = useMsal();
  const account = accounts.at(0);

  if (!isTokenLoaded || inProgress !== InteractionStatus.None) {
      return <Loading message="Authenticating, please wait..." />;
  }

  if (!account && !localToken && !window.location.pathname.startsWith("/auth")) {
    const from = encodeURIComponent(window.location.pathname);
    window.location.replace("/auth/login");
    return null;
  }

  if ((localToken || account) && window.location.pathname.startsWith("/auth")) {
    window.location.replace("/");
    return null; 
  }

  return <>{children}</>;
}

  export const Loading = ({ message = "Authenticating, please wait..." }: { message?: string }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        color: "text.primary",
        gap: 2,
      }}
    >
      <CircularProgress color="primary" />
      <Typography variant="h6" fontWeight={500}>
        {message}
      </Typography>
    </Box>
  );
};

export const AuthProvider = memo(function AuthProvider({ children }: PropsWithChildren) {
  
  const { config, loading } = useConfig();

  if (loading || !config?.auth?.msal) {
  return <Loading message="Loading configuration, please wait..." />;
  }

  const msalConfig: Configuration = {
    auth: {
      clientId: config.auth.msal.clientId?? "",
      redirectUri: location.origin,
      authority: config.auth.msal.authority,
    },
  };

  const msalInstance = new PublicClientApplication(msalConfig);

  return (
    <MsalProvider instance={msalInstance}>
      <RequireAuth>
        {children}
      </RequireAuth>
    </MsalProvider>
  );
});

export const useAuthState = () => {
  const [localToken, setLocalToken] = useState(() => localStorage.getItem("token"));
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);

  const { instance, accounts } = useMsal();

  const account = accounts.at(0);

  const getToken = useCallback(async () => {
    if (localToken) {
      return localToken;
    }

    try {
      const { idToken } = await instance.acquireTokenSilent({
        scopes: ["User.Read"],
        account,
        forceRefresh: true,
      });
      return idToken;
    } catch {
      return undefined;
    }
  }, [instance, account, localToken]);

  const logout = useCallback(async () => {
    if (instance && account) {
      await instance.logoutRedirect({
        postLogoutRedirectUri: "/auth/login",
      });
    } else{
      localStorage.removeItem("token");
      setLocalToken(null);
      window.location.replace("/auth/login");
    }
  }, [instance, account]);

  const reLogin = useCallback(async () => {
    if (instance && account) {
      await instance.logoutRedirect({
        postLogoutRedirectUri: "/auth/login",
      });
    }
    else{
      localStorage.removeItem("token");
      setLocalToken(null);
      window.location.replace("/auth/login");
    }

  }, [instance, account]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLocalToken(token);
    }
    setIsTokenLoaded(true); 
  }, []);

  return { account, getToken, logout, reLogin,localToken, setLocalToken ,isTokenLoaded};
};
