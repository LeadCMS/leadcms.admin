import { SyntheticEvent, useEffect, useState } from "react";
import { ModuleWrapper } from "@components/module-wrapper";
import { SavingBar } from "@components/saving-bar";
import { useNotificationsService } from "@hooks";
import { ContactDetailsDto, OrderDetailsDto } from "@lib/network/swagger-client";
import { defaultFilterLimit } from "@providers/query-provider";
import { CoreModule } from "@lib/router";
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { useRequestContext } from "@providers/request-provider";
import { useCoreModuleNavigation } from "@hooks";
import { orderAddHeader, orderEditHeader, orderFormBreadcrumbLinks } from "../constants";
import { useFormik, FormikHelpers } from "formik";
import zod from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { execSubmitWithToast } from "utils/formik-helper";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { CardContainer } from "../index.styled";

interface OrderFormProps {
  order: OrderDetailsDto | undefined;
  updateOrder: (order: OrderDetailsDto) => void;
  handleSave: (order: OrderDetailsDto) => Promise<void>;
  isEdit: boolean;
}

export const OrderForm = ({ order, handleSave, isEdit }: OrderFormProps) => {
  const { notificationsService } = useNotificationsService();
  const { client } = useRequestContext();
  const { setSaving, setBusy } = useModuleWrapperContext();
  const handleNavigation = useCoreModuleNavigation();
  const { Show: showErrorModal } = useErrorDetailsModal()!;

  const [isLoading, setIsLoading] = useState(true);
  const [contactList, setContactList] = useState<ContactDetailsDto[]>([]);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [open, setOpen] = useState(false);
  const loading = open && isLoading;
  const header = isEdit ? orderEditHeader : orderAddHeader;

  useEffect(() => {
    if (order) {
      setBusy(async () => {
        try {
          formik.setValues(order);
          const { data } = await client.api.contactsDetail(order.contactId);
          formik.setFieldValue("contact", data);
          setIsLoading(false);
        } catch (e) {
          console.log(e);
        }
      });
    }
  }, [order]);

  useEffect(() => {
    if (!open) {
      setContactList([]);
    }
  }, [open]);

  const loadContacts = async (e: SyntheticEvent<Element, Event>, text: string) => {
    if (e.type != "change") return;

    if (timer) {
      clearTimeout(timer);
    }
    setIsLoading(true);
    setTimer(
      setTimeout(async () => {
        if (text) {
          const { data } = await client.api.contactsList({
            query: `${text}&filter[limit]=${defaultFilterLimit}`,
          });
          setContactList(data);
        } else {
          setContactList([]);
        }
        setIsLoading(false);
      }, 800),
    );
  };

  const handleCancel = () => {
    handleNavigation(CoreModule.orders);
  };

  const handleContactChange = (value: ContactDetailsDto) => {
    if (value) {
      formik.setFieldValue("contactId", value.id);
      formik.setFieldValue("contact", value);
    }
  };

  const getOptionLabel = (contact: ContactDetailsDto) => {
    if (contact.firstName || contact.lastName) return `${contact.firstName} ${contact.lastName}`;
    else return contact.email;
  };

  const submitFunc = async (values: OrderDetailsDto, helpers: FormikHelpers<OrderDetailsDto>) => {
    try {
      await handleSave(values);
      handleNavigation(CoreModule.orders);
    } catch (error) {
      formik.setSubmitting(false);
      throw error;
    }
  };

  const submit = (values: OrderDetailsDto, helpers: FormikHelpers<OrderDetailsDto>) => {
    execSubmitWithToast<OrderDetailsDto>(
      values,
      helpers,
      submitFunc,
      notificationsService,
      showErrorModal,
      "order",
    );
  };

  const OrderEditValidationScheme = zod.object({
    contactId: zod.number().positive("Select a contact"),
    refNo: zod.string(),
    exchangeRate: zod.number().nullable().optional(),
    currency: zod.string(),
  });

  const formik = useFormik({
    validationSchema: toFormikValidationSchema(OrderEditValidationScheme),
    initialValues: {
      contactId: 0,
      refNo: "",
      exchangeRate: 0,
      currency: "",
    },
    onSubmit: submit,
    validateOnChange: false,
  });

  return (
    <ModuleWrapper
      breadcrumbs={orderFormBreadcrumbLinks}
      currentBreadcrumb={header}
      saveIndicatorElement={<SavingBar />}
    >
      {order && (
        <form onSubmit={formik.handleSubmit}>
          <CardContainer>
            <CardContent>
              <Grid container spacing={3} marginBottom={4}>
                <Grid xs={12} sm={12} item>
                  <Typography variant="h6">Contact</Typography>
                </Grid>
                <Grid xs={12} sm={6} item>
                  <Autocomplete
                    disabled={formik.isSubmitting}
                    disablePortal
                    open={open}
                    onOpen={() => {
                      setOpen(true);
                    }}
                    onClose={() => {
                      setOpen(false);
                    }}
                    options={contactList}
                    getOptionLabel={(option) => getOptionLabel(option)}
                    value={formik.values.contact || null}
                    onChange={(event, value) => handleContactChange(value!)}
                    onInputChange={(event, value) => {
                      loadContacts(event, value);
                    }}
                    loading={loading}
                    filterOptions={(x) => x}
                    fullWidth
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Contact"
                        value={formik.values.contact || null}
                        error={formik.touched.contactId && Boolean(formik.errors.contactId)}
                        helperText={formik.touched.contactId && formik.errors.contactId}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={4} marginTop={2} marginBottom={4}>
                <Grid xs={12} sm={12} item>
                  <Typography variant="h6">Order</Typography>
                </Grid>
                <Grid xs={12} sm={4} item>
                  <TextField
                    disabled={formik.isSubmitting}
                    label="Ref No"
                    name="refNo"
                    value={formik.values.refNo || ""}
                    placeholder="Enter Ref No"
                    variant="outlined"
                    onChange={formik.handleChange}
                    error={formik.touched.refNo && Boolean(formik.errors.refNo)}
                    helperText={formik.touched.refNo && formik.errors.refNo}
                    fullWidth
                    size="small"
                  ></TextField>
                </Grid>
                <Grid xs={12} sm={4} item>
                  <TextField
                    disabled={formik.isSubmitting}
                    label="Order No"
                    name="orderNumber"
                    value={formik.values.orderNumber || ""}
                    placeholder="Enter Order Number"
                    variant="outlined"
                    onChange={formik.handleChange}
                    fullWidth
                    size="small"
                  ></TextField>
                </Grid>
                <Grid xs={12} sm={4} item>
                  <TextField
                    disabled={formik.isSubmitting}
                    label="Affiliate Name"
                    name="affiliateName"
                    value={formik.values.affiliateName || ""}
                    placeholder="Enter Affiliate Name"
                    variant="outlined"
                    onChange={formik.handleChange}
                    fullWidth
                    size="small"
                  ></TextField>
                </Grid>
              </Grid>
              <Grid container spacing={4} marginTop={2} marginBottom={4}>
                <Grid xs={12} sm={12} item>
                  <Typography variant="h6">Currency</Typography>
                </Grid>
                <Grid xs={12} sm={4} item>
                  <Tooltip title="Exchange Rate field must contain only numbers">
                    <TextField
                      disabled={formik.isSubmitting}
                      label="Exchange Rate"
                      name="exchangeRate"
                      type="number"
                      value={formik.values.exchangeRate || ""}
                      placeholder="Enter Exchange Rate"
                      variant="outlined"
                      error={formik.touched.exchangeRate && Boolean(formik.errors.exchangeRate)}
                      helperText={formik.touched.exchangeRate && formik.errors.exchangeRate}
                      onChange={formik.handleChange}
                      fullWidth
                      size="small"
                    ></TextField>
                  </Tooltip>
                </Grid>
                <Grid xs={12} sm={4} item>
                  <TextField
                    disabled={formik.isSubmitting}
                    label="Currency"
                    name="currency"
                    value={formik.values.currency || ""}
                    placeholder="Enter Currency"
                    variant="outlined"
                    error={formik.touched.currency && Boolean(formik.errors.currency)}
                    helperText={formik.touched.currency && formik.errors.currency}
                    onChange={formik.handleChange}
                    fullWidth
                    size="small"
                  ></TextField>
                </Grid>
              </Grid>
              <Grid container spacing={4} marginTop={2} marginBottom={4}>
                <Grid xs={12} sm={12} item>
                  <Typography variant="h6">Other</Typography>
                </Grid>
                <Grid xs={12} sm={4} item>
                  <TextField
                    disabled={formik.isSubmitting}
                    label="Source"
                    name="source"
                    value={formik.values.source || ""}
                    placeholder="Enter Source"
                    variant="outlined"
                    onChange={formik.handleChange}
                    fullWidth
                    size="small"
                  ></TextField>
                </Grid>
              </Grid>
              <Grid container spacing={4} marginTop={2} marginBottom={4} justifyContent="flex-end">
                <Grid item xs={1}>
                  <Button
                    disabled={formik.isSubmitting}
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
                    disabled={formik.isSubmitting}
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Save
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </CardContainer>
        </form>
      )}
    </ModuleWrapper>
  );
};
