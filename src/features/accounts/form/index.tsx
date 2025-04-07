import { ModuleWrapper } from "@components/module-wrapper";
import { SavingBar } from "@components/saving-bar";
import { useCoreModuleNavigation, useNotificationsService } from "@hooks";
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
} from "@mui/material";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { useRequestContext } from "@providers/request-provider";
import { ChangeEvent, Fragment, SyntheticEvent, useEffect, useState } from "react";
import { getContinentList, getCountryList } from "utils/general-helper";
import { accountAddHeader, accountEditHeader, accountFormBreadcrumbLinks } from "../constants";
import { useFormik, FormikHelpers } from "formik";
import zod from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { execSubmitWithToast } from "utils/formik-helper";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { CardContainer } from "../index.styled";

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
  const { setSaving, setBusy } = useModuleWrapperContext();
  const { Show: showErrorModal } = useErrorDetailsModal()!;
  const handleNavigation = useCoreModuleNavigation();

  const [countryList, setCountryList] = useState<Country[]>([]);
  const [continentList, setContinentList] = useState<Continent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSocialMediaKey, setNewSocialMediaKey] = useState("");
  const [newSocialMediaValue, setNewSocialMediaValue] = useState("");

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
    if (account.name) {
      formik.setValues(account);
    }
  }, [account]);

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    formik.setFieldValue("tags", value.split(","));
  };

  const handleCancel = () => {
    handleNavigation(CoreModule.accounts);
  };

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

  const handleSocialMediaChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: string,
  ) => {
    const socialMedia = { ...formik.values.socialMedia };
    (socialMedia![key] = e.target.value), formik.setFieldValue("socialMedia", socialMedia);
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

  const submitFunc = async (
    values: AccountDetailsDto,
    helpers: FormikHelpers<AccountDetailsDto>,
  ) => {
    try {
      await handleSave(values);
      handleNavigation(CoreModule.accounts);
    } catch (error) {
      formik.setSubmitting(false);
      throw error;
    }
  };

  const submit = (values: AccountDetailsDto, helpers: FormikHelpers<AccountDetailsDto>) => {
    execSubmitWithToast<AccountDetailsDto>(
      values,
      helpers,
      submitFunc,
      notificationsService,
      showErrorModal,
      "account",
    );
  };

  const AccountEditValidationScheme = zod.object({
    name: zod.string(),
    revenue: zod.number().nullable().optional(),
  });

  const formik = useFormik({
    validationSchema: toFormikValidationSchema(AccountEditValidationScheme),
    initialValues: {
      name: "",
    },
    onSubmit: submit,
    validateOnChange: false,
  });

  return (
    <ModuleWrapper
      breadcrumbs={accountFormBreadcrumbLinks}
      currentBreadcrumb={header}
      saveIndicatorElement={<SavingBar />}
    >
      <form onSubmit={formik.handleSubmit}>
        <CardContainer>
          <CardContent>
            <Grid container spacing={4} marginBottom={4}>
              <Grid xs={12} sm={12} item>
                <Typography variant="h6">About</Typography>
              </Grid>
              <Grid xs={12} sm={4} item>
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
                ></TextField>
              </Grid>
              <Grid xs={12} sm={4} item>
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
                ></TextField>
              </Grid>
              <Grid xs={12} sm={4} item>
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
                ></TextField>
              </Grid>
              <Grid xs={12} sm={2} item>
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
                ></TextField>
              </Grid>
              <Grid xs={12} sm={2} item>
                <Tooltip title="Revenue field must contain only numbers">
                  <TextField
                    disabled={isLoading || formik.isSubmitting}
                    label="Revenue"
                    name="revenue"
                    type="number"
                    value={formik.values.revenue || ""}
                    placeholder="Enter Revenue"
                    variant="outlined"
                    error={formik.touched.revenue && Boolean(formik.errors.revenue)}
                    helperText={formik.touched.revenue && formik.errors.revenue}
                    onChange={formik.handleChange}
                    fullWidth
                    size="small"
                  ></TextField>
                </Tooltip>
              </Grid>
            </Grid>
            <Divider></Divider>
            <Grid container spacing={4} marginTop={2} marginBottom={4}>
              <Grid xs={12} sm={12} item>
                <Typography variant="h6">Location</Typography>
              </Grid>
              <Grid xs={12} sm={3} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="City"
                  name="city"
                  value={formik.values.cityName}
                  placeholder="Enter City"
                  variant="outlined"
                  onChange={formik.handleChange}
                  fullWidth
                  size="small"
                ></TextField>
              </Grid>
              <Grid xs={12} sm={3} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="State"
                  name="state"
                  value={formik.values.state}
                  placeholder="Enter State"
                  variant="outlined"
                  onChange={formik.handleChange}
                  fullWidth
                  size="small"
                ></TextField>
              </Grid>
              <Grid xs={12} sm={3} item>
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
              <Grid xs={12} sm={3} item>
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
              <Grid xs={12} sm={12} item>
                <Typography variant="h6">Social Media</Typography>
              </Grid>
              <Grid xs={12} sm={12} item>
                <Grid container spacing={3}>
                  {formik.values.socialMedia &&
                    Object.entries(formik.values.socialMedia || {}).map(([key, value], index) => (
                      <Fragment key={index}>
                        <Grid xs={12} sm={2} item>
                          <TextField
                            label="Name"
                            value={key}
                            variant="outlined"
                            fullWidth
                            size="small"
                            disabled
                          />
                        </Grid>
                        <Grid xs={12} sm={6} item>
                          <TextField
                            disabled={isLoading || formik.isSubmitting}
                            label="Url"
                            value={value}
                            fullWidth
                            size="small"
                            onChange={(event) => handleSocialMediaChange(event, key)}
                          />
                        </Grid>
                        <Grid xs={12} sm={4} item>
                          <Tooltip title="Remove social media">
                            <IconButton onClick={() => handleSocialMediaRemove(key)}>
                              <RemoveIcon />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Fragment>
                    ))}
                  <Grid xs={12} sm={2} item>
                    <TextField
                      disabled={isLoading || formik.isSubmitting}
                      label="Name"
                      fullWidth
                      size="small"
                      value={newSocialMediaKey}
                      onChange={(event) => setNewSocialMediaKey(event.target.value)}
                    />
                  </Grid>
                  <Grid xs={12} sm={6} item>
                    <TextField
                      disabled={isLoading || formik.isSubmitting}
                      label="Url"
                      fullWidth
                      size="small"
                      value={newSocialMediaValue}
                      onChange={(event) => setNewSocialMediaValue(event.target.value)}
                    />
                  </Grid>
                  <Grid xs={12} sm={4} item>
                    <Tooltip title="Add social media">
                      <IconButton onClick={handleSocialMediaAdd}>
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Divider></Divider>
            <Grid container spacing={4} marginTop={2} marginBottom={4}>
              <Grid xs={12} sm={12} item>
                <Typography variant="h6">Other</Typography>
              </Grid>
              <Grid xs={12} sm={4} item>
                <TextField
                  disabled={isLoading || formik.isSubmitting}
                  label="Tags"
                  name="tags"
                  value={formik.values.tags?.join(",") || ""}
                  placeholder="Enter Tags"
                  variant="outlined"
                  onChange={handleTagInputChange}
                  fullWidth
                  size="small"
                ></TextField>
              </Grid>
              <Grid xs={12} sm={4} item>
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
                ></TextField>
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
