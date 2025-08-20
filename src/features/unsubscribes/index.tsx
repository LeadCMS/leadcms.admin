import {
  GenericDataGridProps,
  GenericFormProps,
  GenericModule,
  getSchemaDto,
} from "@components/generic-components";
import { CoreModule, getCoreModuleRoute, getEditFormRoute, getViewFormRoute } from "@lib/router";
import { useNavigate, useParams } from "react-router-dom";

import swaggerJson from "@lib/network/swagger.json";
import { useRequestContext } from "@providers/request-provider";
import { UnsubscribeDto, UnsubscribeDetailsDto } from "@lib/network/swagger-client";

export const UnsubscribesModule = () => {
  const { client } = useRequestContext();
  const navigate = useNavigate();

  const formProps: GenericFormProps<UnsubscribeDetailsDto, UnsubscribeDto, UnsubscribeDto> = {
    detailsSchema: getSchemaDto("UnsubscribeDetailsDto", swaggerJson.components.schemas),
    updateSchema: getSchemaDto("UnsubscribeDto", swaggerJson.components.schemas),
    createSchema: getSchemaDto("UnsubscribeDto", swaggerJson.components.schemas),
    editable: false,
    getItemFn: client.api.unsubscribesDetail,
    updateItemFn: client.api.unsubscribesPartialUpdate,
    createItemFn: client.api.unsubscribesCreate,
    getItemId: () => undefined,
  };

  const tableProps: GenericDataGridProps<UnsubscribeDetailsDto> = {
    key: "unsubscribes-table",
    schema: getSchemaDto("UnsubscribeDetailsDto", swaggerJson.components.schemas),
    getItemsFn: client.api.unsubscribesList,
    detailsNavigate: (item) => {
      item.id && navigate(getViewFormRoute(item.id), { state: item });
    },
    editNavigate: (item) => {
      item.id && navigate(getEditFormRoute(item.id), { state: item });
    },
  };

  const deleteProps = {
    header: "Data Management",
    description: "Please be aware that what has been deleted can never be brought back.",
    entity: "unsubscribe",
    listRoute: CoreModule.unsubscribes,
    deleteItemFn: client.api.unsubscribesDelete,
  };

  const module = GenericModule({
    moduleName: "Unsubscribes",
    modulePath: CoreModule.unsubscribes,
    tableProps: tableProps,
    extraActions: {
      export: {
        showButton: true,
        exportItemsFn: client.api.unsubscribesExportList,
      },
      import: {
        showButton: true,
        importItemsFn: client.api.unsubscribesImportCreate,
        importSchema: getSchemaDto("UnsubscribeImportDto", swaggerJson.components.schemas),
      },
      showColumnsPanel: true,
      showFiltersPanel: true,
    },
    viewFormProps: {
      ...formProps,
      mode: "details",
      editable: false,
      deleteOptionProps: deleteProps,
      getItemId: () => {
        const params = useParams();
        return Number(params && params["*"] && params["*"].match(/^(\d+)\/view$/)?.[1]);
      },
    },
    editFormProps: {
      ...formProps,
      mode: "update",
      editable: true,
      getItemId: () => {
        const params = useParams();
        return Number(params && params["*"] && params["*"].match(/^(\d+)\/edit$/)?.[1]);
      },
      onSaved: () => {
        navigate(getCoreModuleRoute(CoreModule.unsubscribes));
      },
    },
    createFormProps: {
      ...formProps,
      mode: "create",
      editable: true,
      onSaved: () => {
        navigate(getCoreModuleRoute(CoreModule.unsubscribes));
      },
    },
  });

  return module;
};
