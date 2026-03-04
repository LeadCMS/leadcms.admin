import { useNotificationsService } from "@hooks";
import { EmailGroupCreateDto } from "@lib/network/swagger-client";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import { TransitionProps } from "@mui/material/transitions";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { useRequestContext } from "@providers/request-provider";
import { FormikHelpers, useFormik } from "formik";
import React from "react";
import { toPromiseError } from "@utils/api-error-parser";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { EmailGroupEditValidationScheme } from "./validation";
import { Box, TextField } from "@mui/material";
import { CreateNewEmailGroupProps } from "./types";
import { LanguageSelect } from "@components/language-select";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Fade ref={ref} {...props} />;
});

export const CreateNewEmailGroup = ({
  onChange,
  isOpen,
  onClose,
  defaultLanguage,
}: CreateNewEmailGroupProps) => {
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const { client } = useRequestContext();

  const submitFunc = async (
    values: EmailGroupCreateDto,
    helpers: FormikHelpers<EmailGroupCreateDto>
  ) => {
    const { data } = await client.api.emailGroupsCreate(values);
    onChange({
      id: data.id as number,
      label: data.name,
    });
    onClose();
    helpers.setSubmitting(false);
  };

  const submit = async (
    values: EmailGroupCreateDto,
    helpers: FormikHelpers<EmailGroupCreateDto>
  ) => {
    notificationsService.promise(submitFunc(values, helpers), {
      pending: "Creating a group...",
      success: "Successfully created group",
      error: (error) => {
        return toPromiseError(error, showErrorModal, "Failed to create group");
      },
    });
  };

  const formik = useFormik({
    validationSchema: toFormikValidationSchema(EmailGroupEditValidationScheme),
    initialValues: {
      name: "",
      language: defaultLanguage || "",
    } as EmailGroupCreateDto,
    onSubmit: submit,
    validateOnChange: false,
    enableReinitialize: true,
  });

  const valueUpdate = (event: React.SyntheticEvent<Element, Event>) => {
    formik.handleChange(event);
  };

  return (
    <>
      <Dialog
        disableRestoreFocus
        open={isOpen}
        onClose={onClose}
        TransitionComponent={Transition}
        keepMounted={false}
        disablePortal={false}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              minWidth: 520,
            },
          },
        }}
        aria-labelledby="create-group-dialog-title"
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle id="create-group-dialog-title">
            <Typography>Create email group</Typography>
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              label="Name"
              name="name"
              value={formik.values.name}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              placeholder="Enter name"
              variant="outlined"
              onChange={valueUpdate}
              fullWidth
              sx={{ mt: 2 }}
            />
            <Box sx={{ mt: 3 }}>
              <LanguageSelect
                value={formik.values.language || ""}
                onChange={(value) => {
                  formik.setFieldValue("language", value);
                }}
                error={formik.touched.language && Boolean(formik.errors.language)}
                helperText={formik.touched.language && formik.errors.language}
                disabled={formik.isSubmitting}
                label="Language"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              type="submit"
              variant="contained"
              sx={{
                marginTop: "1rem",
              }}
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};
