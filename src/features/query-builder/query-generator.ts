import { getFieldByName } from "./schemas";
import type {
    DataSchema,
    GroupNode,
    QueryNode,
    QueryOperator,
    QueryValue,
    RuleNode,
} from "./types";

export type MongoQueryValue =
    | string
    | number
    | boolean
    | null
    | string[]
    | number[]
    | {
        $eq?: string | number | boolean | null;
        $ne?: string | number | boolean | null;
        $regex?: string;
        $options?: string;
        $gt?: string | number;
        $lt?: string | number;
        $gte?: string | number;
        $lte?: string | number;
        $in?: string[] | number[];
        $exists?: boolean;
    };

export type MongoQuery = Record<string, MongoQueryValue | MongoQuery[]>;

function isRangeValue(
    value: QueryValue,
): value is { from: string | number; to: string | number } {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        "from" in value &&
        "to" in value
    );
}

function normalizeNumberValue(value: QueryValue) {
    if (typeof value === "number") {
        return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);

        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }

    return value;
}

function normalizeValue(value: QueryValue, fieldType: DataSchema["fields"][number]["type"]) {
    if (Array.isArray(value) && fieldType === "number") {
        return value
            .map((item) => Number(item))
            .filter((item) => !Number.isNaN(item));
    }

    if (fieldType === "number") {
        return normalizeNumberValue(value);
    }

    return value;
}

function generateRuleQuery(rule: RuleNode, schema: DataSchema): MongoQuery {
    const field = getFieldByName(schema, rule.field);

    if (!field) {
        return {};
    }

    const value = normalizeValue(rule.value, field.type);

    switch (rule.operator) {
        case "equals":
            return {
                [rule.field]: {
                    $eq: value as string | number | boolean | null,
                },
            };

        case "notEquals":
            return {
                [rule.field]: {
                    $ne: value as string | number | boolean | null,
                },
            };

        case "contains":
            return {
                [rule.field]: {
                    $regex: String(value),
                    $options: "i",
                },
            };

        case "startsWith":
            return {
                [rule.field]: {
                    $regex: `^${String(value)}`,
                    $options: "i",
                },
            };

        case "greaterThan":
            return {
                [rule.field]: {
                    $gt: value as string | number,
                },
            };

        case "lessThan":
            return {
                [rule.field]: {
                    $lt: value as string | number,
                },
            };

        case "inArray":
            return {
                [rule.field]: {
                    $in: Array.isArray(value) ? (value as string[] | number[]) : [],
                },
            };

        case "between": {
            const rangeValue = isRangeValue(value) ? value : { from: "", to: "" };
            const fromValue =
                field.type === "number" ? Number(rangeValue.from) : rangeValue.from;
            const toValue = field.type === "number" ? Number(rangeValue.to) : rangeValue.to;

            return {
                [rule.field]: {
                    $gte: fromValue,
                    $lte: toValue,
                },
            };
        }

        case "regex":
            return {
                [rule.field]: {
                    $regex: String(value),
                    $options: "i",
                },
            };

        case "isNull":
            return {
                [rule.field]: {
                    $eq: null,
                },
            };

        case "isNotNull":
            return {
                [rule.field]: {
                    $ne: null,
                },
            };

        case "before":
            return {
                [rule.field]: {
                    $lt: value as string | number,
                },
            };

        case "after":
            return {
                [rule.field]: {
                    $gt: value as string | number,
                },
            };

        default:
            return {};
    }
}

export function generateMongoQuery(node: QueryNode, schema: DataSchema): MongoQuery {
    if (node.type === "rule") {
        return generateRuleQuery(node, schema);
    }

    const childQueries = node.children.map((child) =>
        generateMongoQuery(child, schema),
    );

    if (childQueries.length === 0) {
        return {};
    }

    const mongoCombinator = node.combinator === "AND" ? "$and" : "$or";

    return {
        [mongoCombinator]: childQueries,
    };
}

export function formatMongoQueryPreview(queryTree: GroupNode, schema: DataSchema) {
    return JSON.stringify(generateMongoQuery(queryTree, schema), null, 2);
}