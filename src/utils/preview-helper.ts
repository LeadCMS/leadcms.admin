export const generateSitePreviewUrl = (
  template: string,
  params: Record<string, unknown>,
  defaultLanguage?: string
): string => {
  let url = template;

  // Create enhanced params with calculated fields
  const enhancedParams = { ...params };

  // Calculate lang parameter
  if (params.language) {
    const langPrefix = calculateLangPrefix(String(params.language), defaultLanguage);
    // Remove trailing slash for standalone lang parameter
    enhancedParams["lang"] = langPrefix.replace(/\/$/, "");
  }

  // Calculate lang+slug parameter
  if (params.language && params.slug) {
    const lang = calculateLangPrefix(String(params.language), defaultLanguage);
    enhancedParams["lang+slug"] = `${lang}${params.slug}`;
  }

  Object.keys(enhancedParams).forEach((key) => {
    // Escape special regex characters in the key
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    url = url.replace(
      new RegExp(`\\{${escapedKey}\\}`, "g"),
      enhancedParams[key] !== undefined ? String(enhancedParams[key]) : ""
    );
  });
  return url;
};

export const calculateLangPrefix = (contentLanguage: string, defaultLanguage?: string): string => {
  if (!contentLanguage || !defaultLanguage || contentLanguage === defaultLanguage) {
    return "";
  }
  return `${contentLanguage}/`;
};

export const openSitePreview = (
  params: Record<string, unknown>,
  template: string,
  defaultLanguage?: string
): boolean => {
  // Generate the preview URL (this will calculate lang+slug and other enhanced params)
  const previewUrl = generateSitePreviewUrl(template, params, defaultLanguage);

  // Check if there are still unresolved placeholders after URL generation
  const unresolvedPlaceholders = previewUrl.match(/{(.*?)}/g) || [];

  if (unresolvedPlaceholders.length > 0) {
    const missingKeys = unresolvedPlaceholders.map((k) => k.replace(/[{}]/g, ""));
    console.debug("[PreviewHelper] Missing required params for site preview:", missingKeys, {
      params,
      template,
      previewUrl,
    });
    return false;
  }

  console.log("[PreviewHelper] Opening site preview:", previewUrl);

  // Open in new tab
  window.open(previewUrl, "_blank", "noopener,noreferrer");
  return true;
};
