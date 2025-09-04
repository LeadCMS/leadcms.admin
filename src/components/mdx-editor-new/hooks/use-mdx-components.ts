import { useEffect, useState, useMemo } from "react";
import { useRequestContext } from "@providers/request-provider";
import { MdxComponentAnalysisDto, MdxComponentDto } from "@lib/network/swagger-client";

interface UseMdxComponentsOptions {
  contentType?: string;
  useCache?: boolean;
  maxCacheAgeHours?: number;
}

interface UseMdxComponentsResult {
  components: MdxComponentDto[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook to fetch MDX components for a specific content type
 */
export const useMdxComponents = ({
  contentType,
  useCache = true,
  maxCacheAgeHours = 1,
}: UseMdxComponentsOptions = {}): UseMdxComponentsResult => {
  const { client } = useRequestContext();
  const [data, setData] = useState<MdxComponentAnalysisDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComponents = async () => {
    if (!contentType || !client) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await client.api.contentMdxComponentsDetail(contentType, {
        useCache,
        maxCacheAgeHours,
      });
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch MDX components:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch MDX components");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch components when contentType changes
  useEffect(() => {
    fetchComponents();
  }, [contentType, useCache, maxCacheAgeHours]);

  // Memoize the components array to prevent unnecessary re-renders
  const components = useMemo(() => {
    return data?.components || [];
  }, [data?.components]);

  return {
    components,
    loading,
    error,
    refresh: fetchComponents,
  };
};
