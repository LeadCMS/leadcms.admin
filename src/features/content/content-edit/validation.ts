import zod from "zod";
import { ContentTypeDetailsDto, ContentTypeCreateDto } from "../../../lib/network/swagger-client";

// Define ContentApi interface locally (not from swagger-client)
export interface ContentApi {
  api: {
    contentTypesList: () => Promise<{ data: ContentTypeDetailsDto[] }>;
    contentTypesCreate: (payload: ContentTypeCreateDto) => Promise<{ data: ContentTypeDetailsDto }>;
  };
}

// Async: Get content type IDs for validation (from API)
export const getContentEditAvailableTypeIds = async (
  client: ContentApi
): Promise<string[]> => {
  const types = await client.api.contentTypesList();
  return types.data.map((type: ContentTypeDetailsDto) => type.uid);
};

export const ContentEditMaximumImageSize = 3 * 1000 * 1000; // 3 megabytes

export const ContentEditValidationScheme = zod.object({
  type: zod.string(),
  title: zod.string(),
  description: zod.string(),
  body: zod.string(),
  coverImageAlt: zod.string().optional(),
  slug: zod.string(),
  author: zod.string(),
  language: zod.string(),
  allowComments: zod.boolean().optional(),
  tags: zod.string().array().optional(),
  category: zod.string(),
});
