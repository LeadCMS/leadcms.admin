import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ContentDetailsDto,
  ContentUpdateDto,
  ContentCreateDto,
  HttpResponse,
  ProblemDetails,
  UserDetailsDto,
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
  Tabs,
  Tab,
  Box,
  Autocomplete,
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
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MonacoEditor from "@monaco-editor/react";

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
  const [activeTab, setActiveTab] = useState<string>("content");
  const [users, setUsers] = useState<UserDetailsDto[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch users for author combobox
  useEffect(() => {
    setUsersLoading(true);
    client.api.usersList().then((resp) => {
      setUsers(resp.data || []);
      setUsersLoading(false);
    }).catch(() => setUsersLoading(false));
  }, [client]);

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

  function autoCompleteValueUpdate(field: string, value: unknown): void {
    setWasModified(true);
    formik.setFieldValue(field, value);
  }

  // Helper function to set default values for a content type
  const setContentTypeDefaults = (contentTypeId: string) => {
    const contentType = getContentTypeById(contentTypeId);
    if (!contentType) {
      return;
    }
    const currentValues = { ...formik.values };
    // Always update the form state for any type
    const defaults = generateDefaultValues(contentTypeId);
    formik.setValues({
      ...defaults,
      // Preserve id and publishedAt if present
      id: currentValues.id,
      publishedAt: currentValues.publishedAt,
    });
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

  const contentType = getContentTypeById(formik.values.type);
  const supportsCover = contentType?.supportsCoverImage;
  const supportsComments = contentType?.supportsComments;

  // Check for validation errors in each tab
  const hasContentErrors = Boolean(formik.errors.body);
  const hasCoverErrors = Boolean(formik.errors.coverImageAlt);
  const hasSettingsErrors = Boolean(
    formik.errors.slug ||
    formik.errors.language ||
    formik.errors.category ||
    formik.errors.tags ||
    formik.errors.allowComments ||
    formik.errors.author ||
    formik.errors.publishedAt
  );

  // Handler for delete action
  const handleDelete = async () => {
    if (!id) return;
    try {
      await client.api.contentDelete(parseInt(id));
      notificationsService.success("Content deleted successfully");
      handleNavigation(CoreModule.content);
    } catch (error) {
      notificationsService.error("Failed to delete content");
    }
  };

  return (
    <ModuleWrapper
      breadcrumbs={contentFormBreadcrumbLinks}
      currentBreadcrumb={formik.values.title}
      saveIndicatorElement={<SavingBar />}
      isForm={true}
      actionButtons={
        <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ pl: { sm: 4 } }}>
            {!isCreateMode && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={formik.isSubmitting}
                  size="medium"
                >
                  Delete
                </Button>
                <Dialog
                  open={deleteDialogOpen}
                  onClose={() => setDeleteDialogOpen(false)}
                  aria-labelledby="delete-content-dialog-title"
                  aria-describedby="delete-content-dialog-description"
                >
                  <DialogTitle id="delete-content-dialog-title">Delete Content</DialogTitle>
                  <DialogContent>
                    <DialogContentText id="delete-content-dialog-description">
                      Are you sure you want to delete this content? This action cannot be undone.
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        setDeleteDialogOpen(false);
                        await handleDelete();
                      }}
                      color="error"
                      variant="contained"
                      autoFocus
                      disabled={formik.isSubmitting}
                    >
                      Delete
                    </Button>
                  </DialogActions>
                </Dialog>
              </>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 2, pr: { sm: 4 } }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleNavigation(CoreModule.content)}
              disabled={formik.isSubmitting}
              startIcon={<CancelIcon />}
              size="medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!(wasModified || coverWasModified) || formik.isSubmitting}
              startIcon={<SaveIcon />}
              size="medium"
              onClick={() => formik.handleSubmit()}
            >
              Save
            </Button>
          </Box>
        </Box>
      }
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
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <TextField
                      label="Title"
                      name="title"
                      value={formik.values.title}
                      onChange={valueUpdate}
                      error={formik.touched.title && Boolean(formik.errors.title)}
                      helperText={formik.touched.title && formik.errors.title}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <ContentTypeDropdown
                      value={formik.values.type}
                      onChange={(val: string) => {
                        setContentTypeDefaults(val);
                      }}
                      onContentTypeChange={(ct) => {
                        if (ct) setContentTypeDefaults(ct.id);
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, sm: 12 }}>
                    <TextField
                      label="Description"
                      name="description"
                      value={formik.values.description}
                      onChange={valueUpdate}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                      multiline
                      minRows={3}
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}>
                  <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{ minHeight: 36 }}
                  >
                    <Tab 
                      label="Content" 
                      value="content"
                      sx={{
                        color: hasContentErrors ? "error.main" : "inherit",
                        fontWeight: hasContentErrors ? 600 : 400,
                        "&.Mui-selected": {
                          color: hasContentErrors ? "error.main" : "primary.main"
                        }
                      }}
                    />
                    {supportsCover && (
                      <Tab 
                        label="Cover" 
                        value="cover"
                        sx={{
                          color: hasCoverErrors ? "error.main" : "inherit",
                          fontWeight: hasCoverErrors ? 600 : 400,
                          "&.Mui-selected": {
                            color: hasCoverErrors ? "error.main" : "primary.main"
                          }
                        }}
                      />
                    )}
                    <Tab 
                      label="Settings" 
                      value="settings"
                      sx={{
                        color: hasSettingsErrors ? "error.main" : "inherit",
                        fontWeight: hasSettingsErrors ? 600 : 400,
                        "&.Mui-selected": {
                          color: hasSettingsErrors ? "error.main" : "primary.main"
                        }
                      }}
                    />
                  </Tabs>
                  <Box sx={{ flex: 1 }} />
                  <Button
                    variant="text"
                    component="a"
                    href={formik.values.slug ? `/content/${formik.values.slug}` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<OpenInNewIcon fontSize="small" />}
                    sx={{
                      color: "#1976d2",
                      textTransform: "none",
                      fontSize: 14,
                      ml: 2,
                      pl: 0,
                      pr: 0,
                      minWidth: 0,
                      "&:hover": { textDecoration: "underline", background: "none" }
                    }}
                  >
                    Preview on Site
                  </Button>
                </Box>
                {activeTab === "content" && (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 12 }}>
                      {contentType?.format === "JSON" || contentType?.format === "YAML" ? (
                        <MonacoEditor
                          height="400px"
                          defaultLanguage={contentType.format.toLowerCase() as "json" | "yaml"}
                          value={formik.values.body}
                          onChange={(value) => {
                            setWasModified(true);
                            formik.setFieldValue("body", value || "");
                          }}
                          options={{
                            readOnly: !!props.readonly,
                            minimap: { enabled: false },
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            wordWrap: "on"
                          }}
                        />                        
                      ) : (
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
                      )}
                    </Grid>
                  </Grid>
                )}
                {activeTab === "cover" && supportsCover && (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FileDropdown
                        onChange={onCoverImageChange}
                        acceptMIME="image/*"
                        maxFileSize={ContentEditMaximumImageSize}
                        data={formik.values.coverImagePending}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Cover Image Alt Text"
                        name="coverImageAlt"
                        value={formik.values.coverImageAlt || ""}
                        error={Boolean(formik.touched.coverImageAlt && formik.errors.coverImageAlt)}
                        helperText={formik.touched.coverImageAlt && formik.errors.coverImageAlt}
                        placeholder="Enter Cover Image Alt Text"
                        variant="outlined"
                        onChange={valueUpdate}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                )}
                {activeTab === "settings" && (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
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
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
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
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <RemoteAutocomplete
                        type={RemoteValues.CATEGORIES}
                        label="Category"
                        placeholder="Select Category"
                        error={formik.touched.category && Boolean(formik.errors.category)}
                        helperText={formik.touched.category && formik.errors.category}
                        value={formik.values.category}
                        onChange={(ev, val) => autoCompleteValueUpdate("category", val as string)}
                        freeSolo
                        multiple={false}
                        limit={1}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <RemoteAutocomplete
                        type={RemoteValues.TAGS}
                        label="Tags"
                        placeholder="Select Tags"
                        error={formik.touched.tags && Boolean(formik.errors.tags)}
                        helperText={formik.touched.tags && formik.errors.tags}
                        value={formik.values.tags}
                        onChange={(ev, val) => autoCompleteValueUpdate("tags", val as string[])}
                        freeSolo
                        multiple
                        limit={3}
                      />
                    </Grid>
                    {supportsComments && (
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControlLabel
                          label="Allow Comments"
                          control={
                            <Checkbox
                              disabled={props.readonly}
                              checked={formik.values.allowComments}
                              onChange={(ev) =>
                                valueUpdateGeneric(
                                  "allowComments",
                                  ev.target.checked
                                )
                              }
                              name="allowComments"
                            />
                          }
                        />
                      </Grid>
                    )}
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Autocomplete<UserDetailsDto, false, false, false>
                        options={users}
                        loading={usersLoading}
                        getOptionLabel={(option) => option.displayName || option.email || ""}
                        value={users.find((u) => u.id === formik.values.author) || null}
                        onChange={(_, val) =>
                          autoCompleteValueUpdate("author", val ? val.id : "")
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Author"
                            placeholder="Select Author"
                            variant="outlined"
                            error={formik.touched.author && Boolean(formik.errors.author)}
                            helperText={formik.touched.author && formik.errors.author}
                            fullWidth
                          />
                        )}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <DatePicker
                        label="Published At"
                        disabled={props.readonly}
                        value={formik.values.publishedAt ? dayjs(formik.values.publishedAt) : null}
                        onChange={(newValue) => handleDateChange("publishedAt", newValue)}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </form>
        ) : null}
      </ContentEditContainer>
    </ModuleWrapper>
  );
};
