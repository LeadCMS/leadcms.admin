import { BreadcrumbLink } from "../../types";
import { dataListBreadcrumbLinks } from "../../utils/constants";
import { CoreModule, getCoreModuleRoute } from "@lib/router";
import { GridColumnVisibilityModel } from "@mui/x-data-grid";

export interface DtoSourceProperty {
  $ref?: string;
  type?: "integer" | "number" | "string" | string;
  format?: "int32" | "int64" | "float" | "double" | "date-time" | "email" | "password" | string;
  nullable?: boolean;
  title?: string;
  description?: string;
  "x-hide"?: boolean;
  enum?: string[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  example?: any;
}

export interface DtoSchemaSource {
  type: string;
  enum?: string[];
  required?: string[];
  properties?: {
    [x: string]: DtoSourceProperty;
  };
}

export interface DtoProperty {
  hide: boolean;
  type: "integer" | "number" | "string" | string;
  format?: "int32" | "int64" | "float" | "double" | "date-time" | "email" | "password" | string;
  nullable?: boolean;
  title?: string;
  description?: string;
  enum?: string[];
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  example?: any;
}

export interface DtoSchema {
  type: string;
  enum?: string[];
  required?: string[];
  properties: {
    [x: string]: DtoProperty;
  };
}

export const camelCaseToTitleCase = (str: string) => {
  const titleCase = str.replace(/[A-Z]/g, (match) => ` ${match}`);
  return titleCase.charAt(0).toUpperCase() + titleCase.slice(1);
};

export interface BasicTypeForGeneric {
  id?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export const getBreadcrumbLinks = (
  moduleName: string,
  modulePath: CoreModule,
): BreadcrumbLink[] => {
  return [
    ...dataListBreadcrumbLinks,
    { linkText: moduleName, toRoute: getCoreModuleRoute(modulePath) },
  ];
};

export interface GenericDataGridSettings {
  sortColumn: string;
  sortDirection: string;
  columnVisibilityModel: GridColumnVisibilityModel;
}

export interface DictItem {
  value: number;
  displayText: string;
}

export interface CustomFieldSourceDictionary {
  label?: string;
  items: DictItem[];
  onSelect?: (itemId: number | null) => void;
}

export interface CustomFieldSourceDictionaries {
  [x: string]: CustomFieldSourceDictionary | undefined;
}

export type JsonArray = {
  [key: string]: any;
};

export const isJsonArray = (item: any): item is JsonArray => {
  return typeof item === "object" && item !== null;
};
