import dayjs from "dayjs";
import zod from "zod";
import { TypeDefaultValues } from "./types";

export const ContentEditAvailableTypes = [
  "Landing",
  "Pricing",
  "BlogIndex",
  "BlogPost",
  "ReleaseIndex",
  "Release",
  "Contact",
  "About",
  "Page",
  "DocumentIndex",
  "Document",
] as const;

export const ContentEditMaximumImageSize = 3 * 1000 * 1000; // 3 megabytes

// Default template for creating consistent default values
const createDefaultValues = (type: string) => ({
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
    type: "Landing",
    defaultValues: createDefaultValues("Landing"),
  },
  {
    type: "Pricing",
    defaultValues: createDefaultValues("Pricing"),
  },
  {
    type: "BlogIndex",
    defaultValues: createDefaultValues("BlogIndex"),
  },
  {
    type: "BlogPost",
    defaultValues: createDefaultValues("BlogPost"),
  },
  {
    type: "ReleaseIndex",
    defaultValues: createDefaultValues("ReleaseIndex"),
  },
  {
    type: "Release",
    defaultValues: createDefaultValues("Release"),
  },
  {
    type: "Contact",
    defaultValues: createDefaultValues("Contact"),
  },
  {
    type: "About",
    defaultValues: createDefaultValues("About"),
  },
  {
    type: "Page",
    defaultValues: createDefaultValues("Page"),
  },
  {
    type: "DocumentIndex",
    defaultValues: createDefaultValues("DocumentIndex"),
  },
  {
    type: "Document",
    defaultValues: createDefaultValues("Document"),
  },
];

export const ContentEditValidationScheme = zod.object({
  type: zod.enum(ContentEditAvailableTypes),
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
