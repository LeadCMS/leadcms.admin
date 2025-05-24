export const buildAbsoluteUrl = (localUrl: string | null | undefined) => {
  if (localUrl === null || localUrl === undefined || localUrl.length === 0) {
    return "";
  }
  if (!process.env.CORE_API) {
    throw new Error("CORE_API environment variable is not defined");
  }
  return new URL(localUrl, process.env.CORE_API).href;
};

export const getContentCoverImageUrl = (coverImageUrl?: string | null) => {
  if (!coverImageUrl || coverImageUrl.length === 0) {
    return "/images/placeholder.svg";
  }
  return buildAbsoluteUrl(coverImageUrl);
};
