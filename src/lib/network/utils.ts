export const buildAbsoluteUrl = (localUrl: string | null | undefined) => {
  if (!localUrl || localUrl.length === 0) {
    return "";
  }
  const coreApi = process.env.CORE_API;
  const base =
    coreApi && coreApi.trim().length > 0
      ? coreApi
      : typeof window !== "undefined" ? window.location.origin : "";
  if (!base) {
    throw new Error("Unable to determine base URL for absolute URL construction");
  }
  return new URL(localUrl, base).href;
};

export const getContentCoverImageUrl = (coverImageUrl?: string | null) => {
  if (!coverImageUrl || coverImageUrl.length === 0) {
    return "/images/placeholder.svg";
  }
  return buildAbsoluteUrl(coverImageUrl);
};
