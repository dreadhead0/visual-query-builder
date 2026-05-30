import { getFieldByName } from "./schemas";
import type { MockRecord } from "./mock-data";
import type {
    DataSchema,
    GroupNode,
    QueryNode,
    QueryOperator,
    QueryValue,
    RuleNode,
} from "./types";

export type SortDirection = "asc" | "desc";

export type QueryExecutionResult = {
    records: MockRecord[];
    total: number;
};

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

type ComparableValue = string | number | boolean | null | undefined;

function normalizeComparableValue(value: unknown): ComparableValue {
    if (typeof value === "number") {
        return value;
    }

    if (typeof value === "boolean") {
        return value;
    }

    if (value === null || value === undefined) {
        return value;
    }

    if (typeof value === "string") {
        const numericValue = Number(value);

        if (value.trim() !== "" && !Number.isNaN(numericValue)) {
            return numericValue;
        }

        return value.toLowerCase();
    }

    return String(value).toLowerCase();
}

function compareValues(
    recordValue: MockRecord[string],
    operator: QueryOperator,
    queryValue: QueryValue,
) {
    switch (operator) {
        case "equals":
            return String(recordValue).toLowerCase() === String(queryValue).toLowerCase();

        case "notEquals":
            return String(recordValue).toLowerCase() !== String(queryValue).toLowerCase();

        case "contains":
            return String(recordValue).toLowerCase().includes(String(queryValue).toLowerCase());

        case "startsWith":
            return String(recordValue).toLowerCase().startsWith(String(queryValue).toLowerCase());

        case "greaterThan":
            return Number(recordValue) > Number(queryValue);

        case "lessThan":
            return Number(recordValue) < Number(queryValue);

        case "inArray":
            return Array.isArray(queryValue)
                ? queryValue
                    .map((item) => String(item).toLowerCase())
                    .includes(String(recordValue).toLowerCase())
                : false;

        case "between": {
            if (!isRangeValue(queryValue)) {
                return false;
            }

            const normalizedRecordValue = normalizeComparableValue(recordValue);
            const normalizedFrom = normalizeComparableValue(queryValue.from);
            const normalizedTo = normalizeComparableValue(queryValue.to);

            if (
                normalizedRecordValue === null ||
                normalizedRecordValue === undefined ||
                normalizedFrom === null ||
                normalizedFrom === undefined ||
                normalizedTo === null ||
                normalizedTo === undefined
            ) {
                return false;
            }

            return (
                normalizedRecordValue >= normalizedFrom &&
                normalizedRecordValue <= normalizedTo
            );
        }

        case "regex": {
            try {
                return new RegExp(String(queryValue), "i").test(String(recordValue));
            } catch {
                return false;
            }
        }

        case "isNull":
            return recordValue === null || recordValue === undefined;

        case "isNotNull":
            return recordValue !== null && recordValue !== undefined;

        case "before":
            return Date.parse(String(recordValue)) < Date.parse(String(queryValue));

        case "after":
            return Date.parse(String(recordValue)) > Date.parse(String(queryValue));

        default:
            return false;
    }
}

function doesRuleMatchRecord(
    rule: RuleNode,
    schema: DataSchema,
    record: MockRecord,
) {
    const field = getFieldByName(schema, rule.field);

    if (!field) {
        return false;
    }

    const recordValue = record[rule.field];

    return compareValues(recordValue, rule.operator, rule.value);
}

function doesNodeMatchRecord(
    node: QueryNode,
    schema: DataSchema,
    record: MockRecord,
): boolean {
    if (node.type === "rule") {
        return doesRuleMatchRecord(node, schema, record);
    }

    if (node.children.length === 0) {
        return false;
    }

    if (node.combinator === "AND") {
        return node.children.every((child) =>
            doesNodeMatchRecord(child, schema, record),
        );
    }

    return node.children.some((child) =>
        doesNodeMatchRecord(child, schema, record),
    );
}

function sortRecords(
    records: MockRecord[],
    sortField: string | null,
    sortDirection: SortDirection,
) {
    if (!sortField) {
        return records;
    }

    return [...records].sort((first, second) => {
        const firstValue = normalizeComparableValue(first[sortField]);
        const secondValue = normalizeComparableValue(second[sortField]);

        if (firstValue === secondValue) {
            return 0;
        }

        if (firstValue === null || firstValue === undefined) {
            return sortDirection === "asc" ? 1 : -1;
        }

        if (secondValue === null || secondValue === undefined) {
            return sortDirection === "asc" ? -1 : 1;
        }

        if (firstValue > secondValue) {
            return sortDirection === "asc" ? 1 : -1;
        }

        return sortDirection === "asc" ? -1 : 1;
    });
}

export function executeQueryTree({
    queryTree,
    schema,
    records,
    sortField,
    sortDirection,
}: {
    queryTree: GroupNode;
    schema: DataSchema;
    records: MockRecord[];
    sortField: string | null;
    sortDirection: SortDirection;
}): QueryExecutionResult {
    const filteredRecords = records.filter((record) =>
        doesNodeMatchRecord(queryTree, schema, record),
    );

    const sortedRecords = sortRecords(filteredRecords, sortField, sortDirection);

    return {
        records: sortedRecords,
        total: sortedRecords.length,
    };
}