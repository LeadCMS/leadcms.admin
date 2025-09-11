import { useState, useEffect } from "react";
import { useRequestContext } from "@providers/request-provider";
import { buildAbsoluteUrl } from "@lib/network/utils";
import { ContentDetails } from "@features/content/content-edit/types";
import {
  ContentDetailsDto,
  ContentTypeDetailsDto,
  MdxComponentAnalysisDto,
} from "@lib/network/swagger-client";
import { fetchAllContentTypes } from "@features/content/content-types";

export interface ContentDataOperations {
  // Loading states
  isInitialLoading: boolean;
  setIsInitialLoading: (loading: boolean) => void;
  hasPreloadedData: boolean;
  setHasPreloadedData: (hasData: boolean) => void;
  // Content data
  sourceContent: ContentDetailsDto | null;
  setSourceContent: (content: ContentDetailsDto | null) => void;
  contentTypes: ContentTypeDetailsDto[];
  setContentTypes: (types: ContentTypeDetailsDto[]) => void;
  contentType: ContentTypeDetailsDto | null;
  setContentType: (type: ContentTypeDetailsDto | null) => void;
  contentTypeLoading: boolean;
  setContentTypeLoading: (loading: boolean) => void;
  // Preloaded data
  preloadedMdxComponents: MdxComponentAnalysisDto | undefined;
  setPreloadedMdxComponents: (components: MdxComponentAnalysisDto | undefined) => void;
  preloadedTranslations: ContentDetailsDto[] | undefined;
  setPreloadedTranslations: (translations: ContentDetailsDto[] | undefined) => void;
  // Operations
  loadContent: (id: string) => Promise<ContentDetails>;
  loadContentForDuplication: (sourceId: string) => Promise<ContentDetails>;
  loadAIGeneratedContent: (aiContent: ContentDetailsDto) => Promise<ContentDetails>;
  reloadContentTypes: () => Promise<void>;
}

export const useContentDataOperations = (): ContentDataOperations => {
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(false);
  const [hasPreloadedData, setHasPreloadedData] = useState<boolean>(false);
  const [sourceContent, setSourceContent] = useState<ContentDetailsDto | null>(null);
  const [contentTypes, setContentTypes] = useState<ContentTypeDetailsDto[]>([]);
  const [contentType, setContentType] = useState<ContentTypeDetailsDto | null>(null);
  const [contentTypeLoading, setContentTypeLoading] = useState<boolean>(false);
  const [preloadedMdxComponents, setPreloadedMdxComponents] = useState<
    MdxComponentAnalysisDto | undefined
  >(undefined);
  const [preloadedTranslations, setPreloadedTranslations] = useState<
    ContentDetailsDto[] | undefined
  >(undefined);

  const { client } = useRequestContext();

  const loadContent = async (id: string): Promise<ContentDetails> => {
    if (!client) throw new Error("Client not available");

    const contentResponse = await client.api.contentDetail(Number(id));
    const contentData = contentResponse.data;

    const patched: ContentDetails = {
      ...contentData,
      id: contentData.id ? contentData.id.toString() : null,
      coverImagePending: {
        url: contentData.coverImageUrl ? buildAbsoluteUrl(contentData.coverImageUrl) : "",
        fileName: "",
      },
      files: [],
    } as ContentDetails;

    return patched;
  };

  const loadContentForDuplication = async (sourceId: string): Promise<ContentDetails> => {
    if (!client) throw new Error("Client not available");

    const { data } = await client.api.contentDetail(Number(sourceId));
    const duplicatedContent: ContentDetails = {
      ...data,
      id: null,
      title: data.title + " - Copy",
      slug: data.slug + "-copy",
      createdAt: null,
      updatedAt: null,
      coverImagePending: {
        url: data.coverImageUrl ? buildAbsoluteUrl(data.coverImageUrl) : "",
        fileName: "",
      },
      files: [],
    } as ContentDetails;

    return duplicatedContent;
  };

  const loadAIGeneratedContent = async (aiContent: ContentDetailsDto): Promise<ContentDetails> => {
    const content: ContentDetails = {
      ...aiContent,
      id: null,
      createdAt: null,
      updatedAt: null,
      publishedAt: null,
      coverImagePending: {
        url: aiContent.coverImageUrl ? buildAbsoluteUrl(aiContent.coverImageUrl) : "",
        fileName: "",
      },
      files: [],
    } as ContentDetails;

    return content;
  };

  const reloadContentTypes = async () => {
    if (client) {
      const types = await fetchAllContentTypes(client);
      setContentTypes(Array.isArray(types) ? types : []);
    }
  };

  // Load content types on mount
  useEffect(() => {
    reloadContentTypes();
  }, [client]);

  return {
    isInitialLoading,
    setIsInitialLoading,
    hasPreloadedData,
    setHasPreloadedData,
    sourceContent,
    setSourceContent,
    contentTypes,
    setContentTypes,
    contentType,
    setContentType,
    contentTypeLoading,
    setContentTypeLoading,
    preloadedMdxComponents,
    setPreloadedMdxComponents,
    preloadedTranslations,
    setPreloadedTranslations,
    loadContent,
    loadContentForDuplication,
    loadAIGeneratedContent,
    reloadContentTypes,
  };
};
