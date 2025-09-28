import { ConfigDto } from "@lib/network/swagger-client";

/**
 * Helper functions for accessing configuration settings
 */

/**
 * Check if realtime validation is enabled for content
 * Defaults to true if the setting is not present (backward compatibility)
 */
export const isRealtimeSyntaxValidationEnabled = (config: ConfigDto | null): boolean => {
  if (!config?.settings) {
    return true; // Default to enabled if no config or settings
  }

  const setting = config.settings["Content.EnableRealtimeSyntaxValidation"];

  // If setting is not present, default to true (enabled)
  if (setting === null || setting === undefined) {
    return true;
  }

  // Parse the string value as boolean
  return setting.toLowerCase() === "true";
};
