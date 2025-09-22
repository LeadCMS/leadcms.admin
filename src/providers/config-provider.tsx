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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch /api/config");
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
