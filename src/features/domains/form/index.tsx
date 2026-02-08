import { GenericForm, GenericFormProps } from "@components/generic-components";
import { ModuleWrapper } from "@components/module-wrapper";
import { SavingBar } from "@components/saving-bar";
import { DomainCreateDto, DomainDetailsDto, DomainUpdateDto } from "@lib/network/swagger-client";
import { domainFormBreadcrumbLinks } from "../constants";
import { useState } from "react";
import { Button, Box } from "@mui/material";
import { XCircle, Save } from "lucide-react";
import { DataManagementBlock } from "@components/data-management";

const fieldSections = {
  sections: [
    {
      id: "domainDetails",
      title: "Domain Details",
      fields: ["name", "title", "description", "url", "faviconUrl"],
    },
    {
      id: "verificationChecks",
      title: "Verification Checks",
      fields: ["httpCheck", "dnsCheck", "mxCheck"],
    },
    {
      id: "domainProperties",
      title: "Domain Properties",
      fields: ["free", "disposable", "catchAll"],
    },
    {
      id: "metadata",
      title: "Source Metadata",
      fields: ["source"],
    },
    {
      id: "dnsRecords",
      title: "DNS Records",
      fields: [""],
    },
  ],
};

export const DomainForm = (
  key: string,
  currentBreadcrumb: string,
  formProps: GenericFormProps<DomainDetailsDto, DomainCreateDto, DomainUpdateDto>
) => {
  const [triggerSave, setTriggerSave] = useState(false);
  const [triggerSaveAndClose, setTriggerSaveAndClose] = useState(false);
  const [triggerCancel, setTriggerCancel] = useState(false);

  const genericForm = (
    <GenericForm<DomainDetailsDto, DomainCreateDto, DomainUpdateDto>
      {...formProps}
      triggerSave={triggerSave}
      triggerSaveAndClose={triggerSaveAndClose}
      triggerCancel={triggerCancel}
      onSaveHandled={() => setTriggerSave(false)}
      onSaveAndCloseHandled={() => setTriggerSaveAndClose(false)}
      onCancelHandled={() => setTriggerCancel(false)}
      fieldSections={fieldSections}
    />
  );

  const handleSaveClick = () => setTriggerSave(true);
  const handleSaveAndCloseClick = () => setTriggerSaveAndClose(true);
  const handleCancelClick = () => setTriggerCancel(true);

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
        variant="outlined"
        onClick={handleSaveClick}
        size="large"
        startIcon={<Save size={22} />}
      >
        Save
      </Button>
      <Button
        type="button"
        variant="contained"
        onClick={handleSaveAndCloseClick}
        size="large"
        startIcon={<Save size={22} />}
      >
        Save and Close
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
      breadcrumbs={domainFormBreadcrumbLinks}
      currentBreadcrumb={currentBreadcrumb}
      actionButtons={actionButtons}
    >
      {genericForm}
    </ModuleWrapper>
  );
};
