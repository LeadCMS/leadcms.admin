import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button } from "@mui/material";
import { Save, XCircle } from "lucide-react";
import { ModuleWrapper } from "@components/module-wrapper";
import {
  GenericForm,
  GenericFormProps,
  getSchemaDto,
  getBreadcrumbLinks,
} from "@components/generic-components";
import { DataManagementBlock } from "@components/data-management";
import { CoreModule, getCoreModuleRoute } from "@lib/router";
import swaggerJson from "@lib/network/swagger.json";
import { useRequestContext } from "@providers/request-provider";
import { UnsubscribeDetailsDto, UnsubscribeDto } from "@lib/network/swagger-client";

type FormMode = "view" | "edit" | "create";

interface UnsubscribeFormPageProps {
  mode: FormMode;
}

export const UnsubscribeFormPage = ({ mode }: UnsubscribeFormPageProps) => {
  const { client } = useRequestContext();
  const navigate = useNavigate();
  const params = useParams();

  const [triggerSave, setTriggerSave] = useState(false);
  const [triggerSaveAndClose, setTriggerSaveAndClose] = useState(false);
  const [triggerCancel, setTriggerCancel] = useState(false);

  const handleSaveClick = () => setTriggerSave(true);
  const handleSaveAndCloseClick = () => setTriggerSaveAndClose(true);
  const handleCancelClick = () => setTriggerCancel(true);

  const getItemId = (): number | undefined => {
    const wildcard = params["*"] || "";
    const viewMatch = wildcard.match(/^(\d+)\/view$/);
    const editMatch = wildcard.match(/^(\d+)\/edit$/);
    const match = viewMatch || editMatch;
    return match ? Number(match[1]) : undefined;
  };

  const listRoute = getCoreModuleRoute(CoreModule.unsubscribes);

  const baseFormProps: GenericFormProps<UnsubscribeDetailsDto, UnsubscribeDto, UnsubscribeDto> = {
    detailsSchema: getSchemaDto("UnsubscribeDetailsDto", swaggerJson.components.schemas),
    updateSchema: getSchemaDto("UnsubscribeDto", swaggerJson.components.schemas),
    createSchema: getSchemaDto("UnsubscribeDto", swaggerJson.components.schemas),
    editable: mode !== "view",
    getItemFn: client.api.unsubscribesDetail,
    updateItemFn: client.api.unsubscribesPartialUpdate,
    createItemFn: client.api.unsubscribesCreate,
    getItemId,
    mode: mode === "view" ? "details" : mode === "edit" ? "update" : "create",
    onSaved: mode !== "view" ? () => navigate(listRoute) : undefined,
    ...(mode === "view" && {
      deleteOptionProps: {
        header: "Data Management",
        description: "Please be aware that what has been deleted " + "can never be brought back.",
        entity: "unsubscribe",
        listRoute: CoreModule.unsubscribes,
        deleteItemFn: client.api.unsubscribesDelete,
      },
    }),
  };

  const breadcrumbLabel = mode === "view" ? "View" : mode === "edit" ? "Edit" : "Create";

  const actionButtons =
    mode !== "view" ? (
      <Box
        sx={{
          display: "flex",
          width: "100%",
          gap: 4,
          justifyContent: "flex-end",
        }}
      >
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
    ) : baseFormProps.deleteOptionProps ? (
      <DataManagementBlock
        header={baseFormProps.deleteOptionProps.header}
        description={baseFormProps.deleteOptionProps.description}
        entity={baseFormProps.deleteOptionProps.entity}
        handleDeleteAsync={(id) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return baseFormProps.deleteOptionProps!.deleteItemFn(Number(id));
        }}
        itemId={getItemId() ?? ""}
        successNavigationRoute={baseFormProps.deleteOptionProps.listRoute}
        showOnlyButtons={true}
      />
    ) : null;

  return (
    <ModuleWrapper
      breadcrumbs={getBreadcrumbLinks("Unsubscribes", CoreModule.unsubscribes)}
      currentBreadcrumb={breadcrumbLabel}
      actionButtons={actionButtons}
    >
      <GenericForm<UnsubscribeDetailsDto, UnsubscribeDto, UnsubscribeDto>
        {...baseFormProps}
        triggerSave={triggerSave}
        triggerSaveAndClose={triggerSaveAndClose}
        triggerCancel={triggerCancel}
        onSaveHandled={() => setTriggerSave(false)}
        onSaveAndCloseHandled={() => setTriggerSaveAndClose(false)}
        onCancelHandled={() => setTriggerCancel(false)}
      />
    </ModuleWrapper>
  );
};
