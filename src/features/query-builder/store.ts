import { create } from "zustand";

import {
    DATA_SCHEMAS,
    DEFAULT_SCHEMA_ID,
    getSchemaById,
} from "./schemas";
import {
    readQueryHistory,
    readSavedPresets,
    writeQueryHistory,
    writeSavedPresets,
} from "./storage";
import {
    addChildToGroup,
    createNestedGroupForSchema,
    createRuleForSchema,
    moveNodeInTree,
    removeNodeFromTree,
    reorderChildrenInGroup,
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
    QueryHistoryEntry,
    QueryOperator,
    QueryTree,
    QueryValue,
    SavedQueryPreset,
} from "./types";

type QueryBuilderState = {
    schemas: DataSchema[];
    activeSchemaId: string;
    queryTree: GroupNode;
    queryHistory: QueryHistoryEntry[];
    savedPresets: SavedQueryPreset[];
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

    reorderChildren: (
        parentGroupId: string,
        activeId: string,
        overId: string,
    ) => void;

    hydrateStoredQueries: () => void;
    recordQueryExecution: () => void;
    saveCurrentQueryAsPreset: (name: string) => void;
    loadQueryTree: (schemaId: string, queryTree: QueryTree) => void;
    deleteSavedPreset: (presetId: string) => void;
    clearQueryHistory: () => void;
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
    queryHistory: [],
    savedPresets: [],

    hydrateStoredQueries: () => {
        set({
            queryHistory: readQueryHistory(),
            savedPresets: readSavedPresets(),
        });
    },

    recordQueryExecution: () => {
        const state = get();

        const nextEntry: QueryHistoryEntry = {
            id: `history_${crypto.randomUUID()}`,
            schemaId: state.activeSchemaId,
            queryTree: state.queryTree,
            executedAt: new Date().toISOString(),
        };

        const nextHistory = [nextEntry, ...state.queryHistory].slice(0, 10);

        writeQueryHistory(nextHistory);

        set({
            queryHistory: nextHistory,
        });
    },

    saveCurrentQueryAsPreset: (name) => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        const state = get();

        const nextPreset: SavedQueryPreset = {
            id: `preset_${crypto.randomUUID()}`,
            name: trimmedName,
            schemaId: state.activeSchemaId,
            queryTree: state.queryTree,
            createdAt: new Date().toISOString(),
        };

        const nextPresets = [nextPreset, ...state.savedPresets];

        writeSavedPresets(nextPresets);

        set({
            savedPresets: nextPresets,
        });
    },

    loadQueryTree: (schemaId, queryTree) => {
        const nextSchema = getActiveSchema(schemaId);

        set({
            activeSchemaId: nextSchema.id,
            queryTree,
        });
    },

    deleteSavedPreset: (presetId) => {
        const nextPresets = get().savedPresets.filter(
            (preset) => preset.id !== presetId,
        );

        writeSavedPresets(nextPresets);

        set({
            savedPresets: nextPresets,
        });
    },

    clearQueryHistory: () => {
        writeQueryHistory([]);

        set({
            queryHistory: [],
        });
    },

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

    reorderChildren: (parentGroupId, activeId, overId) => {
        set((state) => ({
            queryTree: reorderChildrenInGroup(state.queryTree, {
                parentGroupId,
                activeId,
                overId,
            }) as GroupNode,
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

export function selectQueryHistory(state: QueryBuilderStore) {
    return state.queryHistory;
}

export function selectSavedPresets(state: QueryBuilderStore) {
    return state.savedPresets;
}