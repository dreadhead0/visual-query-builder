import { getFieldByName } from "./schemas";
import { getOperatorDefinition, isOperatorAllowedForFieldType } from "./operators";
import type {
    DataSchema,
    FieldType,
    GroupNode,
    QueryNode,
    QueryOperator,
    QueryValue,
    RuleNode,
} from "./types";

export type ValidationSeverity = "error" | "warning";

export type ValidationIssue = {
    id: string;
    nodeId: string;
    severity: ValidationSeverity;
    message: string;
};

export type ValidationResult = {
    isValid: boolean;
    errors: ValidationIssue[];
    warnings: ValidationIssue[];
    issues: ValidationIssue[];
};

function createValidationIssue(
    nodeId: string,
    severity: ValidationSeverity,
    message: string,
): ValidationIssue {
    return {
        id: `${nodeId}_${severity}_${message}`,
        nodeId,
        severity,
        message,
    };
}

function isEmptyString(value: unknown) {
    return typeof value === "string" && value.trim() === "";
}

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

function isValueMissing(value: QueryValue, operator: QueryOperator) {
    if (operator === "isNull" || operator === "isNotNull") {
        return false;
    }

    if (Array.isArray(value)) {
        return value.length === 0;
    }

    if (isRangeValue(value)) {
        return isEmptyString(value.from) || isEmptyString(value.to);
    }

    return value === null || value === undefined || isEmptyString(value);
}

function isInvalidNumber(value: QueryValue) {
    if (typeof value === "number") {
        return Number.isNaN(value);
    }

    if (typeof value === "string") {
        return value.trim() !== "" && Number.isNaN(Number(value));
    }

    return false;
}

function isInvalidNumberRange(value: QueryValue) {
    if (!isRangeValue(value)) {
        return true;
    }

    const from = Number(value.from);
    const to = Number(value.to);

    if (Number.isNaN(from) || Number.isNaN(to)) {
        return true;
    }

    return from > to;
}

function isInvalidRegexPattern(value: QueryValue) {
    if (typeof value !== "string" || value.trim() === "") {
        return true;
    }

    try {
        new RegExp(value);
        return false;
    } catch {
        return true;
    }
}

function isInvalidDateValue(value: QueryValue) {
    if (typeof value !== "string") {
        return true;
    }

    return value.trim() === "" || Number.isNaN(Date.parse(value));
}

function isInvalidDateRange(value: QueryValue) {
    if (!isRangeValue(value)) {
        return true;
    }

    const from = String(value.from);
    const to = String(value.to);

    if (from.trim() === "" || to.trim() === "") {
        return true;
    }

    const fromTime = Date.parse(from);
    const toTime = Date.parse(to);

    if (Number.isNaN(fromTime) || Number.isNaN(toTime)) {
        return true;
    }

    return fromTime > toTime;
}

function validateValueForFieldType(
    nodeId: string,
    fieldType: FieldType,
    operator: QueryOperator,
    value: QueryValue,
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (isValueMissing(value, operator)) {
        issues.push(
            createValidationIssue(nodeId, "error", "This rule needs a value."),
        );

        return issues;
    }

    if (operator === "regex" && isInvalidRegexPattern(value)) {
        issues.push(
            createValidationIssue(
                nodeId,
                "error",
                "Enter a valid regular expression pattern.",
            ),
        );

        return issues;
    }

    if (fieldType === "number") {
        if (operator === "between") {
            if (isInvalidNumberRange(value)) {
                issues.push(
                    createValidationIssue(
                        nodeId,
                        "error",
                        "Enter a valid number range where the first value is not greater than the second.",
                    ),
                );
            }

            return issues;
        }

        if (operator === "inArray") {
            if (
                !Array.isArray(value) ||
                value.some((item) => Number.isNaN(Number(item)))
            ) {
                issues.push(
                    createValidationIssue(
                        nodeId,
                        "error",
                        "Enter a comma-separated list of valid numbers.",
                    ),
                );
            }

            return issues;
        }

        if (isInvalidNumber(value)) {
            issues.push(
                createValidationIssue(nodeId, "error", "Enter a valid number."),
            );
        }
    }

    if (fieldType === "date") {
        if (operator === "between") {
            if (isInvalidDateRange(value)) {
                issues.push(
                    createValidationIssue(
                        nodeId,
                        "error",
                        "Enter a valid date range where the start date is not after the end date.",
                    ),
                );
            }

            return issues;
        }

        if (operator === "before" || operator === "after" || operator === "equals" || operator === "notEquals") {
            if (isInvalidDateValue(value)) {
                issues.push(
                    createValidationIssue(nodeId, "error", "Enter a valid date."),
                );
            }
        }
    }

    if (fieldType === "enum") {
        if (Array.isArray(value)) {
            return issues;
        }

        if (typeof value !== "string") {
            issues.push(
                createValidationIssue(nodeId, "error", "Select a valid option."),
            );
        }
    }

    if (fieldType === "boolean" && typeof value !== "boolean") {
        issues.push(
            createValidationIssue(nodeId, "error", "Select either true or false."),
        );
    }

    return issues;
}

function validateRule(rule: RuleNode, schema: DataSchema): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const field = getFieldByName(schema, rule.field);

    if (!field) {
        return [
            createValidationIssue(
                rule.id,
                "error",
                `The field "${rule.field}" does not exist in the active schema.`,
            ),
        ];
    }

    const operatorDefinition = getOperatorDefinition(rule.operator);

    if (!operatorDefinition) {
        issues.push(
            createValidationIssue(
                rule.id,
                "error",
                `The operator "${rule.operator}" is not supported.`,
            ),
        );

        return issues;
    }

    if (!isOperatorAllowedForFieldType(rule.operator, field.type)) {
        issues.push(
            createValidationIssue(
                rule.id,
                "error",
                `"${operatorDefinition.label}" cannot be used with ${field.type} fields.`,
            ),
        );

        return issues;
    }

    issues.push(
        ...validateValueForFieldType(rule.id, field.type, rule.operator, rule.value),
    );

    return issues;
}

function validateGroup(group: GroupNode, schema: DataSchema): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (group.children.length === 0) {
        issues.push(
            createValidationIssue(
                group.id,
                "error",
                "This group is empty. Add at least one rule or nested group.",
            ),
        );
    }

    for (const child of group.children) {
        issues.push(...validateQueryNode(child, schema));
    }

    return issues;
}

function validateQueryNode(
    node: QueryNode,
    schema: DataSchema,
): ValidationIssue[] {
    if (node.type === "rule") {
        return validateRule(node, schema);
    }

    return validateGroup(node, schema);
}

export function validateQueryTree(
    queryTree: GroupNode,
    schema: DataSchema,
): ValidationResult {
    const issues = validateQueryNode(queryTree, schema);
    const errors = issues.filter((issue) => issue.severity === "error");
    const warnings = issues.filter((issue) => issue.severity === "warning");

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        issues,
    };
}