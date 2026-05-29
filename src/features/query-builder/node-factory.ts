import { getDefaultFieldForSchema } from "./schemas";
import type {
    DataSchema,
    GroupNode,
    LogicalOperator,
    QueryOperator,
    QueryValue,
    RuleNode,
} from "./types";

function createNodeId(prefix: "rule" | "group") {
    return `${prefix}_${crypto.randomUUID()}`;
}

function getDefaultValueForOperator(operator: QueryOperator): QueryValue {
    if (operator === "between") {
        return {
            from: "",
            to: "",
        };
    }

    if (operator === "inArray") {
        return [];
    }

    if (operator === "isNull" || operator === "isNotNull") {
        return null;
    }

    return "";
}

export function createRuleNode(schema: DataSchema): RuleNode {
    const defaultField = getDefaultFieldForSchema(schema);

    return {
        id: createNodeId("rule"),
        type: "rule",
        field: defaultField.name,
        operator: "equals",
        value: getDefaultValueForOperator("equals"),
    };
}

export function createGroupNode(
    combinator: LogicalOperator = "AND",
    children: GroupNode["children"] = [],
): GroupNode {
    return {
        id: createNodeId("group"),
        type: "group",
        combinator,
        collapsed: false,
        children,
    };
}

export function createInitialQueryTree(schema: DataSchema): GroupNode {
    return createGroupNode("AND", [createRuleNode(schema)]);
}