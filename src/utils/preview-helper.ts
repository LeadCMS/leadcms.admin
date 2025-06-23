export const generateSitePreviewUrl = (
  template: string,
  params: Record<string, unknown>
): string => {
  let url = template;
  Object.keys(params).forEach((key) => {
    url = url.replace(
      new RegExp(`{${key}}`, "g"),
      encodeURIComponent(params[key] !== undefined ? String(params[key]) : "")
    );
  });
  return url;
};

export const openSitePreview = (
  params: Record<string, unknown>,
  template: string
): boolean => {
  // Check for required parameters
  const placeholders = template.match(/{(.*?)}/g) || [];
  const missingKeys = placeholders
    .map((k) => k.replace(/[{}]/g, ""))
    .filter((key) => !params[key]);
    
  if (missingKeys.length > 0) {
    console.debug(
      "[PreviewHelper] Missing required params for site preview:",
      missingKeys,
      { params, template }
    );
    return false;
  }
  
  const previewUrl = generateSitePreviewUrl(template, params);
  console.log("[PreviewHelper] Opening site preview:", previewUrl);
  
  // Open in new tab
  window.open(previewUrl, "_blank", "noopener,noreferrer");
  return true;
};
