import { useState } from "react";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { ContentDetails } from "@features/content/content-edit/types";

export interface AIContentOperations {
  // Draft creation
  createAIDraft: (language: string, contentType: string, prompt: string) => Promise<ContentDetails>;
  // Content editing
  editWithAI: (content: ContentDetails, prompt: string) => Promise<ContentDetails>;
  // State
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useAIContentOperations = (): AIContentOperations => {
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

      // Check for the specific error structure: { data: null, error: { title: "...", ... } }
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

      // Check direct error object properties (fallback)
      if (errorObj.title && typeof errorObj.title === "string") {
        return errorObj.title;
      }
      if (errorObj.message && typeof errorObj.message === "string") {
        return errorObj.message;
      }
      if (errorObj.detail && typeof errorObj.detail === "string") {
        return errorObj.detail;
      }

      // Check nested response data (existing logic)
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

  const createAIDraft = async (
    language: string,
    contentType: string,
    prompt: string
  ): Promise<ContentDetails> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await client.api.contentAiDraftCreate({
        language,
        contentType,
        prompt,
      });

      const aiContent: ContentDetails = {
        ...data,
        id: null,
        createdAt: null,
        updatedAt: null,
        publishedAt: null,
      } as ContentDetails;

      notificationsService.success("AI draft created successfully!");
      return aiContent;
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      console.error("Failed to create AI draft:", err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const editWithAI = async (content: ContentDetails, prompt: string): Promise<ContentDetails> => {
    setIsLoading(true);
    setError(null);

    try {
      const currentContent = {
        title: content.title,
        description: content.description,
        body: content.body,
        coverImageUrl: content.coverImageUrl,
        coverImageAlt: content.coverImageAlt,
        slug: content.slug,
        type: content.type,
        author: content.author,
        language: content.language,
        translationKey: content.translationKey,
        category: content.category,
        tags: content.tags,
        allowComments: content.allowComments,
        source: undefined, // Not included in ContentDetails
        publishedAt: content.publishedAt,
        prompt,
      };

      const { data } = await client.api.contentAiEditCreate(currentContent);

      const editedContent: ContentDetails = {
        ...content, // Keep existing data like id, dates, etc.
        ...data, // Override with AI-edited content
      } as ContentDetails;

      notificationsService.success("Content edited successfully with AI!");
      return editedContent;
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      console.error("Failed to edit content with AI:", err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    createAIDraft,
    editWithAI,
    isLoading,
    error,
    clearError,
  };
};
