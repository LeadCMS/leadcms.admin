import { iconKeywordMap, defaultIcon } from "./icon-map";

export function getSectionIcon(title: string) {
  if (!title) return defaultIcon;

  const lowerTitle = title.toLowerCase();
  for (const { keywords, icon } of iconKeywordMap) {
    if (keywords.some((kw) => lowerTitle.includes(kw))) {
      return icon;
    }
  }
  return defaultIcon;
}
