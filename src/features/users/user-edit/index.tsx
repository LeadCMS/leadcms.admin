import {
  useCoreModuleNavigation,
  useNotificationsService,
  usePasswordPolicy,
  useSaveShortcut,
} from "@hooks";
import {
  HttpResponse,
  ProblemDetails,
  UserCreateDto,
  UserUpdateDto,
  UserDetailsDto,
} from "@lib/network/swagger-client";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { useRequestContext } from "@providers/request-provider";
import { FormikHelpers, useFormik } from "formik";
import { useParams } from "react-router-dom";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { createUserEditValidationScheme } from "./validation";
import { useEffect, useRef, useState } from "react";
import { ModuleWrapper } from "@components/module-wrapper";
import { UserEditBreadcrumbLinks } from "../constants";
import { StyledAvatar } from "./styled";
import {
  Box,
  Grid,
  Typography,
  Badge,
  Avatar,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Paper,
  InputAdornment,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Camera, XCircle, Save, Eye, EyeOff, User, Lock } from "lucide-react";
import { UserEditProps } from "./types";
import { buildAbsoluteUrl } from "@lib/network/utils";
import { useUserInfo } from "@providers/user-provider";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { execSubmitWithToast } from "utils/formik-helper";
import { CoreModule } from "@lib/router";
import { DataManagementBlock } from "@components/data-management";
import { PasswordRequirements } from "@components/password-requirements";
import { PasswordValidationResult } from "@hooks";

export const UserEdit = ({ readonly }: UserEditProps) => {
  const { setBusy } = useModuleWrapperContext();
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const { client } = useRequestContext();
  const handleNavigation = useCoreModuleNavigation();
  const userInfo = useUserInfo();
  const {
    policy,
    loading: policyLoading,
    validatePassword,
    getPasswordHelperText,
  } = usePasswordPolicy();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { id } = useParams();
  const isCreateMode = id === undefined;

  const [autoLangSet, setAutoLangSet] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(
    null
  );
  const saveModeRef = useRef<"stay" | "close">("close");

  const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 3,
        mt: 4,
        pb: 1,
        borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
      }}
    >
      <Box sx={{ mr: 1.5, display: "flex", color: "primary.main" }}>{icon}</Box>
      <Typography variant="subtitle1" fontWeight="500" color="primary.main">
        {title}
      </Typography>
    </Box>
  );

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
    if (saveModeRef.current === "close") {
      handleNavigation(CoreModule.users);
    }
    saveModeRef.current = "close";
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
    password: "",
    generatePassword: false,
    sendPasswordEmail: false,
    language: "",
  };

  const formik = useFormik({
    validationSchema: toFormikValidationSchema(createUserEditValidationScheme(policy)),
    initialValues: initialValues,
    onSubmit: submit,
    validateOnChange: false,
  });

  const handleSaveStay = () => {
    saveModeRef.current = "stay";
    formik.submitForm();
  };

  const handleSaveAndClose = () => {
    saveModeRef.current = "close";
    formik.submitForm();
  };

  useSaveShortcut(handleSaveStay, !readonly && !formik.isSubmitting);

  // Set browser language on mount if not set
  useEffect(() => {
    if (!autoLangSet) {
      const browserLang =
        navigator.language || (navigator.languages && navigator.languages[0]) || "en";
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

  // Initialize password validation when policy loads to show correct initial requirements
  useEffect(() => {
    if (policy && !policyLoading && !formik.values.generatePassword) {
      const currentPassword = formik.values.password || "";
      // Always initialize validation when policy is loaded to show requirements
      const validation = validatePassword(currentPassword);
      setPasswordValidation(validation);
    }
  }, [policy, policyLoading, formik.values.generatePassword]);

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
        File: file,
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

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const password = event.target.value;
    formik.handleChange(event);

    if (password && !formik.values.generatePassword) {
      const validation = validatePassword(password);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  };

  const actionButtons = (
    <Box sx={{ display: "flex", width: "100%", gap: 4, justifyContent: "flex-end" }}>
      {!readonly && (
        <>
          <Button
            disabled={formik.isSubmitting}
            variant="outlined"
            color="primary"
            onClick={() => handleNavigation(CoreModule.users)}
            startIcon={<XCircle />}
            size="medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outlined"
            size="medium"
            startIcon={<Save />}
            onClick={handleSaveStay}
          >
            {isCreateMode ? "Add" : "Save"}
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="medium"
            startIcon={<Save />}
            onClick={handleSaveAndClose}
          >
            {isCreateMode ? "Add and Close" : "Save and Close"}
          </Button>
        </>
      )}
      {id && readonly && (
        <DataManagementBlock
          header="Data Management"
          description="Please be aware that what has been deleted can never be reverted."
          entity="user"
          handleDeleteAsync={(id) => client.api.usersDelete(id as string)}
          itemId={id}
          successNavigationRoute={CoreModule.users}
          showOnlyButtons={true}
        />
      )}
    </Box>
  );

  return (
    <ModuleWrapper
      breadcrumbs={UserEditBreadcrumbLinks}
      currentBreadcrumb={formik.values.displayName || "User Edit"}
      isForm={true}
      actionButtons={actionButtons}
    >
      <form onSubmit={formik.handleSubmit}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid rgba(0, 0, 0, 0.12)",
            mb: 4,
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "center" : "flex-start",
              borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
              backgroundColor: "rgba(0, 0, 0, 0.02)",
              gap: 2,
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              sx={{
                width: { xs: 60, sm: 72 },
                height: { xs: 60, sm: 72 },
              }}
              badgeContent={
                !readonly ? (
                  <StyledAvatar onClick={handleImageUpload} sx={{ width: 24, height: 24 }}>
                    <Camera size={16} />
                  </StyledAvatar>
                ) : undefined
              }
            >
              <Avatar
                alt={formik.values.displayName || "User Avatar"}
                src={
                  formik.values.avatarUrl ? buildAbsoluteUrl(formik.values.avatarUrl) : undefined
                }
                sx={{
                  width: { xs: 60, sm: 72 },
                  height: { xs: 60, sm: 72 },
                  bgcolor: "primary.main",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  fontWeight: "bold",
                }}
              >
                {formik.values.displayName ? `${formik.values.displayName.charAt(0)}` : "U"}
              </Avatar>
            </Badge>
            <Box sx={{ textAlign: isMobile ? "center" : "left" }}>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight="medium">
                {formik.values.displayName || "New User"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formik.values.email || "No email provided"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
            <SectionHeader icon={<User />} title="Personal Information" />
            <Grid container spacing={3} marginBottom={5}>
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
                  size="small"
                  fullWidth
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
                  size="small"
                  fullWidth
                />
              </Grid>
              {isCreateMode && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    disabled={readonly}
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    placeholder="Enter email address"
                    variant="outlined"
                    onChange={valueUpdate}
                    size="small"
                    fullWidth
                  />
                </Grid>
              )}
            </Grid>

            <SectionHeader icon={<Lock />} title="Password Options" />
            <Grid container spacing={3} marginBottom={5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled={readonly || formik.values.generatePassword}
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password || ""}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={
                    formik.touched.password && formik.errors.password
                      ? formik.errors.password
                      : formik.values.generatePassword
                      ? "Password will be generated server-side"
                      : policyLoading
                      ? "Loading password requirements..."
                      : getPasswordHelperText()
                  }
                  placeholder={
                    formik.values.generatePassword ? "Will be auto-generated" : "Set password"
                  }
                  variant="outlined"
                  onChange={handlePasswordChange}
                  size="small"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showPassword ? "Hide password" : "Show password"}>
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={readonly}
                            size="small"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
                {!formik.values.generatePassword && (
                  <PasswordRequirements
                    validation={passwordValidation}
                    policy={policy}
                    loading={policyLoading}
                  />
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="generatePassword"
                        checked={Boolean(formik.values.generatePassword)}
                        onChange={(e) => {
                          formik.setFieldValue("generatePassword", e.target.checked);
                        }}
                        disabled={readonly}
                        size="small"
                      />
                    }
                    label="Generate strong password"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="sendPasswordEmail"
                        checked={Boolean(formik.values.sendPasswordEmail)}
                        onChange={(e) =>
                          formik.setFieldValue("sendPasswordEmail", e.target.checked)
                        }
                        disabled={readonly}
                        size="small"
                      />
                    }
                    label="Send password by email"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </form>
    </ModuleWrapper>
  );
};
