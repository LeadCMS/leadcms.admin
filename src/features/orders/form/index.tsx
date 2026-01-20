import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { ModuleWrapper } from "@components/module-wrapper";
import { KnownTagsAutocomplete } from "@components/known-tags-autocomplete";
import { useNotificationsService, useSaveShortcut } from "@hooks";
import { ContactDetailsDto, OrderDetailsDto } from "@lib/network/swagger-client";
import { defaultFilterLimit } from "@providers/query-provider";
import { CoreModule, getCoreModuleRoute, getViewFormRoute } from "@lib/router";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { useRequestContext } from "@providers/request-provider";
import { useCoreModuleNavigation } from "@hooks";
import { orderAddHeader, orderEditHeader, orderFormBreadcrumbLinks } from "../constants";
import { useFormik, FormikHelpers } from "formik";
import zod from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { execSubmitWithToast } from "utils/formik-helper";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { execDeleteWithToast } from "utils/general-helper";
import {
  ChevronDown,
  CircleDollarSign,
  Eye,
  Hash,
  Link,
  Receipt,
  Save,
  ShoppingCart,
  Trash2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OrderFormProps {
  order: OrderDetailsDto | undefined;
  updateOrder: (order: OrderDetailsDto) => void;
  handleSave: (order: OrderDetailsDto) => Promise<void>;
  handleDelete?: (orderId: number) => Promise<void>;
  isEdit: boolean;
}

export const OrderForm = ({ order, handleSave, handleDelete, isEdit }: OrderFormProps) => {
  const { notificationsService } = useNotificationsService();
  const { client } = useRequestContext();
  const { setBusy } = useModuleWrapperContext();
  const handleNavigation = useCoreModuleNavigation();
  const { Show: showErrorModal } = useErrorDetailsModal();
  const navigate = useNavigate();

  const noopErrorHandler = (errors: string[]) => {
    console.log("Error occurred but error modal is not available:", errors);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [contactList, setContactList] = useState<ContactDetailsDto[]>([]);
  const [contactSearchOpen, setContactSearchOpen] = useState(false);
  const [contactSearchLoading, setContactSearchLoading] = useState(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [currenciesLoaded, setCurrenciesLoaded] = useState(false);
  const [currenciesLoading, setCurrenciesLoading] = useState(false);
  const saveModeRef = useRef<"stay" | "close">("close");
  const header = isEdit ? orderEditHeader : orderAddHeader;

  useEffect(() => {
    if (order) {
      setBusy(async () => {
        try {
          formik.setValues(order);
          if (order.contactId) {
            await loadContactById(order.contactId);
          }
          setIsLoading(false);
        } catch (e) {
          console.log(e);
        }
      });
    }
  }, [order]);

  const loadCurrencies = async () => {
    if (currenciesLoaded) return;
    setCurrenciesLoading(true);
    try {
      const { data } = await client.api.ordersCurrenciesList();
      setCurrencies(data || []);
      setCurrenciesLoaded(true);
    } catch (error) {
      console.error("Error loading currencies:", error);
    } finally {
      setCurrenciesLoading(false);
    }
  };

  const loadInitialContacts = async (force = false) => {
    if (!force && contactList.length > 0) return;
    setContactSearchLoading(true);
    try {
      const { data } = await client.api.contactsList({
        query: `&filter[limit]=${defaultFilterLimit}&filter[order]=email ASC&filter[skip]=0`,
      });
      setContactList(data);
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setContactSearchLoading(false);
    }
  };

  const handleContactSearch = async (searchTerm: string) => {
    if (!searchTerm) {
      loadInitialContacts(true);
      return;
    }
    setContactSearchLoading(true);
    try {
      const { data } = await client.api.contactsList({
        query: `${searchTerm}&filter[limit]=${defaultFilterLimit}`,
      });
      const selectedId = formik.values.contactId;
      if (selectedId) {
        const selected = contactList.find((c) => c.id === selectedId);
        if (selected && !data.find((c: ContactDetailsDto) => c.id === selectedId)) {
          setContactList([selected, ...data]);
        } else {
          setContactList(data);
        }
      } else {
        setContactList(data);
      }
    } catch (error) {
      console.error("Error searching contacts:", error);
    } finally {
      setContactSearchLoading(false);
    }
  };

  const loadContactById = async (contactId: number) => {
    try {
      const { data } = await client.api.contactsDetail(contactId);
      if (data) {
        setContactList((prev) => {
          const exists = prev.find((c) => c.id === data.id);
          return exists ? prev : [...prev, data];
        });
      }
    } catch (error) {
      console.error("Error loading contact:", error);
    }
  };

  const handleCancel = () => {
    handleNavigation(CoreModule.orders);
  };

  const handleView = () => {
    if (formik.values.id) {
      const viewRoute = `${getCoreModuleRoute(CoreModule.orders)}/${getViewFormRoute(
        Number(formik.values.id)
      )}`;
      navigate(viewRoute);
    }
  };

  const handleContactChange = (
    e: SyntheticEvent<Element, Event>,
    value: ContactDetailsDto | null
  ) => {
    if (value) {
      formik.setFieldValue("contactId", value.id);
    } else {
      formik.setFieldValue("contactId", null);
    }
  };

  const getContactLabel = (contact: ContactDetailsDto) => {
    const name =
      contact.firstName || contact.lastName
        ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
        : "";
    if (name && contact.email) return `${name} (${contact.email})`;
    return name || contact.email || "";
  };

  const submitFunc = async (values: OrderDetailsDto) => {
    try {
      await handleSave(values);
      if (saveModeRef.current === "close") {
        handleNavigation(CoreModule.orders);
      } else {
        formik.setSubmitting(false);
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
    testOrder: zod.boolean().nullable().optional(),
    data: zod.string().nullable().optional(),
    tags: zod.array(zod.string()).nullable().optional(),
    commission: zod.number().nullable().optional(),
    refund: zod.number().nullable().optional(),
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
      testOrder: false,
      data: "",
      tags: [],
      commission: 0,
      refund: 0,
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

  const deleteOrder = async () => {
    if (!isEdit || !handleDelete || !formik.values.id) {
      setOpenDeleteConfirmation(false);
      return;
    }

    await execDeleteWithToast(
      async () => {
        setIsDeleting(true);
        try {
          await handleDelete(formik.values.id as number);
          handleNavigation(CoreModule.orders);
        } finally {
          setIsDeleting(false);
        }
      },
      notificationsService,
      "order",
      showErrorModal
    );
  };

  const getOrderLabel = () => {
    const orderNo = formik.values.orderNumber;
    const refNo = formik.values.refNo;
    if (orderNo) return `Order #${orderNo}`;
    if (refNo) return `Ref: ${refNo}`;
    return isEdit ? "Edit Order" : "New Order";
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "paid":
        return "success";
      case "cancelled":
        return "error";
      case "refunded":
        return "info";
      case "failed":
        return "error";
      default:
        return "default";
    }
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
          startIcon={<Save />}
          size="medium"
          onClick={handleSaveStay}
        >
          Save
        </Button>
        <Button
          type="submit"
          disabled={isLoading || formik.isSubmitting || isDeleting}
          variant="contained"
          color="primary"
          startIcon={<Save />}
          size="medium"
          onClick={handleSaveAndClose}
        >
          Save and Close
        </Button>
      </Box>
    </Box>
  );

  return (
    <ModuleWrapper
      breadcrumbs={orderFormBreadcrumbLinks}
      currentBreadcrumb={header}
      isForm={true}
      actionButtons={actionButtons}
    >
      {order && (
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
                <ShoppingCart size={36} />
              </Avatar>
              <Box
                sx={{
                  textAlign: { xs: "center", md: "left" },
                  flex: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <Typography variant="h5" fontWeight="bold">
                    {getOrderLabel()}
                  </Typography>
                  <Chip
                    label={formik.values.status || "Pending"}
                    color={
                      getStatusColor(formik.values.status || "Pending") as
                        | "warning"
                        | "success"
                        | "error"
                        | "info"
                        | "default"
                    }
                    size="small"
                  />
                  {formik.values.testOrder && (
                    <Chip label="Test Order" color="secondary" size="small" variant="outlined" />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {formik.values.currency || "No currency"}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.5,
                  justifyContent: {
                    xs: "center",
                    md: "flex-end",
                  },
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    mr: 1.5,
                    display: "flex",
                    color: "primary.main",
                  }}
                >
                  <Receipt size={20} />
                </Box>
                <Typography variant="h6" fontWeight="600">
                  Order Information
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Autocomplete
                    disabled={formik.isSubmitting}
                    options={contactList}
                    getOptionLabel={(option) => getContactLabel(option)}
                    size="small"
                    fullWidth
                    open={contactSearchOpen}
                    onOpen={() => {
                      setContactSearchOpen(true);
                      loadInitialContacts();
                    }}
                    onClose={() => setContactSearchOpen(false)}
                    loading={contactSearchLoading}
                    value={contactList.find((c) => c.id === formik.values.contactId) || null}
                    onChange={handleContactChange}
                    onInputChange={(e, value, reason) => {
                      if (reason === "input") {
                        handleContactSearch(value);
                      }
                    }}
                    filterOptions={(x) => x}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Contact"
                        placeholder="Search contact..."
                        error={formik.touched.contactId && Boolean(formik.errors.contactId)}
                        helperText={formik.touched.contactId && formik.errors.contactId}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
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
                <Grid size={{ xs: 12, sm: 6 }}>
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
                <Grid size={{ xs: 12, sm: 6 }}>
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
              </Grid>
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
                <Box
                  sx={{
                    mr: 1.5,
                    display: "flex",
                    color: "primary.main",
                  }}
                >
                  <Hash size={20} />
                </Box>
                <Typography variant="h6" fontWeight="600">
                  Financial Details
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Tooltip title="Commission amount">
                    <TextField
                      disabled={formik.isSubmitting}
                      label="Commission"
                      name="commission"
                      type="number"
                      value={formik.values.commission ?? ""}
                      placeholder="Enter Commission"
                      variant="outlined"
                      onChange={formik.handleChange}
                      fullWidth
                      size="small"
                    />
                  </Tooltip>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Tooltip title="Refund amount">
                    <TextField
                      disabled={formik.isSubmitting}
                      label="Refund"
                      name="refund"
                      type="number"
                      value={formik.values.refund ?? ""}
                      placeholder="Enter Refund"
                      variant="outlined"
                      onChange={formik.handleChange}
                      fullWidth
                      size="small"
                    />
                  </Tooltip>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Checkbox
                      disabled={formik.isSubmitting}
                      checked={formik.values.testOrder || false}
                      onChange={(e) => formik.setFieldValue("testOrder", e.target.checked)}
                    />
                    <Typography variant="body2">Test Order</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ "& .MuiAccordion-root": { mb: 2 } }}>
            <Accordion defaultExpanded={false}>
              <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ py: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      mr: 1.5,
                      display: "flex",
                      color: "primary.main",
                    }}
                  >
                    <CircleDollarSign size={20} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight="600">
                    Currency
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      disabled={formik.isSubmitting}
                      options={currencies}
                      freeSolo
                      autoSelect
                      size="small"
                      fullWidth
                      loading={currenciesLoading}
                      onOpen={() => loadCurrencies()}
                      value={formik.values.currency || ""}
                      onChange={(e, val) => formik.setFieldValue("currency", val || "")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Currency"
                          placeholder="Enter Currency"
                          error={formik.touched.currency && Boolean(formik.errors.currency)}
                          helperText={formik.touched.currency && formik.errors.currency}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
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
                      />
                    </Tooltip>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded={false}>
              <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ py: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      mr: 1.5,
                      display: "flex",
                      color: "primary.main",
                    }}
                  >
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
                  <Grid size={{ xs: 12, sm: 6 }}>
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
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <KnownTagsAutocomplete
                      entityType="orders"
                      label="Tags"
                      placeholder="Add tag"
                      disabled={formik.isSubmitting}
                      value={formik.values.tags || []}
                      onChange={(value) => formik.setFieldValue("tags", value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      disabled={formik.isSubmitting}
                      label="Data"
                      name="data"
                      value={formik.values.data || ""}
                      placeholder="Enter Data"
                      variant="outlined"
                      onChange={formik.handleChange}
                      fullWidth
                      size="small"
                      multiline
                      minRows={2}
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        </form>
      )}
      <Dialog open={openDeleteConfirmation} onClose={closeDeleteConfirmation}>
        <DialogTitle>Delete order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. The order and associated data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmation} disabled={isDeleting} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={deleteOrder}
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
