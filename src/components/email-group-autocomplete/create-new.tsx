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
import { useState } from "react";
import { networkErrorToStringArray } from "utils/general-helper";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { EmailGroupEditValidationScheme } from "./validation";
import { TextField } from "@mui/material";
import { CreateNewEmailGroupProps } from "./types";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Fade ref={ref} {...props} />;
});

export const CreateNewEmailGroup = ({ onChange, isOpen, onClose }: CreateNewEmailGroupProps) => {
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal()!;
  const { client } = useRequestContext();

  const submitFunc = async (
    values: EmailGroupCreateDto,
    helpers: FormikHelpers<EmailGroupCreateDto>,
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
    helpers: FormikHelpers<EmailGroupCreateDto>,
  ) => {
    notificationsService.promise(submitFunc(values, helpers), {
      pending: "Creating a group...",
      success: "Successfully created group",
      error: (error) => {
        const errMessage: string =
          (error.data.error && error.data.error.title) ||
          (error.data.message && error.data.message) ||
          "unknown";
        const errDetails: string[] = [];
        if (error.data.error && error.data.error.errors) {
          errDetails.push(...networkErrorToStringArray(error.data.error.errors));
        }
        return {
          title: errMessage,
          onClick: () => {
            showErrorModal(errDetails);
          },
        };
      },
    });
  };

  const formik = useFormik({
    validationSchema: toFormikValidationSchema(EmailGroupEditValidationScheme),
    initialValues: {
      name: "",
    } as EmailGroupCreateDto,
    onSubmit: submit,
    validateOnChange: false,
  });

  const valueUpdate = (event: React.SyntheticEvent<Element, Event>) => {
    formik.handleChange(event);
  };

  return (
    <>
      <Dialog disableRestoreFocus open={isOpen} onClose={onClose} TransitionComponent={Transition}>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
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
            />
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
