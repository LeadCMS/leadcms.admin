import React, { createContext, useContext, useEffect, useState } from "react";
import { useRequestContext } from "@providers/request-provider";
import { ConfigDto } from "@lib/network/swagger-client";

interface ConfigContextType {
  config: ConfigDto | null;
  loading: boolean;
  error: string | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<ConfigDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { client } = useRequestContext();

  useEffect(() => {
    let isMounted = true;
    client.api
      .configList()
      .then((response) => {
        if (isMounted) {
          setConfig(response.data);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (isMounted) {
          setError(e instanceof Error ? e.message : "Failed to fetch /api/config");
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [client]);

  return (
    <ConfigContext.Provider value={{ config, loading, error }}>{children}</ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
};
