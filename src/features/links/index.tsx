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
import { LinkCreateDto, LinkDetailsDto, LinkUpdateDto } from "@lib/network/swagger-client";

export const LinksModule = () => {
  const { client } = useRequestContext();
  const navigate = useNavigate();

  const formProps: GenericFormProps<LinkDetailsDto, LinkCreateDto, LinkUpdateDto> = {
    detailsSchema: getSchemaDto("LinkDetailsDto", swaggerJson.components.schemas),
    updateSchema: getSchemaDto("LinkUpdateDto", swaggerJson.components.schemas),
    createSchema: getSchemaDto("LinkCreateDto", swaggerJson.components.schemas),
    editable: false,
    getItemFn: client.api.linksDetail,
    updateItemFn: client.api.linksPartialUpdate,
    createItemFn: client.api.linksCreate,
    getItemId: () => undefined,
  };

  const tableProps: GenericDataGridProps<LinkDetailsDto> = {
    key: "links-table",
    initiallyShownColumns: ["name", "source", "destination"],
    schema: getSchemaDto("LinkDetailsDto", swaggerJson.components.schemas),
    getItemsFn: client.api.linksList,
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
    entity: "link",
    listRoute: CoreModule.links,
    deleteItemFn: client.api.linksDelete,
  };

  const module = GenericModule({
    moduleName: "Links",
    modulePath: CoreModule.links,
    addButtonContent: "Add link",
    tableProps: tableProps,
    extraActions: {
      export: {
        showButton: true,
        exportItemsFn: client.api.linksExportList,
      },
      import: {
        showButton: true,
        importItemsFn: client.api.linksImportCreate,
        importSchema: getSchemaDto("LinkImportDto", swaggerJson.components.schemas),
      },
      showColumnsPanel: true,
      showFiltersPanel: true,
      bulkDelete: {
        onBulkDelete: async (ids) => {
          await client.api.linksBulkDelete(ids.map(Number));
        },
        entityName: "link",
      },
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
        navigate(getCoreModuleRoute(CoreModule.links));
      },
    },
    createFormProps: {
      ...formProps,
      mode: "create",
      editable: true,
      onSaved: () => {
        navigate(getCoreModuleRoute(CoreModule.links));
      },
    },
  });

  return module;
};
