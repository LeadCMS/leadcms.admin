export const buildAbsoluteUrl = (localUrl: string | null | undefined) => {
  if (!localUrl || localUrl.length === 0) {
    return "";
  }
  const coreApi = process.env.CORE_API;
  const base =
    coreApi && coreApi.trim().length > 0
      ? coreApi
      : typeof window !== "undefined"
      ? window.location.origin
      : "";
  if (!base) {
    throw new Error("Unable to determine base URL for absolute URL construction");
  }
  return new URL(localUrl, base).href;
};

export const getContentCoverImageUrl = (
  coverImageUrl?: string | null,
  cacheKey?: string | number | null
) => {
  if (!coverImageUrl || coverImageUrl.length === 0) {
    return "/images/placeholder.svg";
  }
  return buildAbsoluteUrlWithCacheBustKey(coverImageUrl, cacheKey);
};

// Simple hash function for cache busting
const simpleHash = (str: string): string => {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

export const buildAbsoluteUrlWithCacheBust = (
  localUrl: string | null | undefined,
  size?: number,
  updatedAt?: string | null
) => {
  if (!localUrl || localUrl.length === 0) {
    return "";
  }

  const baseUrl = buildAbsoluteUrl(localUrl);

  // If we have size and updatedAt, generate cache busting parameter
  if (size !== undefined && updatedAt) {
    const cacheKey = `${size}-${updatedAt}`;
    const hash = simpleHash(cacheKey);
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}v=${hash}`;
  }

  return baseUrl;
};

export const buildAbsoluteUrlWithCacheBustKey = (
  localUrl: string | null | undefined,
  cacheKey?: string | number | null
) => {
  if (!localUrl || localUrl.length === 0) {
    return "";
  }

  const baseUrl = buildAbsoluteUrl(localUrl);

  if (cacheKey === undefined || cacheKey === null || cacheKey === "") {
    return baseUrl;
  }

  const hash = simpleHash(String(cacheKey));
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}v=${hash}`;
};
