import { useEffect, useState, useMemo } from "react";
import { useRequestContext } from "@providers/request-provider";
import { MdxComponentAnalysisDto, MdxComponentDto } from "@lib/network/swagger-client";

interface UseMdxComponentsOptions {
  contentType?: string;
  useCache?: boolean;
  maxCacheAgeHours?: number;
  preloadedData?: MdxComponentAnalysisDto | null;
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
  preloadedData,
}: UseMdxComponentsOptions = {}): UseMdxComponentsResult => {
  const { client } = useRequestContext();
  const [data, setData] = useState<MdxComponentAnalysisDto | null>(preloadedData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set preloaded data when it becomes available
  useEffect(() => {
    if (preloadedData) {
      setData(preloadedData);
      setLoading(false);
      setError(null);
    }
  }, [preloadedData]);

  const fetchComponents = async (forceRefresh = false) => {
    // Skip fetching if we have preloaded data for the same content type and it's not a
    // forced refresh
    if (preloadedData && preloadedData.contentType === contentType && !forceRefresh) {
      console.log("Using preloaded MDX components for content type:", contentType);
      return;
    }

    if (!contentType || !client) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    // Don't fetch if we already have data for this content type
    if (data && data.contentType === contentType && !forceRefresh) {
      console.log("Using cached MDX components for content type:", contentType);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching MDX components for content type:", contentType);
      const response = await client.api.contentMdxComponentsDetail(contentType, {
        useCache: forceRefresh ? false : useCache,
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

  // Fetch components when contentType changes (only if no suitable data exists)
  useEffect(() => {
    // If we have preloaded data for the current content type, use it
    if (preloadedData && preloadedData.contentType === contentType) {
      setData(preloadedData);
      setLoading(false);
      setError(null);
      return;
    }

    // If we already have data for this content type, don't fetch again
    if (data && data.contentType === contentType) {
      return;
    }

    // Only fetch if we don't have preloaded data
    if (!preloadedData) {
      fetchComponents();
    }
  }, [contentType, useCache, maxCacheAgeHours]);

  // Memoize the components array to prevent unnecessary re-renders
  const components = useMemo(() => {
    return data?.components || [];
  }, [data?.components]);

  return {
    components,
    loading,
    error,
    refresh: () => fetchComponents(true),
  };
};
