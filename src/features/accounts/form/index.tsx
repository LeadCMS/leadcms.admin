import { ModuleWrapper } from "@components/module-wrapper";
import { KnownTagsAutocomplete } from "@components/known-tags-autocomplete";
import { useCoreModuleNavigation, useNotificationsService, useSaveShortcut } from "@hooks";
import { AccountDetailsDto } from "@lib/network/swagger-client";
import { CoreModule, getCoreModuleRoute, getViewFormRoute } from "@lib/router";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { useRequestContext } from "@providers/request-provider";
import { ChangeEvent, Fragment, SyntheticEvent, useEffect, useRef, useState } from "react";
import { getContinentList, getCountryList, execDeleteWithToast } from "utils/general-helper";
import { accountAddHeader, accountEditHeader, accountFormBreadcrumbLinks } from "../constants";
import { useFormik, FormikHelpers } from "formik";
import zod from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { execSubmitWithToast } from "utils/formik-helper";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import {
  Building,
  ChevronDown,
  Eye,
  Info,
  Link,
  MapPin,
  Minus,
  Plus,
  Save,
  Share2,
  Trash2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AccountFormProps {
  account: AccountDetailsDto;
  handleSave: (account: AccountDetailsDto) => Promise<void>;
  handleDelete?: (accountId: number) => Promise<void>;
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

export const AccountForm = ({ account, handleSave, handleDelete, isEdit }: AccountFormProps) => {
  const { notificationsService } = useNotificationsService();
  const context = useRequestContext();
  const { setBusy } = useModuleWrapperContext();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const handleNavigation = useCoreModuleNavigation();
  const navigate = useNavigate();

  const [countryList, setCountryList] = useState<Country[]>([]);
  const [continentList, setContinentList] = useState<Continent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSocialMediaKey, setNewSocialMediaKey] = useState("");
  const [newSocialMediaValue, setNewSocialMediaValue] = useState("");
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const saveModeRef = useRef<"stay" | "close">("close");

  const header = isEdit ? accountEditHeader : accountAddHeader;

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
    if (account && account.name) {
      formik.setValues({
        id: account.id,
        name: account.name || "",
        socialMedia: account.socialMedia || {},
        revenue: account.revenue ?? null,
        profit: account.profit ?? null,
        siteUrl: account.siteUrl || "",
        logoUrl: account.logoUrl || "",
        employeesRange: account.employeesRange || "",
        cityName: account.cityName || "",
        state: account.state || "",
        address: account.address || "",
        tin: account.tin || "",
        countryCode: account.countryCode || "ZZ",
        continentCode: account.continentCode || "ZZ",
        tags: account.tags || [],
        source: account.source || "",
      });
    }
  }, [account]);

  // Tags now handled via multi Autocomplete (freeSolo) below.

  const handleCancel = () => {
    handleNavigation(CoreModule.accounts);
  };

  const handleView = () => {
    if (formik.values.id) {
      const viewRoute = `${getCoreModuleRoute(CoreModule.accounts)}/${getViewFormRoute(
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
    if (isDeleting) return;
    setOpenDeleteConfirmation(false);
  };

  const deleteAccount = async () => {
    if (!isEdit || !handleDelete || !formik.values.id) {
      setOpenDeleteConfirmation(false);
      return;
    }

    await execDeleteWithToast(
      async () => {
        setIsDeleting(true);
        try {
          await handleDelete(formik.values.id as number);
          handleNavigation(CoreModule.accounts);
        } finally {
          setIsDeleting(false);
        }
      },
      notificationsService,
      "account",
      showErrorModal
    );
  };

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

  const handleSocialMediaChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string
  ) => {
    const socialMedia = { ...formik.values.socialMedia };
    (socialMedia[key] = e.target.value), formik.setFieldValue("socialMedia", socialMedia);
  };

  const handleSocialMediaAdd = () => {
    if (!newSocialMediaKey || !newSocialMediaValue) return;

    const newItem = { [newSocialMediaKey]: newSocialMediaValue };
    const updatedSocialMedia = { ...formik.values.socialMedia, ...newItem };
    formik.setFieldValue("socialMedia", updatedSocialMedia);

    setNewSocialMediaKey("");
    setNewSocialMediaValue("");
  };

  const handleSocialMediaRemove = (key: string) => {
    const updatedSocialMedia = { ...formik.values.socialMedia };
    delete updatedSocialMedia[key];
    formik.setFieldValue("socialMedia", updatedSocialMedia);
  };

  const submitFunc = async (values: AccountDetailsDto) => {
    console.log("submitFunc called with values:", values);
    try {
      await handleSave(values);
      console.log("handleSave completed successfully");
      if (saveModeRef.current === "close") {
        handleNavigation(CoreModule.accounts);
      } else {
        formik.setSubmitting(false);
      }
      saveModeRef.current = "close";
    } catch (error) {
      console.error("Error in submitFunc:", error);
      formik.setSubmitting(false);
      throw error;
    }
  };

  const submit = (values: AccountDetailsDto, helpers: FormikHelpers<AccountDetailsDto>) => {
    console.log("Account form submit called with values:", values);
    execSubmitWithToast<AccountDetailsDto>(
      values,
      helpers,
      submitFunc,
      notificationsService,
      showErrorModal,
      "account"
    );
  };

  const AccountEditValidationScheme = zod.object({
    name: zod.string().min(1, "Name is required"),
    revenue: zod
      .preprocess((val) => {
        if (val === "" || val === undefined) return null;
        if (val === null) return null;
        const num = Number(val);
        return Number.isNaN(num) ? null : num;
      }, zod.number().nullable().optional())
      .nullable()
      .optional(),
    profit: zod
      .preprocess((val) => {
        if (val === "" || val === undefined) return null;
        if (val === null) return null;
        const num = Number(val);
        return Number.isNaN(num) ? null : num;
      }, zod.number().nullable().optional())
      .nullable()
      .optional(),
    socialMedia: zod.record(zod.string()).optional(),
    siteUrl: zod.string().optional(),
    logoUrl: zod.string().optional(),
    employeesRange: zod.string().optional(),
    cityName: zod.string().optional(),
    state: zod.string().optional(),
    address: zod.string().optional(),
    tin: zod.string().optional(),
    countryCode: zod.string().optional(),
    continentCode: zod.string().optional(),
    tags: zod.array(zod.string()).optional(),
    source: zod.string().optional(),
  });

  const formik = useFormik({
    validationSchema: toFormikValidationSchema(AccountEditValidationScheme),
    initialValues: {
      id: undefined as number | undefined,
      name: "",
      socialMedia: {},
      revenue: null,
      profit: null,
      siteUrl: "",
      logoUrl: "",
      employeesRange: "",
      cityName: "",
      state: "",
      address: "",
      tin: "",
      countryCode: "ZZ",
      continentCode: "ZZ",
      tags: [],
      source: "",
    },
    onSubmit: submit,
    validateOnChange: false,
    enableReinitialize: true,
  });

  const handleSaveStay = () => {
    saveModeRef.current = "stay";
    formik.submitForm();
  };

  const handleSaveAndClose = () => {
    saveModeRef.current = "close";
    formik.submitForm();
  };

  useSaveShortcut(handleSaveStay, !isLoading && !formik.isSubmitting);

  const getAccountLabel = () => {
    if (formik.values.name) return formik.values.name;
    return isEdit ? "Edit Account" : "New Account";
  };

  const getInitials = () => {
    const name = formik.values.name || "";
    return name
      .split(" ")
      .map((w: string) => w.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
          type="button"
          disabled={isLoading || formik.isSubmitting || isDeleting}
          variant="outlined"
          color="primary"
          startIcon={isEdit ? <Save /> : <Plus />}
          size="medium"
          onClick={handleSaveStay}
        >
          {isEdit ? "Save" : "Add"}
        </Button>
        <Button
          type="submit"
          disabled={isLoading || formik.isSubmitting || isDeleting}
          variant="contained"
          color="primary"
          startIcon={isEdit ? <Save /> : <Plus />}
          size="medium"
          onClick={handleSaveAndClose}
        >
          {isEdit ? "Save and Close" : "Add and Close"}
        </Button>
      </Box>
    </Box>
  );

  return (
    <ModuleWrapper
      breadcrumbs={accountFormBreadcrumbLinks}
      currentBreadcrumb={header}
      isForm={true}
      actionButtons={actionButtons}
    >
      <form id="accountForm" onSubmit={formik.handleSubmit}>
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
              src={formik.values.logoUrl || undefined}
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.main",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            >
              {!formik.values.logoUrl && (getInitials() || <Building size={36} />)}
            </Avatar>
            <Box sx={{ textAlign: { xs: "center", md: "left" }, flex: 1 }}>
              <Typography variant="h5" fontWeight="bold">
                {getAccountLabel()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {formik.values.siteUrl || "No website provided"}
              </Typography>
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
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Box sx={{ mr: 1.5, display: "flex", color: "primary.main" }}>
                <Info size={20} />
              </Box>
              <Typography variant="h6" fontWeight="600">
                Account Information
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Name"
                  name="name"
                  value={formik.values.name || ""}
                  placeholder="Enter name"
                  variant="outlined"
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  fullWidth
                  size="small"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Site Url"
                  name="siteUrl"
                  value={formik.values.siteUrl || ""}
                  placeholder="Enter Site Url"
                  variant="outlined"
                  onChange={formik.handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Employees Range"
                  name="employeesRange"
                  value={formik.values.employeesRange || ""}
                  placeholder="Enter Employees Range"
                  variant="outlined"
                  onChange={formik.handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Tooltip title="Revenue field must contain only numbers">
                  <TextField
                    disabled={isLoading || formik.isSubmitting}
                    label="Revenue"
                    name="revenue"
                    type="number"
                    value={formik.values.revenue ?? ""}
                    placeholder="Enter Revenue"
                    variant="outlined"
                    error={formik.touched.revenue && Boolean(formik.errors.revenue)}
                    helperText={formik.touched.revenue && formik.errors.revenue}
                    onChange={formik.handleChange}
                    fullWidth
                    size="small"
                  />
                </Tooltip>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Tooltip title="Profit field must contain only numbers">
                  <TextField
                    disabled={isLoading || formik.isSubmitting}
                    label="Profit"
                    name="profit"
                    type="number"
                    value={formik.values.profit ?? ""}
                    placeholder="Enter Profit"
                    variant="outlined"
                    error={formik.touched.profit && Boolean(formik.errors.profit)}
                    helperText={formik.touched.profit && formik.errors.profit}
                    onChange={formik.handleChange}
                    fullWidth
                    size="small"
                  />
                </Tooltip>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="TIN"
                  name="tin"
                  value={formik.values.tin || ""}
                  placeholder="Enter TIN"
                  variant="outlined"
                  onChange={formik.handleChange}
                  fullWidth
                  size="small"
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
                  <MapPin size={20} />
                </Box>
                <Typography variant="subtitle1" fontWeight="600">
                  Location
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    disabled={isLoading || formik.isSubmitting}
                    label="Address"
                    name="address"
                    value={formik.values.address || ""}
                    placeholder="Enter Address"
                    variant="outlined"
                    onChange={formik.handleChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    disabled={isLoading || formik.isSubmitting}
                    label="City"
                    name="cityName"
                    value={formik.values.cityName || ""}
                    placeholder="Enter City"
                    variant="outlined"
                    onChange={formik.handleChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    disabled={isLoading || formik.isSubmitting}
                    label="State"
                    name="state"
                    value={formik.values.state || ""}
                    placeholder="Enter State"
                    variant="outlined"
                    onChange={formik.handleChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {!isLoading && (
                    <Autocomplete
                      disabled={isLoading || formik.isSubmitting}
                      disablePortal
                      options={countryList}
                      getOptionLabel={(option) => option.name}
                      onChange={handleCountryChange}
                      value={countryList.find((c) => c.code === formik.values.countryCode) || null}
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
                          label="Continent"
                          value={
                            continentList.find((c) => c.code === formik.values.continentCode) ||
                            null
                          }
                          onChange={formik.handleChange}
                        />
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
                {formik.values.socialMedia &&
                  Object.entries(formik.values.socialMedia || {}).map(([key, value], index) => (
                    <Fragment key={index}>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <TextField
                          label="Name"
                          value={key}
                          variant="outlined"
                          fullWidth
                          size="small"
                          disabled
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          disabled={isLoading || formik.isSubmitting}
                          label="Url"
                          value={value}
                          fullWidth
                          size="small"
                          onChange={(event) => handleSocialMediaChange(event, key)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Tooltip title="Remove social media">
                          <IconButton onClick={() => handleSocialMediaRemove(key)}>
                            <Minus size={22} />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Fragment>
                  ))}
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    disabled={isLoading || formik.isSubmitting}
                    label="Name"
                    fullWidth
                    size="small"
                    value={newSocialMediaKey}
                    onChange={(event) => setNewSocialMediaKey(event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    disabled={isLoading || formik.isSubmitting}
                    label="Url"
                    fullWidth
                    size="small"
                    value={newSocialMediaValue}
                    onChange={(event) => setNewSocialMediaValue(event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Tooltip title="Add social media">
                    <IconButton onClick={handleSocialMediaAdd}>
                      <Plus size={22} />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ py: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ mr: 1.5, display: "flex", color: "primary.main" }}>
                  <Link size={20} />
                </Box>
                <Typography variant="subtitle1" fontWeight="600">
                  Other
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <KnownTagsAutocomplete
                    entityType="accounts"
                    label="Tags"
                    placeholder="Add tag"
                    disabled={isLoading || formik.isSubmitting}
                    value={formik.values.tags || []}
                    onChange={(value) => {
                      formik.setFieldValue("tags", value);
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    disabled={isLoading || formik.isSubmitting}
                    label="Source"
                    name="source"
                    value={formik.values.source || ""}
                    placeholder="Enter Source"
                    variant="outlined"
                    onChange={formik.handleChange}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    disabled={isLoading || formik.isSubmitting}
                    label="Logo Url"
                    name="logoUrl"
                    value={formik.values.logoUrl || ""}
                    placeholder="Enter Logo Url"
                    type="url"
                    variant="outlined"
                    onChange={formik.handleChange}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Box>
      </form>
      <Dialog open={openDeleteConfirmation} onClose={closeDeleteConfirmation}>
        <DialogTitle>Delete account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. The account and associated data will be permanently
            removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmation} disabled={isDeleting} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={deleteAccount}
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
