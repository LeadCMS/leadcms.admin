import { useState, useEffect } from "react";
import { useFormik, FormikHelpers } from "formik";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService, useCoreModuleNavigation } from "@hooks";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { useConfig } from "@providers/config-provider";
import { buildAbsoluteUrl } from "@lib/network/utils";
import { execSubmitWithToast } from "utils/formik-helper";
import { handleDraftSaveError, handleSubmitError } from "@utils/error-handler";
import { CoreModule } from "@lib/router";
import useLocalStorage from "use-local-storage";
import { useDebouncedCallback } from "use-debounce";
import {
  ContentDetails,
  ContentEditData,
  ContentEditorAutoSave,
} from "@features/content/content-edit/types";
import { createContentEditValidationSchema } from "@features/content/content-edit/validation";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ContentDetailsDto, HttpResponse, ProblemDetails } from "@lib/network/swagger-client";
import { Dayjs } from "dayjs";
import { ValidateFrontmatterError } from "utils/frontmatter-validator";
import { ImageData } from "@components/file-dropdown";
import {
  getContentLengthSettings,
  validateTitleLength,
  validateDescriptionLength,
} from "@utils/content-validation-helper";

export interface ContentFormOperations {
  // Form management
  formik: ReturnType<typeof useFormik<ContentDetails>>;
  // State management
  wasModified: boolean;
  setWasModified: (modified: boolean) => void;
  coverWasModified: boolean;
  setCoverWasModified: (modified: boolean) => void;
  isSaving: boolean;
  originalContent: string;
  setOriginalContent: (content: string) => void;
  refreshKey: number;
  setRefreshKey: (key: number) => void;
  frontmatterState: ValidateFrontmatterError | null;
  setFrontmatterState: (state: ValidateFrontmatterError | null) => void;
  // Content change tracking for preview
  hasContentChanged: boolean;
  setHasContentChanged: (changed: boolean) => void;
  // Form helpers
  valueUpdate: (event: React.SyntheticEvent<Element, Event>) => void;
  valueUpdateGeneric: (field: string, value: unknown) => void;
  autoCompleteValueUpdate: (field: string, value: unknown) => void;
  handleDateChange: (field: string, newValue: Dayjs | null) => void;
  onCoverImageChange: (url: ImageData) => void;
  // Auto-save
  isDraftSaving: boolean;
  // Live preview
  useLivePreview: boolean;
  setUseLivePreview: (enabled: boolean) => void;
}

const LIVE_PREVIEW_STORAGE_KEY = "content-live-preview-enabled";

export const useContentFormOperations = (
  id?: string | null,
  hasLivePreview?: boolean
): ContentFormOperations => {
  const [wasModified, setWasModified] = useState<boolean>(false);
  const [coverWasModified, setCoverWasModified] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDraftSaving, setIsDraftSaving] = useState<boolean>(false);
  const [originalContent, setOriginalContent] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [frontmatterState, setFrontmatterState] = useState<ValidateFrontmatterError | null>(null);
  const [hasContentChanged, setHasContentChanged] = useState<boolean>(false);
  const [useLivePreview, setUseLivePreview] = useLocalStorage(LIVE_PREVIEW_STORAGE_KEY, true);

  const { setSaving } = useModuleWrapperContext();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const { notificationsService } = useNotificationsService();
  const handleNavigation = useCoreModuleNavigation();
  const { client } = useRequestContext();
  const { config } = useConfig();

  const [editorLocalStorage, setEditorLocalStorage] = useLocalStorage<ContentEditData>(
    "leadcms_editor_autosave",
    { data: [] },
    {
      logger: (error) => console.log(error),
    }
  );

  // API-based draft save (for live preview)
  const filterEmptyValues = (obj: unknown) => {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).filter(
        ([, v]) =>
          v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)
      )
    );
  };

  const saveDraft = useDebouncedCallback(async (values: ContentDetails) => {
    if (
      !useLivePreview ||
      !hasLivePreview ||
      (!wasModified && !coverWasModified && !hasContentChanged)
    ) {
      return;
    }

    try {
      setIsDraftSaving(true);
      const filteredValues = filterEmptyValues(values);
      if (id) {
        await client.api.contentDraftPartialUpdate(Number(id), filteredValues);
      } else {
        await client.api.contentDraftCreate(filteredValues);
      }
    } catch (error: unknown) {
      console.error("Failed to save draft:", error);

      await handleDraftSaveError(error, {
        formik,
        notificationsService,
        fieldMapping: {
          Title: "title",
          Description: "description",
        },
      });
    } finally {
      setIsDraftSaving(false);
    }
  }, 1000);

  const autoSave = useDebouncedCallback((value) => {
    if (!wasModified && !coverWasModified && !hasContentChanged) {
      return;
    }
    const localStorageSnapshot = { ...editorLocalStorage };
    let reference = localStorageSnapshot.data.filter((data) => data.id === id)[0];
    if (reference === undefined) {
      reference = {
        id,
        savedData: value,
        latestAutoSave: new Date(),
      } as ContentEditorAutoSave;
      localStorageSnapshot.data.push(reference);
    } else {
      (reference.latestAutoSave = new Date()), (reference.savedData = value);
    }
    setEditorLocalStorage(localStorageSnapshot);
    !isSaving &&
      setSaving(async () => {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
      });
  }, 3000);

  const submitFunc = async (values: ContentDetails, helpers: FormikHelpers<ContentDetails>) => {
    let response: HttpResponse<ContentDetailsDto, void | ProblemDetails>;
    let coverUrl = values.coverImageUrl;
    setIsSaving(true);

    if (frontmatterState !== null) {
      throw Error("Frontmatter validation error. Check preview window for details");
    }

    // Check for real-time validation errors before submitting
    const lengthSettings = getContentLengthSettings(config);
    const titleError = validateTitleLength(values.title, lengthSettings);
    const descriptionError = validateDescriptionLength(values.description, lengthSettings);

    if (titleError || descriptionError) {
      const errors: string[] = [];
      if (titleError) errors.push(`Title: ${titleError}`);
      if (descriptionError) errors.push(`Description: ${descriptionError}`);
      throw Error(`Content validation failed: ${errors.join("; ")}`);
    }

    const trimmedSlug = values.slug ? values.slug.replace(/^\/+|\/+$/g, "") : values.slug;

    if (coverWasModified && values.coverImagePending && values.coverImagePending.url) {
      const blob = await (await fetch(values.coverImagePending.url)).blob();
      const file = new File([blob], values.coverImagePending.fileName || "image.jpg");
      const imageUploadingResponse = await client.api.mediaCreate({
        File: file,
        ScopeUid: trimmedSlug,
      });
      if (imageUploadingResponse.error) {
        throw Error(imageUploadingResponse.error.title as string);
      }
      if (imageUploadingResponse.data.location === null) {
        throw Error("imageupload.data.location is null");
      }
      coverUrl = imageUploadingResponse.data.location as string;
    }

    if (values?.id) {
      response = await client.api.contentUpdate(Number(values.id), {
        ...values,
        slug: trimmedSlug,
        coverImageUrl: coverUrl,
      });
    } else {
      response = await client.api.contentCreate({
        ...values,
        slug: trimmedSlug,
        coverImageUrl: coverUrl,
      });
    }

    const patched: ContentDetails = {
      ...response.data,
      id: response.data.id ? response.data.id.toString() : null,
      coverImagePending: {
        url: response.data.coverImageUrl ? buildAbsoluteUrl(response.data.coverImageUrl) : "",
        fileName: "",
      },
    } as ContentDetails;

    helpers.setValues(patched);
    await helpers.setFieldValue("coverImagePending", patched.coverImagePending);
    setRefreshKey(Date.now());
    setWasModified(false);
    setCoverWasModified(false);
    setHasContentChanged(false); // Reset content changed state after save
    setOriginalContent(values.body || "");

    const localStorageSnapshot = { ...editorLocalStorage };
    localStorageSnapshot.data = localStorageSnapshot.data.filter((data) => data.id !== id);
    setEditorLocalStorage(localStorageSnapshot);
    setIsSaving(false);
    helpers.setSubmitting(false);
    handleNavigation(CoreModule.content);
  };

  const submit = async (values: ContentDetails, helpers: FormikHelpers<ContentDetails>) => {
    try {
      await execSubmitWithToast<ContentDetails>(
        values,
        helpers,
        submitFunc,
        notificationsService,
        showErrorModal,
        "content",
        {
          fieldMapping: {
            Title: "title",
            Description: "description",
          },
          customValidationErrorMessage:
            "Content validation failed. Please check title and description requirements.",
        }
      );
    } catch (error: unknown) {
      await handleSubmitError(error, helpers, {
        notificationsService,
        fieldMapping: {
          Title: "title",
          Description: "description",
        },
        customErrorMessage:
          "Content validation failed. Please check title and description requirements.",
      });
    }
  };

  const formik = useFormik<ContentDetails>({
    validationSchema: toFormikValidationSchema(createContentEditValidationSchema(config)),
    initialValues: {
      title: "",
      description: "",
      body: "",
      slug: "",
      type: "",
      author: "",
      language: "",
      translationKey: null,
      category: "",
      tags: [],
      allowComments: false,
      coverImagePending: { url: "", fileName: "" },
      coverImageAlt: "",
      publishedAt: null,
      id: null,
      coverImageUrl: "",
      createdAt: null,
      updatedAt: null,
    },
    onSubmit: submit,
    validateOnChange: false, // Disable real-time validation
    validateOnBlur: true,
  });

  const valueUpdate = (event: React.SyntheticEvent<Element, Event>) => {
    setWasModified(true);
    formik.handleChange(event);
  };

  const valueUpdateGeneric = (field: string, value: unknown) => {
    setWasModified(true);
    formik.setFieldValue(field, value);
  };

  const autoCompleteValueUpdate = (field: string, value: unknown): void => {
    setWasModified(true);
    formik.setFieldValue(field, value);
  };

  const handleDateChange = (field: string, newValue: Dayjs | null) => {
    setWasModified(true);
    if (newValue && newValue.isValid()) {
      formik.setFieldValue(field, newValue.toISOString());
    } else {
      // Handle clearing the date (when newValue is null)
      formik.setFieldValue(field, null);
    }
  };

  const onCoverImageChange = (url: ImageData) => {
    formik.setFieldValue("coverImagePending", url);
    setCoverWasModified(true);
  };

  // Auto-save effect
  useEffect(() => {
    autoSave(formik.values);
    saveDraft(formik.values);
  }, [formik.values]);

  return {
    formik,
    wasModified,
    setWasModified,
    coverWasModified,
    setCoverWasModified,
    isSaving,
    originalContent,
    setOriginalContent,
    refreshKey,
    setRefreshKey,
    frontmatterState,
    setFrontmatterState,
    hasContentChanged,
    setHasContentChanged,
    valueUpdate,
    valueUpdateGeneric,
    autoCompleteValueUpdate,
    handleDateChange,
    onCoverImageChange,
    isDraftSaving,
    useLivePreview,
    setUseLivePreview,
  };
};
