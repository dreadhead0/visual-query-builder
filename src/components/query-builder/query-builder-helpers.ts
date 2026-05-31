import {
    getFieldByName,
    getOperatorDefinition,
    type DataSchema,
    type GroupNode,
    type QueryNode,
    type RuleNode,
} from "@/features/query-builder";

export function getChildSummary(children: QueryNode[]) {
    const ruleCount = children.filter((child) => child.type === "rule").length;
    const groupCount = children.filter((child) => child.type === "group").length;

    return `${ruleCount} rule${ruleCount === 1 ? "" : "s"}, ${groupCount} group${groupCount === 1 ? "" : "s"
        }`;
}

export function getRuleSummary(rule: RuleNode, schema: DataSchema) {
    const field = getFieldByName(schema, rule.field);
    const operator = getOperatorDefinition(rule.operator);

    return {
        fieldLabel: field?.label ?? rule.field,
        operatorLabel: operator?.label ?? rule.operator,
    };
}

export function getReadableRuleValue(rule: RuleNode) {
    if (Array.isArray(rule.value)) {
        return rule.value.join(", ") || "No value";
    }

    if (typeof rule.value === "object" && rule.value !== null) {
        if ("from" in rule.value && "to" in rule.value) {
            return `${String(rule.value.from)} → ${String(rule.value.to)}`;
        }

        return "Range value";
    }

    return String(rule.value ?? "No value") || "No value";
}

export function getNodeLabel(node: QueryNode, schema: DataSchema, isRoot = false) {
    if (node.type === "group") {
        return isRoot ? "Root" : "Nested group";
    }

    return getRuleSummary(node, schema).fieldLabel;
}

export function getNodePath(root: GroupNode, targetId: string, schema: DataSchema) {
    const path: string[] = [];

    function walk(node: QueryNode, isRoot = false): boolean {
        path.push(getNodeLabel(node, schema, isRoot));

        if (node.id === targetId) {
            return true;
        }

        if (node.type === "group") {
            for (const child of node.children) {
                if (walk(child)) {
                    return true;
                }
            }
        }

        path.pop();
        return false;
    }

    walk(root, true);

    return path;
}

export function findFirstRuleId(node: QueryNode): string | null {
    if (node.type === "rule") {
        return node.id;
    }

    for (const child of node.children) {
        const ruleId = findFirstRuleId(child);

        if (ruleId) {
            return ruleId;
        }
    }

    return null;
}
