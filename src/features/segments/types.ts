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
