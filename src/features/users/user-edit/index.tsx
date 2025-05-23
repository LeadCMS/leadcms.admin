import { useCoreModuleNavigation, useNotificationsService } from "@hooks";
import { HttpResponse, ProblemDetails, 
  UserCreateDto, UserUpdateDto, UserDetailsDto} from "@lib/network/swagger-client";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { useRequestContext } from "@providers/request-provider";
import { FormikHelpers, useFormik } from "formik";
import { useParams } from "react-router-dom";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { UserEditValidationScheme } from "./validation";
import { useEffect, useState } from "react";
import { ModuleWrapper } from "@components/module-wrapper";
import { UserEditBreadcrumbLinks } from "../constants";
import { StyledAvatar, UserEditContainer } from "./styled";
import {
  Card,
  CardContent,
  Box,
  Grid,
  Typography,
  Badge,
  Avatar,
  TextField,
  Button,
} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { UserEditProps } from "./types";
import { buildAbsoluteUrl } from "@lib/network/utils";
import { useUserInfo } from "@providers/user-provider";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { execSubmitWithToast } from "utils/formik-helper";
import { CoreModule } from "@lib/router";
import { DataManagementBlock } from "@components/data-management";


export const UserEdit = ({ readonly }: UserEditProps) => {
  const { setBusy } = useModuleWrapperContext();

  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal()!;
  const { client } = useRequestContext();
  const handleNavigation = useCoreModuleNavigation();
  const userInfo = useUserInfo();

  const { id } = useParams();
  const isCreateMode = id === undefined;

  const [autoLangSet, setAutoLangSet] = useState(false);

  const submitFunc = async (
    values: UserCreateDto | UserUpdateDto, 
    helpers: FormikHelpers<UserCreateDto | UserUpdateDto>
  ) => {
    let response: HttpResponse<UserDetailsDto, void | ProblemDetails>;
    
    if (isCreateMode) {
      response = await client.api.usersCreate(values as UserCreateDto);
    } else {
      response = await client.api.usersPartialUpdate(id, values as UserUpdateDto);
    }
    
    helpers.setValues(response.data);
    if (id === userInfo?.details?.id) {
      userInfo?.refresh();
    }
    helpers.setSubmitting(false);
    handleNavigation(CoreModule.users);
  };

  const submit = async (
    values: UserCreateDto | UserUpdateDto, 
    helpers: FormikHelpers<UserCreateDto | UserUpdateDto>
  ) => {
    execSubmitWithToast<UserCreateDto | UserUpdateDto>(
      values,
      helpers,
      submitFunc,
      notificationsService,
      showErrorModal,
      "user"
    );
  };

  // Define initial values based on create or update mode
  const initialValues: UserCreateDto | UserUpdateDto = {
    avatarUrl: "",
    displayName: "",
    email: "",
    userName: "",
    password: isCreateMode ? "" : undefined,
    generatePassword: isCreateMode ? false : undefined,
    sendPasswordEmail: isCreateMode ? false : undefined,
  };

  const formik = useFormik({
    validationSchema: toFormikValidationSchema(UserEditValidationScheme),
    initialValues: initialValues,
    onSubmit: submit,
    validateOnChange: false,
  });

  // Set browser language on mount if not set
  useEffect(() => {
    if (!autoLangSet) {
      const browserLang =
        navigator.language ||
        (navigator.languages && navigator.languages[0]) ||
        "en";
      formik.setFieldValue("language", browserLang);
      setAutoLangSet(true);
    }
  }, [autoLangSet]);

  useEffect(() => {
    if (isCreateMode) {
      return;
    }

    setBusy(async () => {
      const resp = await client.api.usersDetail(id);
      await formik.setValues(resp.data as UserUpdateDto);
    });
  }, [client, id]);

  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      if (e === null || e.target === null) {
        return;
      }
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) {
        return;
      }
      const file = target.files[0];
      const imageUploadingResponse = await client.api.mediaCreate({
        Image: file,
        ScopeUid: "UserAvatarStorage",
      });
      if (imageUploadingResponse.error) {
        notificationsService.error(
          `Failed to upload image ${imageUploadingResponse.error.detail}`
        );
      }
      input.remove();
      await formik.setFieldValue("avatarUrl", imageUploadingResponse.data.location);
    };
    input.click();
  };

  const valueUpdate = (event: React.SyntheticEvent<Element, Event>) => {
    formik.handleChange(event);
  };
  return (
    <ModuleWrapper
      breadcrumbs={UserEditBreadcrumbLinks}
      currentBreadcrumb={formik.values.displayName || "User Edit"}
    >
      <UserEditContainer>
        <form onSubmit={formik.handleSubmit}>
          <Card>
            <CardContent>
              <Grid container gap={"2rem"} direction={"column"}>
                <Grid sx={{ display: "flex", flexDirection: "row", gap: "2rem" }}>
                  <Grid>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      sx={{
                        width: 96,
                        height: 96,
                      }}
                      badgeContent={
                        !readonly ? (
                          <StyledAvatar onClick={handleImageUpload}>
                            <AddAPhotoIcon />
                          </StyledAvatar>
                        ) : undefined
                      }
                    >
                      <Avatar
                        alt={formik.values.displayName || "Avatar image"}
                        src={formik.values.avatarUrl ? 
                          buildAbsoluteUrl(formik.values.avatarUrl) : 
                          undefined}
                        sx={{
                          width: 96,
                          height: 96,
                        }}
                      />
                    </Badge>
                  </Grid>
                  <Grid sx={{ display: "flex", flexDirection: "column" }} size={{ xs: 6 }} 
                    justifyContent={"center"}>
                    <Grid>
                      <Typography>Display name: {formik.values.displayName}</Typography>
                    </Grid>
                    <Grid>
                      <Typography>Email: {formik.values.email}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    disabled={readonly}
                    label="Display Name"
                    name="displayName"
                    value={formik.values.displayName}
                    error={formik.touched.displayName && Boolean(formik.errors.displayName)}
                    helperText={formik.touched.displayName && formik.errors.displayName}
                    placeholder="Enter display name"
                    variant="outlined"
                    onChange={valueUpdate}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    disabled={readonly}
                    label="Username"
                    name="userName"
                    value={formik.values.userName}
                    error={formik.touched.userName && Boolean(formik.errors.userName)}
                    helperText={formik.touched.userName && formik.errors.userName}
                    placeholder="Enter username"
                    variant="outlined"
                    onChange={valueUpdate}
                  />
                </Grid>
                {isCreateMode && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      disabled={readonly}
                      label="Email"
                      name="email"
                      value={formik.values.email}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      placeholder="Enter Email"
                      variant="outlined"
                      onChange={valueUpdate}
                    />
                  </Grid>
                )}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    disabled={readonly}
                    label="Password"
                    name="password"
                    type="password"
                    value={formik.values.password || ""}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    placeholder="Set password"
                    variant="outlined"
                    onChange={valueUpdate}
                  />
                </Grid>
                {isCreateMode && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <label>
                        <input
                          type="checkbox"
                          name="generatePassword"
                          checked={Boolean(formik.values.generatePassword)}
                          onChange={e => formik.setFieldValue("generatePassword", e.target.checked)}
                          disabled={readonly}
                        />
                        Generate strong password
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          name="sendPasswordEmail"
                          checked={Boolean(formik.values.sendPasswordEmail)}
                          onChange={e =>
                            formik.setFieldValue("sendPasswordEmail", e.target.checked)
                          }
                          disabled={readonly}
                        />
                        Send password by email
                      </label>
                    </Box>
                  </Grid>
                )}
              </Grid>
              {!readonly && (
                <Grid
                  spacing={3}
                  sx={{
                    display: "flex",
                    marginTop: "1rem",
                  }}
                >
                  <Grid size={{ xs: 1 }}>
                    <Button
                      disabled={formik.isSubmitting}
                      variant="outlined"
                      color="primary"
                      onClick={() => handleNavigation(CoreModule.users)}
                      fullWidth
                    >
                      Cancel
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 1 }}>
                    <Button type="submit" variant="contained" fullWidth>
                      Save
                    </Button>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
          {id && readonly && (
            <Grid container spacing={3} marginTop={1}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <DataManagementBlock
                  header="Data Management"
                  description="Please be aware that what has been deleted can never be reverted."
                  entity="user"
                  handleDeleteAsync={(id) => client.api.usersDelete(id as string)}
                  itemId={id}
                  successNavigationRoute={CoreModule.users}
                ></DataManagementBlock>
              </Grid>
            </Grid>
          )}
        </form>
      </UserEditContainer>
    </ModuleWrapper>
  );
};
