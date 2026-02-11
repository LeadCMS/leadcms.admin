import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  TextField,
  Typography,
  Box,
  Avatar,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { ContactDetailsDto } from "lib/network/swagger-client";
import { CoreModule, getCoreModuleRoute, getViewFormRoute } from "lib/router";
import { contactAddHeader, contactEditHeader, contactFormBreadcrumbLinks } from "../constants";
import { getContinentList, getCountryList } from "utils/general-helper";
import { useRequestContext } from "@providers/request-provider";
import { useCoreModuleNavigation, useNotificationsService } from "@hooks";
import { ModuleWrapper } from "@components/module-wrapper";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { useFormik, FormikHelpers } from "formik";
import zod from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { execSubmitWithToast } from "utils/formik-helper";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { DateField } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useConfig } from "@providers/config-provider";
import { prefixOptions, timezones } from "utils/constants";
import { execDeleteWithToast } from "utils/general-helper";

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
  Eye,
  Save,
  ChevronDown,
  Phone,
  Mail,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ContactFormProps {
  contact: ContactDetailsDto;
  handleSave: (contact: ContactDetailsDto) => Promise<void>;
  handleDelete?: (contactId: number) => Promise<void>;
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

type Account = {
  id: number;
  name: string;
};

interface SocialMedia {
  [key: string]: string;
}

export const ContactForm = ({ contact, handleSave, handleDelete, isEdit }: ContactFormProps) => {
  const { notificationsService } = useNotificationsService();
  const context = useRequestContext();
  const handleNavigation = useCoreModuleNavigation();
  const { setBusy } = useModuleWrapperContext();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const { config } = useConfig();
  const navigate = useNavigate();
  const languages = config?.languages || [];

  const [countryList, setCountryList] = useState<Country[]>([]);
  const [continentList, setContinentList] = useState<Continent[]>([]);
  const [accountList, setAccountList] = useState<Account[]>([]);
  const [accountSearchOpen, setAccountSearchOpen] = useState(false);
  const [accountSearchLoading, setAccountSearchLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (contact.email && !formik.dirty) {
      formik.setValues(contact);
      if (contact.accountId) {
        loadAccountById(contact.accountId);
      }
    }
  }, [contact]);

  const submit = (values: ContactDetailsDto, helpers: FormikHelpers<ContactDetailsDto>) => {
    execSubmitWithToast<ContactDetailsDto>(
      values,
      helpers,
      submitFunc,
      notificationsService,
      showErrorModal,
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
      accountId: undefined,
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
    value: { code?: string; name?: string } | null
  ) => {
    if (value && value.code) {
      formik.setFieldValue("language", value.code);
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

  const handleAccountChange = (e: SyntheticEvent<Element, Event>, value: Account | null) => {
    if (value) {
      formik.setFieldValue("accountId", value.id);
    } else {
      formik.setFieldValue("accountId", null);
    }
  };

  const loadAccountById = async (accountId: number) => {
    try {
      const response = await context.client.api.accountsDetail(accountId);
      if (response && response.data && response.data.id && response.data.name) {
        const account = { id: response.data.id, name: response.data.name };
        setAccountList((prev) => {
          const exists = prev.find((acc) => acc.id === account.id);
          return exists ? prev : [...prev, account];
        });
      }
    } catch (error) {
      console.error("Error loading account:", error);
    }
  };

  const loadInitialAccounts = async (force = false) => {
    if (!force && accountList.length > 0) return;
    setAccountSearchLoading(true);
    try {
      const response = await context.client.api.accountsList({
        query: "&filter[limit]=100&filter[order]=name ASC&filter[skip]=0",
      });
      if (response && response.data) {
        setAccountList(
          response.data
            .filter((acc) => acc.id !== undefined && acc.name !== undefined)
            .map((acc) => ({ id: acc.id as number, name: acc.name as string }))
        );
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
    } finally {
      setAccountSearchLoading(false);
    }
  };

  const handleAccountSearch = async (searchTerm: string) => {
    if (!searchTerm) {
      loadInitialAccounts(true);
      return;
    }
    setAccountSearchLoading(true);
    try {
      const response = await context.client.api.accountsList({
        query: `${searchTerm}&filter[limit]=100&filter[order]=name ASC&filter[skip]=0`,
      });
      if (response && response.data) {
        setAccountList(
          response.data
            .filter((acc) => acc.id !== undefined && acc.name !== undefined)
            .map((acc) => ({ id: acc.id as number, name: acc.name as string }))
        );
      }
    } catch (error) {
      console.error("Error searching accounts:", error);
    } finally {
      setAccountSearchLoading(false);
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

  const handleView = () => {
    if (formik.values.id) {
      const viewRoute = `${getCoreModuleRoute(CoreModule.contacts)}/${getViewFormRoute(
        Number(formik.values.id)
      )}`;
      navigate(viewRoute);
    }
  };

  const handleDeleteClick = () => {
    if (!isEdit || !handleDelete || !formik.values.id) {
      return;
    }
    setOpenDeleteConfirmation(true);
  };

  const closeDeleteConfirmation = () => {
    if (isDeleting) {
      return;
    }
    setOpenDeleteConfirmation(false);
  };

  const deleteContact = async () => {
    if (!isEdit || !handleDelete || !formik.values.id) {
      setOpenDeleteConfirmation(false);
      return;
    }

    await execDeleteWithToast(
      async () => {
        setIsDeleting(true);
        try {
          await handleDelete(formik.values.id as number);
          handleNavigation(CoreModule.contacts);
        } finally {
          setIsDeleting(false);
        }
      },
      notificationsService,
      "contact",
      showErrorModal
    );
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

  const actionButtons = (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        gap: 2,
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Box>
        {isEdit && handleDelete && formik.values.id ? (
          <Button
            disabled={isLoading || formik.isSubmitting || isDeleting}
            variant="outlined"
            color="error"
            onClick={handleDeleteClick}
            startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <Trash2 />}
            size="medium"
          >
            Delete
          </Button>
        ) : null}
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          disabled={isLoading || formik.isSubmitting || isDeleting}
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
          disabled={isLoading || formik.isSubmitting || isDeleting}
          variant="contained"
          color="primary"
          startIcon={<Save />}
          size="medium"
          onClick={() => formik.handleSubmit()}
        >
          {isEdit ? "Save" : "Add"}
        </Button>
      </Box>
    </Box>
  );

  return (
    <ModuleWrapper
      breadcrumbs={contactFormBreadcrumbLinks}
      currentBreadcrumb={header}
      isForm={true}
      actionButtons={actionButtons}
    >
      <form onSubmit={formik.handleSubmit}>
        <Card sx={{ mb: 4 }}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: 3,
              p: 3,
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.main",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            >
              {getInitials()}
            </Avatar>
            <Box sx={{ textAlign: { xs: "center", md: "left" }, flex: 1 }}>
              <Typography variant="h5" fontWeight="bold">
                {getFullName()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {formik.values.email || "No email provided"}
              </Typography>
              {formik.values.companyName && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {formik.values.companyName}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                justifyContent: { xs: "center", md: "flex-end" },
                mt: { xs: 2, md: 0 },
              }}
            >
              {formik.values.phone && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Phone size={16} />}
                  href={`tel:${formik.values.phone}`}
                >
                  Call
                </Button>
              )}
              {formik.values.email && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Mail size={16} />}
                  href={`mailto:${formik.values.email}`}
                >
                  Email
                </Button>
              )}
              {isEdit && formik.values.id && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Eye size={16} />}
                  onClick={handleView}
                  disabled={isLoading || formik.isSubmitting || isDeleting}
                >
                  View
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box sx={{ mr: 1.5, display: "flex", color: "primary.main" }}>
                <Contact size={20} />
              </Box>
              <Typography variant="h6" fontWeight="600">
                Contact Information
              </Typography>
            </Box>
            <Grid container spacing={3}>
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
                  required
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  disabled={isLoading || formik.isSubmitting}
                  options={accountList}
                  getOptionLabel={(option) => option.name}
                  size="small"
                  fullWidth
                  open={accountSearchOpen}
                  onOpen={() => {
                    setAccountSearchOpen(true);
                    loadInitialAccounts();
                  }}
                  onClose={() => setAccountSearchOpen(false)}
                  loading={accountSearchLoading}
                  value={accountList.find((acc) => acc.id === formik.values.accountId) || null}
                  onChange={handleAccountChange}
                  onInputChange={(e, value) => {
                    if (e && e.type !== "blur") {
                      handleAccountSearch(value);
                    }
                  }}
                  filterOptions={(x) => x}
                  renderInput={(params) => (
                    <TextField {...params} label="Account" placeholder="Search account..." />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  disabled={isLoading || formik.isSubmitting}
                  options={languages}
                  getOptionLabel={(option) => option.name || ""}
                  size="small"
                  fullWidth
                  value={languages.find((c) => c.code === formik.values.language) || null}
                  renderInput={(params) => (
                    <TextField {...params} label="Language" placeholder="Select language" />
                  )}
                  onChange={handleLanguageChange}
                />
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
          </CardContent>
        </Card>

        <Box sx={{ "& .MuiAccordion-root": { mb: 2 } }}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ py: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ mr: 1.5, display: "flex", color: "primary.main" }}>
                  <User size={20} />
                </Box>
                <Typography variant="subtitle1" fontWeight="600">
                  Personal Information
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
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
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ py: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ mr: 1.5, display: "flex", color: "primary.main" }}>
                  <Briefcase size={20} />
                </Box>
                <Typography variant="subtitle1" fontWeight="600">
                  Job Information
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
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
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ py: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ mr: 1.5, display: "flex", color: "primary.main" }}>
                  <Home size={20} />
                </Box>
                <Typography variant="subtitle1" fontWeight="600">
                  Address
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
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
                        <TextField {...params} label="Country" placeholder="Select country" />
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
                        <TextField {...params} label="Continent" placeholder="Select continent" />
                      )}
                    />
                  )}
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ py: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ mr: 1.5, display: "flex", color: "primary.main" }}>
                  <Share2 size={20} />
                </Box>
                <Typography variant="subtitle1" fontWeight="600">
                  Social Media
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {["facebook", "instagram", "twitter", "linkedin"].map((platform) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={platform}>
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
            </AccordionDetails>
          </Accordion>
        </Box>
      </form>
      <Dialog open={openDeleteConfirmation} onClose={closeDeleteConfirmation}>
        <DialogTitle>Delete contact</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. The contact and associated data will be permanently
            removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmation} disabled={isDeleting} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={deleteContact}
            disabled={isDeleting}
            color="error"
            variant="contained"
            startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <Trash2 />}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </ModuleWrapper>
  );
};
