import dayjs from "dayjs";
import zod from "zod";
import { TypeDefaultValues } from "./types";
import pageTypesEN from "../../../locales/en/pageTypes.json";

// Define PageType type using the keys from the JSON file
export type PageType = keyof typeof pageTypesEN;

// Extract page type keys for validation and dropdown options
export const ContentEditAvailableTypes = Object.keys(pageTypesEN) as PageType[];

export const ContentEditMaximumImageSize = 3 * 1000 * 1000; // 3 megabytes

// Default template for creating consistent default values
const createDefaultValues = (type: PageType) => ({
  id: null,
  type: type,
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
});

export const ContentEditDefaultValues: TypeDefaultValues[] = [
  {
    type: "home",
    defaultValues: createDefaultValues("home"),
  },
  {
    type: "landing",
    defaultValues: createDefaultValues("landing"),
  },
  {
    type: "product",
    defaultValues: createDefaultValues("product"),
  },
  {
    type: "blog",
    defaultValues: createDefaultValues("blog"),
  },
  {
    type: "testimonial",
    defaultValues: createDefaultValues("testimonial"),
  },
  {
    type: "faq",
    defaultValues: createDefaultValues("faq"),
  },
  {
    type: "pricing",
    defaultValues: createDefaultValues("pricing"),
  },
  {
    type: "releaseNote",
    defaultValues: createDefaultValues("releaseNote"),
  },
  {
    type: "contact",
    defaultValues: createDefaultValues("contact"),
  },
  {
    type: "about",
    defaultValues: createDefaultValues("about"),
  },
  {
    type: "document",
    defaultValues: createDefaultValues("document"),
  },
  {
    type: "legal",
    defaultValues: createDefaultValues("legal"),
  },
  {
    type: "general",
    defaultValues: createDefaultValues("general"),
  },
];

export const ContentEditValidationScheme = zod.object({
  // Fix: Convert array to tuple type with spread operator for Zod enum
  type: zod.enum([...ContentEditAvailableTypes] as [string, ...string[]]),
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
