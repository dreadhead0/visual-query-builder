export type FieldType = "string" | "number" | "boolean" | "date" | "enum";

export type LogicalOperator = "AND" | "OR";

export type QueryOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "startsWith"
  | "greaterThan"
  | "lessThan"
  | "inArray"
  | "between"
  | "regex"
  | "isNull"
  | "isNotNull"
  | "before"
  | "after";

export type QueryNodeType = "rule" | "group";

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | Array<string | number>
  | {
      from: string | number;
      to: string | number;
    };

export type SchemaField = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
};

export type DataSchema = {
  id: string;
  label: string;
  description: string;
  fields: SchemaField[];
};

export type RuleNode = {
  id: string;
  type: "rule";
  field: string;
  operator: QueryOperator;
  value: QueryValue;
};

export type GroupNode = {
  id: string;
  type: "group";
  combinator: LogicalOperator;
  collapsed: boolean;
  children: QueryNode[];
};

export type QueryNode = RuleNode | GroupNode;

export type QueryTree = GroupNode;

export type SavedQueryPreset = {
  id: string;
  name: string;
  schemaId: string;
  queryTree: QueryTree;
  createdAt: string;
};

export type QueryHistoryEntry = {
  id: string;
  schemaId: string;
  queryTree: QueryTree;
  executedAt: string;
};