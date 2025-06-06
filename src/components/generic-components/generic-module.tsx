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
import { Button, CircularProgress, Grid, Typography, Box } from "@mui/material";
import { SearchBar } from "@components/search-bar";
import { GhostLink } from "@components/ghost-link";
import { Download, Upload } from "@mui/icons-material";
import {
  HttpResponse,
  ImportResult,
  ProblemDetails,
  RequestParams,
} from "@lib/network/swagger-client";
import { CsvExport } from "@components/export";
import { CsvImport } from "@components/spreadsheet-import";
import { Result } from "react-spreadsheet-import/types/types";

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
      <Button to={getAddFormRoute()} component={GhostLink} variant="contained">
        {addButtonContent || "Add"}
      </Button>
    );

    const extraActionsChildren = (
      <>
        {extraActions?.import?.showButton && (
          <Button
            key={"import-btn"}
            disabled={!(extraActions?.import?.importItemsFn && extraActions?.import?.importSchema)}
            onClick={() => {
              setImportIsOpen(true);
            }}
            startIcon={<Upload />}
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
            startIcon={<Download />}
          >
            Export
          </Button>
        )}
      </>
    );

    return (
      <ModuleWrapper
        key={key}
        breadcrumbs={dataListBreadcrumbLinks}
        currentBreadcrumb={moduleName}
        leftContainerChildren={searchBox}
        extraActionsContainerChildren={extraActionsChildren}
        addButtonContainerChildren={addButton}
      >
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
    const savingIndicatorElement = (
      <>
        <Grid container spacing={3} size={{ xs: "auto", sm: "auto" }}>
          <Grid size={{ xs: 12, sm: "auto" }}>
            <CircularProgress size={14} />
          </Grid>
          <Grid size={{ xs: 12, sm: "auto" }}>
            <Typography>Saving...</Typography>
          </Grid>
        </Grid>
      </>
    );

    const actionButtons = formProps.editable ? (
    <Box sx={{ display: "flex", width: "100%", gap: 2}}>
     <Box sx={{ display: "flex", flex: 1, justifyContent: 'flex-start'}}>
        <Button
          type="button"
          variant="outlined"
          onClick={handleCancelClick}
          size="large"
        >
          Cancel
        </Button>
     </Box>
       <Box sx={{ display: "flex", flex: 1, justifyContent: 'flex-end'}}>
        <Button
          type="button"
          variant="contained"
          onClick={handleSaveClick}
          size="large"
        >
          Save
        </Button>
      </Box>
    </Box>
  ) : null;

    return (
      <ModuleWrapper
        key={key}
        saveIndicatorElement={savingIndicatorElement}
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
