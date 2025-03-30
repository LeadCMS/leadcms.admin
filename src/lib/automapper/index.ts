import { createMap, forMember, mapFrom, createMapper } from "@automapper/core";
import { pojos, PojosMetadataMap } from "@automapper/pojos";
import { ContentDetailsDto, ContentUpdateDto, ContentCreateDto } from "@lib/network/swagger-client";
import { ContentDetails } from "@features/blog/content-edit/types";

export const Automapper = createMapper({
  strategyInitializer: pojos(),
});

PojosMetadataMap.create<ContentDetailsDto>("ContentDetailsDto", {
  title: String,
  description: String,
  body: String,
  coverImageUrl: String,
  coverImageAlt: String,
  slug: String,
  type: String,
  author: String,
  language: String,
  category: String,
  tags: [String],
  allowComments: Boolean,
  id: Number,
  createdAt: String,
  updatedAt: String,
  publishedAt: String,
});

PojosMetadataMap.create<ContentDetails>("ContentDetails", {
  tags: [String],
  category: String,
  id: Number,
  allowComments: Boolean,
  createdAt: String,
  updatedAt: String,
  publishedAt: String,
  description: String,
  body: String,
  coverImageUrl: String,
  coverImageAlt: String,
  slug: String,
  type: String,
  author: String,
  language: String,
  title: String,
});

PojosMetadataMap.create<ContentUpdateDto>("ContentUpdateDto", {
  title: String,
  description: String,
  body: String,
  coverImageUrl: String,
  coverImageAlt: String,
  slug: String,
  type: String,
  author: String,
  language: String,
  category: String,
  tags: [String],
  allowComments: Boolean,
  publishedAt: String,
});
PojosMetadataMap.create<ContentCreateDto>("ContentCreateDto", {
  title: String,
  description: String,
  body: String,
  coverImageUrl: String,
  coverImageAlt: String,
  slug: String,
  type: String,
  author: String,
  language: String,
  category: String,
  tags: [String],
  allowComments: Boolean,
  publishedAt: String,
});

createMap<ContentDetailsDto, ContentDetails>(
  Automapper,
  "ContentDetailsDto",
  "ContentDetails",
  forMember(
    (d) => d.type,
    mapFrom((s) => {
      switch (s.type.toLowerCase()) {
        case "post":
          return "blog";
        case "release":
          return "releasenote";
        case "page":
          return "general";
        default:
          return s.type;
      }
    }),
  ),
);

createMap<ContentDetails, ContentUpdateDto>(
  Automapper,
  "ContentDetails",
  "ContentUpdateDto",
  forMember(
    (d) => d.type,
    mapFrom((s) => {
      switch (s.type.toLowerCase()) {
        default:
          return s.type;
      }
    }),
  ),
);

createMap<ContentDetails, ContentCreateDto>(
  Automapper,
  "ContentDetails",
  "ContentCreateDto",
  forMember(
    (d) => d.type,
    mapFrom((s) => {
      switch (s.type.toLowerCase()) {
        default:
          return s.type;
      }
    }),
  ),
);
