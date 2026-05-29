import type { FieldType, QueryOperator } from "./types";

export type OperatorDefinition = {
  value: QueryOperator;
  label: string;
  supportedFieldTypes: FieldType[];
  requiresValue: boolean;
};

export const OPERATOR_DEFINITIONS: OperatorDefinition[] = [
  {
    value: "equals",
    label: "Equals",
    supportedFieldTypes: ["string", "number", "boolean", "date", "enum"],
    requiresValue: true,
  },
  {
    value: "notEquals",
    label: "Not equals",
    supportedFieldTypes: ["string", "number", "boolean", "date", "enum"],
    requiresValue: true,
  },
  {
    value: "contains",
    label: "Contains",
    supportedFieldTypes: ["string"],
    requiresValue: true,
  },
  {
    value: "startsWith",
    label: "Starts with",
    supportedFieldTypes: ["string"],
    requiresValue: true,
  },
  {
    value: "greaterThan",
    label: "Greater than",
    supportedFieldTypes: ["number"],
    requiresValue: true,
  },
  {
    value: "lessThan",
    label: "Less than",
    supportedFieldTypes: ["number"],
    requiresValue: true,
  },
  {
    value: "inArray",
    label: "In array",
    supportedFieldTypes: ["string", "number", "enum"],
    requiresValue: true,
  },
  {
    value: "between",
    label: "Between",
    supportedFieldTypes: ["number", "date"],
    requiresValue: true,
  },
  {
    value: "regex",
    label: "Regex",
    supportedFieldTypes: ["string"],
    requiresValue: true,
  },
  {
    value: "isNull",
    label: "Is null",
    supportedFieldTypes: ["string", "number", "boolean", "date", "enum"],
    requiresValue: false,
  },
  {
    value: "isNotNull",
    label: "Is not null",
    supportedFieldTypes: ["string", "number", "boolean", "date", "enum"],
    requiresValue: false,
  },
  {
    value: "before",
    label: "Before",
    supportedFieldTypes: ["date"],
    requiresValue: true,
  },
  {
    value: "after",
    label: "After",
    supportedFieldTypes: ["date"],
    requiresValue: true,
  },
];

export function getOperatorsForFieldType(fieldType: FieldType) {
  return OPERATOR_DEFINITIONS.filter((operator) =>
    operator.supportedFieldTypes.includes(fieldType),
  );
}

export function isOperatorAllowedForFieldType(
  operator: QueryOperator,
  fieldType: FieldType,
) {
  return getOperatorsForFieldType(fieldType).some(
    (item) => item.value === operator,
  );
}

export function getOperatorDefinition(operator: QueryOperator) {
  return OPERATOR_DEFINITIONS.find((item) => item.value === operator);
}