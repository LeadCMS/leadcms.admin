import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ContentDetailsDto,
  ContentUpdateDto,
  ContentCreateDto,
  HttpResponse,
  ProblemDetails,
} from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { ContentEditContainer } from "../index.styled";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
} from "@mui/material";
import { useFormik, FormikHelpers } from "formik";
import {
  ContentDetails,
  ContentEditData,
  ContentEditRestoreState,
  ContentEditorAutoSave,
} from "./types";
import {
  ContentEditValidationScheme,
  ContentEditDefaultValues,
  ContentEditMaximumImageSize,
} from "./validation";
import {
  ContentTypeDropdown,
  getContentTypeById,
  generateDefaultValues
} from "../content-types";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { Automapper } from "@lib/automapper";
import MarkdownEditor from "@components/markdown-editor";
import FileDropdown from "@components/file-dropdown";
import { buildAbsoluteUrl } from "@lib/network/utils";
import useLocalStorage from "use-local-storage";
import { RestoreDataModal } from "@components/restore-data";
import { useDebouncedCallback } from "use-debounce";
import { ValidateFrontmatterError } from "utils/frontmatter-validator";
import { ImageData } from "@components/file-dropdown";
import { useCoreModuleNavigation, useNotificationsService } from "@hooks";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { contentFormBreadcrumbLinks } from "@features/content/constants";
import { ModuleWrapper } from "@components/module-wrapper";
import { RemoteAutocomplete } from "@components/remote-autocomplete";
import { RemoteValues } from "@components/remote-autocomplete/types";
import { SavingBar } from "@components/saving-bar";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { LanguageAutocomplete } from "@components/language-autocomplete";
import { execSubmitWithToast } from "utils/formik-helper";
import { CoreModule } from "@lib/router";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";

interface ContentEditProps {
  readonly?: boolean;
}

export const ContentEdit = (props: ContentEditProps) => {
  const { setSaving, setBusy } = useModuleWrapperContext();
  const errorDetailsModal = useErrorDetailsModal();
  // Use fallback function to satisfy TypeScript for the error modal
  const showErrorModal = errorDetailsModal?.Show || 
    ((data) => console.error("Error modal not available:", data));
  const { notificationsService } = useNotificationsService();
  const networkContext = useRequestContext();
  const handleNavigation = useCoreModuleNavigation();
  const [editorLocalStorage, setEditorLocalStorage] = useLocalStorage<ContentEditData>(
    "leadcms_editor_autosave",
    { data: [] },
    {
      logger: (error) => console.log(error),
    }
  );
  const { client } = networkContext;
  const { id } = useParams();
  const [wasModified, setWasModified] = useState<boolean>(false);
  const [coverWasModified, setCoverWasModified] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(!!id);
  const [frontmatterState, setfrontmatterState] = useState<ValidateFrontmatterError | null>(null);
  const [restoreDataState, setRestoreDataState] = useState<ContentEditRestoreState>(
    ContentEditRestoreState.Idle
  );

  const autoSave = useDebouncedCallback((value) => {
    if (!wasModified && !coverWasModified) {
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
  }, 3000); ///TODO: User Settings

  const submitFunc = async (values: ContentDetails, helpers: FormikHelpers<ContentDetails>) => {
    let response: HttpResponse<ContentDetailsDto, void | ProblemDetails>;
    let coverUrl = values.coverImageUrl;
    setIsSaving(true);
    if (frontmatterState !== null) {
      throw Error("Frontmatter validation error. Check preview window for details");
    }
    if (coverWasModified && values.coverImagePending && values.coverImagePending.url) {
      const blob = await (await fetch(values.coverImagePending.url)).blob();
      const file = new File([blob], values.coverImagePending.fileName || "image.jpg");
      const imageUploadingResponse = await client.api.mediaCreate({
        Image: file,
        ScopeUid: values.slug,
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
      const content = Automapper.map<ContentDetails, ContentUpdateDto>(
        values,
        "ContentDetails",
        "ContentUpdateDto"
      );
      response = await client.api.contentPartialUpdate(Number(values.id), {
        ...content,
        coverImageUrl: coverUrl,
      });
    } else {
      const content = Automapper.map<ContentDetails, ContentCreateDto>(
        values,
        "ContentDetails",
        "ContentCreateDto"
      );
      response = await client.api.contentCreate({
        ...content,
        coverImageUrl: coverUrl,
      });
    }
    helpers.setValues(
      Automapper.map<ContentDetailsDto, ContentDetails>(
        response.data,
        "ContentDetailsDto",
        "ContentDetails"
      )
    );
    await helpers.setFieldValue("coverImagePending", {
      url: response.data.coverImageUrl ? buildAbsoluteUrl(response.data.coverImageUrl) : "",
      fileName: "",
    });

    setWasModified(false);
    setCoverWasModified(false);
    const localStorageSnapshot = { ...editorLocalStorage };
    localStorageSnapshot.data = localStorageSnapshot.data.filter((data) => data.id !== id);
    setEditorLocalStorage(localStorageSnapshot);
    setIsSaving(false);
    helpers.setSubmitting(false);
    handleNavigation(CoreModule.content);
  };

  const submit = async (values: ContentDetails, helpers: FormikHelpers<ContentDetails>) => {
    execSubmitWithToast<ContentDetails>(
      values,
      helpers,
      submitFunc,
      notificationsService,
      showErrorModal,
      "post"
    );
  };

  const formik = useFormik({
    validationSchema: toFormikValidationSchema(ContentEditValidationScheme),
    initialValues: ContentEditDefaultValues[0].defaultValues,
    onSubmit: submit,
    validateOnChange: false,
  });

  const valueUpdate = (event: React.SyntheticEvent<Element, Event>) => {
    setWasModified(true);
    formik.handleChange(event);
  };
  const valueUpdateGeneric = (field: string, value: unknown) => {
    setWasModified(true);
    formik.setFieldValue(field, value);
  };

  function autoCompleteValueUpdate(field: string, value: unknown): void {
    setWasModified(true);
    formik.setFieldValue(field, value);
  }

  // Helper function to set default values for a content type
  const setContentTypeDefaults = (contentTypeId: string) => {
    // Find the content type definition
    const contentType = getContentTypeById(contentTypeId);
    
    if (!contentType) {
      return;
    }
    
    // Find template with default values or generate new defaults
    const template = ContentEditDefaultValues.find(v => v.type === contentTypeId);
    const currentValues = { ...formik.values };
    
    if (template !== undefined) {
      formik.setValues({ 
        ...template.defaultValues,
        // Preserve existing values that shouldn't be overwritten
        id: currentValues.id,
        title: currentValues.title,
        description: currentValues.description,
        slug: currentValues.slug,
        author: currentValues.author,
        language: currentValues.language,
        publishedAt: currentValues.publishedAt,
        // Set properties based on content type definition
        allowComments: contentType.supportsComments ? 
          contentType.defaultValues.allowComments || false : false,
        type: contentTypeId,
      });
    } else {
      // If no template exists, use the content type definition to set appropriate defaults
      const defaults = generateDefaultValues(contentTypeId);
      formik.setValues({
        ...defaults,
        // Preserve existing values
        id: currentValues.id,
        title: currentValues.title,
        description: currentValues.description,
        slug: currentValues.slug,
        author: currentValues.author,
        language: currentValues.language,
        publishedAt: currentValues.publishedAt,
      });
    }
    
    setWasModified(true);
  };

  const handleDateChange = (field: string, newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      setWasModified(true);
      formik.setFieldValue(field, newValue.toISOString());
    }
  };

  const onCoverImageChange = (url: ImageData) => {
    formik.setFieldValue("coverImagePending", url);
    setCoverWasModified(true);
  };

  useEffect(() => {
    setBusy(async () => {
      try {
        const localStorageSnapshot = { ...editorLocalStorage };
        switch (restoreDataState) {
          case ContentEditRestoreState.Idle:
            if (localStorageSnapshot.data.filter((data) => data.id === id).length > 0) {
              setRestoreDataState(ContentEditRestoreState.Requested);
              return;
            }
            break;
          case ContentEditRestoreState.Requested:
            return;
          case ContentEditRestoreState.Rejected:
            localStorageSnapshot.data = localStorageSnapshot.data.filter((data) => data.id !== id);
            setEditorLocalStorage(localStorageSnapshot);
            break;
          case ContentEditRestoreState.Accepted:
            await formik.setValues(
              localStorageSnapshot.data.filter((data) => data.id === id)[0].savedData
            );
            if (
              localStorageSnapshot.data.filter((data) => data.id === id)[0].savedData
                .coverImagePending.fileName.length > 0
            ) {
              setCoverWasModified(true);
            }
            setWasModified(true);
            setIsInitialLoading(false);
            return;
        }
        if (client && id) {
          const { data } = await client.api.contentDetail(Number(id));
          await formik.setValues(
            Automapper.map<ContentDetailsDto, ContentDetails>(
              data,
              "ContentDetailsDto",
              "ContentDetails"
            )
          );
          await formik.setFieldValue("coverImagePending", {
            url: data.coverImageUrl ? buildAbsoluteUrl(data.coverImageUrl) : "",
            fileName: "",
          });
        }
        setIsInitialLoading(false);
      } catch (e) {
        console.log(e);
        setIsInitialLoading(false);
      }
    });
  }, [client, id, restoreDataState]);

  useEffect(() => {
    autoSave(formik.values);
  }, [formik.values]);

  const isCreateMode = !id;
  const shouldShowForm = isCreateMode || !isInitialLoading;

  return (
    <ModuleWrapper
      breadcrumbs={contentFormBreadcrumbLinks}
      currentBreadcrumb={formik.values.title}
      saveIndicatorElement={<SavingBar />}
    >
      <RestoreDataModal
        isOpen={restoreDataState === ContentEditRestoreState.Requested}
        onClose={(value) =>
          value
            ? setRestoreDataState(ContentEditRestoreState.Accepted)
            : setRestoreDataState(ContentEditRestoreState.Rejected)
        }
      />
      <ContentEditContainer>
        {isSaving && <div>Saving...</div>}
        {shouldShowForm ? (
          <form onSubmit={formik.handleSubmit}>
            <Card>
              <CardContent>
                <Grid container spacing={1}>
                  <Grid container spacing={4} size={{ xs: 6, sm: 6 }}>
                    <Grid size={{ xs: 12, sm: 12 }}>
                      <ContentTypeDropdown 
                        value={formik.values.type}
                        onChange={(value) => {
                          setContentTypeDefaults(value);
                        }}
                        onContentTypeChange={(contentType) => {
                          if (contentType) {
                            // Update form fields based on content type definition
                            formik.setFieldValue("allowComments", contentType.supportsComments);
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }}>
                      <TextField
                        disabled={props.readonly}
                        label="Title"
                        name="title"
                        value={formik.values.title}
                        placeholder="Enter title"
                        variant="outlined"
                        onChange={valueUpdate}
                        error={formik.touched.title && Boolean(formik.errors.title)}
                        helperText={formik.touched.title && formik.errors.title}
                        fullWidth
                      ></TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12 }}>
                      <TextField
                        disabled={props.readonly}
                        label="Description"
                        name="description"
                        value={formik.values.description}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                        helperText={formik.touched.description && formik.errors.description}
                        multiline={true}
                        minRows={3}
                        placeholder="Enter description"
                        variant="outlined"
                        onChange={valueUpdate}
                        fullWidth
                      ></TextField>
                    </Grid>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 6 }} pb={{ sm: "0.7rem" }}>
                    <FileDropdown
                      onChange={onCoverImageChange}
                      acceptMIME="image/*"
                      maxFileSize={ContentEditMaximumImageSize}
                      data={formik.values.coverImagePending}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid size={{ xs: 12, sm: 12 }} data-color-mode="light">
                    <MarkdownEditor
                      onChange={async (value) => {
                        setWasModified(true);
                        await formik.setFieldValue("body", value);
                      }}
                      onFrontmatterErrorChange={async (value) => {
                        setfrontmatterState(value);
                      }}
                      value={formik.values.body}
                      isReadOnly={props.readonly}
                      contentDetails={formik.values}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <TextField
                      disabled={props.readonly}
                      label="Cover Image Alt Text"
                      name="coverImageAlt"
                      value={formik.values.coverImageAlt}
                      error={formik.touched.coverImageAlt && Boolean(formik.errors.coverImageAlt)}
                      helperText={formik.touched.coverImageAlt && formik.errors.coverImageAlt}
                      placeholder="Enter Cover Image Alt Text"
                      variant="outlined"
                      onChange={valueUpdate}
                      fullWidth
                    ></TextField>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <TextField
                      disabled={props.readonly}
                      label="Slug"
                      name="slug"
                      value={formik.values.slug}
                      error={formik.touched.slug && Boolean(formik.errors.slug)}
                      helperText={formik.touched.slug && formik.errors.slug}
                      placeholder="Enter slug"
                      variant="outlined"
                      onChange={valueUpdate}
                      fullWidth
                    ></TextField>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <TextField
                      disabled={props.readonly}
                      value={formik.values.author}
                      onChange={valueUpdate}
                      label="Author"
                      name="author"
                      placeholder="Select Author"
                      variant="outlined"
                      error={formik.touched.author && Boolean(formik.errors.author)}
                      helperText={formik.touched.author && formik.errors.author}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 3, sm: 3 }}>
                    <LanguageAutocomplete
                      value={formik.values.language}
                      onChange={(val) => autoCompleteValueUpdate("language", val)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Language"
                          placeholder="Select language"
                          variant="outlined"
                          name="language"
                          error={formik.touched.language && Boolean(formik.errors.language)}
                          helperText={formik.touched.language && formik.errors.language}
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 3, sm: 3 }}>
                    <DatePicker
                      label="Published At"
                      disabled={props.readonly}
                      value={
                        (formik.values.publishedAt && dayjs(formik.values.publishedAt)) || dayjs()
                      }
                      onChange={(newValue) => handleDateChange("publishedAt", newValue)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <RemoteAutocomplete
                      type={RemoteValues.TAGS}
                      label="Tags"
                      placeholder="Select Tags"
                      error={formik.touched.tags && Boolean(formik.errors.tags)}
                      helperText={formik.touched.tags && formik.errors.tags}
                      value={formik.values.tags}
                      onChange={(ev, val) =>
                        autoCompleteValueUpdate("tags", val as string[])
                      }
                      freeSolo
                      multiple
                      limit={3}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <FormControlLabel
                      label="Allow Comments"
                      control={
                        <Checkbox
                          disabled={props.readonly}
                          checked={formik.values.allowComments}
                          onChange={(ev) => valueUpdateGeneric("allowComments", ev.target.checked)}
                          name="allowComments"
                        />
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 6 }}>
                    <RemoteAutocomplete
                      type={RemoteValues.CATEGORIES}
                      label="Category"
                      placeholder="Select Category"
                      error={formik.touched.category && Boolean(formik.errors.category)}
                      helperText={formik.touched.category && formik.errors.category}
                      value={formik.values.category}
                      onChange={(ev, val) =>
                        autoCompleteValueUpdate("category", val as string)
                      }
                      freeSolo
                    />
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 6 }}>
                      {!props.readonly && (
                        <Button
                          disabled={formik.isSubmitting}
                          variant="contained"
                          color="primary"
                          onClick={() => handleNavigation(CoreModule.content)}
                          fullWidth
                          size="large"
                        >
                          Cancel
                        </Button>
                      )}
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      {!props.readonly && (
                        <Button
                          disabled={!(wasModified || coverWasModified)}
                          type="submit"
                          variant="contained"
                          fullWidth
                          size="large"
                        >
                          Save
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </form>
        ) : null}
      </ContentEditContainer>
    </ModuleWrapper>
  );
};
