import zod from "zod";
import {
  ContentTypeDetailsDto,
  ContentTypeCreateDto,
  ConfigDto,
} from "../../../lib/network/swagger-client";
import { getContentLengthSettings } from "@utils/content-validation-helper";
import { validateContentSyntax } from "@utils/syntax-validators";

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

// Enhanced validation schema that includes syntax validation
export const createContentEditValidationSchemaWithSyntax = (
  config: ConfigDto | null,
  contentTypes: ContentTypeDetailsDto[]
) => {
  const baseSchema = createContentEditValidationSchema(config);

  return baseSchema.superRefine((data, ctx) => {
    const contentType = contentTypes.find((ct) => ct.uid === data.type);

    if (!contentType?.format || !data.body?.trim()) {
      return; // Skip validation if no format or empty content
    }

    try {
      const result = validateContentSyntax(data.body, contentType.format);

      // For async results (MDX), we can't handle them in Zod superRefine
      // So we skip async validation here and rely on real-time validation in UI
      if (result instanceof Promise) {
        // Skip async validation in form schema - handled by UI components
        return;
      }

      // Handle sync validation results (JSON, YAML, etc.)
      if (!result.isValid && result.error) {
        const lineInfo = result.error.line ? ` (line ${result.error.line})` : "";
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          path: ["body"],
          message: `Syntax error${lineInfo}: ${result.error.message}`,
        });
      }
    } catch (error) {
      // If validation throws, skip it - handled by UI components
      console.log("Skipping sync validation due to error:", error);
    }
  });
};
