import React, { useEffect, useRef, useState } from "react";
import { Editor as TinyMCEEditor } from "tinymce";
import { Editor } from "@tinymce/tinymce-react";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { useCoreModuleNavigation, useNotificationsService } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { useRequestContext } from "@providers/request-provider";
import { useParams } from "react-router-dom";
import { EmailTemplateDetailsDto, HttpResponse, ProblemDetails } from "@lib/network/swagger-client";
import { FormikHelpers, useFormik } from "formik";
import { networkErrorToStringArray } from "utils/general-helper";
import { EmailTemplateEditValidationScheme } from "./validation";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ModuleWrapper } from "@components/module-wrapper";
import { emailTemplateFormBreadcrumbLinks } from "../constants";
import { EmailTemplateDeleteContainer, EmailTemplateEditContainer } from "./index.styled";
import { Autocomplete, Button, Card, CardContent, Grid, TextField } from "@mui/material";
import useLocalStorage from "use-local-storage";
import {
  EmailTemplateEditData,
  EmailTemplateEditProps,
  EmailTemplateEditRestoreState,
  EmailTemplateEditorAutoSave,
} from "./types";
import { useDebouncedCallback } from "use-debounce";
import { RestoreDataModal } from "@components/restore-data";
import { SavingBar } from "@components/saving-bar";
import { LanguageAutocomplete } from "@components/language-autocomplete";
import { EmailGroupAutocomplete } from "@components/email-group-autocomplete";
import { execSubmitWithToast } from "utils/formik-helper";
import { DataManagementBlock } from "@components/data-management";
import { CoreModule } from "@lib/router";

const TINYMCE_API_KEY = process.env.TINYMCE_API_KEY || undefined;

export const EmailTemplateEdit = ({ readonly }: EmailTemplateEditProps) => {
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const { setSaving, setBusy } = useModuleWrapperContext();
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal()!;
  const { client } = useRequestContext();
  const handleNavigation = useCoreModuleNavigation();
  const { id } = useParams();
  const [editorLocalStorage, setEditorLocalStorage] = useLocalStorage<EmailTemplateEditData>(
    "onlinesales_emailTemplateEditor_autosave",
    { data: [] },
    {
      logger: (error) => console.log(error),
    },
  );
  const [restoreDataState, setRestoreDataState] = useState<EmailTemplateEditRestoreState>(
    EmailTemplateEditRestoreState.Idle,
  );
  const [wasModified, setWasModified] = useState<boolean>(false);

  const autoSave = useDebouncedCallback((value) => {
    if (!wasModified) {
      return;
    }
    const localStorageSnapshot = { ...editorLocalStorage };
    let reference = localStorageSnapshot.data.filter((data) => data.id === id)[0];
    if (reference === undefined) {
      reference = {
        id,
        savedData: value,
        latestAutoSave: new Date(),
      } as EmailTemplateEditorAutoSave;
      localStorageSnapshot.data.push(reference);
    } else {
      (reference.latestAutoSave = new Date()), (reference.savedData = value);
    }
    setEditorLocalStorage(localStorageSnapshot);
    setSaving(async () => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
    });
  }, 3000);

  const submitFunc = async (
    values: EmailTemplateDetailsDto,
    helpers: FormikHelpers<EmailTemplateDetailsDto>,
  ) => {
    let response: HttpResponse<EmailTemplateDetailsDto, void | ProblemDetails>;
    if (id === undefined) {
      response = await client.api.emailTemplatesCreate(values);
    } else {
      response = await client.api.emailTemplatesPartialUpdate(Number(id), values);
    }
    setWasModified(false);
    const localStorageSnapshot = { ...editorLocalStorage };
    localStorageSnapshot.data = localStorageSnapshot.data.filter((data) => data.id !== id);
    setEditorLocalStorage(localStorageSnapshot);
    helpers.setValues(response.data);
    helpers.setSubmitting(false);
    handleNavigation(CoreModule.emailTemplates);
  };

  const submit = async (
    values: EmailTemplateDetailsDto,
    helpers: FormikHelpers<EmailTemplateDetailsDto>,
  ) => {
    execSubmitWithToast<EmailTemplateDetailsDto>(
      values,
      helpers,
      submitFunc,
      notificationsService,
      showErrorModal,
      "email template",
    );
  };

  const formik = useFormik({
    validationSchema: toFormikValidationSchema(EmailTemplateEditValidationScheme),
    initialValues: {
      name: "",
      fromEmail: "",
      fromName: "",
      subject: "",
      language: "",
      bodyTemplate: "",
      emailGroupId: 0,
    } as EmailTemplateDetailsDto,
    onSubmit: submit,
    validateOnChange: false,
  });

  const valueUpdate = (event: React.SyntheticEvent<Element, Event>) => {
    setWasModified(true);
    formik.handleChange(event);
  };

  function autoCompleteValueUpdate<UpdateType>(field: string, value: UpdateType): void {
    setWasModified(true);
    formik.setFieldValue(field, value);
  }

  useEffect(() => {
    if (id === undefined) {
      return;
    }

    setBusy(async () => {
      const resp = await client.api.emailTemplatesDetail(Number(id));
      await formik.setValues(resp.data);
    });
  }, [client, id]);

  useEffect(() => {
    autoSave(formik.values);
  }, [formik.values]);

  useEffect(() => {
    setBusy(async () => {
      try {
        const localStorageSnapshot = { ...editorLocalStorage };
        switch (restoreDataState) {
          case EmailTemplateEditRestoreState.Idle:
            if (localStorageSnapshot.data.filter((data) => data.id === id).length > 0) {
              setRestoreDataState(EmailTemplateEditRestoreState.Requested);
              return;
            }
            break;
          case EmailTemplateEditRestoreState.Requested:
            return;
          case EmailTemplateEditRestoreState.Rejected:
            localStorageSnapshot.data = localStorageSnapshot.data.filter((data) => data.id !== id);
            setEditorLocalStorage(localStorageSnapshot);
            break;
          case EmailTemplateEditRestoreState.Accepted:
            await formik.setValues(
              localStorageSnapshot.data.filter((data) => data.id === id)[0].savedData,
            );
            setWasModified(true);
            return;
        }
        if (client && id) {
          const { data } = await client.api.emailTemplatesDetail(Number(id));
          await formik.setValues(data);
        }
      } catch (e) {
        console.log(e);
      }
    });
  }, [client, id, restoreDataState]);

  return (
    <ModuleWrapper
      breadcrumbs={emailTemplateFormBreadcrumbLinks}
      currentBreadcrumb={formik.values.name}
      saveIndicatorElement={<SavingBar />}
    >
      <RestoreDataModal
        isOpen={restoreDataState === EmailTemplateEditRestoreState.Requested}
        onClose={(value) =>
          value
            ? setRestoreDataState(EmailTemplateEditRestoreState.Accepted)
            : setRestoreDataState(EmailTemplateEditRestoreState.Rejected)
        }
      />
      <EmailTemplateEditContainer>
        <Card>
          <CardContent>
            <form onSubmit={formik.handleSubmit}>
              <Grid container direction={"row"} spacing={3}>
                <Grid item xs={6} sm={6}>
                  <TextField
                    disabled={readonly}
                    label="Name"
                    name="name"
                    value={formik.values.name}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    placeholder="Enter name"
                    variant="outlined"
                    onChange={valueUpdate}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6} sm={6}>
                  <TextField
                    disabled={readonly}
                    label="Subject"
                    name="subject"
                    value={formik.values.subject}
                    error={formik.touched.subject && Boolean(formik.errors.subject)}
                    helperText={formik.touched.subject && formik.errors.subject}
                    placeholder="Enter subject"
                    variant="outlined"
                    onChange={valueUpdate}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6} sm={6}>
                  <TextField
                    disabled={readonly}
                    label="Sender Email"
                    name="fromEmail"
                    value={formik.values.fromEmail}
                    error={formik.touched.fromEmail && Boolean(formik.errors.fromEmail)}
                    helperText={formik.touched.fromEmail && formik.errors.fromEmail}
                    placeholder="Enter sender email"
                    variant="outlined"
                    onChange={valueUpdate}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6} sm={6}>
                  <TextField
                    disabled={readonly}
                    label="Sender Name"
                    name="fromName"
                    value={formik.values.fromName}
                    error={formik.touched.fromName && Boolean(formik.errors.fromName)}
                    helperText={formik.touched.fromName && formik.errors.fromName}
                    placeholder="Enter sender name"
                    variant="outlined"
                    onChange={valueUpdate}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6} sm={6}>
                  <EmailGroupAutocomplete
                    disabled={readonly}
                    label="Group ID"
                    value={formik.values.emailGroupId}
                    error={formik.touched.emailGroupId && Boolean(formik.errors.emailGroupId)}
                    helperText={formik.touched.emailGroupId && formik.errors.emailGroupId}
                    placeholder="Enter group id"
                    onChange={(value) => formik.setFieldValue("emailGroupId", value)}
                  />
                </Grid>
                <Grid item xs={6} sm={6}>
                  <LanguageAutocomplete
                    value={formik.values.language}
                    onChange={(val) => autoCompleteValueUpdate<string | null>("language", val)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        disabled={readonly}
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
                <Grid item xs={12} sm={12}>
                  <Editor
                    onInit={(evt, editor) => (editorRef.current = editor)}
                    value={formik.values.bodyTemplate}
                    disabled={readonly}
                    onEditorChange={(currentValue, editor) =>
                      formik.setFieldValue("bodyTemplate", currentValue)
                    }
                    apiKey={TINYMCE_API_KEY}
                    init={{
                      height: 500,
                      menubar: "file edit view insert format tools table help",
                      plugins: `print preview paste importcss searchreplace autolink
                        autosave save directionality code visualblocks visualchars fullscreen
                        image link media template codesample table charmap hr pagebreak
                        nonbreaking anchor toc insertdatetime advlist lists wordcount
                        imagetools textpattern noneditable help charmap quickbars emoticons`,
                      toolbar: `undo redo | bold italic underline strikethrough | fontselect
                        fontsizeselect formatselect | alignleft aligncenter alignright
                        alignjustify | outdent indent |  numlist bullist | forecolor
                        backcolor removeformat | pagebreak | charmap emoticons | 
                        fullscreen  preview save print | insertfile image media template
                        link anchor codesample | ltr rtl`,
                      content_style: `body { font-family:Helvetica,Arial,sans-serif;
                                             font-size:14px }`,
                    }}
                  />
                </Grid>
                {!readonly && (
                  <Grid container item spacing={3} justifyContent="flex-end">
                    <Grid item xs={2}>
                      <Button
                        disabled={formik.isSubmitting}
                        variant="outlined"
                        color="primary"
                        onClick={() => handleNavigation(CoreModule.emailTemplates)}
                        fullWidth
                        size="large"
                      >
                        Cancel
                      </Button>
                    </Grid>
                    <Grid item xs={2}>
                      <Button type="submit" variant="contained" fullWidth size="large">
                        Save
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </form>
          </CardContent>
        </Card>
      </EmailTemplateEditContainer>
      {id && readonly && (
        <EmailTemplateDeleteContainer>
          <DataManagementBlock
            header="Data Management"
            description="Please be aware that what
            has been deleted can never be brought back."
            entity="email template"
            handleDeleteAsync={(id) => client.api.emailTemplatesDelete(id as number)}
            itemId={+id!}
            successNavigationRoute={CoreModule.emailTemplates}
            showEditButton
          ></DataManagementBlock>
        </EmailTemplateDeleteContainer>
      )}
    </ModuleWrapper>
  );
};
