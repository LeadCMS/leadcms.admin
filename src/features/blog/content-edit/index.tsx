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
  Autocomplete,
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
  TypeDefaultValues,
  ContentDetails,
  ContentEditData,
  ContentEditRestoreState,
  ContentEditorAutoSave,
} from "./types";
import {
  ContentEditValidationScheme,
  ContentEditAvailableTypes,
  ContentEditDefaultValues,
  ContentEditMaximumImageSize,
} from "./validation";
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
import { blogFormBreadcrumbLinks } from "@features/blog/constants";
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
  const { Show: showErrorModal } = useErrorDetailsModal()!;
  const { notificationsService } = useNotificationsService();
  const networkContext = useRequestContext();
  const handleNavigation = useCoreModuleNavigation();
  const [editorLocalStorage, setEditorLocalStorage] = useLocalStorage<ContentEditData>(
    "onlinesales_editor_autosave",
    { data: [] },
    {
      logger: (error) => console.log(error),
    },
  );
  const { client } = networkContext;
  const { id } = useParams();
  const [wasModified, setWasModified] = useState<boolean>(false);
  const [coverWasModified, setCoverWasModified] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [frontmatterState, setfrontmatterState] = useState<ValidateFrontmatterError | null>(null);
  const [restoreDataState, setRestoreDataState] = useState<ContentEditRestoreState>(
    ContentEditRestoreState.Idle,
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
    if (coverWasModified) {
      const blob = await (await fetch(values.coverImagePending.url!)).blob();
      const file = new File([blob], values.coverImagePending.fileName);
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
        "ContentUpdateDto",
      );
      response = await client.api.contentPartialUpdate(Number(values.id), {
        ...content,
        coverImageUrl: coverUrl,
      });
    } else {
      const content = Automapper.map<ContentDetails, ContentCreateDto>(
        values,
        "ContentDetails",
        "ContentCreateDto",
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
        "ContentDetails",
      ),
    );
    await helpers.setFieldValue("coverImagePending", {
      url: buildAbsoluteUrl(response.data.coverImageUrl!),
      fileName: "",
    });

    setWasModified(false);
    setCoverWasModified(false);
    const localStorageSnapshot = { ...editorLocalStorage };
    localStorageSnapshot.data = localStorageSnapshot.data.filter((data) => data.id !== id);
    setEditorLocalStorage(localStorageSnapshot);
    setIsSaving(false);
    helpers.setSubmitting(false);
    handleNavigation(CoreModule.blog);
  };

  const submit = async (values: ContentDetails, helpers: FormikHelpers<ContentDetails>) => {
    execSubmitWithToast<ContentDetails>(
      values,
      helpers,
      submitFunc,
      notificationsService,
      showErrorModal,
      "post",
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
  const valueUpdateGeneric = (field: string, value: any) => {
    setWasModified(true);
    formik.setFieldValue(field, value);
  };

  function autoCompleteValueUpdate<UpdateType>(field: string, value: UpdateType): void {
    setWasModified(true);
    formik.setFieldValue(field, value);
  }

  const typeFieldUpdate = (event: React.SyntheticEvent<Element, Event>, value: string | null) => {
    let template: TypeDefaultValues;
    let typeName: string;
    if (value === null) {
      template = ContentEditDefaultValues.filter((v) => v.type == "Blog Post")[0];
      typeName = template.defaultValues.type;
    } else {
      template = ContentEditDefaultValues.filter((v) => v.type == value)[0];
      typeName = value;
    }
    // Override 'type' because otherwise it always would be 'Other' in case of failure type set
    if (template !== undefined) {
      formik.setValues({ ...template.defaultValues, type: typeName });
    } else {
      formik.setFieldValue("type", value);
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
              localStorageSnapshot.data.filter((data) => data.id === id)[0].savedData,
            );
            if (
              localStorageSnapshot.data.filter((data) => data.id === id)[0].savedData
                .coverImagePending.fileName.length > 0
            ) {
              setCoverWasModified(true);
            }
            setWasModified(true);
            return;
        }
        if (client && id) {
          const { data } = await client.api.contentDetail(Number(id));
          await formik.setValues(
            Automapper.map<ContentDetailsDto, ContentDetails>(
              data,
              "ContentDetailsDto",
              "ContentDetails",
            ),
          );
          await formik.setFieldValue("coverImagePending", {
            url: buildAbsoluteUrl(data.coverImageUrl!),
            fileName: "",
          });
        }
      } catch (e) {
        console.log(e);
      }
    });
  }, [client, id, restoreDataState]);

  useEffect(() => {
    autoSave(formik.values);
  }, [formik.values]);

  return (
    <ModuleWrapper
      breadcrumbs={blogFormBreadcrumbLinks}
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
        <form onSubmit={formik.handleSubmit}>
          <Card>
            <CardContent>
              <Grid container spacing={1}>
                <Grid container item spacing={4} xs={6} sm={6}>
                  <Grid xs={12} sm={12} item>
                    <Autocomplete
                      freeSolo
                      disabled={props.readonly}
                      value={formik.values.type}
                      onChange={typeFieldUpdate}
                      autoSelect
                      options={ContentEditAvailableTypes}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Type"
                          name="type"
                          placeholder="Select Type"
                          variant="outlined"
                          error={formik.touched.type && Boolean(formik.errors.type)}
                          helperText={formik.touched.type && formik.errors.type}
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                  <Grid xs={12} sm={12} item>
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
                  <Grid xs={12} sm={12} item>
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
                <Grid item xs={6} sm={6} pb={{ sm: "0.7rem" }}>
                  <FileDropdown
                    onChange={onCoverImageChange}
                    acceptMIME="image/*"
                    maxFileSize={ContentEditMaximumImageSize}
                    data={formik.values.coverImagePending}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid xs={12} sm={12} item data-color-mode="light">
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
                <Grid xs={6} sm={6} item>
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
                <Grid xs={6} sm={6} item>
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
                <Grid xs={6} sm={6} item>
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
                <Grid xs={3} sm={3} item>
                  <LanguageAutocomplete
                    value={formik.values.language}
                    onChange={(val) => autoCompleteValueUpdate<string | null>("language", val)}
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
                <Grid xs={3} sm={3} item>
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
                <Grid xs={6} sm={6} item>
                  <RemoteAutocomplete
                    type={RemoteValues.TAGS}
                    label="Tags"
                    placeholder="Select Tags"
                    error={formik.touched.tags && Boolean(formik.errors.tags)}
                    helperText={formik.touched.tags && formik.errors.tags}
                    value={formik.values.tags}
                    onChange={(ev, val) =>
                      autoCompleteValueUpdate<string[]>("tags", val as string[])
                    }
                    freeSolo
                    multiple
                    limit={3}
                  />
                </Grid>
                <Grid xs={6} sm={6} item>
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
                <Grid xs={6} sm={6} item>
                  <RemoteAutocomplete
                    type={RemoteValues.CATEGORIES}
                    label="Category"
                    placeholder="Select Category"
                    error={formik.touched.category && Boolean(formik.errors.category)}
                    helperText={formik.touched.category && formik.errors.category}
                    value={formik.values.category}
                    onChange={(ev, val) =>
                      autoCompleteValueUpdate<string>("category", val as string)
                    }
                    freeSolo
                  />
                </Grid>
                <Grid container item spacing={3}>
                  <Grid item xs={6}>
                    {!props.readonly && (
                      <Button
                        disabled={formik.isSubmitting}
                        variant="contained"
                        color="primary"
                        onClick={() => handleNavigation(CoreModule.blog)}
                        fullWidth
                        size="large"
                      >
                        Cancel
                      </Button>
                    )}
                  </Grid>
                  <Grid item xs={6}>
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
      </ContentEditContainer>
    </ModuleWrapper>
  );
};
