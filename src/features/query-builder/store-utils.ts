import { createGroupNode, createRuleNode } from "./node-factory";
import { getFieldByName } from "./schemas";
import { arrayMove } from "@dnd-kit/sortable";
import type {
    DataSchema,
    GroupNode,
    LogicalOperator,
    QueryNode,
    QueryOperator,
    QueryValue,
    RuleNode,
} from "./types";

type UpdateNodeOptions = {
    targetId: string;
    update: (node: QueryNode) => QueryNode;
};

type AddChildOptions = {
    parentGroupId: string;
    child: QueryNode;
};

type MoveNodeOptions = {
    activeId: string;
    overId: string;
};

type ReorderChildrenOptions = {
    parentGroupId: string;
    activeId: string;
    overId: string;
};

function getDefaultValueForFieldAndOperator(
    fieldType: DataSchema["fields"][number]["type"],
    operator: QueryOperator,
): QueryValue {
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

    if (fieldType === "boolean") {
        return true;
    }

    return "";
}

export function updateNodeInTree(
    node: QueryNode,
    options: UpdateNodeOptions,
): QueryNode {
    if (node.id === options.targetId) {
        return options.update(node);
    }

    if (node.type === "rule") {
        return node;
    }

    return {
        ...node,
        children: node.children.map((child) => updateNodeInTree(child, options)),
    };
}

export function addChildToGroup(
    node: QueryNode,
    options: AddChildOptions,
): QueryNode {
    if (node.type === "rule") {
        return node;
    }

    if (node.id === options.parentGroupId) {
        return {
            ...node,
            children: [...node.children, options.child],
        };
    }

    return {
        ...node,
        children: node.children.map((child) => addChildToGroup(child, options)),
    };
}

export function removeNodeFromTree(
    node: QueryNode,
    targetId: string,
): QueryNode {
    if (node.type === "rule") {
        return node;
    }

    return {
        ...node,
        children: node.children
            .filter((child) => child.id !== targetId)
            .map((child) => removeNodeFromTree(child, targetId)),
    };
}

export function reorderChildrenInGroup(
    node: QueryNode,
    options: ReorderChildrenOptions,
): QueryNode {
    if (node.type === "rule") {
        return node;
    }

    if (node.id === options.parentGroupId) {
        const oldIndex = node.children.findIndex(
            (child) => child.id === options.activeId,
        );
        const newIndex = node.children.findIndex(
            (child) => child.id === options.overId,
        );

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
            return node;
        }

        return {
            ...node,
            children: arrayMove(node.children, oldIndex, newIndex),
        };
    }

    return {
        ...node,
        children: node.children.map((child) =>
            reorderChildrenInGroup(child, options),
        ),
    };
}

export function updateRuleField(
    rule: RuleNode,
    schema: DataSchema,
    fieldName: string,
): RuleNode {
    const nextField = getFieldByName(schema, fieldName);

    if (!nextField) {
        return rule;
    }

    return {
        ...rule,
        field: nextField.name,
        operator: "equals",
        value: getDefaultValueForFieldAndOperator(nextField.type, "equals"),
    };
}

export function updateRuleOperator(
    rule: RuleNode,
    schema: DataSchema,
    operator: QueryOperator,
): RuleNode {
    const field = getFieldByName(schema, rule.field);

    if (!field) {
        return rule;
    }

    return {
        ...rule,
        operator,
        value: getDefaultValueForFieldAndOperator(field.type, operator),
    };
}

export function updateRuleValue(rule: RuleNode, value: QueryValue): RuleNode {
    return {
        ...rule,
        value,
    };
}

export function updateGroupCombinator(
    group: GroupNode,
    combinator: LogicalOperator,
): GroupNode {
    return {
        ...group,
        combinator,
    };
}

export function toggleGroupCollapsed(group: GroupNode): GroupNode {
    return {
        ...group,
        collapsed: !group.collapsed,
    };
}

export function createRuleForSchema(schema: DataSchema): RuleNode {
    return createRuleNode(schema);
}

export function createNestedGroupForSchema(schema: DataSchema): GroupNode {
    return createGroupNode("AND", [createRuleNode(schema)]);
}

function removeNodeAndReturnRemoved(
    node: QueryNode,
    targetId: string,
): { tree: QueryNode; removedNode: QueryNode | null } {
    if (node.type === "rule") {
        return {
            tree: node,
            removedNode: null,
        };
    }

    let removedNode: QueryNode | null = null;

    const nextChildren = node.children
        .filter((child) => {
            if (child.id === targetId) {
                removedNode = child;
                return false;
            }

            return true;
        })
        .map((child) => {
            const result = removeNodeAndReturnRemoved(child, targetId);

            if (result.removedNode) {
                removedNode = result.removedNode;
            }

            return result.tree;
        });

    return {
        tree: {
            ...node,
            children: nextChildren,
        },
        removedNode,
    };
}

function insertNodeAfterTarget(
    node: QueryNode,
    targetId: string,
    nodeToInsert: QueryNode,
): QueryNode {
    if (node.type === "rule") {
        return node;
    }

    const nextChildren = node.children.flatMap((child) => {
        if (child.id === targetId) {
            return [child, nodeToInsert];
        }

        return [insertNodeAfterTarget(child, targetId, nodeToInsert)];
    });

    return {
        ...node,
        children: nextChildren,
    };
}

export function moveNodeInTree(
    tree: GroupNode,
    options: MoveNodeOptions,
): GroupNode {
    if (options.activeId === tree.id || options.activeId === options.overId) {
        return tree;
    }

    const removalResult = removeNodeAndReturnRemoved(tree, options.activeId);

    if (!removalResult.removedNode) {
        return tree;
    }

    const movedTree = insertNodeAfterTarget(
        removalResult.tree,
        options.overId,
        removalResult.removedNode,
    );

    return movedTree as GroupNode;
}