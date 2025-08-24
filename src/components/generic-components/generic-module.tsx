import { Outlet, Route, Routes } from "react-router-dom";
import {
  addFormRoute,
  CoreModule,
  editFormRoute,
  getAddFormRoute,
  viewFormRoute,
} from "@lib/router";
import {
  BasicTypeForGeneric,
  DtoSchema,
  getBreadcrumbLinks,
} from "@components/generic-components/common";
import { ReactNode, useRef, useState } from "react";
import {
  GenericDataGrid,
  GenericDataGridProps,
  GenericDataGridRef,
} from "@components/generic-components/generic-data-grid";
import { ModuleWrapper } from "@components/module-wrapper";
import { dataListBreadcrumbLinks } from "../../utils/constants";
import { GenericForm, GenericFormProps } from "@components/generic-components/generic-form";
import { Button, Box } from "@mui/material";
import { SearchBar } from "@components/search-bar";
import { GhostLink } from "@components/ghost-link";
import {
  HttpResponse,
  ImportResult,
  ProblemDetails,
  RequestParams,
} from "@lib/network/swagger-client";
import { buildExportQueryString } from "@components/export";
import { CsvImport } from "@components/spreadsheet-import";
import { Result } from "react-spreadsheet-import/types/types";
import { Download, Upload, XCircle, Save, Plus, Settings2, Filter } from "lucide-react";
import { DataManagementBlock } from "@components/data-management";
import { ToolbarButton } from "@components/tool-bar-button";
import { ColumnsPanel } from "@components/custom-columns-panel";
import { CustomFilterBar } from "@components/custom-filter";
import { downloadExportFile } from "@components/download";
import { ExportPopup } from "@components/export-popup";
import { ExportParams } from "types";

interface ExtraActions {
  export?: {
    showButton?: boolean;
    exportItemsFn?: (
      query?: { query?: string },
      params?: RequestParams
    ) => Promise<HttpResponse<unknown, void | ProblemDetails>>;
  };
  import?: {
    showButton?: boolean;
    importSchema?: DtoSchema;
    importItemsFn?: (
      data: Record<string, unknown>[],
      params: RequestParams
    ) => Promise<HttpResponse<ImportResult, void | ProblemDetails>>;
  };
  showColumnsPanel?: boolean;
  showFiltersPanel?: boolean;
}

interface GenericModuleProps<TView extends BasicTypeForGeneric, TCreate, TUpdate> {
  moduleName: string;
  modulePath: CoreModule;
  addButtonContent?: string | ReactNode | undefined;
  extraActions?: ExtraActions | undefined;
  tableProps?: GenericDataGridProps<TView>;
  createFormProps?: GenericFormProps<TView, TCreate, TUpdate>;
  editFormProps?: GenericFormProps<TView, TCreate, TUpdate>;
  viewFormProps?: GenericFormProps<TView, TCreate, TUpdate>;
}

export function GenericModule<TView extends BasicTypeForGeneric, TCreate, TUpdate>({
  moduleName,
  modulePath,
  addButtonContent,
  tableProps,
  createFormProps,
  editFormProps,
  viewFormProps,
  extraActions,
}: GenericModuleProps<TView, TCreate, TUpdate>): JSX.Element {
  const [searchText, setSearchText] = useState("");
  const [exportIsOpen, setExportIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [importIsOpen, setImportIsOpen] = useState(false);
  const genericDataGridRef = useRef<GenericDataGridRef>(null);
  const [triggerSave, setTriggerSave] = useState(false);
  const [triggerCancel, setTriggerCancel] = useState(false);
  const handleSaveClick = () => setTriggerSave(true);
  const handleCancelClick = () => setTriggerCancel(true);
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const handleExport = async (
    exportScope: string,
    fileFormat: string,
    selectedColumns: string[]
  ): Promise<void> => {
    try {
      if (!extraActions?.export?.exportItemsFn) return;
      setExportError(null);
      setExporting(true);

      const exportPanelProps = genericDataGridRef.current?.getExportPanelProps?.();

      const params: ExportParams = {
        searchTerm: searchText,
        scope: exportScope,
        format: fileFormat,
        cols: selectedColumns,
        selectedRows: exportPanelProps?.selectedRows || [],
        whereFilterQuery: exportPanelProps?.whereFilterQuery || "",
        basicFilterQuery: exportPanelProps?.basicFilterQuery || "",
      };

      const { finalQueryString, accept } = buildExportQueryString(params);
      const response = await extraActions.export.exportItemsFn(
        { query: finalQueryString },
        { headers: { Accept: accept } }
      );
      
      const blob = await response.blob();
      downloadExportFile(blob, fileFormat, moduleName.toLowerCase());
    } catch (err) {
      let message = "Export failed with unknown error.";
      if (
        err &&
        typeof err === "object" &&
        "statusText" in err &&
        typeof (err as any).statusText === "string"
      ) {
        const statusText = (err as any).statusText;
        const status = (err as any).status;
        message = `Export failed (${status}): ${statusText}`;
      }
      console.log("export error generic module", message);
      setExportError(message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPopupClose = () => {
    setExportIsOpen(false);
    setExportError(null);
  };

  const handleSaveHandled = () => {
    setTriggerSave(false);
    setRefreshFlag((f) => f + 1);
  };

  const getGenericTable = (key: string, tableProps: GenericDataGridProps<TView>) => {
    const genericDataGrid = GenericDataGrid<TView>(
      {
        ...tableProps,
        searchText: searchText,
        refreshFlag: refreshFlag,
      },
      genericDataGridRef
    );

    const searchBox = (
      <SearchBar
        setSearchTermOnChange={(value) => setSearchText(value)}
        searchBoxLabel={"Search"}
        initialValue={""}
      />
    );

    const addButton = (
      <Button
        to={getAddFormRoute()}
        component={GhostLink}
        variant="contained"
        startIcon={<Plus size={18} />}
      >
        {addButtonContent || "Add"}
      </Button>
    );

    const extraActionsChildren = (
      <>
        {extraActions?.showFiltersPanel && (
          <ToolbarButton
            startIcon={<Filter size={18} />}
            onClick={() => setFilterPanelOpen(true)}
            sx={{
              minWidth: 0,
              py: 2,
              px: 2,
              ".MuiButton-startIcon": { marginRight: 0, marginLeft: 0 },
            }}
          ></ToolbarButton>
        )}

        {extraActions?.showColumnsPanel && (
          <ToolbarButton
            startIcon={<Settings2 size={18} />}
            onClick={() => setColumnsPanelOpen((open) => !open)}
          >
            Columns
          </ToolbarButton>
        )}
        {extraActions?.import?.showButton && (
          <ToolbarButton
            key="import-btn"
            disabled={!(extraActions?.import?.importItemsFn && extraActions?.import?.importSchema)}
            onClick={() => setImportIsOpen(true)}
            startIcon={<Upload size={18} />}
          >
            Import
          </ToolbarButton>
        )}
        {extraActions?.export?.showButton && (
          <ToolbarButton
            key="export-btn"
            disabled={!extraActions?.export?.exportItemsFn}
            onClick={() => setExportIsOpen(true)}
            startIcon={<Download size={18} />}
          >
            Export
          </ToolbarButton>
        )}
      </>
    );
    const columnsPanelProps = genericDataGridRef.current?.getColumnsPanelProps();
    const filtersPanelProps = genericDataGridRef.current?.getFiltersPanelProps();
    const exportPanelProps = genericDataGridRef.current?.getExportPanelProps();

    return (
      <ModuleWrapper
        key={key}
        breadcrumbs={dataListBreadcrumbLinks}
        currentBreadcrumb={moduleName}
        leftContainerChildren={searchBox}
        extraActionsContainerChildren={extraActionsChildren}
        addButtonContainerChildren={addButton}
      >
        {extraActions?.showFiltersPanel && filtersPanelProps && (
          <CustomFilterBar
            columns={filtersPanelProps.columns}
            whereFilters={filtersPanelProps.whereFilters || []}
            addFilter={filtersPanelProps.addFilter}
            removeFilter={filtersPanelProps.removeFilter}
            filterPanelOpen={filterPanelOpen}
            setFilterPanelOpen={setFilterPanelOpen}
            clearAllFilters={filtersPanelProps.clearAllFilters}
          />
        )}

        {extraActions?.showColumnsPanel && columnsPanelProps && (
          <ColumnsPanel
            open={columnsPanelOpen}
            columns={columnsPanelProps.columns}
            setColumns={columnsPanelProps.setColumns}
            columnVisibilityModel={columnsPanelProps.columnVisibilityModel}
            setColumnVisibilityModel={columnsPanelProps.setColumnVisibilityModel}
            onColumnsReorder={columnsPanelProps.onColumnsReorder}
            onClose={() => setColumnsPanelOpen(false)}
          />
        )}
        {extraActions?.export?.showButton && exportPanelProps && (
          <ExportPopup
            open={exportIsOpen}
            onClose={handleExportPopupClose}
            onExport={handleExport}
            columns={exportPanelProps.columns}
            selectedCount={exportPanelProps.selectedCount}
            columnVisibilityModel={exportPanelProps.columnVisibilityModel}
            exporting={exporting}
            errorMessage={exportError}
          />
        )}
        {genericDataGrid}
        {importIsOpen && extraActions?.import?.importSchema && (
          <CsvImport
            isOpen={importIsOpen}
            onClose={() => {
              setImportIsOpen(false);
            }}
            onUpload={async (data: Result<string>) => {
              if (extraActions?.import?.importItemsFn) {
                await extraActions.import.importItemsFn(
                  data.validData as Record<string, unknown>[],
                  {}
                );
              }
            }}
            object={extraActions?.import?.importSchema.properties}
            endRoute={modulePath as CoreModule}
          />
        )}
      </ModuleWrapper>
    );
  };

  const genericTable = tableProps && getGenericTable("table", tableProps);

  const getForm = (
    key: string,
    currentBreadcrumb: string,
    formProps: GenericFormProps<TView, TCreate, TUpdate>
  ) => {
    const genericForm = (
      <GenericForm<TView, TCreate, TUpdate>
        {...formProps}
        triggerSave={triggerSave}
        triggerCancel={triggerCancel}
        onSaveHandled={handleSaveHandled}
        onCancelHandled={() => setTriggerCancel(false)}
      />
    );

    const actionButtons = formProps.editable ? (
      <Box sx={{ display: "flex", width: "100%", gap: 4, justifyContent: "flex-end" }}>
        <Button
          type="button"
          variant="outlined"
          onClick={handleCancelClick}
          size="large"
          startIcon={<XCircle size={22} />}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={handleSaveClick}
          size="large"
          startIcon={<Save size={22} />}
        >
          Save
        </Button>
      </Box>
    ) : formProps.deleteOptionProps ? (
      <DataManagementBlock
        header={formProps.deleteOptionProps.header}
        description={formProps.deleteOptionProps.description}
        entity={formProps.deleteOptionProps.entity}
        handleDeleteAsync={(id) => formProps.deleteOptionProps!.deleteItemFn(Number(id))}
        itemId={formProps.getItemId?.() ?? ""}
        successNavigationRoute={formProps.deleteOptionProps.listRoute}
        showOnlyButtons={true}
        onDeleted={() => setRefreshFlag((f) => f + 1)}
      />
    ) : null;

    return (
      <ModuleWrapper
        key={key}
        breadcrumbs={getBreadcrumbLinks(moduleName, modulePath)}
        currentBreadcrumb={currentBreadcrumb}
        actionButtons={actionButtons}
      >
        {genericForm}
      </ModuleWrapper>
    );
  };

  const genericCreateForm = createFormProps && getForm("create", "Create", createFormProps);
  const genericEditForm = editFormProps && getForm("edit", "Edit", editFormProps);
  const genericViewForm = viewFormProps && getForm("view", "View", viewFormProps);

  return (
    <>
      <Routes>
        <Route index element={genericTable} />
        <Route path={addFormRoute.template} element={genericCreateForm} />
        <Route path={editFormRoute.template} element={genericEditForm} />
        <Route path={viewFormRoute.template} element={genericViewForm} />
      </Routes>
      <Outlet />
    </>
  );
}
