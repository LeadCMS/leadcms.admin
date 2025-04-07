import { useCoreModuleNavigation, useNotificationsService } from "@hooks";
import { HttpResponse, ProblemDetails, UserDetailsDto } from "@lib/network/swagger-client";
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
  Tab,
  Tabs,
  Grid,
  Typography,
  Badge,
  Avatar,
  TextField,
  Button,
} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { TabPanelProps, UserEditProps } from "./types";
import { buildAbsoluteUrl } from "@lib/network/utils";
import { useUserInfo } from "@providers/user-provider";
import { networkErrorToStringArray } from "utils/general-helper";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { execSubmitWithToast } from "utils/formik-helper";
import { CoreModule } from "@lib/router";
import { DataManagementBlock } from "@components/data-management";

const tabProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const UserEdit = ({ readonly }: UserEditProps) => {
  const { setSaving, setBusy } = useModuleWrapperContext();

  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal()!;
  const { client } = useRequestContext();
  const handleNavigation = useCoreModuleNavigation();
  const userInfo = useUserInfo();

  const { id } = useParams();

  const [currentPanel, setCurrentPanel] = useState<number>(0);

  const submitFunc = async (values: UserDetailsDto, helpers: FormikHelpers<UserDetailsDto>) => {
    let response: HttpResponse<UserDetailsDto, void | ProblemDetails>;
    if (id === undefined) {
      response = await client.api.usersCreate(values);
    } else {
      response = await client.api.usersPartialUpdate(id, values);
    }
    helpers.setValues(response.data);
    if (id === userInfo?.details?.id) {
      userInfo?.refresh();
    }
    helpers.setSubmitting(false);
    handleNavigation(CoreModule.users);
  };

  const submit = async (values: UserDetailsDto, helpers: FormikHelpers<UserDetailsDto>) => {
    execSubmitWithToast<UserDetailsDto>(
      values,
      helpers,
      submitFunc,
      notificationsService,
      showErrorModal,
      "user",
    );
  };

  const formik = useFormik({
    validationSchema: toFormikValidationSchema(UserEditValidationScheme),
    initialValues: {
      avatarUrl: "",
      displayName: "",
      email: "",
      userName: "",
    } as UserDetailsDto,
    onSubmit: submit,
    validateOnChange: false,
  });

  useEffect(() => {
    if (id === undefined) {
      return;
    }

    setBusy(async () => {
      const resp = await client.api.usersDetail(id);
      await formik.setValues(resp.data);
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
      const file = target.files![0];
      const imageUploadingResponse = await client.api.mediaCreate({
        Image: file,
        ScopeUid: "UserAvatarStorage",
      });
      if (imageUploadingResponse.error) {
        notificationsService.error(`Failed to upload image ${imageUploadingResponse.error.detail}`);
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
      currentBreadcrumb={formik.values.displayName}
    >
      <UserEditContainer>
        <form onSubmit={formik.handleSubmit}>
          <Card>
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={currentPanel} onChange={(_, newValue) => setCurrentPanel(newValue)}>
                  <Tab label="Overview" {...tabProps(0)} />
                </Tabs>
              </Box>
              <TabPanel value={currentPanel} index={0}>
                <Grid container gap={"2rem"} direction={"column"}>
                  <Grid item>
                    <Typography>Basic Info</Typography>
                  </Grid>
                  <Grid item container direction={"row"} gap={"2rem"}>
                    <Grid item>
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
                          src={formik.values.avatarUrl && buildAbsoluteUrl(formik.values.avatarUrl)}
                          sx={{
                            width: 96,
                            height: 96,
                          }}
                        />
                      </Badge>
                    </Grid>
                    <Grid item container direction={"column"} xs={6} justifyContent={"center"}>
                      <Grid item>
                        <Typography>Display name: {formik.values.displayName}</Typography>
                      </Grid>
                      <Grid item>
                        <Typography>Email: {formik.values.email}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={6} sm={6}>
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
                  <Grid item xs={6} sm={6}>
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
                  {!id && (
                    <Grid item xs={6} sm={6}>
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
                </Grid>
                {!readonly && (
                  <Grid
                    container
                    item
                    spacing={3}
                    sx={{
                      marginTop: "1rem",
                    }}
                  >
                    <Grid item xs={1}>
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
                    <Grid item xs={1}>
                      <Button type="submit" variant="contained" fullWidth>
                        Save
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </TabPanel>
            </CardContent>
          </Card>
          {id && readonly && (
            <Grid container spacing={3} marginTop={1}>
              <Grid item xs={8} sm={8}>
                <DataManagementBlock
                  header="Data Management"
                  description="Please be aware that what
                        has been deleted can never be brought back."
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
