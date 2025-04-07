import { useEffect, useState } from "react";
import { ContactCardHeader } from "@features/contacts/index.styled";
import { useNotificationsService } from "@hooks";
import {
  ContactDetailsDto,
  OrderDetailsDto,
  OrderItemDetailsDto,
} from "@lib/network/swagger-client";
import { getWhereFilterQuery } from "@providers/query-provider";
import { CoreModule, getCoreModuleRoute, getViewFormRoute, viewFormRoute } from "@lib/router";
import {
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Link,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridCellParams, GridColDef } from "@mui/x-data-grid";
import { useRequestContext } from "@providers/request-provider";
import { DataView } from "components/data-view";
import { useRouteParams } from "typesafe-routes";
import { execDeleteWithToast, getCountryByCode, getFormattedDateTime } from "utils/general-helper";
import { ModuleWrapper } from "@components/module-wrapper";
import { GhostLink } from "@components/ghost-link";
import { ActionButtonContainer } from "@components/data-table/index.styled";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { useFormik, FormikHelpers } from "formik";
import zod from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { execSubmitWithToast } from "utils/formik-helper";
import { useErrorDetailsModal } from "@providers/error-details-modal-provider";
import { DataManagementBlock, DataDeleteConfirmation } from "@components/data-management";
import { orderFormBreadcrumbLinks } from "@features/orders/constants";

export const OrderView = () => {
  const context = useRequestContext();
  const { client } = context;
  const { id } = useRouteParams(viewFormRoute);
  const { notificationsService } = useNotificationsService();
  const { setBusy } = useModuleWrapperContext();
  const { Show: showErrorModal } = useErrorDetailsModal()!;

  const [order, setOrder] = useState<OrderDetailsDto | undefined>();
  const [contact, setContact] = useState<ContactDetailsDto>();
  const [contactCountry, setContactCountry] = useState<string>("");
  const [orderItems, setOrderItems] = useState<OrderItemDetailsDto[] | undefined>();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [orderItem, setOrderItem] = useState<OrderItemDetailsDto>();
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    setBusy(async () => {
      try {
        const { data } = await client.api.ordersDetail(id);
        setContactState(data.contactId);
        setOrder(data);
        setOrderItems(await getOrderItems(data.id!));
      } catch (e) {
        console.log(e);
      }
    });
  }, [client]);

  useEffect(() => {
    if (isConfirmed) {
      (async () => {
        await execDeleteWithToast(deleteRecord, notificationsService, "order item", showErrorModal);
      })();
    }
  }, [isConfirmed]);

  const deleteRecord = async () => {
    await client.api.orderItemsDelete(orderItem!.id!);
    setOrderItems(await getOrderItems(order!.id!));
    setIsConfirmed(false);
  };

  const setContactState = async (id: number) => {
    try {
      const { data } = await client.api.contactsDetail(id);
      setContact(data);
      if (data.countryCode) {
        setContactCountryState(data.countryCode);
      }
    } catch (error) {
      console.log(error);
      notificationsService.error("Server error: could not retrieve contact details.");
    }
  };

  const setContactCountryState = async (code: string) => {
    const country = await getCountryByCode(context, code);
    if (country) {
      setContactCountry(country);
    } else {
      notificationsService.error("Server error: country is not available.");
    }
  };

  const getOrderItems = async (orderId: number) => {
    try {
      const { data } = await client.api.orderItemsList({
        query: getWhereFilterQuery("orderId", orderId.toString(), "equals"),
      });
      if (data.length > 0) {
        return data;
      } else {
        notificationsService.info("No order items available for seleted order.");
        return [];
      }
    } catch (error) {
      console.log(error);
      notificationsService.error("Server error: could not retrieve order items.");
    }
  };

  const handleDelete = (row: any) => {
    setOpenConfirmation(true);
    setOrderItem(orderItems?.find((x) => x.id === row.id));
  };

  const contactRef =
    contact?.firstName || contact?.lastName
      ? `${contact.firstName || ""} ${contact.lastName || ""}`
      : contact?.email;

  const contactAddress = contact && (
    <div>
      <div>{contact.address1 || ""}</div>
      <div>{contact.cityName || ""}</div>
      <div>{contactCountry || ""}</div>
    </div>
  );

  const contactName = contact && (
    <div>
      <Link
        to={`${getCoreModuleRoute(CoreModule.contacts)}/${getViewFormRoute(contact.id!)}`}
        state={contact}
        component={GhostLink}
        underline="hover"
      >
        {contactRef}
      </Link>
    </div>
  );

  const orderViewData = [
    { label: "Order Id", value: order?.orderNumber || "" },
    { label: "Reference no", value: order?.refNo || "" },
    { label: "Order date", value: order?.createdAt ? getFormattedDateTime(order?.createdAt) : "" },
    { label: "Quantity", value: order?.quantity || "" },
    { label: "Total", value: order?.total || "" },
  ];

  const orderCustomerData = [
    { label: "Name", value: contactName || "" },
    { label: "Address", value: contactAddress || "" },
  ];

  const columns: GridColDef<OrderItemDetailsDto>[] = [
    {
      field: "productName",
      headerName: "Product",
      flex: 2,
    },
    {
      field: "licenseCode",
      headerName: "License",
      flex: 2,
    },
    {
      field: "unitPrice",
      headerName: "Unit price",
      flex: 2,
    },
    {
      field: "currency",
      headerName: "Currency",
      flex: 2,
    },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 2,
    },
    {
      field: "total",
      headerName: "Total",
      flex: 2,
    },
  ];

  const actionsColumn: GridColDef | any = {
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
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton disabled={isEdit} onClick={() => handleDelete(params)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </ActionButtonContainer>
      );
    },
  };

  const handleEditClick = (row: any) => {
    setIsEdit(true);
    const editingOrderItem = orderItems?.find((x) => x.id === row.id);
    formik.setValues(editingOrderItem!);
  };

  const handleCancel = () => {
    setIsEdit(false);
  };

  const handleAdd = () => {
    formik.setValues({
      productName: "",
      orderId: order!.id!,
      licenseCode: "",
      unitPrice: 0,
      currency: "",
      quantity: 0,
    });
    setIsEdit(true);
  };

  const gridFinalizedColumns = columns.concat(actionsColumn);

  const submitFunc = async (
    values: OrderItemDetailsDto,
    helpers: FormikHelpers<OrderItemDetailsDto>,
  ) => {
    try {
      if (values?.id) {
        await client.api.orderItemsPartialUpdate(values.id!, values!);
      } else await client.api.orderItemsCreate(values!);
      setOrderItems(await getOrderItems(order!.id!));
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
      "order item",
    );
  };

  const OrderItemEditValidationScheme = zod.object({
    productName: zod.string(),
    licenseCode: zod.string(),
    unitPrice: zod.number().positive(),
    currency: zod.string(),
    quantity: zod.number().positive(),
  });

  const formik = useFormik({
    validationSchema: toFormikValidationSchema(OrderItemEditValidationScheme),
    initialValues: {
      orderId: 0,
      productName: "",
      licenseCode: "",
      unitPrice: 0,
      currency: "",
      quantity: 0,
    },
    onSubmit: submit,
    validateOnChange: false,
  });

  return (
    <>
      {order && (
        <>
          <Grid container spacing={3} marginTop={4} paddingRight={4}>
            <Grid xs={12} sm={4} item>
              <Grid marginBottom={3}>
                <DataView header="Order Info" rows={orderViewData}></DataView>
              </Grid>
              <Grid marginBottom={3}>
                <DataView header="Customer Info" rows={orderCustomerData}></DataView>
              </Grid>
              <Grid marginBottom={3}>
                <DataManagementBlock
                  header="Data Management"
                  description="Please be aware that what
            has been deleted can never be brought back."
                  entity="order"
                  handleDeleteAsync={(id) => client.api.ordersDelete(id as number)}
                  itemId={id}
                  successNavigationRoute={CoreModule.orders}
                ></DataManagementBlock>
              </Grid>
            </Grid>
            <Grid xs={12} sm={8} item>
              <Grid marginBottom={3}>
                <Card>
                  {orderItems && (
                    <CardContent>
                      <Grid marginBottom={3}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography gutterBottom variant="h6" component="div">
                            Order Items
                          </Typography>
                          <Button variant="contained" color="primary" onClick={handleAdd}>
                            Add Order Item
                          </Button>
                        </div>
                      </Grid>
                      <DataGrid
                        columns={gridFinalizedColumns}
                        rows={orderItems || []}
                        loading={!orderItems}
                        checkboxSelection={false}
                        autoHeight={true}
                        pagination={undefined}
                        hideFooter={true}
                      />
                    </CardContent>
                  )}
                </Card>
              </Grid>
              {isEdit && (
                <form onSubmit={formik.handleSubmit}>
                  <Grid marginBottom={3}>
                    <Card>
                      <CardContent>
                        <Grid container spacing={4} marginBottom={4}>
                          <Grid xs={12} sm={10} item>
                            <Typography gutterBottom variant="h6" component="div">
                              {`${formik.values.id ? "Edit" : "Add"} Order Item`}
                            </Typography>
                          </Grid>
                          <Grid xs={12} sm={4} item>
                            <TextField
                              disabled={formik.isSubmitting}
                              label="Product Name"
                              name="productName"
                              value={formik.values.productName || ""}
                              variant="outlined"
                              fullWidth
                              size="small"
                              error={
                                formik.touched.productName && Boolean(formik.errors.productName)
                              }
                              helperText={formik.touched.productName && formik.errors.productName}
                              onChange={formik.handleChange}
                            />
                          </Grid>
                          <Grid xs={12} sm={4} item>
                            <TextField
                              disabled={formik.isSubmitting}
                              label="License Code"
                              name="licenseCode"
                              value={formik.values.licenseCode || ""}
                              fullWidth
                              size="small"
                              error={
                                formik.touched.licenseCode && Boolean(formik.errors.licenseCode)
                              }
                              helperText={formik.touched.licenseCode && formik.errors.licenseCode}
                              onChange={formik.handleChange}
                            />
                          </Grid>
                          <Grid xs={12} sm={4} item>
                            <Tooltip title="Unit Price field must contain only numbers">
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
                          <Grid xs={12} sm={4} item>
                            <TextField
                              disabled={formik.isSubmitting}
                              label="Currency"
                              name="currency"
                              value={formik.values.currency || ""}
                              error={formik.touched.currency && Boolean(formik.errors.currency)}
                              helperText={formik.touched.currency && formik.errors.currency}
                              fullWidth
                              size="small"
                              onChange={formik.handleChange}
                            />
                          </Grid>
                          <Grid xs={12} sm={4} item>
                            <Tooltip title="Quantity field must contain only numbers">
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
                          <Grid xs={12} sm={4} item>
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
                        <Grid container spacing={3} justifyContent="flex-end">
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
                    </Card>
                  </Grid>
                </form>
              )}
            </Grid>
          </Grid>
          <DataDeleteConfirmation
            entity="order item"
            openConfirmation={openConfirmation}
            setIsConfirmed={setIsConfirmed}
            setOpenConfirmation={setOpenConfirmation}
          ></DataDeleteConfirmation>
        </>
      )}
    </>
  );
};
