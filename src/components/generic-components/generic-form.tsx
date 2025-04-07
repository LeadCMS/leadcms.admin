import { HttpResponse, ProblemDetails, RequestParams } from "@lib/network/swagger-client";
import {
  DtoSchema,
  camelCaseToTitleCase,
  BasicTypeForGeneric,
  CustomFieldSourceDictionaries,
  DictItem,
} from "@components/generic-components/common";
import { useEffect, useState } from "react";
import { useModuleWrapperContext } from "@providers/module-wrapper-provider";
import { Button, Card, CardContent, Grid, Tab, Tabs, Typography } from "@mui/material";
import {
  NumberEdit,
  TextEdit,
  DatetimeEdit,
  EnumEdit,
  DynamicValues,
  ValidationResult,
  DictionaryEdit,
} from "@components/generic-components/edit-components";
import { validate } from "@components/generic-components/edit-components/validator";
import { ArrayEdit } from "./edit-components/array-edit";
import { DataManagementBlock } from "@components/data-management";
import { GenericViewDeleteContainer, StyledDivider } from "./index.styled";
import { useCoreModuleNavigation } from "@hooks";
import { TextView } from "./view-components/text-view";
import { BoolView } from "./view-components/bool-view";
import { DateTimeView } from "./view-components/datetime-view";
import { ArrayView } from "./view-components/array-view";

export interface DtoField {
  editable: boolean;
  required: boolean | undefined;
  hide: boolean;
  name: string;
  label: string;
  type: "integer" | "number" | "string" | string;
  format?: "int32" | "int64" | "float" | "double" | "date-time" | "email" | "password" | string;
  nullable?: boolean;
  description?: string;
  enum?: string[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  example?: any;
}

export interface DeleteOptionProps {
  header: string;
  description: string;
  entity: string;
  listRoute: string;
  deleteItemFn: (id: number) => Promise<HttpResponse<void, void | ProblemDetails>>;
}

export interface GenericFormProps<TView extends BasicTypeForGeneric, TCreate, TUpdate> {
  editable: boolean;
  getItemFn: (
    id: number,
    params?: RequestParams,
  ) => Promise<HttpResponse<TView, void | ProblemDetails>>;
  updateItemFn: (
    id: number,
    data: TUpdate,
    params: RequestParams,
  ) => Promise<HttpResponse<TView, void | ProblemDetails>>;
  createItemFn: (
    data: TCreate,
    params: RequestParams,
  ) => Promise<HttpResponse<TView, void | ProblemDetails>>;
  detailsSchema: DtoSchema;
  updateSchema: DtoSchema;
  createSchema: DtoSchema;
  deleteOptionProps?: DeleteOptionProps;
  mode?: "create" | "update" | "details";
  getItemId: () => number | undefined;
  onSaved?: (item: TView) => void;

  customDictionaries?: CustomFieldSourceDictionaries;
}

export function GenericForm<TView extends BasicTypeForGeneric, TCreate, TUpdate>({
  editable,
  getItemFn,
  createItemFn,
  updateItemFn,
  detailsSchema,
  updateSchema,
  createSchema,
  mode,
  deleteOptionProps,
  getItemId,
  onSaved,
  customDictionaries,
}: GenericFormProps<TView, TCreate, TUpdate>) {
  const { setBusy, isBusy, setSaving, isSaving } = useModuleWrapperContext();
  const handleCoreNavigation = useCoreModuleNavigation();
  const [validationResult, setValidationResult] = useState<ValidationResult>();
  const itemId = getItemId();

  const updateFields: DtoField[] = Object.keys(updateSchema.properties).map((key) => {
    return {
      name: key,
      label: updateSchema.properties[key].title || camelCaseToTitleCase(key),
      type: updateSchema.properties[key].type,
      format: updateSchema.properties[key].format,
      nullable: updateSchema.properties[key].nullable,
      description: updateSchema.properties[key].description,
      enum: updateSchema.properties[key].enum,
      example: updateSchema.properties[key].example,
      pattern: updateSchema.properties[key].pattern,
      minLength: updateSchema.properties[key].minLength,
      maxLength: updateSchema.properties[key].maxLength,
      required: updateSchema.required && updateSchema.required.indexOf(key) > -1,
      editable: true,
      hide: updateSchema.properties[key].hide,
    };
  });

  const createFields: DtoField[] = Object.keys(createSchema.properties).map((key) => {
    return {
      name: key,
      label: createSchema.properties[key].title || camelCaseToTitleCase(key),
      type: createSchema.properties[key].type,
      format: createSchema.properties[key].format,
      nullable: createSchema.properties[key].nullable,
      description: createSchema.properties[key].description,
      enum: createSchema.properties[key].enum,
      example: createSchema.properties[key].example,
      pattern: createSchema.properties[key].pattern,
      minLength: createSchema.properties[key].minLength,
      maxLength: createSchema.properties[key].maxLength,
      required: createSchema.required && createSchema.required.indexOf(key) > -1,
      editable: true,
      hide: createSchema.properties[key].hide,
    };
  });

  const detailsFields: DtoField[] = Object.keys(detailsSchema.properties).map((key) => {
    return {
      name: key,
      label: detailsSchema.properties[key].title || camelCaseToTitleCase(key),
      type: detailsSchema.properties[key].type,
      format: detailsSchema.properties[key].format,
      nullable: detailsSchema.properties[key].nullable,
      description: detailsSchema.properties[key].description,
      enum: detailsSchema.properties[key].enum,
      example: detailsSchema.properties[key].example,
      pattern: detailsSchema.properties[key].pattern,
      minLength: detailsSchema.properties[key].minLength,
      maxLength: detailsSchema.properties[key].maxLength,
      required: detailsSchema.required && detailsSchema.required.indexOf(key) > -1,
      editable: key in updateSchema.properties,
      hide: detailsSchema.properties[key].hide,
    };
  });
  const initValues = () => {
    const initValues: DynamicValues = {};
    for (const field of detailsFields) {
      switch (field.type) {
        case "integer":
          initValues[field.name] = 0;
          break;
        case "number":
          initValues[field.name] = 0;
          break;
        default:
          initValues[field.name] = "";
          break;
      }
    }
    return initValues;
  };

  const [values, setValues] = useState<DynamicValues>(initValues);

  useEffect(() => {
    const abortController = new AbortController();
    if (itemId) {
      setBusy(async () => {
        try {
          const { data } = await getItemFn(itemId);
          setValues((values) => ({ ...values, ...data }));
        } catch (e) {
          console.log(e);
        }
      });
    } else {
      setValues(initValues);
    }
    return () => {
      abortController.abort("cancelled");
    };
  }, [itemId, getItemFn]);

  useEffect(() => {
    if (mode === "update") {
      setValidationResult(validate(updateFields, values));
    } else if (mode === "create") {
      setValidationResult(validate(createFields, values));
    }
  }, [values]);

  const save = () => {
    setSaving(async () => {
      const saveData: any = {};
      (itemId ? updateFields : createFields).forEach((field) => {
        if (isValidUpdate(field)) {
          saveData[field.name] = values[field.name];
        }
      });

      if (itemId) {
        if (!validationResult || !validationResult.errors) {
          const { data } = await updateItemFn(itemId, saveData, {});
          setValues((values) => ({ ...values, ...data }));
          onSaved && onSaved(data);
        }
      } else {
        if (!validationResult || !validationResult.errors) {
          const { data } = await createItemFn(saveData, {});
          setValues((values) => ({ ...values, ...data }));
          onSaved && onSaved(data);
        }
      }
    });
  };

  const cancel = () => {
    const currentPath = window.location.pathname;
    const modulePath = currentPath.split("/")[1];
    handleCoreNavigation(modulePath);
  };

  const isValidUpdate = (field: DtoField) => {
    if (field.type == "boolean" && (values[field.name] === true || values[field.name] === false))
      return true;
    if (field.type == "string" && values[field.name] == "") return true;
    if (values[field.name]) return true;
  };

  const fieldsSet = () => {
    switch (mode) {
      case "create":
        return createFields;
      case "update":
        return detailsFields;
      default:
        return detailsFields;
    }
  };

  const getEdit = (field: DtoField) => {
    const commonProps = {
      error: validationResult && validationResult.errors && validationResult.errors[field.name],
      required: field.required,
      pattern: field.pattern,
      key: field.name,
      label: field.label,
      example: field.example && `Value examples: ${field.example}`,
      value: values[field.name],
      disabled: !editable || !field.editable,
      onChangeValue: (newValue: any) => {
        setValues((prevValues) => ({
          ...prevValues,
          [field.name]: newValue,
        }));
      },
    };
    switch (field.type) {
      case "integer":
        if (customDictionaries && customDictionaries[field.name]) {
          const customDictionary = customDictionaries[field.name];
          const dictItems = customDictionary?.items || [];
          return DictionaryEdit({
            ...commonProps,
            label: customDictionary?.label || field.label,
            example: undefined,
            value: dictItems.find((item) => item.value === values[field.name]) || null,
            valueOptions: dictItems,
            onChangeValue: (newValue: DictItem | null) => {
              setValues((prevValues) => ({
                ...prevValues,
                [field.name]: newValue ? newValue.value : null,
              }));
              customDictionary?.onSelect &&
                customDictionary?.onSelect(newValue ? newValue.value : null);
            },
          });
        }
        return NumberEdit({
          ...commonProps,
        });
      case "number":
        return NumberEdit({
          ...commonProps,
        });
      case "string":
        if (field.format === "date-time") {
          return DatetimeEdit({
            ...commonProps,
            value: values[field.name] ? new Date(values[field.name]) : null,
            onChangeValue: (newValue: Date | null) => {
              setValues((prevValues) => ({
                ...prevValues,
                [field.name]: newValue ? newValue.toISOString() : null,
              }));
            },
          });
        } else if (field.enum && field.enum.length > 0) {
          return EnumEdit({
            ...commonProps,
            valueOptions: field.enum,
          });
        } else {
          return TextEdit({
            ...commonProps,
            minLength: field.minLength,
            maxLength: field.maxLength,
          });
        }
      case "array":
        return ArrayEdit({
          ...commonProps,
          minLength: field.minLength,
          maxLength: field.maxLength,
        });
      case "boolean":
        return EnumEdit({
          ...commonProps,
          valueOptions: ["true", "false"],
          onChangeValue: (newValue: string | null) => {
            setValues((prevValues) => ({
              ...prevValues,
              [field.name]: newValue === "true",
            }));
          },
        });
      default:
        return TextEdit({
          ...commonProps,
          minLength: field.minLength,
          maxLength: field.maxLength,
        });
    }
  };

  const getView = (field: DtoField) => {
    const commonProps = {
      key: field.name,
      label: field.label,
      value: values[field.name],
    };

    switch (field.type) {
      case "boolean":
        return BoolView({ ...commonProps });
      case "string":
        if (field.format === "date-time") {
          return DateTimeView({ ...commonProps });
        } else {
          return TextView({ ...commonProps });
        }
      case "array":
        return ArrayView({ ...commonProps });
      default:
        return TextView({ ...commonProps });
    }
  };

  return (
    <>
      {!editable && (
        <>
          <Tabs value="view">
            <Tab label="Overview" value="view" />
          </Tabs>
          <StyledDivider></StyledDivider>
        </>
      )}
      <Card>
        <CardContent>
          <Grid container spacing={4} marginBottom={4}>
            <Grid xs={12} sm={12} item>
              <Typography variant="h6">Details</Typography>
            </Grid>
            {fieldsSet()
              .filter((field) => !field.hide)
              .map((field) =>
                editable ? (
                  <Grid key={field.name} item xs={4} sm={4}>
                    {getEdit(field)}
                  </Grid>
                ) : (
                  <Grid key={field.name} item xs={3} sm={3}>
                    {getView(field)}
                  </Grid>
                ),
              )}
          </Grid>
          <Grid container spacing={4} justifyContent="flex-end">
            <Grid item xs={12} sm={1}>
              {editable && (
                <Button
                  type="submit"
                  disabled={isBusy || isSaving}
                  variant="outlined"
                  fullWidth
                  onClick={cancel}
                  size="small"
                >
                  Cancel
                </Button>
              )}
            </Grid>
            <Grid item xs={12} sm={1}>
              {editable && (
                <Button
                  type="submit"
                  disabled={isBusy || isSaving}
                  variant="contained"
                  fullWidth
                  onClick={save}
                  size="small"
                >
                  Save
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {!editable && deleteOptionProps && (
        <Grid container spacing={3}>
          <Grid item xs={8} sm={8}>
            <GenericViewDeleteContainer>
              <DataManagementBlock
                header={deleteOptionProps!.header}
                description={deleteOptionProps!.description}
                entity={deleteOptionProps!.entity}
                handleDeleteAsync={(id) => deleteOptionProps!.deleteItemFn(id as number)}
                itemId={itemId!}
                successNavigationRoute={deleteOptionProps!.listRoute}
              ></DataManagementBlock>
            </GenericViewDeleteContainer>
          </Grid>
        </Grid>
      )}
    </>
  );
}
