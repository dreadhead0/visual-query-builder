import type { GroupNode, QueryNode, RuleNode } from "./types";

export function isGroupNode(node: QueryNode): node is GroupNode {
    return node.type === "group";
}

export function isRuleNode(node: QueryNode): node is RuleNode {
    return node.type === "rule";
}

export function countNodes(node: QueryNode): number {
    if (isRuleNode(node)) {
        return 1;
    }

    return 1 + node.children.reduce((total, child) => total + countNodes(child), 0);
}

export function countRules(node: QueryNode): number {
    if (isRuleNode(node)) {
        return 1;
    }

    return node.children.reduce((total, child) => total + countRules(child), 0);
}

export function countGroups(node: QueryNode): number {
    if (isRuleNode(node)) {
        return 0;
    }

    return (
        1 + node.children.reduce((total, child) => total + countGroups(child), 0)
    );
}

export function getTreeDepth(node: QueryNode): number {
    if (isRuleNode(node)) {
        return 1;
    }

    if (node.children.length === 0) {
        return 1;
    }

    return 1 + Math.max(...node.children.map((child) => getTreeDepth(child)));
}

export function findNodeById(node: QueryNode, nodeId: string): QueryNode | null {
    if (node.id === nodeId) {
        return node;
    }

    if (isRuleNode(node)) {
        return null;
    }

    for (const child of node.children) {
        const match = findNodeById(child, nodeId);

        if (match) {
            return match;
        }
    }

    return null;
}