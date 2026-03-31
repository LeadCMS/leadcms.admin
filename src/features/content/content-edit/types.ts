import { SeoMetadataDto } from "@lib/network/swagger-client";

export interface ContentDetails {
  id: string | null;
  type: string;
  title: string;
  description: string;
  body: string;
  coverImageUrl: string;
  coverImageAlt: string;
  slug: string;
  author: string;
  language: string;
  translationKey?: string | null;
  allowComments: boolean;
  tags: string[];
  category: string;
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
  seo?: SeoMetadataDto | null;
}

export interface ContentEditorAutoSave {
  id: string;
  savedData: ContentDetails;
  latestAutoSave: Date;
}

export interface ContentEditData {
  data: ContentEditorAutoSave[];
}

export enum ContentEditRestoreState {
  Idle = 1,
  Requested,
  Rejected,
  Accepted,
}
