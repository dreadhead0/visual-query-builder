"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import type { DragEndEvent } from "@dnd-kit/core";

import {
    countGroups,
    countRules,
    findNodeById,
    getTreeDepth,
    selectActiveSchema,
    selectQueryTree,
    useQueryBuilderStore,
} from "@/features/query-builder";
import { Badge } from "@/components/ui/badge";
import { QueryStructureTree } from "./query-structure-tree";
import { SelectedNodeEditor } from "./selected-node-editor";
import { findFirstRuleId, getNodePath } from "./query-builder-helpers";

function subscribe() {
    return () => { };
}

function useIsMounted() {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
}

export function QueryBuilder() {
    const isDndReady = useIsMounted();
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const activeSchema = useQueryBuilderStore(selectActiveSchema);
    const queryTree = useQueryBuilderStore(selectQueryTree);

    const addRule = useQueryBuilderStore((state) => state.addRule);
    const addGroup = useQueryBuilderStore((state) => state.addGroup);
    const removeNode = useQueryBuilderStore((state) => state.removeNode);
    const updateRuleField = useQueryBuilderStore((state) => state.updateRuleField);
    const updateRuleOperator = useQueryBuilderStore(
        (state) => state.updateRuleOperator,
    );
    const updateRuleValue = useQueryBuilderStore((state) => state.updateRuleValue);
    const updateGroupCombinator = useQueryBuilderStore(
        (state) => state.updateGroupCombinator,
    );
    const toggleGroupCollapsed = useQueryBuilderStore(
        (state) => state.toggleGroupCollapsed,
    );
    const reorderChildren = useQueryBuilderStore((state) => state.reorderChildren);

    const treeStats = useMemo(
        () => ({
            totalRules: countRules(queryTree),
            totalGroups: Math.max(0, countGroups(queryTree) - 1),
            treeDepth: getTreeDepth(queryTree),
        }),
        [queryTree],
    );

    const firstRuleId = useMemo(() => findFirstRuleId(queryTree), [queryTree]);

    const selectedNode = useMemo(() => {
        const selectedCandidate = selectedNodeId
            ? findNodeById(queryTree, selectedNodeId)
            : null;

        return (
            selectedCandidate ??
            findNodeById(queryTree, firstRuleId ?? "") ??
            queryTree
        );
    }, [firstRuleId, queryTree, selectedNodeId]);

    const selectedPath = useMemo(
        () => getNodePath(queryTree, selectedNode.id, activeSchema),
        [activeSchema, queryTree, selectedNode.id],
    );

    const handleSelectNode = useCallback((nodeId: string) => {
        setSelectedNodeId(nodeId);
    }, []);

    const handleRemoveNode = useCallback(
        (nodeId: string) => {
            removeNode(nodeId);

            if (selectedNode.id === nodeId) {
                setSelectedNodeId(queryTree.id);
            }
        },
        [queryTree.id, removeNode, selectedNode.id],
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;

            if (!over || active.id === over.id) {
                return;
            }

            const activeParentGroupId = active.data.current?.parentGroupId;
            const overParentGroupId = over.data.current?.parentGroupId;

            if (
                typeof activeParentGroupId !== "string" ||
                typeof overParentGroupId !== "string"
            ) {
                return;
            }

            if (activeParentGroupId !== overParentGroupId) {
                return;
            }

            reorderChildren(activeParentGroupId, String(active.id), String(over.id));
        },
        [reorderChildren],
    );

    return (
        <div className="flex min-h-0 min-w-0 flex-col space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="max-w-xl">
                    <p className="text-sm font-semibold tracking-tight">
                        Query Builder Canvas
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Use the tree to navigate nested logic, then edit the selected
                        group or rule in the editor panel.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                        {treeStats.totalGroups} nested group
                        {treeStats.totalGroups === 1 ? "" : "s"}
                    </Badge>
                    <Badge variant="outline">{treeStats.totalRules} rules</Badge>
                    <Badge variant="outline">Depth {treeStats.treeDepth}</Badge>
                </div>
            </div>

            <div className="grid min-h-[560px] min-w-0 gap-4 xl:grid-cols-[minmax(520px,1.35fr)_minmax(360px,0.85fr)]">
                <QueryStructureTree
                    queryTree={queryTree}
                    schema={activeSchema}
                    selectedNodeId={selectedNode.id}
                    isDndReady={isDndReady}
                    onSelectNode={handleSelectNode}
                    onToggleCollapsed={toggleGroupCollapsed}
                    onDragEnd={handleDragEnd}
                />

                <div className="min-h-0 min-w-0 space-y-3 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm text-muted-foreground">
                        {selectedPath.map((item, index) => (
                            <span key={`${item}-${index}`} className="flex items-center gap-2">
                                {index > 0 && <span>/</span>}
                                <span
                                    className={
                                        index === selectedPath.length - 1
                                            ? "font-semibold text-foreground"
                                            : ""
                                    }
                                >
                                    {item}
                                </span>
                            </span>
                        ))}
                    </div>

                    <SelectedNodeEditor
                        node={selectedNode}
                        rootGroupId={queryTree.id}
                        schema={activeSchema}
                        onSelectNode={handleSelectNode}
                        onAddRule={addRule}
                        onAddGroup={addGroup}
                        onRemoveNode={handleRemoveNode}
                        onRuleFieldChange={updateRuleField}
                        onRuleOperatorChange={updateRuleOperator}
                        onRuleValueChange={updateRuleValue}
                        onGroupCombinatorChange={updateGroupCombinator}
                        onToggleCollapsed={toggleGroupCollapsed}
                    />
                </div>
            </div>
        </div>
    );
}
