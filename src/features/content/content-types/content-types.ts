import { ContentDetails } from "../content-edit/types";
import dayjs from "dayjs";

export type ContentFormat = "MD" | "MDX" | "HTML" | "JSON" | "YAML" | "Plain Text";

export interface ContentTypeDefinition {
  /** Unique identifier for the content type (kebab-case) */
  id: string;
  /** Content format */
  format: ContentFormat;
  /** Whether this content type supports comments */
  supportsComments: boolean;
  /** Whether this content type supports cover images */
  supportsCoverImage: boolean;
}

/**
 * Predefined content types for a SaaS product website
 */
export const CONTENT_TYPES: ContentTypeDefinition[] = [
  {
    id: "blog-post",
    format: "MDX",
    supportsComments: true,
    supportsCoverImage: true
  },
  {
    id: "release-note",
    format: "MD",
    supportsComments: true,
    supportsCoverImage: true
  },
  {
    id: "case-study",
    format: "MDX",
    supportsComments: false,
    supportsCoverImage: true
  },
  {
    id: "documentation",
    format: "MDX",
    supportsComments: true,
    supportsCoverImage: false
  },
  {
    id: "feature",
    format: "MDX",
    supportsComments: false,
    supportsCoverImage: true
  },
  {
    id: "faq",
    format: "MDX",
    supportsComments: false,
    supportsCoverImage: false
  },
  {
    id: "landing",
    format: "MDX",
    supportsComments: false,
    supportsCoverImage: true
  },
  {
    id: "pricing",
    format: "JSON",
    supportsComments: false,
    supportsCoverImage: false
  },
  {
    id: "testimonial",
    format: "MD",
    supportsComments: false,
    supportsCoverImage: true
  },
  {
    id: "about-us",
    format: "MDX",
    supportsComments: false,
    supportsCoverImage: true
  },
  {
    id: "contact",
    format: "MDX",
    supportsComments: false,
    supportsCoverImage: false
  },
  {
    id: "legal",
    format: "MD",
    supportsComments: false,
    supportsCoverImage: false
  }
];

/**
 * Converts a display name to a content type ID (kebab-case)
 */
export const displayNameToId = (displayName: string): string => {
  if (!displayName) return "";
  return displayName.toLowerCase().replace(/\s+/g, "-");
};

/**
 * Converts a content type ID to display name (Title Case)
 */
export const idToDisplayName = (id: string): string => {
  return id
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Gets custom content types from localStorage
 */
export const getCustomContentTypes = (): ContentTypeDefinition[] => {
  try {
    const stored = localStorage.getItem("leadcms_content_types");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error parsing custom content types:", e);
  }
  return [];
};

/**
 * Saves custom content types to localStorage
 */
export const saveCustomContentTypes = (customTypes: ContentTypeDefinition[]): void => {
  try {
    localStorage.setItem("leadcms_content_types", JSON.stringify(customTypes));
  } catch (e) {
    console.error("Error saving custom content types:", e);
  }
};

/**
 * Adds a new custom content type
 */
export const addCustomContentType = (newType: {
  id: string;
  format: ContentFormat;
  supportsComments: boolean;
  supportsCoverImage: boolean;
}): ContentTypeDefinition => {
  const customTypes = getCustomContentTypes();
  const contentType: ContentTypeDefinition = {
    id: newType.id,
    format: newType.format,
    supportsComments: newType.supportsComments,
    supportsCoverImage: newType.supportsCoverImage
  };
  
  // Check if content type already exists
  const existingIndex = customTypes.findIndex(type => type.id === contentType.id);
  if (existingIndex >= 0) {
    // Replace existing
    customTypes[existingIndex] = contentType;
  } else {
    // Add new
    customTypes.push(contentType);
  }
  
  saveCustomContentTypes(customTypes);
  return contentType;
};

/**
 * Returns all content types (static + custom from localStorage)
 */
export const getAllContentTypes = (): ContentTypeDefinition[] => {
  const customTypes = getCustomContentTypes();
  
  // Merge static and custom, custom overrides static by id
  const merged = [...CONTENT_TYPES];
  customTypes.forEach((ct) => {
    const idx = merged.findIndex((t) => t.id === ct.id);
    if (idx >= 0) {
      merged[idx] = ct;
    } else {
      merged.push(ct);
    }
  });
  return merged;
};

/**
 * Gets a content type definition by its ID (from merged list)
 * If not found, returns a default configuration for unknown types
 */
export const getContentTypeById = (id: string): ContentTypeDefinition => {
  const found = getAllContentTypes().find((type) => type.id === id);
  
  if (found) {
    return found;
  }
  
  // Return default configuration for unknown content types
  return {
    id: id,
    format: "MDX",
    supportsComments: true,
    supportsCoverImage: true
  };
};

/**
 * Generate default values for a content type (from merged list)
 */
export const generateDefaultValues = (contentTypeId: string): ContentDetails => {
  const contentType = getContentTypeById(contentTypeId);
  
  const baseDefaults: ContentDetails = {
    id: null,
    type: contentTypeId,
    title: "",
    description: "",
    body: "",
    coverImageUrl: "",
    coverImagePending: { fileName: "", url: "" },
    coverImageAlt: "",
    slug: "",
    author: "",
    language: "",
    allowComments: contentType.supportsComments,
    tags: [],
    category: "",
    createdAt: "",
    updatedAt: "",
    publishedAt: dayjs().toISOString(),
    files: null,
  };

  return baseDefaults;
};

/**
 * Get array of content type display names for dropdown
 */
export const getContentTypeOptions = (): string[] => {
  return getAllContentTypes().map(type => idToDisplayName(type.id));
};

/**
 * Create default values for all content types
 */
export const createContentTypeDefaultValues = ()
    : { type: string; defaultValues: ContentDetails }[] => {
  return getAllContentTypes().map(contentType => ({
    type: contentType.id,
    defaultValues: generateDefaultValues(contentType.id),
  }));
};
