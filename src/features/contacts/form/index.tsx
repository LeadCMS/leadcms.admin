import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  InputAdornment,
  TextField,
  Typography,
  Box,
  Paper,
  Avatar,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ContactDetailsDto } from "lib/network/swagger-client";
import { CoreModule } from "lib/router";
import { contactAddHeader, contactEditHeader, contactFormBreadcrumbLinks } from "../constants";
import { getContinentList, getCountryList } from "utils/general-helper";
import { useRequestContext } from "@providers/request-provider";
import { useCoreModuleNavigation, useNotificationsService } from "@hooks";
import { ModuleWrapper } from "@components/module-wrapper";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { SavingBar } from "@components/saving-bar";
import { useFormik, FormikHelpers } from "formik";
import zod from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { execSubmitWithToast } from "utils/formik-helper";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { DateField } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useConfig } from "@providers/config-provider";
import { prefixOptions, timezones } from "utils/constants";

// Icons
import {
  User,
  XCircle,
  Contact,
  Home,
  Briefcase,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Share2,
  Link,
  Save,
} from "lucide-react";

interface ContactFormProps {
  contact: ContactDetailsDto;
  handleSave: (contact: ContactDetailsDto) => Promise<void>;
  isEdit: boolean;
}

type Country = {
  code: string;
  name: string;
};

type Continent = {
  code: string;
  name: string;
};

interface SocialMedia {
  [key: string]: string;
}

export const ContactForm = ({ contact, handleSave, isEdit }: ContactFormProps) => {
  const { notificationsService } = useNotificationsService();
  const context = useRequestContext();
  const handleNavigation = useCoreModuleNavigation();
  const { setBusy } = useModuleWrapperContext();
  const showErrorModal = useErrorDetailsModal()?.Show;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { config } = useConfig();
  const languages = config?.languages || [];

  const noopErrorHandler = (errors: string[]) => {
    console.log("Error occurred but error modal is not available:", errors);
  };

  const [countryList, setCountryList] = useState<Country[]>([]);
  const [continentList, setContinentList] = useState<Continent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const header = isEdit ? contactEditHeader : contactAddHeader;

  useEffect(() => {
    setBusy(async () => {
      const [countries, continents] = await Promise.all([
        getCountryList(context),
        getContinentList(context),
      ]);
      if (countries) {
        setCountryList(Object.entries(countries).map(([code, name]) => ({ code, name })));
      } else {
        notificationsService.error("Server error: country list not available.");
      }
      if (continents) {
        setContinentList(Object.entries(continents).map(([code, name]) => ({ code, name })));
      } else {
        notificationsService.error("Server error: continents list not available.");
      }
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (contact.email) {
      formik.setValues(contact);
    }
  }, [contact]);

  const submit = (values: ContactDetailsDto, helpers: FormikHelpers<ContactDetailsDto>) => {
    execSubmitWithToast<ContactDetailsDto>(
      values,
      helpers,
      submitFunc,
      notificationsService,
      showErrorModal || noopErrorHandler,
      "contact"
    );
  };

  const submitFunc = async (values: ContactDetailsDto) => {
    try {
      await handleSave(values);
      handleNavigation(CoreModule.contacts);
    } catch (error) {
      formik.setSubmitting(false);
      throw error;
    }
  };

  const ContactEditValidationScheme = zod.object({
    email: zod.string().email(),
    timezone: zod.number().nullable().optional(),
    firstName: zod.string().nullable().optional(),
  });

  const formik = useFormik<ContactDetailsDto>({
    validationSchema: toFormikValidationSchema(ContactEditValidationScheme),
    initialValues: {
      email: "",
      timezone: null as number | null,
      firstName: "",
      lastName: "",
      prefix: "",
      middleName: "",
      socialMedia: {} as SocialMedia,
      countryCode: null as string | null,
      continentCode: null as string | null,
      cityName: "",
      address1: "",
      address2: "",
      jobTitle: "",
      companyName: "",
      department: "",
      state: "",
      zip: "",
      phone: "",
      language: "",
      birthday: null,
      id: 0,
    } as ContactDetailsDto,
    onSubmit: submit,
    validateOnChange: false,
  });

  const handleCountryChange = (
    e: SyntheticEvent<Element, Event>,
    value: { code: string; name: string } | null
  ) => {
    if (value) {
      formik.setFieldValue("countryCode", value.code);
    }
  };

  const handleContinentChange = (
    e: SyntheticEvent<Element, Event>,
    value: { code: string; name: string } | null
  ) => {
    if (value) {
      formik.setFieldValue("continentCode", value.code);
    }
  };

  const handleLanguageChange = (
    e: SyntheticEvent<Element, Event>,
    value: { value: string; label: string } | null
  ) => {
    if (value) {
      formik.setFieldValue("language", value.value);
    }
  };

  const handleTimezoneChange = (
    e: SyntheticEvent<Element, Event>,
    value: { value: number; label: string } | null
  ) => {
    if (value) {
      formik.setFieldValue("timezone", value.value);
    }
  };

  const handlePrefixChange = (e: SyntheticEvent<Element, Event>, value: string | null) => {
    if (value) {
      formik.setFieldValue("prefix", value);
    }
  };

  const handleSocialMediaChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string
  ) => {
    const socialMedia = { ...formik.values.socialMedia } as SocialMedia;
    socialMedia[key] = e.target.value;
    formik.setFieldValue("socialMedia", socialMedia);
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    if (newValue) {
      formik.setFieldValue("birthday", newValue);
    }
  };

  const handleCancel = () => {
    handleNavigation(CoreModule.contacts);
  };

  const getSocialMediaIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <Facebook color="#1877F3" />;
      case "instagram":
        return <Instagram color="#E1306C" />;
      case "twitter":
        return <Twitter color="#1DA1F2" />;
      case "linkedin":
        return <Linkedin color="#0077B5" />;
      default:
        return <Link />;
    }
  };

  const getInitials = () => {
    const firstName = formik.values.firstName || "";
    const lastName = formik.values.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getFullName = () => {
    const prefix = formik.values.prefix ? `${formik.values.prefix} ` : "";
    const firstName = formik.values.firstName || "";
    const middleName = formik.values.middleName ? `${formik.values.middleName} ` : "";
    const lastName = formik.values.lastName || "";

    return `${prefix}${firstName} ${middleName}${lastName}`.trim() || "New Contact";
  };

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

  return (
    <ModuleWrapper
      breadcrumbs={contactFormBreadcrumbLinks}
      currentBreadcrumb={header}
      saveIndicatorElement={<SavingBar />}
      isForm={true}
      actionButtons={
        <Box sx={{ display: "flex", width: "100%", gap: 4, justifyContent: "flex-end" }}>
          <Button
            disabled={isLoading || formik.isSubmitting}
            variant="outlined"
            color="primary"
            onClick={handleCancel}
            startIcon={<XCircle />}
            size="medium"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || formik.isSubmitting}
            variant="contained"
            color="primary"
            startIcon={<Save />}
            size="medium"
            onClick={() => formik.handleSubmit()}
          >
            {isEdit ? "Save" : "Add"}
          </Button>
        </Box>
      }
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
            <Avatar
              sx={{
                width: { xs: 60, sm: 72 },
                height: { xs: 60, sm: 72 },
                bgcolor: "primary.main",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                fontWeight: "bold",
              }}
            >
              {getInitials()}
            </Avatar>
            <Box sx={{ textAlign: isMobile ? "center" : "left" }}>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight="medium">
                {getFullName()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formik.values.email || "No email provided"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
            <SectionHeader icon={<User />} title="Personal Information" />
            <Grid container spacing={3} marginBottom={5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  id="prefix"
                  options={prefixOptions}
                  size="small"
                  disabled={isLoading || formik.isSubmitting}
                  value={prefixOptions.find((c) => c === formik.values.prefix) || ""}
                  onChange={handlePrefixChange}
                  fullWidth
                  renderInput={(params) => <TextField {...params} label="Prefix" />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="First Name"
                  name="firstName"
                  value={formik.values.firstName || ""}
                  placeholder="First name"
                  variant="outlined"
                  onChange={formik.handleChange}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Middle"
                  name="middleName"
                  value={formik.values.middleName || ""}
                  placeholder="Middle"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Last Name"
                  name="lastName"
                  value={formik.values.lastName || ""}
                  placeholder="Last name"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  disabled={isLoading || formik.isSubmitting}
                  options={languages}
                  getOptionLabel={(option) => option.label}
                  size="small"
                  fullWidth
                  value={languages.find((c) => c.value === formik.values.language) || null}
                  renderInput={(params) => (
                    <TextField {...params} label="Language" placeholder="Select language" />
                  )}
                  onChange={handleLanguageChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DateField
                  disabled={isLoading || formik.isSubmitting}
                  label="Birthday"
                  format="MM-DD-YYYY"
                  size="small"
                  fullWidth
                  variant="outlined"
                  value={(formik.values.birthday && dayjs(formik.values.birthday)) || null}
                  onChange={(newValue) => handleDateChange(newValue)}
                />
              </Grid>
            </Grid>

            <SectionHeader icon={<Contact />} title="Contact Information" />
            <Grid container spacing={3} marginBottom={5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Email Address"
                  name="email"
                  value={formik.values.email}
                  placeholder="Email address"
                  type="email"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Phone"
                  name="phone"
                  value={formik.values.phone || ""}
                  placeholder="Phone number"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>

            <SectionHeader icon={<Briefcase />} title="Job Information" />
            <Grid container spacing={3} marginBottom={5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Job title"
                  name="jobTitle"
                  value={formik.values.jobTitle || ""}
                  placeholder="Job title"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Company"
                  name="companyName"
                  value={formik.values.companyName || ""}
                  placeholder="Company"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Department"
                  name="department"
                  value={formik.values.department || ""}
                  placeholder="Department"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>

            <SectionHeader icon={<Home />} title="Address" />
            <Grid container spacing={3} marginBottom={5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Street address"
                  name="address1"
                  value={formik.values.address1 || ""}
                  placeholder="Street address"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Apt, suite, etc"
                  name="address2"
                  value={formik.values.address2 || ""}
                  placeholder="Apt, suite, etc"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="City"
                  name="cityName"
                  value={formik.values.cityName || ""}
                  placeholder="City"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="State"
                  name="state"
                  value={formik.values.state || ""}
                  placeholder="State"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Zip"
                  name="zip"
                  value={formik.values.zip || ""}
                  placeholder="Zip"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {!isLoading && (
                  <Autocomplete
                    disabled={isLoading || formik.isSubmitting}
                    options={countryList}
                    getOptionLabel={(option) => option.name}
                    value={countryList.find((c) => c.code === formik.values.countryCode) || null}
                    onChange={handleCountryChange}
                    fullWidth
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Country"
                        value={
                          countryList.find((c) => c.code === formik.values.countryCode) || null
                        }
                        onChange={formik.handleChange}
                      />
                    )}
                  />
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {!isLoading && (
                  <Autocomplete
                    disabled={isLoading || formik.isSubmitting}
                    options={continentList}
                    getOptionLabel={(option) => option.name}
                    value={
                      continentList.find((c) => c.code === formik.values.continentCode) || null
                    }
                    onChange={handleContinentChange}
                    fullWidth
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Continent"
                        value={
                          continentList.find((c) => c.code === formik.values.continentCode) || null
                        }
                        onChange={formik.handleChange}
                      />
                    )}
                  />
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  disabled={isLoading || formik.isSubmitting}
                  options={timezones}
                  getOptionLabel={(option) => option.label}
                  size="small"
                  fullWidth
                  value={timezones.find((c) => c.value === formik.values.timezone) || null}
                  renderInput={(params) => (
                    <TextField {...params} label="Timezone" placeholder="Select timezone" />
                  )}
                  onChange={handleTimezoneChange}
                />
              </Grid>
            </Grid>

            <SectionHeader icon={<Share2 />} title="Social Media" />
            <Grid container spacing={3} marginBottom={5}>
              {["facebook", "instagram", "twitter", "linkedin"].map((platform) => (
                <Grid size={{ xs: 12, sm: 6 }} marginBottom={1} key={platform}>
                  <TextField
                    disabled={isLoading || formik.isSubmitting}
                    label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    size="small"
                    value={(formik.values.socialMedia as SocialMedia)?.[platform] || ""}
                    fullWidth
                    onChange={(event) => handleSocialMediaChange(event, platform)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {getSocialMediaIcon(platform)}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      </form>
    </ModuleWrapper>
  );
};
