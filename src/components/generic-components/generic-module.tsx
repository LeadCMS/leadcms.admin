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
import { CsvExport } from "@components/export";
import { CsvImport } from "@components/spreadsheet-import";
import { Result } from "react-spreadsheet-import/types/types";
import { Download, Upload, XCircle, Save, Plus, Settings2, Filter } from "lucide-react";
import { DataManagementBlock } from "@components/data-management";
import { ToolbarButton } from "@components/tool-bar-button";
import { ColumnsPanel } from "@components/custom-columns-panel";
import { CustomFilterBar } from "@components/custom-filter";

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
  const [importIsOpen, setImportIsOpen] = useState(false);
  const genericDataGridRef = useRef<GenericDataGridRef>(null);
  const [triggerSave, setTriggerSave] = useState(false);
  const [triggerCancel, setTriggerCancel] = useState(false);
  const handleSaveClick = () => setTriggerSave(true);
  const handleCancelClick = () => setTriggerCancel(true);
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const getGenericTable = (key: string, tableProps: GenericDataGridProps<TView>) => {
    const genericDataGrid = GenericDataGrid<TView>(
      {
        ...tableProps,
        searchText: searchText,
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
          <Button
            key={"import-btn"}
            disabled={!(extraActions?.import?.importItemsFn && extraActions?.import?.importSchema)}
            onClick={() => {
              setImportIsOpen(true);
            }}
            startIcon={<Upload size={22} />}
          >
            Import
          </Button>
        )}
        {extraActions?.export?.showButton && (
          <Button
            key={"export-btn"}
            disabled={!extraActions?.export?.exportItemsFn}
            onClick={() => {
              setExportIsOpen(true);
            }}
            startIcon={<Download size={22} />}
          >
            Export
          </Button>
        )}
      </>
    );
    const columnsPanelProps = genericDataGridRef.current?.getColumnsPanelProps();
    const filtersPanelProps = genericDataGridRef.current?.getFiltersPanelProps();

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
        {exportIsOpen && extraActions?.export?.exportItemsFn && (
          <CsvExport
            exportAsync={async () => {
              const filters =
                genericDataGridRef.current && genericDataGridRef.current.getExportFilters();
              if (extraActions?.export?.exportItemsFn) {
                const response = await extraActions.export.exportItemsFn(filters || {});
                return response?.text();
              }
              return "";
            }}
            closeExport={() => {
              setExportIsOpen(false);
            }}
            fileName={moduleName}
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
        onSaveHandled={() => setTriggerSave(false)}
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
