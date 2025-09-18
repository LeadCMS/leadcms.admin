import { GridColumnVisibilityModel, GridFilterModel } from "@mui/x-data-grid";
import { Theme } from "@mui/material/styles";

export interface BreadcrumbLink {
  linkText: string;
  toRoute: string;
}

export type DataListSettings = {
  searchTerm: string;
  filterLimit: number;
  skipLimit: number;
  sortColumn: string;
  sortOrder: string;
  pageNumber: number;
  columnVisibilityModel: GridColumnVisibilityModel | undefined;
  whereFilters?: Array<{
    whereField: string;
    whereOperator: string;
    whereFieldValue: string;
  }>;
  columnOrder?: string[];
  columnWidths?: Record<string, number>;
};

export type GridDataFilterSettings = {
  searchTerm: string;
  filterLimit: number;
  skipLimit: number;
  sortColumn: string;
  sortOrder: string;
  whereFilters?: Array<{
    whereField: string;
    whereOperator: string;
    whereFieldValue: string;
  }>;
  pageNumber: number;
  columnVisibilityModel: GridColumnVisibilityModel | undefined;
  filterModel?: GridFilterModel;
};

export interface GridDataFilterState {
  filterLimit?: number;
  sortColumn?: string;
  sortOrder?: string;
  whereFilters?: Array<{
    whereField: string;
    whereOperator: string;
    whereFieldValue: string;
  }>;
  skipLimit?: number;
  pageNumber?: number;
  searchTerm?: string;
  columnVisibilityModel?: GridColumnVisibilityModel | undefined;
  columnOrder?: string[];
}

export type GridSizeProps = {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
};

export interface ExportParams {
  scope: string;
  format: string;
  cols: string[];
  selectedRows: any[];
  whereFilterQuery: string;
  basicFilterQuery: string | undefined;
  searchTerm: string;
}

export type CustomStylingInstance = {
  omitTW?: boolean;
  cmpTag?: string;
  cmpStyles?: string[];
  twStyles?: string[];
  dymStyles?: string[];
};

export type CardContentProps = {
  icon?: string;
  title?: string;
  descrp?: string;
  tags?: {
    label: string;
    value: string;
    attr: string;
    ext?: string;
  }[];
  context?: {
    label?: string;
    value?: string;
  }[];
  children?: React.ReactNode;
  hide?: boolean;
};

export type CLIinstance = {
  dir?: string;
  cmd: string[];
};

export type LocalContainerProps = {
  className?: string;
  cmpID?: string;
  children?: React.ReactNode;
  rootElement?: "article" | "section" | "div";
  styleObj?: CustomStylingInstance;
  cmpFontSize?: number | 14;
};

export type StyledProps = LocalContainerProps & {
  theme?: Theme;
};
