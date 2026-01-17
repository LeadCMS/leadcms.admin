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
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^\s/, "") // Remove leading space
    .trim();
};

// Available field definitions based on ContactDetailsDto
export interface FieldDefinition {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "boolean" | "select";
  operators: SegmentRule["operator"][];
  options?: { value: string; label: string }[];
}

// Contact field definitions based on the swagger-client ContactDetailsDto
export const contactFields: FieldDefinition[] = [
  {
    id: "email",
    name: "Email",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "firstName",
    name: "First Name",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "lastName",
    name: "Last Name",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "fullName",
    name: "Full Name",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "prefix",
    name: "Prefix",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "middleName",
    name: "Middle Name",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "birthday",
    name: "Birthday",
    type: "date",
    operators: ["Equals", "GreaterThan", "LessThan", "GreaterThanOrEqual", "LessThanOrEqual"],
  },
  {
    id: "jobTitle",
    name: "Job Title",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "companyName",
    name: "Company Name",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "department",
    name: "Department",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "phone",
    name: "Phone",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "address1",
    name: "Address 1",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "address2",
    name: "Address 2",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "language",
    name: "Language",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "dealsCount",
    name: "Deals Count",
    type: "number",
    operators: [
      "Equals",
      "NotEquals",
      "GreaterThan",
      "LessThan",
      "GreaterThanOrEqual",
      "LessThanOrEqual",
    ],
  },
  {
    id: "ordersCount",
    name: "Orders Count",
    type: "number",
    operators: [
      "Equals",
      "NotEquals",
      "GreaterThan",
      "LessThan",
      "GreaterThanOrEqual",
      "LessThanOrEqual",
    ],
  },
  {
    id: "totalRevenue",
    name: "Total Revenue",
    type: "number",
    operators: [
      "Equals",
      "NotEquals",
      "GreaterThan",
      "LessThan",
      "GreaterThanOrEqual",
      "LessThanOrEqual",
    ],
  },
  {
    id: "lastOrderDate",
    name: "Last Order Date",
    type: "date",
    operators: ["Equals", "GreaterThan", "LessThan", "GreaterThanOrEqual", "LessThanOrEqual"],
  },
  {
    id: "createdAt",
    name: "Created At",
    type: "date",
    operators: ["Equals", "GreaterThan", "LessThan", "GreaterThanOrEqual", "LessThanOrEqual"],
  },
  // Account nested attributes
  {
    id: "account.name",
    name: "Account Name",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "account.tin",
    name: "Account TIN",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "account.countryCode",
    name: "Account Country",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "account.state",
    name: "Account State",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "account.cityName",
    name: "Account City",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "account.employeesRange",
    name: "Account Employees Range",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "account.revenue",
    name: "Account Annual Revenue",
    type: "number",
    operators: [
      "Equals",
      "NotEquals",
      "GreaterThan",
      "LessThan",
      "GreaterThanOrEqual",
      "LessThanOrEqual",
    ],
  },
  {
    id: "account.profit",
    name: "Account Profit",
    type: "number",
    operators: [
      "Equals",
      "NotEquals",
      "GreaterThan",
      "LessThan",
      "GreaterThanOrEqual",
      "LessThanOrEqual",
    ],
  },
  {
    id: "account.source",
    name: "Account Source",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "account.dealsCount",
    name: "Account Deals Count",
    type: "number",
    operators: [
      "Equals",
      "NotEquals",
      "GreaterThan",
      "LessThan",
      "GreaterThanOrEqual",
      "LessThanOrEqual",
    ],
  },
  {
    id: "account.ordersCount",
    name: "Account Orders Count",
    type: "number",
    operators: [
      "Equals",
      "NotEquals",
      "GreaterThan",
      "LessThan",
      "GreaterThanOrEqual",
      "LessThanOrEqual",
    ],
  },
  {
    id: "account.totalRevenue",
    name: "Account Total Revenue",
    type: "number",
    operators: [
      "Equals",
      "NotEquals",
      "GreaterThan",
      "LessThan",
      "GreaterThanOrEqual",
      "LessThanOrEqual",
    ],
  },
  {
    id: "account.contactCount",
    name: "Account Contact Count",
    type: "number",
    operators: [
      "Equals",
      "NotEquals",
      "GreaterThan",
      "LessThan",
      "GreaterThanOrEqual",
      "LessThanOrEqual",
    ],
  },
  // Domain nested attributes
  {
    id: "domain.name",
    name: "Domain Name",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "domain.title",
    name: "Domain Title",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "domain.url",
    name: "Domain URL",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
  {
    id: "domain.free",
    name: "Domain Free",
    type: "boolean",
    operators: ["Equals", "NotEquals"],
  },
  {
    id: "domain.disposable",
    name: "Domain Disposable",
    type: "boolean",
    operators: ["Equals", "NotEquals"],
  },
  {
    id: "domain.catchAll",
    name: "Domain Catch All",
    type: "boolean",
    operators: ["Equals", "NotEquals"],
  },
  {
    id: "domain.dnsCheck",
    name: "Domain DNS Check",
    type: "boolean",
    operators: ["Equals", "NotEquals"],
  },
  {
    id: "domain.mxCheck",
    name: "Domain MX Check",
    type: "boolean",
    operators: ["Equals", "NotEquals"],
  },
  {
    id: "domain.httpCheck",
    name: "Domain HTTP Check",
    type: "boolean",
    operators: ["Equals", "NotEquals"],
  },
  {
    id: "domain.source",
    name: "Domain Source",
    type: "text",
    operators: ["Contains", "NotContains", "Equals", "NotEquals", "IsEmpty", "IsNotEmpty"],
  },
];

export const getFieldById = (id: string): FieldDefinition | undefined => {
  return contactFields.find((field) => field.id === id);
};

export const getOperatorDisplayName = (operator: SegmentRule["operator"]): string => {
  return pascalCaseToDisplayText(operator).toLowerCase();
};

export const getFieldDisplayName = (fieldId: string): string => {
  const field = getFieldById(fieldId);
  return field ? field.name : pascalCaseToDisplayText(fieldId);
};
