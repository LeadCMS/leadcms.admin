import { GenericFormProps, getSchemaDto } from "@components/generic-components";
import { DomainCreateDto, DomainDetailsDto, DomainUpdateDto } from "@lib/network/swagger-client";
import {
  addFormRoute,
  CoreModule,
  editFormRoute,
  getCoreModuleRoute,
  viewFormRoute,
} from "lib/router";
import { Outlet, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { DomainsLazy } from "./lazy";
import swaggerJson from "@lib/network/swagger.json";
import { useRequestContext } from "@providers/request-provider";
import { DomainForm } from "./form";

export const DomainsModule = () => {
  const { client } = useRequestContext();
  const navigate = useNavigate();

  const formProps: GenericFormProps<DomainDetailsDto, DomainCreateDto, DomainUpdateDto> = {
    detailsSchema: getSchemaDto("DomainDetailsDto", swaggerJson.components.schemas),
    updateSchema: getSchemaDto("DomainUpdateDto", swaggerJson.components.schemas),
    createSchema: getSchemaDto("DomainCreateDto", swaggerJson.components.schemas),
    editable: false,
    getItemFn: client.api.domainsDetail,
    updateItemFn: client.api.domainsPartialUpdate,
    createItemFn: client.api.domainsCreate,
    getItemId: () => undefined,
  };

  const deleteProps = {
    header: "Data Management",
    description: "Please be aware that what has been deleted can never be brought back.",
    entity: "domain",
    listRoute: CoreModule.domains,
    deleteItemFn: client.api.domainsDelete,
  };

  const viewFormProps: GenericFormProps<DomainDetailsDto, DomainCreateDto, DomainUpdateDto> = {
    ...formProps,
    mode: "details",
    editable: false,
    deleteOptionProps: deleteProps,
    getItemId: () => {
      const params = useParams();
      return Number(params && params["*"] && params["*"].match(/^(\d+)\/view$/)?.[1]);
    },
  };

  const editFormProps: GenericFormProps<DomainDetailsDto, DomainCreateDto, DomainUpdateDto> = {
    ...formProps,
    mode: "update",
    editable: true,
    getItemId: () => {
      const params = useParams();
      return Number(params && params["*"] && params["*"].match(/^(\d+)\/edit$/)?.[1]);
    },
    onSaved: () => {
      navigate(getCoreModuleRoute(CoreModule.domains));
    },
  };

  const createFormProps: GenericFormProps<DomainDetailsDto, DomainCreateDto, DomainUpdateDto> = {
    ...formProps,
    mode: "create",
    editable: true,
    onSaved: () => {
      navigate(getCoreModuleRoute(CoreModule.domains));
    },
  };

  const domainCreateForm = createFormProps && DomainForm("create", "Create", createFormProps);
  const domainEditForm = editFormProps && DomainForm("edit", "Edit", editFormProps);
  const domainViewForm = viewFormProps && DomainForm("view", "View", viewFormProps);

  return (
    <>
      <Routes>
        <Route index element={<DomainsLazy />} />
        <Route path={editFormRoute.template} element={domainEditForm} />
        <Route path={viewFormRoute.template} element={domainViewForm} />
        <Route path={addFormRoute.template} element={domainCreateForm} />
      </Routes>
      <Outlet />
    </>
  );
};
