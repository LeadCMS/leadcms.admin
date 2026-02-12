import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridCellParams, GridColDef } from "@mui/x-data-grid";
import { Edit, Package, Plus, XCircle } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { OrderItemDetailsDto } from "@lib/network/swagger-client";
import { useRequestContext } from "@providers/request-provider";
import { useNotificationsService } from "@hooks";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { useFormik, FormikHelpers } from "formik";
import zod from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { execSubmitWithToast } from "utils/formik-helper";
import { execDeleteWithToast } from "utils/general-helper";
import { ActionButtonContainer } from "@components/data-table/index.styled";
import { DataDeleteConfirmation } from "@components/data-management";
import { OrderViewOutletContext } from "../types";

export const OrderItems = () => {
  const { order, orderItems, refreshOrderItems, currencies } =
    useOutletContext<OrderViewOutletContext>();
  const { client } = useRequestContext();
  const { notificationsService } = useNotificationsService();
  const { Show: showErrorModal } = useErrorDetailsModal();

  const [isEdit, setIsEdit] = useState(false);
  const [orderItem, setOrderItem] = useState<OrderItemDetailsDto | undefined>();
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const deleteRecord = async () => {
    if (!orderItem?.id) return;
    await client.api.orderItemsDelete(orderItem.id);
    await refreshOrderItems();
    setIsConfirmed(false);
  };

  if (isConfirmed) {
    (async () => {
      await execDeleteWithToast(deleteRecord, notificationsService, "order item", showErrorModal);
    })();
  }

  const handleDelete = (row: { id: number }) => {
    setOpenConfirmation(true);
    setOrderItem(orderItems?.find((x) => x.id === row.id));
  };

  const columns: GridColDef<OrderItemDetailsDto>[] = [
    {
      field: "productName",
      headerName: "Product",
      flex: 2,
    },
    {
      field: "currency",
      headerName: "Currency",
      flex: 1,
    },
    {
      field: "unitPrice",
      headerName: "Unit Price",
      flex: 1,
      renderCell: (params) => (params.value != null ? currencyFormatter.format(params.value) : "-"),
    },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 1,
    },
    {
      field: "total",
      headerName: "Total",
      flex: 1,
      renderCell: (params) => (params.value != null ? currencyFormatter.format(params.value) : "-"),
    },
    {
      field: "source",
      headerName: "Source",
      flex: 1,
    },
  ];

  const actionsColumn: GridColDef = {
    field: "actions",
    headerName: "Actions",
    flex: 1,
    align: "right",
    headerAlign: "center",
    filterable: false,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params: GridCellParams) => {
      return (
        <ActionButtonContainer>
          <IconButton onClick={() => handleEditClick(params)}>
            <Edit size={20} />
          </IconButton>
          <IconButton
            disabled={isEdit}
            onClick={() => handleDelete(params as unknown as { id: number })}
          >
            <XCircle size={20} />
          </IconButton>
        </ActionButtonContainer>
      );
    },
  };

  const handleEditClick = (row: { id: unknown }) => {
    setIsEdit(true);
    const editingItem = orderItems?.find((x) => x.id === row.id);
    if (editingItem) formik.setValues(editingItem);
  };

  const handleCancel = () => {
    setIsEdit(false);
  };

  const handleAdd = () => {
    if (!order?.id) return;
    formik.setValues({
      productName: "",
      orderId: order.id,
      unitPrice: 0,
      currency: "",
      quantity: 0,
      source: "",
      id: undefined,
    });
    setIsEdit(true);
  };

  const gridFinalizedColumns = [...columns, actionsColumn];

  const submitFunc = async (values: OrderItemDetailsDto) => {
    try {
      if (values?.id) {
        await client.api.orderItemsPartialUpdate(values.id, values);
      } else {
        await client.api.orderItemsCreate(values);
      }
      await refreshOrderItems();
      setIsEdit(false);
    } finally {
      formik.setSubmitting(false);
    }
  };

  const submit = (values: OrderItemDetailsDto, helpers: FormikHelpers<OrderItemDetailsDto>) => {
    execSubmitWithToast<OrderItemDetailsDto>(
      values,
      helpers,
      submitFunc,
      notificationsService,
      showErrorModal,
      "order item"
    );
  };

  const OrderItemEditValidationScheme = zod.object({
    productName: zod.string(),
    unitPrice: zod.number().positive(),
    currency: zod.string(),
    quantity: zod.number().positive(),
    source: zod.string().optional().nullable(),
    id: zod.number().optional(),
  });

  const formik = useFormik<OrderItemDetailsDto>({
    validationSchema: toFormikValidationSchema(OrderItemEditValidationScheme),
    initialValues: {
      orderId: 0,
      productName: "",
      unitPrice: 0,
      currency: "",
      quantity: 0,
      source: "",
      id: undefined,
    },
    onSubmit: submit,
    validateOnChange: false,
  });

  if (!order) {
    return (
      <Box sx={{ mt: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Order data is not available.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ color: "text.secondary", display: "flex" }}>
                <Package size={18} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Order Items
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={handleAdd}
            >
              Add Item
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <DataGrid
              columns={gridFinalizedColumns}
              rows={orderItems || []}
              loading={!orderItems}
              checkboxSelection={false}
              pagination={undefined}
              hideFooter={true}
            />
          </Box>
        </CardContent>
      </Card>

      {isEdit && (
        <form onSubmit={formik.handleSubmit}>
          <Card variant="outlined" sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2.5 }}>
                {formik.values.id ? "Edit" : "Add"} Order Item
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    disabled={formik.isSubmitting}
                    label="Product Name"
                    name="productName"
                    value={formik.values.productName || ""}
                    variant="outlined"
                    fullWidth
                    size="small"
                    error={formik.touched.productName && Boolean(formik.errors.productName)}
                    helperText={formik.touched.productName && formik.errors.productName}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Tooltip title="Unit Price must be a number">
                    <TextField
                      disabled={formik.isSubmitting}
                      label="Unit Price"
                      name="unitPrice"
                      type="number"
                      value={formik.values.unitPrice || ""}
                      fullWidth
                      size="small"
                      error={formik.touched.unitPrice && Boolean(formik.errors.unitPrice)}
                      helperText={formik.touched.unitPrice && formik.errors.unitPrice}
                      onChange={formik.handleChange}
                    />
                  </Tooltip>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Autocomplete
                    disabled={formik.isSubmitting}
                    options={currencies}
                    freeSolo
                    autoSelect
                    size="small"
                    fullWidth
                    value={formik.values.currency || ""}
                    onChange={(e, val) => formik.setFieldValue("currency", val || "")}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Currency"
                        error={formik.touched.currency && Boolean(formik.errors.currency)}
                        helperText={formik.touched.currency && formik.errors.currency}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Tooltip title="Quantity must be a number">
                    <TextField
                      disabled={formik.isSubmitting}
                      label="Quantity"
                      name="quantity"
                      type="number"
                      value={formik.values.quantity || ""}
                      fullWidth
                      size="small"
                      error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                      helperText={formik.touched.quantity && formik.errors.quantity}
                      onChange={formik.handleChange}
                    />
                  </Tooltip>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    disabled={formik.isSubmitting}
                    label="Source"
                    name="source"
                    value={formik.values.source || ""}
                    fullWidth
                    size="small"
                    onChange={formik.handleChange}
                  />
                </Grid>
              </Grid>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
                <Button
                  disabled={formik.isSubmitting}
                  variant="outlined"
                  size="small"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formik.isSubmitting}
                  variant="contained"
                  size="small"
                >
                  Save
                </Button>
              </Box>
            </CardContent>
          </Card>
        </form>
      )}

      <DataDeleteConfirmation
        entity="order item"
        openConfirmation={openConfirmation}
        setIsConfirmed={setIsConfirmed}
        setOpenConfirmation={setOpenConfirmation}
      />
    </Box>
  );
};
