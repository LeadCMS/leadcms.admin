import { ModuleWrapper } from "@components/module-wrapper";
import { useCoreModuleNavigation, useNotificationsService, useSaveShortcut } from "@hooks";
import { AccountDetailsDto } from "@lib/network/swagger-client";
import { CoreModule } from "@lib/router";
import {
  Autocomplete,
  Button,
  CardContent,
  Divider,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  Box,
  Card,
} from "@mui/material";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { useRequestContext } from "@providers/request-provider";
import { ChangeEvent, Fragment, SyntheticEvent, useEffect, useRef, useState } from "react";
import { getContinentList, getCountryList } from "utils/general-helper";
import { accountAddHeader, accountEditHeader, accountFormBreadcrumbLinks } from "../constants";
import { useFormik, FormikHelpers } from "formik";
import zod from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { execSubmitWithToast } from "utils/formik-helper";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { XCircle, Save, Plus, Minus, Info, MapPin, Share2, Link } from "lucide-react";

interface AccountFormProps {
  account: AccountDetailsDto;
  handleSave: (account: AccountDetailsDto) => Promise<void>;
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

export const AccountForm = ({ account, handleSave, isEdit }: AccountFormProps) => {
  const { notificationsService } = useNotificationsService();
  const context = useRequestContext();
  const { setBusy } = useModuleWrapperContext();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const handleNavigation = useCoreModuleNavigation();

  const [countryList, setCountryList] = useState<Country[]>([]);
  const [continentList, setContinentList] = useState<Continent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSocialMediaKey, setNewSocialMediaKey] = useState("");
  const [newSocialMediaValue, setNewSocialMediaValue] = useState("");
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

  const actionButtons = (
    <Box sx={{ display: "flex", width: "100%", gap: 4, justifyContent: "flex-end" }}>
      <Button
        disabled={isLoading || formik.isSubmitting}
        type="button"
        variant="outlined"
        color="primary"
        onClick={handleCancel}
        size="large"
        startIcon={<XCircle size={22} />}
      >
        Cancel
      </Button>
      <Button
        form="accountForm"
        type="button"
        disabled={isLoading || formik.isSubmitting}
        variant="outlined"
        color="primary"
        size="large"
        startIcon={isEdit ? <Save size={22} /> : <Plus size={22} />}
        onClick={handleSaveStay}
      >
        {isEdit ? "Save" : "Add"}
      </Button>
      <Button
        form="accountForm"
        type="submit"
        disabled={isLoading || formik.isSubmitting}
        variant="contained"
        color="primary"
        size="large"
        startIcon={isEdit ? <Save size={22} /> : <Plus size={22} />}
        onClick={handleSaveAndClose}
      >
        {isEdit ? "Save and Close" : "Add and Close"}
      </Button>
    </Box>
  );

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
      breadcrumbs={accountFormBreadcrumbLinks}
      currentBreadcrumb={header}
      actionButtons={actionButtons}
    >
      <form
        id="accountForm"
        onSubmit={(e) => {
          console.log("Form submit event");
          formik.handleSubmit(e);
        }}
      >
        <Card>
          <CardContent>
            <Grid container spacing={4} marginBottom={4}>
              <Grid size={{ xs: 12, sm: 12 }}>
                <SectionHeader icon={<Info size={22} />} title="About" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
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
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
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
              <Grid size={{ xs: 12, sm: 4 }}>
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
              <Grid size={{ xs: 12, sm: 3 }}>
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
              <Grid size={{ xs: 12, sm: 3 }}>
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
              <Grid size={{ xs: 12, sm: 3 }}>
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
              <Grid size={{ xs: 12, sm: 3 }}>
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
            <Divider></Divider>
            <Grid container spacing={4} marginTop={2} marginBottom={4}>
              <Grid size={{ xs: 12, sm: 12 }}>
                <SectionHeader icon={<MapPin size={22} />} title="Location" />
              </Grid>
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
              <Grid size={{ xs: 12, sm: 3 }}>
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
              <Grid size={{ xs: 12, sm: 3 }}>
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
              <Grid size={{ xs: 12, sm: 3 }}>
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
              <Grid size={{ xs: 12, sm: 3 }}>
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
                          continentList.find((c) => c.code === formik.values.continentCode) || null
                        }
                        onChange={formik.handleChange}
                      />
                    )}
                  />
                )}
              </Grid>
            </Grid>
            <Divider></Divider>
            <Grid container spacing={4} marginTop={2} marginBottom={4}>
              <Grid size={{ xs: 12, sm: 12 }}>
                <SectionHeader icon={<Share2 size={22} />} title="Social Media" />
              </Grid>
              <Grid size={{ xs: 12, sm: 12 }}>
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
              </Grid>
            </Grid>
            <Divider></Divider>
            <Grid container spacing={4} marginTop={2} marginBottom={4}>
              <Grid size={{ xs: 12, sm: 12 }}>
                <SectionHeader icon={<Link size={22} />} title="Other" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Autocomplete
                  multiple
                  freeSolo
                  size="small"
                  disabled={isLoading || formik.isSubmitting}
                  options={[]}
                  value={formik.values.tags || []}
                  onChange={(e, value) => {
                    formik.setFieldValue("tags", value);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Tags" placeholder="Add tag" variant="outlined" />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
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
            </Grid>
          </CardContent>
        </Card>
      </form>
    </ModuleWrapper>
  );
};
