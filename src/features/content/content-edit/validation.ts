import zod from "zod";
import {
  ContentTypeDetailsDto,
  ContentTypeCreateDto,
  ConfigDto,
} from "../../../lib/network/swagger-client";
import { getContentLengthSettings } from "@utils/content-validation-helper";

// Define ContentApi interface locally (not from swagger-client)
export interface ContentApi {
  api: {
    contentTypesList: () => Promise<{ data: ContentTypeDetailsDto[] }>;
    contentTypesCreate: (payload: ContentTypeCreateDto) => Promise<{ data: ContentTypeDetailsDto }>;
  };
}

// Async: Get content type IDs for validation (from API)
export const getContentEditAvailableTypeIds = async (client: ContentApi): Promise<string[]> => {
  const types = await client.api.contentTypesList();
  return types.data.map((type: ContentTypeDetailsDto) => type.uid);
};

export const ContentEditMaximumImageSize = 3 * 1000 * 1000; // 3 megabytes

// Base validation schema without length constraints
export const ContentEditValidationScheme = zod.object({
  type: zod.string(),
  title: zod.string(),
  description: zod.string(),
  body: zod.string(),
  coverImageAlt: zod.string().optional(),
  slug: zod.string(),
  author: zod.string(),
  language: zod.string(),
  translationKey: zod.string().optional().nullable(),
  allowComments: zod.boolean().optional(),
  tags: zod.string().array().optional(),
  category: zod.string(),
});

// Dynamic validation schema that includes content length validation
export const createContentEditValidationSchema = (config: ConfigDto | null) => {
  const lengthSettings = getContentLengthSettings(config);

  let titleValidation = zod.string();
  let descriptionValidation = zod.string();

  if (lengthSettings) {
    titleValidation = titleValidation
      .min(
        lengthSettings.minTitleLength,
        `Title must be at least ${lengthSettings.minTitleLength} characters`
      )
      .max(
        lengthSettings.maxTitleLength,
        `Title must be no more than ${lengthSettings.maxTitleLength} characters`
      );

    descriptionValidation = descriptionValidation
      .min(
        lengthSettings.minDescriptionLength,
        `Description must be at least ${lengthSettings.minDescriptionLength} characters`
      )
      .max(
        lengthSettings.maxDescriptionLength,
        `Description must be no more than ${lengthSettings.maxDescriptionLength} characters`
      );
  }

  return zod.object({
    type: zod.string(),
    title: titleValidation,
    description: descriptionValidation,
    body: zod.string(),
    coverImageAlt: zod.string().optional(),
    slug: zod.string(),
    author: zod.string(),
    language: zod.string(),
    translationKey: zod.string().optional().nullable(),
    allowComments: zod.boolean().optional(),
    tags: zod.string().array().optional(),
    category: zod.string(),
  });
};
