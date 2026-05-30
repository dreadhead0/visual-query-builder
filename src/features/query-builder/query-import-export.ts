import {
    getFieldByName,
    getSchemaById,
} from "./schemas";
import {
    getOperatorDefinition,
    isOperatorAllowedForFieldType,
} from "./operators";
import type {
    DataSchema,
    GroupNode,
    QueryNode,
    QueryOperator,
    QueryTree,
    QueryValue,
    RuleNode,
} from "./types";

const EXPORT_VERSION = 1;
const MAX_IMPORT_DEPTH = 12;
const MAX_IMPORT_NODES = 150;

export type ExportedQueryDocument = {
    version: typeof EXPORT_VERSION;
    schemaId: string;
    queryTree: QueryTree;
    exportedAt: string;
};

type ImportSuccessResult = {
    success: true;
    document: ExportedQueryDocument;
};

type ImportFailureResult = {
    success: false;
    error: string;
};

export type ImportQueryResult = ImportSuccessResult | ImportFailureResult;

type ImportValidationContext = {
    schema: DataSchema;
    seenIds: Set<string>;
    nodeCount: number;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
    return typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
    return typeof value === "boolean";
}

function isValidQueryOperator(value: unknown): value is QueryOperator {
    return isString(value) && Boolean(getOperatorDefinition(value as QueryOperator));
}

function isRangeValue(value: unknown): value is { from: string | number; to: string | number } {
    return (
        isPlainObject(value) &&
        ("from" in value) &&
        ("to" in value) &&
        (typeof value.from === "string" || typeof value.from === "number") &&
        (typeof value.to === "string" || typeof value.to === "number")
    );
}

function isValidQueryValue(value: unknown): value is QueryValue {
    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        value === null
    ) {
        return true;
    }

    if (Array.isArray(value)) {
        return value.every(
            (item) => typeof item === "string" || typeof item === "number",
        );
    }

    return isRangeValue(value);
}

function validateNodeId(
    nodeId: unknown,
    context: ImportValidationContext,
): string {
    if (!isString(nodeId) || nodeId.trim() === "") {
        throw new Error("Every imported rule and group must have a valid string id.");
    }

    if (context.seenIds.has(nodeId)) {
        throw new Error(`Duplicate node id found: ${nodeId}.`);
    }

    context.seenIds.add(nodeId);

    return nodeId;
}

function validateImportedRule(
    value: Record<string, unknown>,
    context: ImportValidationContext,
): RuleNode {
    const id = validateNodeId(value.id, context);

    if (value.type !== "rule") {
        throw new Error("Invalid rule node type.");
    }

    if (!isString(value.field) || value.field.trim() === "") {
        throw new Error("Every imported rule must have a valid field.");
    }

    const field = getFieldByName(context.schema, value.field);

    if (!field) {
        throw new Error(
            `The imported field "${value.field}" does not exist in the selected schema.`,
        );
    }

    if (!isValidQueryOperator(value.operator)) {
        throw new Error(`The imported operator "${String(value.operator)}" is not supported.`);
    }

    if (!isOperatorAllowedForFieldType(value.operator, field.type)) {
        throw new Error(
            `The imported operator "${value.operator}" cannot be used with ${field.type} fields.`,
        );
    }

    if (!isValidQueryValue(value.value)) {
        throw new Error("An imported rule contains an invalid value shape.");
    }

    return {
        id,
        type: "rule",
        field: field.name,
        operator: value.operator,
        value: value.value,
    };
}

function validateImportedGroup(
    value: Record<string, unknown>,
    context: ImportValidationContext,
    depth: number,
): GroupNode {
    const id = validateNodeId(value.id, context);

    if (value.type !== "group") {
        throw new Error("Invalid group node type.");
    }

    if (value.combinator !== "AND" && value.combinator !== "OR") {
        throw new Error("Every imported group must use either AND or OR.");
    }

    if (!isBoolean(value.collapsed)) {
        throw new Error("Every imported group must include a boolean collapsed value.");
    }

    if (!Array.isArray(value.children)) {
        throw new Error("Every imported group must contain a children array.");
    }

    if (depth > MAX_IMPORT_DEPTH) {
        throw new Error(`Imported query is too deeply nested. Maximum depth is ${MAX_IMPORT_DEPTH}.`);
    }

    return {
        id,
        type: "group",
        combinator: value.combinator,
        collapsed: value.collapsed,
        children: value.children.map((child) =>
            validateImportedQueryNode(child, context, depth + 1),
        ),
    };
}

function validateImportedQueryNode(
    value: unknown,
    context: ImportValidationContext,
    depth: number,
): QueryNode {
    context.nodeCount += 1;

    if (context.nodeCount > MAX_IMPORT_NODES) {
        throw new Error(`Imported query has too many nodes. Maximum allowed is ${MAX_IMPORT_NODES}.`);
    }

    if (!isPlainObject(value)) {
        throw new Error("Every imported query node must be an object.");
    }

    if (value.type === "rule") {
        return validateImportedRule(value, context);
    }

    if (value.type === "group") {
        return validateImportedGroup(value, context, depth);
    }

    throw new Error("Every imported query node must be either a rule or a group.");
}

export function createExportedQueryDocument(
    schemaId: string,
    queryTree: QueryTree,
): ExportedQueryDocument {
    return {
        version: EXPORT_VERSION,
        schemaId,
        queryTree,
        exportedAt: new Date().toISOString(),
    };
}

export function stringifyExportedQueryDocument(
    document: ExportedQueryDocument,
): string {
    return JSON.stringify(document, null, 2);
}

export function parseImportedQueryJson(rawJson: string): ImportQueryResult {
    try {
        const parsed = JSON.parse(rawJson) as unknown;

        if (!isPlainObject(parsed)) {
            return {
                success: false,
                error: "Imported JSON must be an object.",
            };
        }

        if (parsed.version !== EXPORT_VERSION) {
            return {
                success: false,
                error: `Unsupported import version. Expected version ${EXPORT_VERSION}.`,
            };
        }

        if (!isString(parsed.schemaId) || parsed.schemaId.trim() === "") {
            return {
                success: false,
                error: "Imported JSON must include a valid schemaId.",
            };
        }

        const schema = getSchemaById(parsed.schemaId);

        if (!schema) {
            return {
                success: false,
                error: `Unknown schemaId "${parsed.schemaId}".`,
            };
        }

        const context: ImportValidationContext = {
            schema,
            seenIds: new Set<string>(),
            nodeCount: 0,
        };

        const queryTree = validateImportedQueryNode(
            parsed.queryTree,
            context,
            1,
        );

        if (queryTree.type !== "group") {
            return {
                success: false,
                error: "Imported queryTree must be a group at the root.",
            };
        }

        return {
            success: true,
            document: {
                version: EXPORT_VERSION,
                schemaId: schema.id,
                queryTree,
                exportedAt: isString(parsed.exportedAt)
                    ? parsed.exportedAt
                    : new Date().toISOString(),
            },
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Imported JSON could not be parsed.",
        };
    }
}