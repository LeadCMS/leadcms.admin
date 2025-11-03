import { memo, PropsWithChildren, useCallback, useEffect, useState } from "react";
import { PublicClientApplication, Configuration, InteractionStatus } from "@azure/msal-browser";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useConfig } from "@providers/config-provider";
import { Api } from "@lib/network/swagger-client";

function RequireAuth({ children }: PropsWithChildren) {
  const { isTokenLoaded, localToken, getToken } = useAuthState();
  const { accounts, inProgress } = useMsal();
  const account = accounts.at(0);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);

  // Handle Microsoft authentication token exchange
  // Only exchange tokens if we have Microsoft account but no local token
  useEffect(() => {
    if (account && !localToken && !isProcessingAuth && isTokenLoaded) {
      setIsProcessingAuth(true);
      getToken().finally(() => setIsProcessingAuth(false));
    }
  }, [account, localToken, isProcessingAuth, isTokenLoaded, getToken]);

  if (!isTokenLoaded || inProgress !== InteractionStatus.None || isProcessingAuth) {
    return <Loading message="Authenticating, please wait..." />;
  }

  // Check if we need to handle device verification flow
  const isDeviceVerifyPath = window.location.pathname === "/auth/device-verify";

  if (!localToken && !account && !window.location.pathname.startsWith("/auth")) {
    // Preserve current URL as return URL when redirecting to login
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.replace(`/auth/login?returnUrl=${returnUrl}`);
    return null;
  }

  if (localToken && window.location.pathname.startsWith("/auth") && !isDeviceVerifyPath) {
    // Check for return URL from multiple sources
    const urlParams = new URLSearchParams(window.location.search);
    let returnUrl = urlParams.get("returnUrl");

    // Also check Microsoft auth state parameter for return URL
    if (!returnUrl && account?.idTokenClaims?.state) {
      try {
        const stateData = JSON.parse(account.idTokenClaims.state as string);
        returnUrl = stateData.returnUrl;
      } catch {
        // Ignore invalid JSON in state
      }
    }

    const redirectUrl = returnUrl ? decodeURIComponent(returnUrl) : "/";
    window.location.replace(redirectUrl);
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
  const [isExchangingToken, setIsExchangingToken] = useState(false);

  const { instance, accounts } = useMsal();

  const account = accounts.at(0);

  const getToken = useCallback(async () => {
    if (localToken) {
      return localToken;
    }

    // If we have a Microsoft account but no local token, try to exchange
    if (account && !isExchangingToken) {
      setIsExchangingToken(true);
      try {
        const { idToken } = await instance.acquireTokenSilent({
          scopes: ["User.Read"],
          account,
        });

        // Exchange Microsoft token for local JWT using API client
        const apiClient = new Api({
          baseUrl: process.env.CORE_API,
        });

        const result = await apiClient.api.identityExchangeTokenCreate({
          microsoftToken: idToken,
        });

        if (result.data?.token) {
          localStorage.setItem("token", result.data.token);
          setLocalToken(result.data.token);

          // Clear Microsoft account cache after successful exchange
          // This ensures logout works properly and we don't keep Microsoft tokens
          try {
            await instance.clearCache();
          } catch (error) {
            console.warn("Failed to clear Microsoft cache:", error);
          }

          return result.data.token;
        } else {
          console.error("Token exchange failed: No token in response");
          // If exchange fails, we should not use Microsoft token
          return undefined;
        }
      } catch (error) {
        console.error("Token exchange failed:", error);
        // If token exchange fails, we should not fallback to Microsoft token
        return undefined;
      } finally {
        setIsExchangingToken(false);
      }
    }

    return undefined;
  }, [instance, account, localToken, isExchangingToken]);

  const logout = useCallback(async () => {
    // Clear local token
    localStorage.removeItem("token");
    setLocalToken(null);

    // Clear any remaining Microsoft cache to ensure clean logout
    try {
      if (instance && accounts.length > 0) {
        await instance.clearCache();
      }
    } catch (error) {
      console.warn("Failed to clear Microsoft cache during logout:", error);
    }

    // Redirect to login
    window.location.replace("/auth/login");
  }, [instance, accounts]);

  const reLogin = useCallback(async () => {
    // Clear local token
    localStorage.removeItem("token");
    setLocalToken(null);

    // Clear any remaining Microsoft cache to ensure clean logout
    try {
      if (instance && accounts.length > 0) {
        await instance.clearCache();
      }
    } catch (error) {
      console.warn("Failed to clear Microsoft cache during reLogin:", error);
    }

    // Redirect to login
    window.location.replace("/auth/login");
  }, [instance, accounts]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLocalToken(token);
    }
    setIsTokenLoaded(true);
  }, []);

  return { account, getToken, logout, reLogin, localToken, setLocalToken, isTokenLoaded };
};
