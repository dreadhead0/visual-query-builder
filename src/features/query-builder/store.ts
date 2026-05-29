import { create } from "zustand";

import {
    DATA_SCHEMAS,
    DEFAULT_SCHEMA_ID,
    getSchemaById,
} from "./schemas";
import {
    addChildToGroup,
    createNestedGroupForSchema,
    createRuleForSchema,
    moveNodeInTree,
    removeNodeFromTree,
    toggleGroupCollapsed,
    updateGroupCombinator,
    updateNodeInTree,
    updateRuleField,
    updateRuleOperator,
    updateRuleValue,
} from "./store-utils";
import { createInitialQueryTree } from "./node-factory";
import type {
    DataSchema,
    GroupNode,
    LogicalOperator,
    QueryOperator,
    QueryValue,
    RuleNode,
} from "./types";

type QueryBuilderState = {
    schemas: DataSchema[];
    activeSchemaId: string;
    queryTree: GroupNode;
};

type QueryBuilderActions = {
    setActiveSchema: (schemaId: string) => void;
    resetQuery: () => void;
    addRule: (parentGroupId: string) => void;
    addGroup: (parentGroupId: string) => void;
    removeNode: (nodeId: string) => void;
    updateRuleField: (ruleId: string, fieldName: string) => void;
    updateRuleOperator: (ruleId: string, operator: QueryOperator) => void;
    updateRuleValue: (ruleId: string, value: QueryValue) => void;
    updateGroupCombinator: (
        groupId: string,
        combinator: LogicalOperator,
    ) => void;
    toggleGroupCollapsed: (groupId: string) => void;
    moveNode: (activeId: string, overId: string) => void;
};

type QueryBuilderStore = QueryBuilderState & QueryBuilderActions;

function getActiveSchema(schemaId: string) {
    return getSchemaById(schemaId) ?? DATA_SCHEMAS[0];
}

const initialSchema = getActiveSchema(DEFAULT_SCHEMA_ID);

export const useQueryBuilderStore = create<QueryBuilderStore>((set, get) => ({
    schemas: DATA_SCHEMAS,
    activeSchemaId: initialSchema.id,
    queryTree: createInitialQueryTree(initialSchema),

    setActiveSchema: (schemaId) => {
        const nextSchema = getActiveSchema(schemaId);

        set({
            activeSchemaId: nextSchema.id,
            queryTree: createInitialQueryTree(nextSchema),
        });
    },

    resetQuery: () => {
        const activeSchema = getActiveSchema(get().activeSchemaId);

        set({
            queryTree: createInitialQueryTree(activeSchema),
        });
    },

    addRule: (parentGroupId) => {
        const activeSchema = getActiveSchema(get().activeSchemaId);
        const rule = createRuleForSchema(activeSchema);

        set((state) => ({
            queryTree: addChildToGroup(state.queryTree, {
                parentGroupId,
                child: rule,
            }) as GroupNode,
        }));
    },

    addGroup: (parentGroupId) => {
        const activeSchema = getActiveSchema(get().activeSchemaId);
        const group = createNestedGroupForSchema(activeSchema);

        set((state) => ({
            queryTree: addChildToGroup(state.queryTree, {
                parentGroupId,
                child: group,
            }) as GroupNode,
        }));
    },

    removeNode: (nodeId) => {
        if (nodeId === get().queryTree.id) {
            return;
        }

        set((state) => ({
            queryTree: removeNodeFromTree(state.queryTree, nodeId) as GroupNode,
        }));
    },

    updateRuleField: (ruleId, fieldName) => {
        const activeSchema = getActiveSchema(get().activeSchemaId);

        set((state) => ({
            queryTree: updateNodeInTree(state.queryTree, {
                targetId: ruleId,
                update: (node) => {
                    if (node.type !== "rule") {
                        return node;
                    }

                    return updateRuleField(node, activeSchema, fieldName);
                },
            }) as GroupNode,
        }));
    },

    updateRuleOperator: (ruleId, operator) => {
        const activeSchema = getActiveSchema(get().activeSchemaId);

        set((state) => ({
            queryTree: updateNodeInTree(state.queryTree, {
                targetId: ruleId,
                update: (node) => {
                    if (node.type !== "rule") {
                        return node;
                    }

                    return updateRuleOperator(node, activeSchema, operator);
                },
            }) as GroupNode,
        }));
    },

    updateRuleValue: (ruleId, value) => {
        set((state) => ({
            queryTree: updateNodeInTree(state.queryTree, {
                targetId: ruleId,
                update: (node) => {
                    if (node.type !== "rule") {
                        return node;
                    }

                    return updateRuleValue(node, value);
                },
            }) as GroupNode,
        }));
    },

    updateGroupCombinator: (groupId, combinator) => {
        set((state) => ({
            queryTree: updateNodeInTree(state.queryTree, {
                targetId: groupId,
                update: (node) => {
                    if (node.type !== "group") {
                        return node;
                    }

                    return updateGroupCombinator(node, combinator);
                },
            }) as GroupNode,
        }));
    },

    toggleGroupCollapsed: (groupId) => {
        set((state) => ({
            queryTree: updateNodeInTree(state.queryTree, {
                targetId: groupId,
                update: (node) => {
                    if (node.type !== "group") {
                        return node;
                    }

                    return toggleGroupCollapsed(node);
                },
            }) as GroupNode,
        }));
    },

    moveNode: (activeId, overId) => {
        set((state) => ({
            queryTree: moveNodeInTree(state.queryTree, {
                activeId,
                overId,
            }),
        }));
    },
}));

export function selectActiveSchema(state: QueryBuilderStore) {
    return getActiveSchema(state.activeSchemaId);
}

export function selectQueryTree(state: QueryBuilderStore) {
    return state.queryTree;
}

export function selectSchemas(state: QueryBuilderStore) {
    return state.schemas;
}