import { ContentDetails } from "../content-edit/types";
import { ContentTypeDetailsDto, ContentTypeCreateDto } from "../../../lib/network/swagger-client";

export type ContentFormat = "MD" | "MDX" | "HTML" | "JSON" | "YAML" | "Plain Text";

// Converts a display name to a content type ID (kebab-case)
export const displayNameToId = (displayName: string): string => {
  if (!displayName) return "";
  return displayName.toLowerCase().replace(/\s+/g, "-");
};

// Converts a content type ID to display name (Title Case)
export const idToDisplayName = (id: string): string => {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Use a minimal public API interface instead of 'any' or private types
export interface ContentApi {
  api: {
    contentTypesList: () => Promise<{ data: ContentTypeDetailsDto[] }>;
    contentTypesCreate: (payload: ContentTypeCreateDto) => Promise<{ data: ContentTypeDetailsDto }>;
  };
}

// Fetch all content types from API
export const fetchAllContentTypes = async (
  client: ContentApi
): Promise<ContentTypeDetailsDto[]> => {
  const res = await client.api.contentTypesList();
  return res.data;
};

// Fetch a content type definition by its ID from API (returns null if not found)
export const getContentTypeByUid = async (
  client: ContentApi,
  uid: string
): Promise<ContentTypeDetailsDto | null> => {
  const types = await fetchAllContentTypes(client);
  const found = types.find((type) => type.uid === uid);
  return found || null;
};

// Add a new content type via API
export const addContentType = async (
  client: ContentApi,
  newType: {
    id: string;
    format: ContentFormat;
    supportsComments: boolean;
    supportsCoverImage: boolean;
  }
): Promise<ContentTypeDetailsDto> => {
  const payload: ContentTypeCreateDto = {
    uid: newType.id,
    format: newType.format === "Plain Text" ? "PlainText" : newType.format,
    supportsComments: newType.supportsComments,
    supportsCoverImage: newType.supportsCoverImage,
  };
  const res = await client.api.contentTypesCreate(payload);
  return res.data;
};

// Generate default values for a content type (from API list)
export const generateDefaultValues = (contentUid: string, authorName?: string): ContentDetails => {
  return {
    id: null,
    type: contentUid,
    title: "",
    description: "",
    body: "",
    coverImageUrl: "",
    coverImagePending: { fileName: "", url: "" },
    coverImageAlt: "",
    slug: "",
    author: authorName || "",
    language: "",
    translationKey: null,
    allowComments: false,
    tags: [],
    category: "",
    createdAt: "",
    updatedAt: "",
    publishedAt: "",
  };
};

// Get array of content type display names for dropdown (from API)
export const getContentTypeOptions = async (client: ContentApi): Promise<string[]> => {
  const types = await fetchAllContentTypes(client);
  return types.map((type) => idToDisplayName(type.uid));
};

// Create default values for all content types (from API)
export const createContentTypeDefaultValues = async (
  client: ContentApi
): Promise<{ type: string; defaultValues: ContentDetails }[]> => {
  const types = await fetchAllContentTypes(client);
  return types.map((contentType) => ({
    type: contentType.uid,
    defaultValues: generateDefaultValues(contentType.uid),
  }));
};
