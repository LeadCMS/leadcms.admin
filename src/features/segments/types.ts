// Re-export swagger-client types for segments
export type {
  ContactDetailsDto,
  RuleGroup,
  SegmentCreateDto,
  SegmentDetailsDto,
  SegmentRule,
  SegmentUpdateDto,
} from "@lib/network/swagger-client";

import type { SegmentRule } from "@lib/network/swagger-client";

export type SegmentType = "dynamic" | "static";

// Utility function to convert PascalCase to display text
// e.g., "FirstName" -> "First Name", "Contains" -> "Contains"
export const pascalCaseToDisplayText = (text: string): string => {
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/^\s/, "")
    .trim();
};

export type FieldValueType =
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "select"
  | "tags"
  | "autocomplete";

export type AutocompleteKey = "countries" | "continents" | "languages";

export type FieldCategory = "Contact" | "Account" | "Domain" | "Orders" | "Order Items" | "Deals";

// Available field definitions
export interface FieldDefinition {
  id: string;
  name: string;
  type: FieldValueType;
  category: FieldCategory;
  operators: SegmentRule["operator"][];
  options?: { value: string; label: string }[];
  /** Key identifying which async option list to load */
  autocompleteKey?: AutocompleteKey;
}

// Operators that require no value input
export const noValueOperators: SegmentRule["operator"][] = [
  "IsEmpty",
  "IsNotEmpty",
  "IsTrue",
  "IsFalse",
];

const textOperators: SegmentRule["operator"][] = [
  "Contains",
  "NotContains",
  "Equals",
  "NotEquals",
  "StartsWith",
  "EndsWith",
  "IsEmpty",
  "IsNotEmpty",
];

const numericOperators: SegmentRule["operator"][] = [
  "Equals",
  "NotEquals",
  "GreaterThan",
  "LessThan",
  "GreaterThanOrEqual",
  "LessThanOrEqual",
];

const dateOperators: SegmentRule["operator"][] = [
  "Equals",
  "GreaterThan",
  "LessThan",
  "GreaterThanOrEqual",
  "LessThanOrEqual",
];

const booleanOperators: SegmentRule["operator"][] = ["IsTrue", "IsFalse"];

const tagsOperators: SegmentRule["operator"][] = [
  "Contains",
  "NotContains",
  "IsEmpty",
  "IsNotEmpty",
];

const selectOperators: SegmentRule["operator"][] = ["Equals", "NotEquals"];

const orderStatusOptions = [
  { value: "Pending", label: "Pending" },
  { value: "Paid", label: "Paid" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Refunded", label: "Refunded" },
  { value: "Failed", label: "Failed" },
];

// Contact field definitions
export const contactFields: FieldDefinition[] = [
  // ── Contact fields ──
  {
    id: "email",
    name: "Email",
    type: "text",
    category: "Contact",
    operators: textOperators,
  },
  {
    id: "firstName",
    name: "First Name",
    type: "text",
    category: "Contact",
    operators: textOperators,
  },
  {
    id: "lastName",
    name: "Last Name",
    type: "text",
    category: "Contact",
    operators: textOperators,
  },
  {
    id: "fullName",
    name: "Full Name",
    type: "text",
    category: "Contact",
    operators: textOperators,
  },
  {
    id: "prefix",
    name: "Prefix",
    type: "text",
    category: "Contact",
    operators: textOperators,
  },
  {
    id: "middleName",
    name: "Middle Name",
    type: "text",
    category: "Contact",
    operators: textOperators,
  },
  {
    id: "birthday",
    name: "Birthday",
    type: "date",
    category: "Contact",
    operators: dateOperators,
  },
  {
    id: "jobTitle",
    name: "Job Title",
    type: "text",
    category: "Contact",
    operators: textOperators,
  },
  {
    id: "companyName",
    name: "Company Name",
    type: "text",
    category: "Contact",
    operators: textOperators,
  },
  {
    id: "department",
    name: "Department",
    type: "text",
    category: "Contact",
    operators: textOperators,
  },
  {
    id: "phone",
    name: "Phone",
    type: "text",
    category: "Contact",
    operators: textOperators,
  },
  {
    id: "address1",
    name: "Address 1",
    type: "text",
    category: "Contact",
    operators: textOperators,
  },
  {
    id: "address2",
    name: "Address 2",
    type: "text",
    category: "Contact",
    operators: textOperators,
  },
  {
    id: "cityName",
    name: "City",
    type: "text",
    category: "Contact",
    operators: textOperators,
  },
  {
    id: "state",
    name: "State",
    type: "text",
    category: "Contact",
    operators: textOperators,
  },
  {
    id: "zip",
    name: "Zip Code",
    type: "text",
    category: "Contact",
    operators: textOperators,
  },
  {
    id: "continentCode",
    name: "Continent",
    type: "autocomplete",
    category: "Contact",
    operators: selectOperators,
    autocompleteKey: "continents",
  },
  {
    id: "countryCode",
    name: "Country",
    type: "autocomplete",
    category: "Contact",
    operators: selectOperators,
    autocompleteKey: "countries",
  },
  {
    id: "language",
    name: "Language",
    type: "autocomplete",
    category: "Contact",
    operators: selectOperators,
    autocompleteKey: "languages",
  },
  {
    id: "source",
    name: "Source",
    type: "text",
    category: "Contact",
    operators: textOperators,
  },
  {
    id: "tags",
    name: "Tags",
    type: "tags",
    category: "Contact",
    operators: tagsOperators,
  },
  {
    id: "isUnsubscribed",
    name: "Is Unsubscribed",
    type: "boolean",
    category: "Contact",
    operators: booleanOperators,
  },
  {
    id: "dealsCount",
    name: "Deals Count",
    type: "number",
    category: "Contact",
    operators: numericOperators,
  },
  {
    id: "ordersCount",
    name: "Orders Count",
    type: "number",
    category: "Contact",
    operators: numericOperators,
  },
  {
    id: "totalRevenue",
    name: "Total Revenue",
    type: "number",
    category: "Contact",
    operators: numericOperators,
  },
  {
    id: "lastOrderDate",
    name: "Last Order Date",
    type: "date",
    category: "Contact",
    operators: dateOperators,
  },
  {
    id: "createdAt",
    name: "Created At",
    type: "date",
    category: "Contact",
    operators: dateOperators,
  },

  // ── Account nested attributes ──
  {
    id: "account.name",
    name: "Name",
    type: "text",
    category: "Account",
    operators: textOperators,
  },
  {
    id: "account.tin",
    name: "TIN",
    type: "text",
    category: "Account",
    operators: textOperators,
  },
  {
    id: "account.countryCode",
    name: "Country",
    type: "autocomplete",
    category: "Account",
    operators: selectOperators,
    autocompleteKey: "countries",
  },
  {
    id: "account.state",
    name: "State",
    type: "text",
    category: "Account",
    operators: textOperators,
  },
  {
    id: "account.cityName",
    name: "City",
    type: "text",
    category: "Account",
    operators: textOperators,
  },
  {
    id: "account.employeesRange",
    name: "Employees Range",
    type: "text",
    category: "Account",
    operators: textOperators,
  },
  {
    id: "account.revenue",
    name: "Annual Revenue",
    type: "number",
    category: "Account",
    operators: numericOperators,
  },
  {
    id: "account.profit",
    name: "Profit",
    type: "number",
    category: "Account",
    operators: numericOperators,
  },
  {
    id: "account.source",
    name: "Source",
    type: "text",
    category: "Account",
    operators: textOperators,
  },
  {
    id: "account.dealsCount",
    name: "Deals Count",
    type: "number",
    category: "Account",
    operators: numericOperators,
  },
  {
    id: "account.ordersCount",
    name: "Orders Count",
    type: "number",
    category: "Account",
    operators: numericOperators,
  },
  {
    id: "account.totalRevenue",
    name: "Total Revenue",
    type: "number",
    category: "Account",
    operators: numericOperators,
  },
  {
    id: "account.contactCount",
    name: "Contact Count",
    type: "number",
    category: "Account",
    operators: numericOperators,
  },

  // ── Domain nested attributes ──
  {
    id: "domain.name",
    name: "Name",
    type: "text",
    category: "Domain",
    operators: textOperators,
  },
  {
    id: "domain.title",
    name: "Title",
    type: "text",
    category: "Domain",
    operators: textOperators,
  },
  {
    id: "domain.url",
    name: "URL",
    type: "text",
    category: "Domain",
    operators: textOperators,
  },
  {
    id: "domain.free",
    name: "Free",
    type: "boolean",
    category: "Domain",
    operators: booleanOperators,
  },
  {
    id: "domain.disposable",
    name: "Disposable",
    type: "boolean",
    category: "Domain",
    operators: booleanOperators,
  },
  {
    id: "domain.catchAll",
    name: "Catch All",
    type: "boolean",
    category: "Domain",
    operators: booleanOperators,
  },
  {
    id: "domain.dnsCheck",
    name: "DNS Check",
    type: "boolean",
    category: "Domain",
    operators: booleanOperators,
  },
  {
    id: "domain.mxCheck",
    name: "MX Check",
    type: "boolean",
    category: "Domain",
    operators: booleanOperators,
  },
  {
    id: "domain.httpCheck",
    name: "HTTP Check",
    type: "boolean",
    category: "Domain",
    operators: booleanOperators,
  },
  {
    id: "domain.source",
    name: "Source",
    type: "text",
    category: "Domain",
    operators: textOperators,
  },

  // ── Orders collection attributes ──
  {
    id: "orders.status",
    name: "Status",
    type: "select",
    category: "Orders",
    operators: selectOperators,
    options: orderStatusOptions,
  },
  {
    id: "orders.refNo",
    name: "Ref No",
    type: "text",
    category: "Orders",
    operators: textOperators,
  },
  {
    id: "orders.orderNumber",
    name: "Order Number",
    type: "text",
    category: "Orders",
    operators: textOperators,
  },
  {
    id: "orders.affiliateName",
    name: "Affiliate Name",
    type: "text",
    category: "Orders",
    operators: textOperators,
  },
  {
    id: "orders.currency",
    name: "Currency",
    type: "text",
    category: "Orders",
    operators: textOperators,
  },
  {
    id: "orders.source",
    name: "Source",
    type: "text",
    category: "Orders",
    operators: textOperators,
  },
  {
    id: "orders.testOrder",
    name: "Test Order",
    type: "boolean",
    category: "Orders",
    operators: booleanOperators,
  },
  {
    id: "orders.tags",
    name: "Tags",
    type: "tags",
    category: "Orders",
    operators: tagsOperators,
  },
  {
    id: "orders.createdAt",
    name: "Created At",
    type: "date",
    category: "Orders",
    operators: dateOperators,
  },

  // ── Order Items nested collection attributes ──
  {
    id: "orders.orderItems.productName",
    name: "Product Name",
    type: "text",
    category: "Order Items",
    operators: textOperators,
  },
  {
    id: "orders.orderItems.unitPrice",
    name: "Unit Price",
    type: "number",
    category: "Order Items",
    operators: numericOperators,
  },
  {
    id: "orders.orderItems.quantity",
    name: "Quantity",
    type: "number",
    category: "Order Items",
    operators: numericOperators,
  },
  {
    id: "orders.orderItems.currency",
    name: "Currency",
    type: "text",
    category: "Order Items",
    operators: textOperators,
  },
  {
    id: "orders.orderItems.total",
    name: "Total",
    type: "number",
    category: "Order Items",
    operators: numericOperators,
  },
  {
    id: "orders.orderItems.source",
    name: "Source",
    type: "text",
    category: "Order Items",
    operators: textOperators,
  },

  // ── Deals collection attributes ──
  {
    id: "deals.dealValue",
    name: "Deal Value",
    type: "number",
    category: "Deals",
    operators: numericOperators,
  },
  {
    id: "deals.dealCurrency",
    name: "Deal Currency",
    type: "text",
    category: "Deals",
    operators: textOperators,
  },
  {
    id: "deals.dealPipelineId",
    name: "Pipeline ID",
    type: "number",
    category: "Deals",
    operators: numericOperators,
  },
  {
    id: "deals.dealPipelineStageId",
    name: "Pipeline Stage ID",
    type: "text",
    category: "Deals",
    operators: [...selectOperators, ...textOperators.filter((op) => !selectOperators.includes(op))],
  },
  {
    id: "deals.expectedCloseDate",
    name: "Expected Close Date",
    type: "date",
    category: "Deals",
    operators: dateOperators,
  },
  {
    id: "deals.actualCloseDate",
    name: "Actual Close Date",
    type: "date",
    category: "Deals",
    operators: dateOperators,
  },
  {
    id: "deals.tags",
    name: "Tags",
    type: "tags",
    category: "Deals",
    operators: tagsOperators,
  },
  {
    id: "deals.createdAt",
    name: "Created At",
    type: "date",
    category: "Deals",
    operators: dateOperators,
  },
];

// Group fields by category for the field selector
export const fieldCategories: FieldCategory[] = [
  "Contact",
  "Account",
  "Domain",
  "Orders",
  "Order Items",
  "Deals",
];

export const getFieldsByCategory = (category: FieldCategory): FieldDefinition[] => {
  return contactFields.filter((field) => field.category === category);
};

export const getFieldById = (id: string): FieldDefinition | undefined => {
  return contactFields.find((field) => field.id === id);
};

export const getOperatorDisplayName = (operator: SegmentRule["operator"]): string => {
  const displayMap: Record<string, string> = {
    Equals: "equals",
    NotEquals: "not equals",
    Contains: "contains",
    NotContains: "not contains",
    StartsWith: "starts with",
    EndsWith: "ends with",
    IsEmpty: "is empty",
    IsNotEmpty: "is not empty",
    GreaterThan: "greater than",
    LessThan: "less than",
    GreaterThanOrEqual: "greater or equal",
    LessThanOrEqual: "less or equal",
    IsTrue: "is true",
    IsFalse: "is false",
    In: "in",
    NotIn: "not in",
  };
  return displayMap[operator] ?? pascalCaseToDisplayText(operator).toLowerCase();
};

export const getFieldDisplayName = (fieldId: string): string => {
  const field = getFieldById(fieldId);
  if (field) {
    return field.category !== "Contact" ? `${field.category}: ${field.name}` : field.name;
  }
  return pascalCaseToDisplayText(fieldId);
};
