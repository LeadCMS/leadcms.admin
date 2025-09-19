import { ConfigDto } from "@lib/network/swagger-client";

export interface ContentLengthSettings {
  minTitleLength: number;
  maxTitleLength: number;
  minDescriptionLength: number;
  maxDescriptionLength: number;
}

/**
 * Extract content length settings from config
 */
export const getContentLengthSettings = (
  config: ConfigDto | null
): ContentLengthSettings | null => {
  if (!config?.settings) {
    return null;
  }

  const settings = config.settings;

  const minTitleLength = settings["Content.MinTitleLength"];
  const maxTitleLength = settings["Content.MaxTitleLength"];
  const minDescriptionLength = settings["Content.MinDescriptionLength"];
  const maxDescriptionLength = settings["Content.MaxDescriptionLength"];

  // All settings must be present
  if (!minTitleLength || !maxTitleLength || !minDescriptionLength || !maxDescriptionLength) {
    return null;
  }

  return {
    minTitleLength: parseInt(minTitleLength, 10),
    maxTitleLength: parseInt(maxTitleLength, 10),
    minDescriptionLength: parseInt(minDescriptionLength, 10),
    maxDescriptionLength: parseInt(maxDescriptionLength, 10),
  };
};

/**
 * Validate title length against settings
 */
export const validateTitleLength = (
  title: string,
  settings: ContentLengthSettings | null
): string | null => {
  if (!settings) return null;

  const length = title.length;

  if (length < settings.minTitleLength) {
    return `Title must be at least ${settings.minTitleLength} characters (currently ${length})`;
  }

  if (length > settings.maxTitleLength) {
    return `Title must be no more than ${settings.maxTitleLength} characters (currently ${length})`;
  }

  return null;
};

/**
 * Validate description length against settings
 */
export const validateDescriptionLength = (
  description: string,
  settings: ContentLengthSettings | null
): string | null => {
  if (!settings) return null;

  const length = description.length;

  if (length < settings.minDescriptionLength) {
    return (
      `Description must be at least ${settings.minDescriptionLength} characters ` +
      `(currently ${length})`
    );
  }

  if (length > settings.maxDescriptionLength) {
    return (
      `Description must be no more than ${settings.maxDescriptionLength} characters ` +
      `(currently ${length})`
    );
  }

  return null;
};
