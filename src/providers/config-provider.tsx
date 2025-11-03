import React, { createContext, useContext, useEffect, useState } from "react";
import { useRequestContext } from "@providers/request-provider";
import { ConfigDto } from "@lib/network/swagger-client";

interface ConfigContextType {
  config: ConfigDto | null;
  loading: boolean;
  error: string | null;
  reloadConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<ConfigDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { client } = useRequestContext();

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await client.api.configList();
      setConfig(response.data);
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
      const response = await client.api.configList();
      setConfig(response.data);
    } catch (e) {
      // Silent reload - don't update error state to avoid disrupting the UI
      console.warn("Failed to reload config:", e instanceof Error ? e.message : "Unknown error");
    }
  };

  useEffect(() => {
    loadConfig();
  }, [client]);

  return (
    <ConfigContext.Provider value={{ config, loading, error, reloadConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
};
