import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { ModuleWrapper } from "@components/module-wrapper";
import { useNotificationsService, useSaveShortcut } from "@hooks";
import { ContactDetailsDto, OrderDetailsDto } from "@lib/network/swagger-client";
import { defaultFilterLimit } from "@providers/query-provider";
import { CoreModule } from "@lib/router";
import {
  Autocomplete,
  Button,
  CardContent,
  Grid,
  TextField,
  Tooltip,
  Typography,
  Box,
  Card,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
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
import { Receipt, CircleDollarSign, Link, XCircle, Save } from "lucide-react";

interface OrderFormProps {
  order: OrderDetailsDto | undefined;
  updateOrder: (order: OrderDetailsDto) => void;
  handleSave: (order: OrderDetailsDto) => Promise<void>;
  isEdit: boolean;
}

export const OrderForm = ({ order, handleSave, isEdit }: OrderFormProps) => {
  const { notificationsService } = useNotificationsService();
  const { client } = useRequestContext();
  const { setBusy } = useModuleWrapperContext();
  const handleNavigation = useCoreModuleNavigation();
  const { Show: showErrorModal } = useErrorDetailsModal();

  const noopErrorHandler = (errors: string[]) => {
    console.log("Error occurred but error modal is not available:", errors);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [contactList, setContactList] = useState<ContactDetailsDto[]>([]);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [open, setOpen] = useState(false);
  const saveModeRef = useRef<"stay" | "close">("close");
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
      }, 800)
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

  const submitFunc = async (values: OrderDetailsDto) => {
    try {
      await handleSave(values);
      if (saveModeRef.current === "close") {
        handleNavigation(CoreModule.orders);
      }
      saveModeRef.current = "close";
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
      showErrorModal || noopErrorHandler,
      "order"
    );
  };

  const OrderEditValidationScheme = zod.object({
    contactId: zod.number().positive("Select a contact"),
    refNo: zod.string(),
    exchangeRate: zod.number().nullable().optional(),
    currency: zod.string(),
    orderNumber: zod.string().nullable().optional(),
    affiliateName: zod.string().nullable().optional(),
    source: zod.string().nullable().optional(),
    status: zod.enum(["Pending", "Paid", "Cancelled", "Refunded", "Failed"]).nullable().optional(),
  });

  const formik = useFormik<OrderDetailsDto>({
    validationSchema: toFormikValidationSchema(OrderEditValidationScheme),
    initialValues: {
      contactId: 0,
      refNo: "",
      exchangeRate: 0,
      currency: "",
      orderNumber: "",
      affiliateName: "",
      source: "",
      status: "Pending",
      contact: undefined as unknown as ContactDetailsDto,
    } as OrderDetailsDto,
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

  useSaveShortcut(handleSaveStay, !formik.isSubmitting);

  const actionButtons = (
    <Box sx={{ display: "flex", width: "100%", gap: 4, justifyContent: "flex-end" }}>
      <Button
        disabled={formik.isSubmitting}
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
        type="button"
        disabled={formik.isSubmitting}
        variant="outlined"
        color="primary"
        size="large"
        startIcon={<Save size={22} />}
        onClick={handleSaveStay}
      >
        Save
      </Button>
      <Button
        type="submit"
        disabled={formik.isSubmitting}
        variant="contained"
        color="primary"
        size="large"
        startIcon={<Save size={22} />}
        onClick={handleSaveAndClose}
      >
        Save and Close
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
      breadcrumbs={orderFormBreadcrumbLinks}
      currentBreadcrumb={header}
      actionButtons={actionButtons}
    >
      {order && (
        <form onSubmit={formik.handleSubmit}>
          <Card>
            <CardContent>
              <Grid container spacing={4} marginBottom={4}>
                <Grid size={{ xs: 12, sm: 6 }}>
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
                    value={formik.values.contact}
                    onChange={(event, value) => value && handleContactChange(value)}
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
                        error={formik.touched.contactId && Boolean(formik.errors.contactId)}
                        helperText={formik.touched.contactId && formik.errors.contactId}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={4} marginTop={2} marginBottom={4}>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <SectionHeader icon={<Receipt size={22} />} title="Orders" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
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
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
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
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      disabled={formik.isSubmitting}
                      label="Status"
                      name="status"
                      value={formik.values.status || "Pending"}
                      onChange={formik.handleChange}
                      error={formik.touched.status && Boolean(formik.errors.status)}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Paid">Paid</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                      <MenuItem value="Refunded">Refunded</MenuItem>
                      <MenuItem value="Failed">Failed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
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
                  />
                </Grid>
              </Grid>
              <Grid container spacing={4} marginTop={2} marginBottom={4}>
                <Grid size={{ xs: 12, sm: 12 }}>
                  <SectionHeader icon={<CircleDollarSign size={22} />} title="Currency" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
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
                <Grid size={{ xs: 12, sm: 4 }}>
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
                <Grid size={{ xs: 12, sm: 12 }}>
                  <SectionHeader icon={<Link size={22} />} title="Other" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
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
            </CardContent>
          </Card>
        </form>
      )}
    </ModuleWrapper>
  );
};
