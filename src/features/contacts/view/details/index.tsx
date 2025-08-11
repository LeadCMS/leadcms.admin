import { useEffect, useState } from "react";
import { Card, CardContent, Grid, IconButton, Typography } from "@mui/material";
import { ContactDetailsDto, OrderDetailsDto } from "lib/network/swagger-client";
import { CoreModule, getViewFormRoute, viewFormRoute } from "lib/router";
import { useRequestContext } from "providers/request-provider";
import { useRouteParams } from "typesafe-routes";
import { getCountryList, getFormattedDateOnly } from "utils/general-helper";
import { useNotificationsService } from "@hooks";
import { DataView, DataViewNoLabel } from "components/data-view";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { timezones } from "utils/constants";
import { getWhereFilterQuery } from "@providers/query-provider";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ActionButtonContainer, ContactHref } from "@features/contacts/index.styled";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DateValueFormatter, DateValueGetter } from "@components/data-list";
import { DataManagementBlock } from "@components/data-management";
import { useConfig } from "@providers/config-provider";

export const ContactView = () => {
  const { notificationsService } = useNotificationsService();
  const context = useRequestContext();
  const { setBusy } = useModuleWrapperContext();
  const navigate = useNavigate();
  const { config } = useConfig();
  const languages = config?.languages || [];

  const { client } = context;
  const { id } = useRouteParams(viewFormRoute);
  const [contact, setContact] = useState<ContactDetailsDto>({
    email: "",
  });
  const [selectedCountry, setSelectedCountry] = useState("");
  const [orders, setOrders] = useState<OrderDetailsDto[]>();

  const getAbsoluteUrl = (url: string) => {
    const absoluteUrl =
      url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    return (
      <ContactHref href={absoluteUrl} target="_blank" rel="noopener noreferrer">
        {absoluteUrl}
      </ContactHref>
    );
  };

  const contactPersonalData = contact && [
    { label: "Prefix", value: contact.prefix || "" },
    {
      label: "Full name",
      value: `${contact.firstName || ""} ${contact.middleName || ""} ${contact.lastName || ""}`,
    },
    {
      label: "Birthday",
      value: (contact.birthday && getFormattedDateOnly(contact.birthday)) || "",
    },
    {
      label: "Language",
      value: languages.find((c) => c.code === contact.language)?.name || "",
    },
  ];
  const contactData = contact && [
    { label: "Email", value: contact.email || "" },
    { label: "Phone", value: contact.phone || "" },
  ];
  const contactAddressData = contact && [
    {
      label: "Address 1",
      value: `${contact.address1 || ""}, ${contact.cityName || ""}, ${contact.zip || ""}, ${
        selectedCountry || ""
      }`,
    },
    { label: "Address 2", value: contact.address2 || "" },
    { label: "Zip code", value: contact.zip || "" },
    { label: "Timezone", value: timezones.find((c) => c.value === contact.timezone)?.label || "" },
  ];
  const contactJobData = contact && [
    { label: "Job title", value: contact.jobTitle || "" },
    { label: "Company name", value: contact.companyName || "" },
    { label: "Department", value: contact.department || "" },
  ];

  const contactOtherData = contact && [
    {
      label: "Created at",
      value: (contact.createdAt && getFormattedDateOnly(contact.createdAt)) || "",
    },
    {
      label: "Updated at",
      value: (contact.updatedAt && getFormattedDateOnly(contact.updatedAt)) || "",
    },
    { label: "Domain", value: contact.domain?.name || "" },
    { label: "Account", value: contact.account?.name || "" },
  ];

  const contactSocialData =
    contact &&
    contact.socialMedia &&
    Object.entries(contact.socialMedia!).map(([key, value]) => ({
      label: "",
      value: getAbsoluteUrl(value),
    }));

  useEffect(() => {
    setBusy(async () => {
      try {
        const { data } = await client.api.contactsDetail(id);
        setCountry(data.countryCode);
        setContact(data);
        setOrders(await getContactOrders(data.id!));
      } catch (e) {
        console.log(e);
      }
    });
  }, [client]);

  const setCountry = async (countryCode: string | null | undefined) => {
    if (countryCode) {
      const countries = await getCountryList(context);
      if (countries) {
        const countryList = Object.entries(countries).map(([code, name]) => ({ code, name }));
        setSelectedCountry(countryList.find((c) => c.code === countryCode)!.name);
      } else {
        notificationsService.error("Server error: country list not available.");
      }
    }
  };

  const getContactOrders = async (contactId: number) => {
    try {
      const { data } = await client.api.ordersList({
        query: getWhereFilterQuery("contactId", contactId.toString(), "equals"),
      });
      if (data.length > 0) {
        return data;
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
      notificationsService.error("Server error: could not retrieve orders.");
    }
  };

  const handleForwardClick = (row: any) => {
    navigate(`/orders/${getViewFormRoute(row.id!)}`, { state: row });
  };

  const columns: GridColDef<OrderDetailsDto>[] = [
    {
      field: "orderNumber",
      headerName: "Order No",
      flex: 2,
    },
    {
      field: "refNo",
      headerName: "Ref No",
      flex: 2,
    },
    {
      field: "createdAt",
      headerName: "Created Date",
      flex: 2,
      type: "date",
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "total",
      headerName: "Amount",
      flex: 2,
    },
    {
      field: "quantity",
      headerName: "Quantity",
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
    renderCell: ({ row }: any) => {
      return (
        <ActionButtonContainer>
          <IconButton onClick={() => handleForwardClick(row)}>
            <ArrowRight size={20} />
          </IconButton>
        </ActionButtonContainer>
      );
    },
  };

  const gridFinalizedColumns = columns.concat(actionsColumn);

  return (
    <>
      <Grid container spacing={3} marginTop={4} paddingRight={4}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Grid marginBottom={3}>
            <DataView header="Personal data" rows={contactPersonalData}></DataView>
          </Grid>
          <Grid marginBottom={3}>
            <DataView header="Contact" rows={contactData}></DataView>
          </Grid>
          <Grid marginBottom={3}>
            <DataView header="Address" rows={contactAddressData}></DataView>
          </Grid>
          <Grid marginBottom={3}>
            <DataView header="Job" rows={contactJobData}></DataView>
          </Grid>
          <Grid marginBottom={3}>
            <DataViewNoLabel header="Social media" rows={contactSocialData}></DataViewNoLabel>
          </Grid>
          <Grid marginBottom={3}>
            <DataView header="Other" rows={contactOtherData}></DataView>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <Grid marginBottom={3}>
            <Card>
              <CardContent>
                <Grid marginBottom={4}>
                  <Typography gutterBottom variant="h6" component="div">
                    {"Orders"}
                  </Typography>
                </Grid>
                <Grid>
                  <DataGrid
                    columns={gridFinalizedColumns}
                    rows={orders || []}
                    loading={!orders}
                    checkboxSelection={false}
                    autoHeight={true}
                    pagination={undefined}
                    hideFooter={true}
                  />
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid>
            <DataManagementBlock
              header="Data Management"
              description="Remove this customer's data if he requested that, 
            if not please be aware that what
            has been deleted can never be brought back."
              entity="contact"
              handleDeleteAsync={(id) => client.api.contactsDelete(id as number)}
              itemId={contact.id!}
              successNavigationRoute={CoreModule.contacts}
            ></DataManagementBlock>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
