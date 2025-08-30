import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useConfig } from "@providers/config-provider";
import { GenericModule } from "@components/generic-components/generic-module";
import { HttpResponse } from "@lib/network/swagger-client";
import { useAuthState } from "@providers/auth-provider";
import { ModuleWrapperProvider } from "@providers/module-wrapper-provider";
import { getEditFormRoute, getViewFormRoute } from "@lib/router";

type FnDef = { endpoint: string; method: string };
type GetTokenFn = () => Promise<string | undefined>;
type ResponseHandler<T, E> = (resp: Response) => Promise<any>;

function buildApiFnHttpInternal<T = any, E = any>(
  fnDef: FnDef,
  getToken: GetTokenFn,
  handleResponse: ResponseHandler<T, E>
): (data: T, params?: any) => Promise<any> {
  return async (data, params) => {
    const BASE_URL = process.env.CORE_API;
    let url = fnDef.endpoint;
    if (url.includes("{id}")) {
      const id = (data as any)?.id ?? data;
      if (id !== undefined && id !== null) {
        url = url.replace("{id}", id);
      }
    }
    if (!/^https?:\/\//.test(url)) {
      const normalizedBaseUrl = BASE_URL!.replace(/\/$/, "");
      const normalizedEndpoint = url.replace(/^\//, "");
      url = `${normalizedBaseUrl}/${normalizedEndpoint}`;
    }

    const token = await getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (params?.headers?.Accept) {
      headers["Accept"] = params.headers.Accept;
    }

    let opts: RequestInit = {
      method: fnDef.method,
      headers,
    };
    if (["POST", "PUT", "PATCH"].includes(fnDef.method)) {
      opts.body = JSON.stringify(data);
    }
    if (fnDef.method === "GET" && data && typeof data === "object") {
      const qs = new URLSearchParams(data as any).toString();
      url += (url.includes("?") ? "&" : "?") + qs;
    }

    const resp = await fetch(url, opts);
    return handleResponse(resp);
  };
}

export function buildExportApiFnHttp<E = any>(
  fnDef: FnDef,
  getToken: GetTokenFn
): (data: any, params?: any) => Promise<Response> {
  return buildApiFnHttpInternal(fnDef, getToken, async (resp) => resp);
}

export function buildApiFnHttp<T = any, E = any>(
  fnDef: FnDef,
  getToken: GetTokenFn
): (data: T, params?: any) => Promise<HttpResponse<T, E>> {
  return buildApiFnHttpInternal(fnDef, getToken, async (resp) => {
    const contentType = resp.headers.get("Content-Type") || "";
    let responseData;
    try {
      responseData = contentType.includes("application/json")
        ? await resp.json()
        : await resp.text();
    } catch (err) {
      responseData = undefined;
    }
    return {
      data: resp.ok ? responseData : undefined,
      error: resp.ok ? undefined : responseData,
      status: resp.status,
      ok: resp.ok,
      redirected: resp.redirected,
      headers: resp.headers,
      url: resp.url,
      type: resp.type,
      statusText: resp.statusText,
    } as HttpResponse<T, E>;
  });
}

export function buildUpdateApiFnHttp<T = any, E = any>(
  fnDef: { endpoint: string; method: string },
  getToken: () => Promise<string | undefined>
): (id: number | string, data: T, params?: any) => Promise<HttpResponse<T, E>> {
  const updateFn = buildApiFnHttp(fnDef, getToken);
  return (id, data, params = {}) => {
    const payload = { ...data, id };
    return updateFn(payload, params);
  };
}

function wrapExtraActions(
  extraActionsFromBackend: any,
  getToken: () => Promise<string | undefined>
) {
  if (!extraActionsFromBackend) return undefined;
  return {
    ...extraActionsFromBackend,
    export: extraActionsFromBackend.export
      ? {
          ...extraActionsFromBackend.export,
          exportItemsFn: buildExportApiFnHttp(
            extraActionsFromBackend.export.exportItemsFn,
            getToken
          ),
        }
      : undefined,
    import: extraActionsFromBackend.import
      ? {
          ...extraActionsFromBackend.import,
          importItemsFn: wrapApiFn(extraActionsFromBackend.import.importItemsFn, getToken),
        }
      : undefined,
  };
}

function wrapApiFn(apiDef: any, getToken: () => Promise<string | undefined>) {
  return apiDef && apiDef.endpoint && apiDef.method ? buildApiFnHttp(apiDef, getToken) : undefined;
}

export function DynamicGenericModuleLoader() {
  const { getToken } = useAuthState();
  const navigate = useNavigate();
  const { moduleName } = useParams();
  const { config, loading, error } = useConfig();

  if (loading) return <CircularProgress />;
  if (error) return <Box color="error.main">{error}</Box>;

  const moduleDescriptor = useMemo(() => {
    if (!config?.modules) return undefined;
    return config.modules.find(
      (m: any) => m.moduleName.toLowerCase() === moduleName?.toLowerCase()
    );
  }, [config, moduleName]);

  if (!moduleDescriptor) return <Box color="error.main">Module not found</Box>;

  function resolveSchema(ref: any) {
    if (ref && ref["$ref"]) {
      const path = ref["$ref"].replace(/^#\//, "").split("/");
      return path.reduce((acc: any, key: string) => acc && acc[key], config);
    }
    return ref;
  }

  const tableProps = {
    ...moduleDescriptor.tableProps,
    schema: moduleDescriptor.schemas!.details!,
    getItemsFn: buildApiFnHttp(moduleDescriptor.tableProps!.getItemsFn!, getToken),
    detailsNavigate: (item: { id: number }) => {
      if (item.id) {
        navigate(`/modules/${moduleDescriptor.modulePath}/${getViewFormRoute(item.id)}`);
      }
    },
    editNavigate: (item: { id: number }) => {
      if (item.id) {
        navigate(`/modules/${moduleDescriptor.modulePath}/${getEditFormRoute(item.id)}`);
      }
    },
    key: moduleDescriptor.tableProps!.key,
  };

  const formFns = moduleDescriptor.formFns || {};
  const schemas = moduleDescriptor.schemas || {};
  const modulePath = `/${moduleDescriptor.modulePath}`;

  const commonFormProps = {
    detailsSchema: resolveSchema(schemas.details),
    updateSchema: resolveSchema(schemas.update),
    createSchema: resolveSchema(schemas.create),
    getItemFn: buildApiFnHttp(formFns.getItemFn!, getToken),
    updateItemFn: buildUpdateApiFnHttp(formFns.updateItemFn!, getToken),
    createItemFn: buildApiFnHttp(formFns.createItemFn!, getToken),
    getItemId: () => undefined,
  };

  const deleteProps = formFns.deleteItemFn
    ? {
        header: "Data Management",
        description: "Please be aware that what has been deleted can never be brought back.",
        entity: moduleDescriptor.moduleName?.toLowerCase() || "item",
        listRoute: moduleDescriptor.modulePath,
        deleteItemFn: (id: number) => buildApiFnHttp(formFns.deleteItemFn!, getToken)(id, {}),
      }
    : undefined;

  const createFormProps = {
    ...commonFormProps,
    editable: true,
    mode: "create" as const,
    onSaved: () => navigate(`/modules${modulePath}`),
  };

  const editFormProps = {
    ...commonFormProps,
    editable: true,
    mode: "update" as const,
    onSaved: () => navigate(`/modules${modulePath}`),
    getItemId: () => {
      const params = useParams();
      return Number(params && params["*"] && params["*"].match(/^(\d+)\/edit$/)?.[1]);
    },
  };

  const viewFormProps = {
    ...commonFormProps,
    editable: false,
    mode: "details" as const,
    onSaved: () => navigate(modulePath),
    getItemId: () => {
      const params = useParams();
      return Number(params && params["*"] && params["*"].match(/^(\d+)\/view$/)?.[1]);
    },
    ...(deleteProps && { deleteOptionProps: deleteProps }),
  };

  const extraActions = wrapExtraActions(moduleDescriptor.extraActions, getToken);
  if (extraActions && extraActions.import) {
    extraActions.import.importSchema = moduleDescriptor.schemas?.create;
  }
  if (extraActions && moduleDescriptor.extraActions) {
    if ("showColumnsPanel" in moduleDescriptor.extraActions) {
      extraActions.showColumnsPanel = moduleDescriptor.extraActions.showColumnsPanel;
    }
    if ("showFiltersPanel" in moduleDescriptor.extraActions) {
      extraActions.showFiltersPanel = moduleDescriptor.extraActions.showFiltersPanel;
    }
  }

  return (
    <Box>
      <GenericModule
        {...moduleDescriptor}
        modulePath={moduleDescriptor.modulePath}
        tableProps={tableProps}
        createFormProps={createFormProps}
        editFormProps={editFormProps}
        viewFormProps={viewFormProps}
        extraActions={extraActions}
      />
    </Box>
  );
}

export function DynamicGenericModuleRoutes() {
  return (
    <ModuleWrapperProvider>
      <DynamicGenericModuleLoader />
    </ModuleWrapperProvider>
  );
}
