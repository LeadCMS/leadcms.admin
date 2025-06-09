import { GenericForm, GenericFormProps } from "@components/generic-components";
import { ModuleWrapper } from "@components/module-wrapper";
import { SavingBar } from "@components/saving-bar";
import { DomainCreateDto, DomainDetailsDto, DomainUpdateDto } from "@lib/network/swagger-client";
import { domainFormBreadcrumbLinks } from "../constants";
import { useState } from "react";
import { Button,Box } from "@mui/material";
import { XCircle, Save } from "lucide-react";

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
  const [triggerCancel, setTriggerCancel] = useState(false);

  const genericForm = (
      <GenericForm<DomainDetailsDto, DomainCreateDto, DomainUpdateDto>
        {...formProps}
        triggerSave={triggerSave}
        triggerCancel={triggerCancel}
        onSaveHandled={() => setTriggerSave(false)}
        onCancelHandled={() => setTriggerCancel(false)}
        fieldSections={fieldSections}
      />
    );

const handleSaveClick = () => setTriggerSave(true);
const handleCancelClick = () => setTriggerCancel(true);  

  const actionButtons = formProps.editable ? (
    <Box sx={{ display: "flex", width: "100%", gap: 4, justifyContent: 'flex-end'}}>
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
  ) : null;

  return (
    <ModuleWrapper
      key={key}
      saveIndicatorElement={<SavingBar />}
      breadcrumbs={domainFormBreadcrumbLinks}
      currentBreadcrumb={currentBreadcrumb}
      actionButtons={actionButtons}
    >
      {genericForm}
    </ModuleWrapper>
  );
};