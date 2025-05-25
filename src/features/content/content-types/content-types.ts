import { ContentDetails } from "../content-edit/types";
import dayjs from "dayjs";

export type ContentFormat = "MD" | "MDX" | "HTML" | "JSON" | "YAML" | "Plain Text";

export interface ContentTypeDefinition {
  /** Unique identifier for the content type (kebab-case) */
  id: string;
  /** Display name for the content type (Title Case) */
  displayName: string;
  /** Content format */
  format: ContentFormat;
  /** Whether this content type supports comments */
  supportsComments: boolean;
  /** Whether this content type supports cover images */
  supportsCoverImage: boolean;
  /** Default values for this content type */
  defaultValues: Partial<ContentDetails>;
}

/**
 * Predefined content types for a SaaS product website
 */
export const CONTENT_TYPES: ContentTypeDefinition[] = [
  {
    id: "blog-post",
    displayName: "Blog Post",
    format: "MDX",
    supportsComments: true,
    supportsCoverImage: true,
    defaultValues: {
      allowComments: true,
    }
  },
  {
    id: "release-note",
    displayName: "Release Note",
    format: "MD",
    supportsComments: true,
    supportsCoverImage: true,
    defaultValues: {
      allowComments: true,
    }
  },
  {
    id: "case-study",
    displayName: "Case Study",
    format: "MDX",
    supportsComments: false,
    supportsCoverImage: true,
    defaultValues: {
      allowComments: false,
    }
  },
  {
    id: "documentation",
    displayName: "Documentation",
    format: "MDX",
    supportsComments: true,
    supportsCoverImage: false,
    defaultValues: {
      allowComments: true,
    }
  },
  {
    id: "feature",
    displayName: "Feature",
    format: "MDX",
    supportsComments: false,
    supportsCoverImage: true,
    defaultValues: {
      allowComments: false,
    }
  },
  {
    id: "faq",
    displayName: "FAQ",
    format: "MDX",
    supportsComments: false,
    supportsCoverImage: false,
    defaultValues: {
      allowComments: false,
    }
  },
  {
    id: "landing",
    displayName: "Landing",
    format: "MDX",
    supportsComments: false,
    supportsCoverImage: true,
    defaultValues: {
      allowComments: false,
    }
  },
  {
    id: "pricing",
    displayName: "Pricing",
    format: "JSON",
    supportsComments: false,
    supportsCoverImage: false,
    defaultValues: {
      allowComments: false,
    }
  },
  {
    id: "testimonial",
    displayName: "Testimonial",
    format: "MD",
    supportsComments: false,
    supportsCoverImage: true,
    defaultValues: {
      allowComments: false,
    }
  },
  {
    id: "about-us",
    displayName: "About Us",
    format: "MDX",
    supportsComments: false,
    supportsCoverImage: true,
    defaultValues: {
      allowComments: false,
    }
  },
  {
    id: "contact",
    displayName: "Contact",
    format: "MDX",
    supportsComments: false,
    supportsCoverImage: false,
    defaultValues: {
      allowComments: false,
    }
  },
  {
    id: "legal",
    displayName: "Legal",
    format: "MD",
    supportsComments: false,
    supportsCoverImage: false,
    defaultValues: {
      allowComments: false,
    }
  },
  {
    id: "integration",
    displayName: "Integration",
    format: "MDX",
    supportsComments: false,
    supportsCoverImage: true,
    defaultValues: {
      allowComments: false,
    }
  },
  {
    id: "api-reference",
    displayName: "API Reference",
    format: "MDX",
    supportsComments: true,
    supportsCoverImage: false,
    defaultValues: {
      allowComments: true,
    }
  }
];

/**
 * Converts a display name to a content type ID (kebab-case)
 */
export const displayNameToId = (displayName: string): string => {
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
 * Returns all content types (static + custom from localStorage)
 */
export const getAllContentTypes = (): ContentTypeDefinition[] => {
  let customTypes: ContentTypeDefinition[] = [];
  try {
    const stored = localStorage.getItem("leadcms_content_types");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        customTypes = parsed;
      }
    }
  } catch (e) {
    // ignore
  }
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
 */
export const getContentTypeById = (id: string): ContentTypeDefinition | undefined => {
  return getAllContentTypes().find((type) => type.id === id);
};

/**
 * Gets a content type definition by its display name (from merged list)
 */
export const getContentTypeByDisplayName = (displayName: string)
  : ContentTypeDefinition | undefined => {
  const id = displayNameToId(displayName);
  return getContentTypeById(id);
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
    allowComments: false,
    tags: [],
    category: "",
    createdAt: "",
    updatedAt: "",
    publishedAt: dayjs().toISOString(),
    files: null,
  };

  if (contentType) {
    return {
      ...baseDefaults,
      ...contentType.defaultValues,
    };
  }

  return baseDefaults;
};

/**
 * Get array of content type display names for dropdown
 */
export const getContentTypeOptions = (): string[] => {
  return CONTENT_TYPES.map(type => type.displayName);
};

/**
 * Create default values for all content types
 */
export const createContentTypeDefaultValues = ()
    : { type: string; defaultValues: ContentDetails }[] => {
  return CONTENT_TYPES.map(contentType => ({
    type: contentType.id,
    defaultValues: generateDefaultValues(contentType.id),
  }));
};
