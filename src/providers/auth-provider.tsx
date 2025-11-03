import { memo, PropsWithChildren, useCallback, useEffect, useState } from "react";
import { PublicClientApplication, Configuration, InteractionStatus } from "@azure/msal-browser";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import { useConfig } from "@providers/config-provider";
import { Api } from "@lib/network/swagger-client";
import { buildAbsoluteUrl } from "@lib/network/utils";

function RequireAuth({ children }: PropsWithChildren) {
  const { isTokenLoaded, localToken, getToken, authError } = useAuthState();
  const { accounts, inProgress } = useMsal();
  const account = accounts.at(0);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);

  // Handle Microsoft authentication token exchange
  // Only exchange tokens if we have Microsoft account but no local token
  useEffect(() => {
    if (account && !localToken && !isProcessingAuth && isTokenLoaded && !authError) {
      setIsProcessingAuth(true);
      getToken().finally(() => setIsProcessingAuth(false));
    }
  }, [account, localToken, isProcessingAuth, isTokenLoaded, getToken, authError]);

  // Show authentication error if token exchange failed
  if (authError) {
    return (
      <Loading message="Authentication failed" showProgress={false}>
        <Alert severity="error" sx={{ mt: 2, maxWidth: 600 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Error:</strong> {authError}
          </Typography>
          <Typography variant="body2">
            Please try refreshing the page or{" "}
            <Box
              component="a"
              href="/auth/login"
              onClick={() => {
                localStorage.removeItem("token");
              }}
              sx={{
                color: "inherit",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              logging in again
            </Box>
            .
          </Typography>
        </Alert>
      </Loading>
    );
  }

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
  children,
}: PropsWithChildren<{
  message?: string;
  showProgress?: boolean;
}>) => {
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
      {children}
    </Box>
  );
};

export const AuthProvider = memo(function AuthProvider({ children }: PropsWithChildren) {
  const { config, loading, error } = useConfig();

  if (loading) {
    return <Loading message="Loading configuration, please wait..." />;
  }

  // Handle configuration loading errors (network issues, server down, etc.)
  if (error) {
    const isNetworkError = error.toLowerCase().includes("network") || error.includes("fetch");
    const errorTitle = isNetworkError
      ? "Unable to connect to server"
      : "Configuration loading failed";

    return (
      <Loading message={errorTitle} showProgress={false}>
        <Alert severity="error" sx={{ mt: 2, maxWidth: 600 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Error:</strong> {error}
          </Typography>
          {isNetworkError ? (
            <Typography variant="body2">
              Please check your network connection and ensure the server is running. Then{" "}
              <Box
                component="a"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.reload();
                }}
                sx={{
                  color: "inherit",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                refresh the page
              </Box>
              .
            </Typography>
          ) : (
            <Typography variant="body2">
              The server returned an error. Please contact your administrator or try again later.
            </Typography>
          )}
        </Alert>
      </Loading>
    );
  }

  // Check if config was loaded but has no authentication methods configured
  if (!config?.auth || !Array.isArray(config.auth.methods) || config.auth.methods.length === 0) {
    return (
      <Loading message="Configuration Error" showProgress={false}>
        <Alert severity="warning" sx={{ mt: 2, maxWidth: 600 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>No authentication methods are configured.</strong>
          </Typography>
          <Typography variant="body2">
            Please contact your administrator to configure authentication methods for this
            application.
          </Typography>
        </Alert>
      </Loading>
    );
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
  const [authError, setAuthError] = useState<string | null>(null);

  const { instance, accounts } = useMsal();

  const account = accounts.at(0);

  const getToken = useCallback(async () => {
    if (localToken) {
      return localToken;
    }

    // If we have a Microsoft account but no local token, try to exchange
    if (account && !isExchangingToken) {
      setIsExchangingToken(true);
      setAuthError(null); // Clear previous errors
      try {
        const { idToken } = await instance.acquireTokenSilent({
          scopes: ["User.Read"],
          account,
        });

        // Exchange Microsoft token for local JWT using API client
        // Use buildAbsoluteUrl to get the base URL (handles CORE_API env var and fallback)
        const baseUrl = buildAbsoluteUrl("/api");
        const apiClient = new Api({
          baseUrl: baseUrl.replace("/api", ""), // Remove the /api suffix to get base URL
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
          const errorMsg = "Token exchange failed: No token received from server";
          console.error(errorMsg);
          setAuthError(errorMsg);
          return undefined;
        }
      } catch (error: unknown) {
        let errorMsg = "Token exchange failed. Please check your network connection and try again.";
        if (error && typeof error === "object") {
          const err = error as { error?: { message?: string }; message?: string };
          errorMsg = err?.error?.message || err?.message || errorMsg;
        }
        console.error("Token exchange failed:", error);
        setAuthError(errorMsg);
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

  return {
    account,
    getToken,
    logout,
    reLogin,
    localToken,
    setLocalToken,
    isTokenLoaded,
    authError,
  };
};
