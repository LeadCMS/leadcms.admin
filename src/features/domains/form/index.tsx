import { GenericForm, GenericFormProps } from "@components/generic-components";
import { ModuleWrapper } from "@components/module-wrapper";
import { SavingBar } from "@components/saving-bar";
import { DomainCreateDto, DomainDetailsDto, DomainUpdateDto } from "@lib/network/swagger-client";
import { domainFormBreadcrumbLinks } from "../constants";

export const DomainForm = (
  key: string,
  currentBreadcrumb: string,
  formProps: GenericFormProps<DomainDetailsDto, DomainCreateDto, DomainUpdateDto>,
) => {
  const genericForm = GenericForm<DomainDetailsDto, DomainCreateDto, DomainUpdateDto>(formProps);

  return (
    <ModuleWrapper
      key={key}
      saveIndicatorElement={<SavingBar />}
      breadcrumbs={domainFormBreadcrumbLinks}
      currentBreadcrumb={currentBreadcrumb}
    >
      {genericForm}
    </ModuleWrapper>
  );
};
