import React, { createContext, useContext, useEffect, useState } from "react";
import { useRequestContext } from "@providers/request-provider";
import { ConfigDto } from "@lib/network/swagger-client";
import { PrimaryCurrencyConfig } from "@utils/currency-formatter";

interface ExtendedConfigDto extends ConfigDto {
  primaryCurrency?: PrimaryCurrencyConfig;
}

interface ConfigContextType {
  config: ExtendedConfigDto | null;
  loading: boolean;
  error: string | null;
  reloadConfig: () => Promise<void>;
  primaryCurrency: PrimaryCurrencyConfig | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<ExtendedConfigDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { client } = useRequestContext();

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      // Config is required before auth bootstrap; do not attach auth requirements here.
      const response = await client.api.configList({ secure: false });
      setConfig(response.data as ExtendedConfigDto);
    } catch (e: unknown) {
      let errorMessage = "Failed to load configuration from /api/config";

      if (e && typeof e === "object") {
        const error = e as {
          message?: string;
          status?: number;
          error?: { message?: string; title?: string };
        };

        // Check for network errors
        if (error.message?.toLowerCase().includes("network") || error.message?.includes("fetch")) {
          errorMessage =
            "Network error: Unable to connect to the server. Check your internet connection.";
        }
        // Check for specific HTTP status codes
        else if (error.status === 404) {
          errorMessage =
            "Configuration endpoint not found (404). The server may not be configured correctly.";
        } else if (error.status === 500) {
          errorMessage = "Server error (500): The server encountered an internal error.";
        } else if (error.status === 503) {
          errorMessage = "Service unavailable (503): The server is temporarily unavailable.";
        }
        // Extract error message from API response
        else if (error.error?.message) {
          errorMessage = `Server error: ${error.error.message}`;
        } else if (error.error?.title) {
          errorMessage = `Server error: ${error.error.title}`;
        } else if (
          error.message?.includes("Unexpected token '<'") ||
          error.message?.includes("<!DOCTYPE")
        ) {
          errorMessage =
            "Configuration endpoint returned HTML instead of JSON. Verify API routing/auth rules for /api/config.";
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      console.error("Failed to load config:", e);
    } finally {
      setLoading(false);
    }
  };

  const reloadConfig = async () => {
    try {
      setError(null);
      const response = await client.api.configList({ secure: false });
      setConfig(response.data as ExtendedConfigDto);
    } catch (e) {
      // Silent reload - don't update error state to avoid disrupting the UI
      console.warn("Failed to reload config:", e instanceof Error ? e.message : "Unknown error");
    }
  };

  useEffect(() => {
    loadConfig();
  }, [client]);

  return (
    <ConfigContext.Provider
      value={{
        config,
        loading,
        error,
        reloadConfig,
        primaryCurrency: config?.primaryCurrency ?? null,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
};
