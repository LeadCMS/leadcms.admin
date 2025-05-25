import zod from "zod";
import { TypeDefaultValues } from "./types";
import { 
  getAllContentTypes, 
  generateDefaultValues 
} from "../content-types";

// Get content type IDs for validation (merged static + custom)
export const ContentEditAvailableTypeIds = getAllContentTypes().map(type => type.id);

export const ContentEditMaximumImageSize = 3 * 1000 * 1000; // 3 megabytes

// Generate default values for all content types (merged static + custom)
export const ContentEditDefaultValues: TypeDefaultValues[] = getAllContentTypes().map(type => ({
  type: type.id,
  defaultValues: generateDefaultValues(type.id),
}));

export const ContentEditValidationScheme = zod.object({
  type: zod.string().refine(val => ContentEditAvailableTypeIds.includes(val), {
    message: "Invalid content type",
  }),
  title: zod.string(),
  description: zod.string(),
  body: zod.string(),
  coverImageAlt: zod.string().optional(),
  slug: zod.string(),
  author: zod.string(),
  language: zod.string(),
  allowComments: zod.boolean().optional(),
  tags: zod.string().array().optional(),
  category: zod.string().optional(),
});
