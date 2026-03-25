import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { OrderDetailsDto, OrderImportDto, OrderItemDetailsDto } from "lib/network/swagger-client";
import { useRequestContext } from "providers/request-provider";
import {
  defaultFilterOrderColumn,
  defaultFilterOrderDirection,
  orderGridSettingsStorageKey,
  modelName,
  orderListPageBreadcrumb,
  searchLabel,
} from "./constants";
import { DataList, DateValueFormatter, DateValueGetter } from "@components/data-list";
import { GridColDef } from "@mui/x-data-grid";
import type { GridRowId } from "@mui/x-data-grid/models/gridRows";
import { CoreModule, getAddFormRoute } from "lib/router";
import { dataListBreadcrumbLinks } from "utils/constants";
import useLocalStorage from "use-local-storage";
import { DataListSettings } from "types";
import { getModelByName } from "@lib/network/swagger-models";
import { Result } from "react-spreadsheet-import/types/types";
import { SearchBar } from "@components/search-bar";
import {
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Plus, Upload, Download, Filter, Settings2, Package } from "lucide-react";
import { CsvImport } from "@components/spreadsheet-import";
import { GhostLink } from "@components/ghost-link";
import { ModuleWrapper } from "@components/module-wrapper";
import { ToolbarButton } from "@components/tool-bar-button";
import { useGlobalLanguageFilter } from "@providers/global-language-filter-provider";
import { getWhereFilterQuery } from "@providers/query-provider";
import { useCurrencyFormatter } from "@hooks";
import type { BulkEditFieldOption } from "@components/bulk-edit-dialog";

const OrderItemsPreview = ({
  items,
  currency,
  formatByCode,
  formatMoney,
}: {
  items: OrderItemDetailsDto[];
  currency: string;
  formatByCode: (value: number, code: string) => string;
  formatMoney: (value: number) => string;
}) => {
  if (!items || items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        No items in this order.
      </Typography>
    );
  }

  return (
    <TableContainer
      sx={{
        maxWidth: 700,
        bgcolor: "background.paper",
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow
            sx={{
              bgcolor: "grey.100",
            }}
          >
            <TableCell sx={{ fontWeight: 600, width: 40 }}>#</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Qty
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Unit Price
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Total
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow
              key={item.id ?? idx}
              sx={{
                "&:last-child td": {
                  borderBottom: 0,
                },
              }}
            >
              <TableCell>{item.lineNumber ?? idx + 1}</TableCell>
              <TableCell
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Package size={14} style={{ flexShrink: 0 }} />
                {item.productName}
              </TableCell>
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell align="right">
                {item.unitPrice != null
                  ? formatByCode(item.unitPrice, item.currency || currency) ||
                    formatMoney(item.unitPrice)
                  : "-"}
              </TableCell>
              <TableCell align="right">
                {item.total != null
                  ? formatByCode(item.total, item.currency || currency) || formatMoney(item.total)
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const Orders = () => {
  const { client } = useRequestContext();
  const { formatMoney, formatByCode } = useCurrencyFormatter();
  const { selectedLanguage, isLanguageFilterActive } = useGlobalLanguageFilter();
  const [gridSettings, setGridSettings] = useLocalStorage<DataListSettings | undefined>(
    orderGridSettingsStorageKey,
    undefined
  );

  const [searchTerm, setSearchTerm] = useState(gridSettings?.searchTerm ?? "");
  const [openImport, setOpenImport] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [importFieldsObject, setImportFieldsObject] = useState<any>();
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedRowIds, setExpandedRowIds] = useState<Set<GridRowId>>(new Set());
  const dataExportQuery = useRef("");

  // Trigger refresh when global language filter changes
  useEffect(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, [selectedLanguage]);

  const orderBulkEditFields: BulkEditFieldOption[] = [
    { key: "status", label: "Status" },
    { key: "exchangeRate", label: "Exchange Rate" },
    {
      key: "affiliateName",
      label: "Affiliate",
      nullable: true,
    },
  ];

  const orderStatuses = ["Pending", "Paid", "Cancelled", "Refunded", "Failed"] as const;

  const renderOrderBulkEditField = (
    fieldKey: string,
    value: unknown,
    onChange: (value: unknown) => void
  ) => {
    switch (fieldKey) {
      case "status":
        return (
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={(value as string) || ""}
              onChange={(e) => onChange(e.target.value)}
            >
              {orderStatuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "exchangeRate":
        return (
          <Tooltip title="Must contain only numbers">
            <TextField
              size="small"
              fullWidth
              type="number"
              label="Exchange Rate"
              value={value !== null && value !== undefined ? value : ""}
              onChange={(e) => {
                const val = e.target.value;
                onChange(val === "" ? null : parseFloat(val));
              }}
            />
          </Tooltip>
        );
      case "affiliateName":
        return (
          <TextField
            size="small"
            fullWidth
            label="Affiliate Name"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
          />
        );
      default:
        return null;
    }
  };

  const getOrderList = async (mainQuery: string, exportQuery?: string) => {
    dataExportQuery.current = exportQuery || "";
    const includeFilter = "filter[include]=Contact" + "&filter[include]=OrderItems";

    // Add global language filter if active (filter by contact language)
    let globalLanguageQuery = "";
    if (isLanguageFilterActive && selectedLanguage !== "all") {
      const languageCode = selectedLanguage.split("-")[0];
      globalLanguageQuery = getWhereFilterQuery("contact.language", languageCode, "contains");
      globalLanguageQuery = globalLanguageQuery.replace(/^&/, "");
    }

    const fullQuery = [mainQuery, includeFilter, globalLanguageQuery].filter(Boolean).join("&");

    const result = await client.api.ordersList({
      query: fullQuery,
    });
    return result;
  };

  const handleDetailPanelToggle = useCallback((rowId: GridRowId) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);

  const getDetailPanelContent = useCallback(
    (row: OrderDetailsDto) => (
      <OrderItemsPreview
        items={row.orderItems || []}
        currency={row.currency || ""}
        formatByCode={formatByCode}
        formatMoney={formatMoney}
      />
    ),
    [formatByCode, formatMoney]
  );

  const ordersExportApi: (query: string, accept: string) => Promise<Response> = (query, accept) =>
    client.api.ordersExportList({ query }, { headers: { Accept: accept } });

  const handleImportOpen = () => {
    !importFieldsObject && setImportFieldsObject(getModelByName(modelName));
    setOpenImport(true);
  };

  const handleImportClose = () => {
    setOpenImport(false);
  };

  const handleExportOpen = () => {
    openExport ? setOpenExport(false) : setOpenExport(true);
  };

  const handleFileUpload = async (data: Result<string>) => {
    const importDtoCollection: any[] = data.validData;
    await client.api.ordersImportCreate(importDtoCollection);
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

  const StatusCell = ({ value }: { value: string }) => (
    <Chip label={value || "Unknown"} color={getStatusColor(value)} size="small" variant="filled" />
  );

  const [columns, setColumns] = useState<GridColDef<OrderDetailsDto>[]>([
    {
      field: "orderNumber",
      headerName: "Order Number",
      width: 120,
      type: "string",
    },
    {
      field: "contact.fullName",
      headerName: "Customer Name",
      width: 200,
      type: "string",
      sortable: true,
      valueGetter: (value, row) => {
        const firstName = row.contact?.firstName || "";
        const lastName = row.contact?.lastName || "";
        return `${firstName} ${lastName}`.trim();
      },
    },
    {
      field: "total",
      headerName: "Total",
      width: 120,
      type: "number",
      align: "left",
      headerAlign: "left",
      renderCell: ({ value }) => (value != null ? formatMoney(value) : ""),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      type: "string",
      renderCell: (params) => <StatusCell value={params.value} />,
    },
    {
      field: "testOrder",
      headerName: "Test Order",
      width: 120,
      type: "boolean",
      renderCell: (params) =>
        params.value ? (
          <Chip label="Test" color="secondary" size="small" variant="outlined" />
        ) : null,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 140,
      type: "date",
      valueGetter: DateValueGetter,
      valueFormatter: DateValueFormatter,
    },
    {
      field: "contact.email",
      headerName: "Contact Email",
      width: 200,
      type: "string",
      sortable: true,
      valueGetter: (value, row) => row.contact?.email || "",
    },
    {
      field: "quantity",
      headerName: "Quantity",
      width: 120,
      type: "number",
      align: "left",
      headerAlign: "left",
    },
    {
      field: "affiliateName",
      headerName: "Affiliate",
      width: 140,
      type: "string",
    },
    {
      field: "currency",
      headerName: "Currency",
      width: 120,
      type: "string",
      sortable: true,
      valueGetter: (value, row) => row.currency || "",
    },
    {
      field: "currencyTotal",
      headerName: "Currency Total",
      width: 140,
      type: "number",
      align: "left",
      headerAlign: "left",
      valueGetter: (value, row) => row.currencyTotal ?? null,
      renderCell: ({ value, row }) => (value != null ? formatByCode(value, row.currency) : ""),
    },
    {
      field: "contact.language",
      headerName: "Contact Language",
      width: 120,
      type: "string",
      sortable: true,
      valueGetter: (value, row) => row.contact?.language || "",
    },
    {
      field: "refNo",
      headerName: "Reference Number",
      width: 120,
      type: "string",
    },
    {
      field: "exchangeRate",
      headerName: "Exchange Rate",
      width: 120,
      type: "number",
      align: "left",
      headerAlign: "left",
    },
    {
      field: "id",
      headerName: "ID",
      width: 100,
      type: "number",
    },
  ]);

  const searchBar = (
    <SearchBar
      setSearchTermOnChange={setSearchTerm}
      searchBoxLabel={searchLabel}
      initialValue={gridSettings?.searchTerm ?? ""}
    ></SearchBar>
  );

  const extraActions = [
    <ToolbarButton
      key="filter-btn"
      startIcon={<Filter size={18} />}
      onClick={() => setFilterPanelOpen(true)}
      sx={{
        minWidth: 0,
        py: 2,
        px: 2,
        ".MuiButton-startIcon": { marginRight: 0, marginLeft: 0 },
      }}
    ></ToolbarButton>,
    <ToolbarButton
      key="columns-btn"
      startIcon={<Settings2 size={18} />}
      onClick={() => setColumnsPanelOpen((open) => !open)}
    >
      Columns
    </ToolbarButton>,
    <Fragment key={"import-action"}>
      <ToolbarButton key={"import-btn"} startIcon={<Upload size={18} />} onClick={handleImportOpen}>
        Import
      </ToolbarButton>
      {importFieldsObject && (
        <CsvImport
          isOpen={openImport}
          onClose={handleImportClose}
          onUpload={handleFileUpload}
          object={importFieldsObject}
          endRoute={CoreModule.orders}
        ></CsvImport>
      )}
    </Fragment>,
    <ToolbarButton key={"export-btn"} startIcon={<Download size={18} />} onClick={handleExportOpen}>
      Export
    </ToolbarButton>,
  ];

  const addButton = (
    <Button
      variant="contained"
      to={getAddFormRoute()}
      component={GhostLink}
      startIcon={<Plus size={18} />}
    >
      Add order
    </Button>
  );

  return (
    <ModuleWrapper
      breadcrumbs={dataListBreadcrumbLinks}
      currentBreadcrumb={orderListPageBreadcrumb}
      leftContainerChildren={searchBar}
      extraActionsContainerChildren={extraActions}
      addButtonContainerChildren={addButton}
    >
      <DataList
        columns={columns}
        setColumns={setColumns}
        gridSettingsStorageKey={orderGridSettingsStorageKey}
        defaultFilterOrderColumn={defaultFilterOrderColumn}
        defaultFilterOrderDirection={defaultFilterOrderDirection}
        searchText={searchTerm}
        getModelDataList={getOrderList}
        initialGridState={{
          columns: { columnVisibilityModel: { currency: false, exchangeRate: false } },
          sorting: {
            sortModel: [{ field: defaultFilterOrderColumn, sort: defaultFilterOrderDirection }],
          },
        }}
        filterPanelOpen={filterPanelOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        columnsPanelOpen={columnsPanelOpen}
        setColumnsPanelOpen={setColumnsPanelOpen}
        onExportOpen={openExport}
        onExportClose={handleExportOpen}
        exportApiCall={ordersExportApi}
        refreshFlag={refreshTrigger}
        onBulkDelete={async (ids) => {
          await client.api.ordersBulkDelete(ids.map(Number));
        }}
        bulkDeleteEntityName="order"
        onBulkEdit={async (ids, fields) => {
          const payload = ids.map(
            (id) =>
              ({
                id: Number(id),
                ...fields,
              } as OrderImportDto)
          );
          await client.api.ordersImportCreate(payload);
        }}
        bulkEditFieldOptions={orderBulkEditFields}
        renderBulkEditField={renderOrderBulkEditField}
        getDetailPanelContent={getDetailPanelContent}
        detailPanelExpandedRowIds={expandedRowIds}
        onDetailPanelToggle={handleDetailPanelToggle}
      ></DataList>
    </ModuleWrapper>
  );
};
