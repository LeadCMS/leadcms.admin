import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  CardContent,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
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
import LinkIcon from "@mui/icons-material/Link";
import dayjs, { Dayjs } from "dayjs";
import { CardContainer } from "../index.styled";
import { languages, prefixOptions, timezones } from "utils/constants";

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

export const ContactForm = ({ contact, handleSave, isEdit }: ContactFormProps) => {
  const { notificationsService } = useNotificationsService();
  const context = useRequestContext();
  const handleNavigation = useCoreModuleNavigation();
  const { setSaving, setBusy } = useModuleWrapperContext();
  const { Show: showErrorModal } = useErrorDetailsModal()!;

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
      showErrorModal,
      "contact",
    );
  };

  const submitFunc = async (
    values: ContactDetailsDto,
    helpers: FormikHelpers<ContactDetailsDto>,
  ) => {
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

  const formik = useFormik({
    validationSchema: toFormikValidationSchema(ContactEditValidationScheme),
    initialValues: {
      email: "",
      timezone: null,
    },
    onSubmit: submit,
    validateOnChange: false,
  });

  const handleCountryChange = (
    e: SyntheticEvent<Element, Event>,
    value: { code: string; name: string } | null,
  ) => {
    if (value) {
      formik.setFieldValue("countryCode", value.code);
    }
  };

  const handleContinentChange = (
    e: SyntheticEvent<Element, Event>,
    value: { code: string; name: string } | null,
  ) => {
    if (value) {
      formik.setFieldValue("continentCode", value.code);
    }
  };

  const handleLanguageChange = (
    e: SyntheticEvent<Element, Event>,
    value: { value: string; label: string } | null,
  ) => {
    if (value) {
      formik.setFieldValue("language", value.value);
    }
  };

  const handleTimezoneChange = (
    e: SyntheticEvent<Element, Event>,
    value: { value: number; label: string } | null,
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
    key: string,
  ) => {
    const socialMedia = { ...formik.values.socialMedia };
    (socialMedia![key] = e.target.value), formik.setFieldValue("socialMedia", socialMedia);
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    if (newValue) {
      formik.setFieldValue("birthday", newValue);
    }
  };

  const handleCancel = () => {
    handleNavigation(CoreModule.contacts);
  };

  return (
    <ModuleWrapper
      breadcrumbs={contactFormBreadcrumbLinks}
      currentBreadcrumb={header}
      saveIndicatorElement={<SavingBar />}
    >
      <form onSubmit={formik.handleSubmit}>
        <CardContainer>
          <CardContent>
            <Grid container spacing={4} marginBottom={4}>
              <Grid xs={12} sm={12} item>
                <Typography variant="h6">Personal data</Typography>
              </Grid>
              <Grid xs={12} sm={1.5} item>
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
              <Grid xs={12} sm={3} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="First Name"
                  name="firstName"
                  value={formik.values.firstName || ""}
                  placeholder="Enter first name"
                  variant="outlined"
                  onChange={formik.handleChange}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                  size="small"
                  fullWidth
                ></TextField>
              </Grid>
              <Grid xs={12} sm={3.5} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Middle Name"
                  name="middleName"
                  value={formik.values.middleName || ""}
                  placeholder="Enter middle name"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                ></TextField>
              </Grid>
              <Grid xs={12} sm={4} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Last Name"
                  name="lastName"
                  value={formik.values.lastName || ""}
                  placeholder="Enter last name"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                ></TextField>
              </Grid>
              <Grid xs={12} sm={2} item>
                <Autocomplete
                  disabled={isLoading || formik.isSubmitting}
                  options={languages}
                  getOptionLabel={(option) => option.label}
                  placeholder="Select language"
                  size="small"
                  fullWidth
                  value={languages.find((c) => c.value === formik.values.language) || null}
                  renderInput={(params) => <TextField {...params} label="Language" />}
                  onChange={handleLanguageChange}
                />
              </Grid>
              <Grid xs={12} sm={2} item>
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
            <Divider></Divider>
            <Grid container spacing={4} marginTop={2} marginBottom={4}>
              <Grid xs={12} sm={12} item>
                <Typography gutterBottom variant="h6" component="div">
                  Contact data
                </Typography>
              </Grid>
              <Grid xs={12} sm={3} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Email Address"
                  name="email"
                  value={formik.values.email}
                  placeholder="Enter email address"
                  type="email"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                ></TextField>
              </Grid>
              <Grid xs={12} sm={3} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Phone"
                  name="phone"
                  value={formik.values.phone || ""}
                  placeholder="Enter phone number"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                ></TextField>
              </Grid>
            </Grid>
            <Divider></Divider>
            <Grid container spacing={4} marginTop={2} marginBottom={4}>
              <Grid xs={12} sm={12} item>
                <Typography gutterBottom variant="h6" component="div">
                  Address
                </Typography>
              </Grid>
              <Grid xs={12} sm={4} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Street address"
                  name="address1"
                  value={formik.values.address1 || ""}
                  placeholder="Enter street address"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                ></TextField>
              </Grid>
              <Grid xs={12} sm={4} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Apt, suite, etc (optional)"
                  name="address2"
                  value={formik.values.address2 || ""}
                  placeholder="Enter apt, suite, etc"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                ></TextField>
              </Grid>
              <Grid xs={12} sm={4} item></Grid>
              <Grid xs={12} sm={4} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="City"
                  name="cityName"
                  value={formik.values.cityName || ""}
                  placeholder="Enter state"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                ></TextField>
              </Grid>
              <Grid xs={12} sm={4} item>
                {!isLoading && (
                  <Autocomplete
                    disabled={isLoading || formik.isSubmitting}
                    disablePortal
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
              <Grid xs={12} sm={4} item></Grid>
              <Grid xs={12} sm={2} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="State"
                  name="state"
                  value={formik.values.state || ""}
                  placeholder="Enter state"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                ></TextField>
              </Grid>
              <Grid xs={12} sm={2} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Zip code"
                  name="zip"
                  value={formik.values.zip || ""}
                  placeholder="Enter zip"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                ></TextField>
              </Grid>
              <Grid xs={12} sm={2} item>
                {!isLoading && (
                  <Autocomplete
                    disabled={isLoading || formik.isSubmitting}
                    disablePortal
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
                        label="Continent code"
                        value={
                          continentList.find((c) => c.code === formik.values.continentCode) || null
                        }
                        onChange={formik.handleChange}
                      />
                    )}
                  />
                )}
              </Grid>
              <Grid xs={12} sm={4} item>
                <Autocomplete
                  disabled={isLoading || formik.isSubmitting}
                  options={timezones}
                  getOptionLabel={(option) => option.label}
                  placeholder="Select language"
                  size="small"
                  fullWidth
                  value={timezones.find((c) => c.value === formik.values.timezone) || null}
                  renderInput={(params) => <TextField {...params} label="Timezone" />}
                  onChange={handleTimezoneChange}
                />
              </Grid>
            </Grid>
            <Divider></Divider>
            <Grid container spacing={4} marginTop={2} marginBottom={4}>
              <Grid xs={12} sm={12} item>
                <Typography gutterBottom variant="h6" component="div">
                  Job
                </Typography>
              </Grid>
              <Grid xs={12} sm={2} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Job title"
                  name="jobTitle"
                  value={formik.values.jobTitle || ""}
                  placeholder="Enter job title"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                ></TextField>
              </Grid>
              <Grid xs={12} sm={2} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Company name"
                  name="companyName"
                  value={formik.values.companyName || ""}
                  placeholder="Enter company name"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                ></TextField>
              </Grid>
              <Grid xs={12} sm={2} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Department"
                  name="department"
                  value={formik.values.department || ""}
                  placeholder="Enter department"
                  variant="outlined"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                ></TextField>
              </Grid>
            </Grid>
            <Divider></Divider>
            <Grid container spacing={4} marginTop={2} marginBottom={4}>
              <Grid xs={12} sm={12} item>
                <Typography gutterBottom variant="h6" component="div">
                  Social media
                </Typography>
              </Grid>
              <Grid xs={12} sm={12} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Facebook"
                  size="small"
                  value={formik.values.socialMedia?.["facebook"] || ""}
                  fullWidth
                  onChange={(event) => handleSocialMediaChange(event, "facebook")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton>
                          <LinkIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid xs={12} sm={12} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Instagram"
                  size="small"
                  fullWidth
                  value={formik.values.socialMedia?.["instagram"] || ""}
                  onChange={(event) => handleSocialMediaChange(event, "instagram")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton>
                          <LinkIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid xs={12} sm={12} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Twitter"
                  size="small"
                  fullWidth
                  value={formik.values.socialMedia?.["twitter"] || ""}
                  onChange={(event) => handleSocialMediaChange(event, "twitter")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton>
                          <LinkIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid xs={12} sm={12} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="LinkedIn"
                  size="small"
                  fullWidth
                  value={formik.values.socialMedia?.["linkedin"] || ""}
                  onChange={(event) => handleSocialMediaChange(event, "linkedin")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton>
                          <LinkIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={4} marginTop={2} marginBottom={4} justifyContent="flex-end">
              <Grid item xs={1}>
                <Button
                  disabled={isLoading || formik.isSubmitting}
                  type="submit"
                  variant="outlined"
                  color="primary"
                  onClick={handleCancel}
                  fullWidth
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={1}>
                <Button
                  type="submit"
                  disabled={isLoading || formik.isSubmitting}
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  {isEdit ? "Save" : "Add"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </CardContainer>
      </form>
    </ModuleWrapper>
  );
};
