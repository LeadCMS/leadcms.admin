import { memo, PropsWithChildren, useCallback, useEffect, useState } from "react";
import { PublicClientApplication, Configuration, InteractionStatus } from "@azure/msal-browser";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useConfig } from "@providers/config-provider";

function RequireAuth({ children }: PropsWithChildren) {
  const { isTokenLoaded, localToken } = useAuthState();
  const { accounts, inProgress } = useMsal();
  const account = accounts.at(0);

  if (!isTokenLoaded || inProgress !== InteractionStatus.None) {
    return <Loading message="Authenticating, please wait..." />;
  }

  if (!account && !localToken && !window.location.pathname.startsWith("/auth")) {
    window.location.replace("/auth/login");
    return null;
  }

  if ((localToken || account) && window.location.pathname.startsWith("/auth")) {
    window.location.replace("/");
    return null;
  }

  return <>{children}</>;
}

export const Loading = ({
  message = "Authenticating, please wait...",
  showProgress = true,
}: {
  message?: string;
  showProgress?: boolean;
}) => {
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
      {showProgress && <CircularProgress color="primary" />}
      <Typography variant="h6" fontWeight={500}>
        {message}
      </Typography>
    </Box>
  );
};

export const AuthProvider = memo(function AuthProvider({ children }: PropsWithChildren) {
  const { config, loading } = useConfig();

  if (loading) {
    return <Loading message="Loading configuration, please wait..." />;
  }

  if (!config?.auth || !Array.isArray(config.auth.methods) || config.auth.methods.length === 0) {
    return <Loading message="No authentication methods are configured." showProgress={false} />;
  }

  const hasLocal = config.auth.methods.includes("Local");
  const hasAzure = config.auth.methods.includes("AzureAD");
  const msalConfigObj = config.auth.msal;

  if (!hasLocal && hasAzure) {
    if (!msalConfigObj) {
      return (
        <Loading
          message="Azure authentication is configured, but MSAL settings are missing."
          showProgress={false}
        />
      );
    }
  }

  if (hasAzure && msalConfigObj) {
    const msalConfig: Configuration = {
      auth: {
        clientId: msalConfigObj.clientId ?? "",
        redirectUri: location.origin,
        authority: msalConfigObj.authority,
      },
    };

    const msalInstance = new PublicClientApplication(msalConfig);

    return (
      <MsalProvider instance={msalInstance}>
        <RequireAuth>{children}</RequireAuth>
      </MsalProvider>
    );
  } else {
    return <RequireAuth>{children}</RequireAuth>;
  }
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
    } else {
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
    } else {
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

  return { account, getToken, logout, reLogin, localToken, setLocalToken, isTokenLoaded };
};
