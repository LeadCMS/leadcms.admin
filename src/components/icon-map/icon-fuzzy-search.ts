import { iconKeywordMap, defaultIcon, defaultIconKey } from "./icon-map";

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

export function getSectionIconKey(title: string): string {
  if (!title) return defaultIconKey;
  const lowerTitle = title.toLowerCase();
  for (const { keywords, key } of iconKeywordMap) {
    if (keywords.some((kw) => lowerTitle.includes(kw))) {
      return key;
    }
  }
  return defaultIconKey;
}
