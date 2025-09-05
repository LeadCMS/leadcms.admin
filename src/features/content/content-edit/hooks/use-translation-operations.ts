import { useState } from "react";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { ContentDetails } from "@features/content/content-edit/types";
import { buildAbsoluteUrl } from "@lib/network/utils";
import { TranslationType } from "@components/translate-dialog";
import { ContentDetailsDto } from "@lib/network/swagger-client";

export interface TranslationOperations {
  // Translation creation
  createTranslation: (
    sourceId: number,
    targetLanguage: string,
    translationType: TranslationType
  ) => Promise<ContentDetails>;
  // Helper to check for existing translations
  getExistingTranslation: (
    sourceId: number,
    targetLanguage: string
  ) => Promise<ContentDetailsDto | null>;
  // State
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useTranslationOperations = (): TranslationOperations => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();

  const extractErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "object" && error !== null) {
      const errorObj = error as Record<string, unknown>;

      // Check for specific error structures
      if (errorObj.error && typeof errorObj.error === "object") {
        const errorDetails = errorObj.error as Record<string, unknown>;
        if (errorDetails.title && typeof errorDetails.title === "string") {
          return errorDetails.title;
        }
        if (errorDetails.message && typeof errorDetails.message === "string") {
          return errorDetails.message;
        }
        if (errorDetails.detail && typeof errorDetails.detail === "string") {
          return errorDetails.detail;
        }
      }

      if (errorObj.title && typeof errorObj.title === "string") {
        return errorObj.title;
      }
      if (errorObj.message && typeof errorObj.message === "string") {
        return errorObj.message;
      }
      if (errorObj.detail && typeof errorObj.detail === "string") {
        return errorObj.detail;
      }

      const response = errorObj.response as Record<string, unknown> | undefined;
      const responseData = response?.data as Record<string, unknown> | undefined;

      if (responseData?.message && typeof responseData.message === "string") {
        return responseData.message;
      }
      if (responseData?.title && typeof responseData.title === "string") {
        return responseData.title;
      }
      if (responseData?.detail && typeof responseData.detail === "string") {
        return responseData.detail;
      }
    }

    return "An unexpected error occurred";
  };

  const createTranslationDraft = async (
    contentId: number,
    targetLanguage: string,
    translationType: TranslationType
  ) => {
    if (translationType === "AITranslation") {
      return await client.api.contentAiTranslationDraftDetail(contentId, targetLanguage);
    } else {
      return await client.api.contentTranslationDraftDetail(contentId, targetLanguage, {
        transformer: translationType as "EmptyCopy" | "KeepOriginal",
      });
    }
  };

  const createTranslation = async (
    sourceId: number,
    targetLanguage: string,
    translationType: TranslationType
  ): Promise<ContentDetails> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await createTranslationDraft(sourceId, targetLanguage, translationType);

      const translatedContent: ContentDetails = {
        ...data,
        id: null,
        createdAt: null,
        updatedAt: null,
        publishedAt: null,
        coverImagePending: {
          url: data.coverImageUrl ? buildAbsoluteUrl(data.coverImageUrl) : "",
          fileName: "",
        },
        files: [],
      } as ContentDetails;

      if (translationType === "AITranslation") {
        notificationsService.success("AI translation created successfully!");
      } else {
        notificationsService.success("Translation draft created successfully!");
      }

      return translatedContent;
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      console.error("Failed to create translation:", err);
      throw err; // Re-throw to allow caller to handle specific errors like 409
    } finally {
      setIsLoading(false);
    }
  };

  const getExistingTranslation = async (
    sourceId: number,
    targetLanguage: string
  ): Promise<ContentDetailsDto | null> => {
    try {
      const translationsResponse = await client.api.contentTranslationsList(sourceId);
      const existingTranslation = translationsResponse.data.find(
        (t) => t.language === targetLanguage
      );
      return existingTranslation || null;
    } catch (err) {
      console.error("Failed to fetch existing translations:", err);
      return null;
    }
  };

  const clearError = () => setError(null);

  return {
    createTranslation,
    getExistingTranslation,
    isLoading,
    error,
    clearError,
  };
};
