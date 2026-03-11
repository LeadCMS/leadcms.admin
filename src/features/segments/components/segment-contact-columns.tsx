import { Avatar, Box, Chip, ListItemAvatar, Tooltip } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { DateValueFormatter, DateValueGetter } from "@components/data-list";
import { RevenueCell } from "@components/metric-cells";
import {
  ContactHref,
  ContactNameListItem,
  ContactNameListItemText,
} from "@features/contacts/index.styled";
import { ContactDetailsDto } from "lib/network/swagger-client";
import type { PrimaryCurrencyConfig } from "@utils/currency-formatter";

export const getSegmentContactColumns = (
  primaryCurrency: PrimaryCurrencyConfig | null | undefined,
  options: {
    hasDeals: boolean;
    hasOrders: boolean;
  }
): GridColDef<ContactDetailsDto>[] => [
  {
    field: "fullName",
    headerName: "Contact",
    width: 250,
    type: "string",
    renderCell: ({ row }) => {
      const displayName =
        row.fullName?.trim() || `${row.firstName || ""} ${row.lastName || ""}`.trim();
      const isDisposable = row.domain?.disposable === true;
      const isFree = row.domain?.free === true;
      const isCorporate =
        row.domain && row.domain.disposable === false && row.domain.free === false;
      const badgeSx = {
        height: 18,
        fontSize: "0.65rem",
        "& .MuiChip-label": {
          px: 0.75,
        },
      };

      let badge: JSX.Element | null = null;
      let badgeTooltip = "";
      if (isDisposable) {
        badge = (
          <Chip component="span" size="small" color="error" label="Disposable" sx={badgeSx} />
        );
        badgeTooltip =
          "Disposable: identified using publicly available lists of disposable email domains.";
      } else if (isFree) {
        badge = (
          <Chip
            component="span"
            size="small"
            color="info"
            label="Free"
            variant="outlined"
            sx={badgeSx}
          />
        );
        badgeTooltip = "Free: domain matches a known public email provider.";
      } else if (isCorporate) {
        badge = (
          <Chip
            component="span"
            size="small"
            color="success"
            label="Corporate"
            variant="outlined"
            sx={badgeSx}
          />
        );
        badgeTooltip =
          "Corporate: domain is not on the list of publicly known free providers, " +
          "so it is likely corporate.";
      }

      const badgeWithTooltip = badge ? (
        <Tooltip title={badgeTooltip} arrow>
          <Box component="span">{badge}</Box>
        </Tooltip>
      ) : null;

      return (
        <ContactNameListItem sx={{ paddingY: 0 }}>
          <ListItemAvatar>
            <Avatar src={row.avatarUrl || undefined}></Avatar>
          </ListItemAvatar>
          <ContactNameListItemText
            primary={displayName || "Unnamed Contact"}
            secondary={
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <ContactHref href={`mailto:${row.email}`}>{row.email}</ContactHref>
                {badgeWithTooltip}
              </Box>
            }
          />
        </ContactNameListItem>
      );
    },
  },
  {
    field: "email",
    headerName: "Email",
    minWidth: 240,
    valueGetter: (_value, row) => row.email || "—",
  },
  {
    field: "firstName",
    headerName: "First Name",
    minWidth: 140,
    valueGetter: (_value, row) => row.firstName || "—",
  },
  {
    field: "lastName",
    headerName: "Last Name",
    minWidth: 140,
    valueGetter: (_value, row) => row.lastName || "—",
  },
  {
    field: "account.name",
    headerName: "Account",
    minWidth: 180,
    valueGetter: (_value, row) => row.account?.name || "—",
  },
  {
    field: "companyName",
    headerName: "Company",
    minWidth: 180,
    valueGetter: (_value, row) => row.companyName || "—",
  },
  {
    field: "phone",
    headerName: "Phone",
    minWidth: 160,
    valueGetter: (_value, row) => row.phone || "—",
  },
  {
    field: "countryCode",
    headerName: "Country",
    minWidth: 120,
    valueGetter: (_value, row) => row.countryCode || "—",
  },
  ...(options.hasOrders
    ? [
        {
          field: "ordersCount",
          headerName: "Orders",
          width: 110,
          type: "number",
          valueGetter: (_value, row) => row.ordersCount ?? 0,
        } as GridColDef<ContactDetailsDto>,
      ]
    : []),
  ...(options.hasDeals
    ? [
        {
          field: "dealsCount",
          headerName: "Deals",
          width: 110,
          type: "number",
          valueGetter: (_value, row) => row.dealsCount ?? 0,
        } as GridColDef<ContactDetailsDto>,
      ]
    : []),
  ...(options.hasOrders
    ? [
        {
          field: "totalRevenue",
          headerName: "Revenue",
          minWidth: 140,
          type: "number",
          align: "right",
          headerAlign: "right",
          valueGetter: (_value, row) => row.totalRevenue ?? null,
          renderCell: ({ value }) => (
            <RevenueCell value={value} primaryCurrency={primaryCurrency} />
          ),
        } as GridColDef<ContactDetailsDto>,
        {
          field: "lastOrderDate",
          headerName: "Last Order",
          minWidth: 180,
          valueGetter: DateValueGetter,
          valueFormatter: DateValueFormatter,
        } as GridColDef<ContactDetailsDto>,
      ]
    : []),
  {
    field: "createdAt",
    headerName: "Created",
    minWidth: 180,
    valueGetter: DateValueGetter,
    valueFormatter: DateValueFormatter,
  },
  {
    field: "updatedAt",
    headerName: "Updated",
    minWidth: 180,
    valueGetter: DateValueGetter,
    valueFormatter: DateValueFormatter,
  },
];
