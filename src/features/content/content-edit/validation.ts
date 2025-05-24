import zod from "zod";
import { TypeDefaultValues } from "./types";
import { 
  CONTENT_TYPES, 
  createContentTypeDefaultValues
} from "../content-types";

// Get content type IDs for validation
export const ContentEditAvailableTypeIds = CONTENT_TYPES.map(type => type.id);

export const ContentEditMaximumImageSize = 3 * 1000 * 1000; // 3 megabytes

// Generate default values for all content types
export const ContentEditDefaultValues: TypeDefaultValues[] = createContentTypeDefaultValues();

export const ContentEditValidationScheme = zod.object({
  type: zod.string().refine(val => ContentEditAvailableTypeIds.includes(val), {
    message: "Invalid content type",
  }),
  title: zod.string(),
  description: zod.string(),
  body: zod.string(),
  coverImageAlt: zod.string(),
  slug: zod.string(),
  author: zod.string(),
  language: zod.string(),
  allowComments: zod.boolean(),
  tags: zod.string().array().optional(),
  category: zod.string(),
});
