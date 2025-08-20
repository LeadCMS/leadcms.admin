import { GridColumnVisibilityModel, GridFilterModel } from "@mui/x-data-grid";

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
  whereField?: string;
  whereFieldValue?: string;
  whereOperator?: string;
  pageNumber: number;
  columnVisibilityModel: GridColumnVisibilityModel | undefined;
  filterModel?: GridFilterModel;
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
  columnWidths?: Record<string, number>;
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
