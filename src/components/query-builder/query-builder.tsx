"use client";

import { useSyncExternalStore } from "react";

import {
    countGroups,
    countRules,
    getTreeDepth,
    selectActiveSchema,
    selectQueryTree,
    useQueryBuilderStore,
} from "@/features/query-builder";

import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    type DragEndEvent,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { QueryGroup } from "./query-group";

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

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const totalRules = countRules(queryTree);
    const totalGroups = countGroups(queryTree);
    const treeDepth = getTreeDepth(queryTree);

    function handleDragEnd(event: DragEndEvent) {
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
    }

    return (
        <div className="flex min-h-0 min-w-0 flex-col space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="max-w-xl">
                    <p className="text-sm font-semibold tracking-tight">
                        Query Builder Canvas
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Create rules and nest groups. Deep groups stay compact so the
                        builder remains usable.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{totalGroups} groups</Badge>
                    <Badge variant="outline">{totalRules} rules</Badge>
                    <Badge variant="outline">Depth {treeDepth}</Badge>
                </div>
            </div>

            <div className="liquid-surface min-w-0 overflow-hidden rounded-2xl p-3">
                <div className="max-h-[68vh] min-w-0 overflow-y-auto overflow-x-hidden pr-1">
                    {isDndReady ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <QueryGroup
                                group={queryTree}
                                schema={activeSchema}
                                isRoot
                                isSortable
                                onAddRule={addRule}
                                onAddGroup={addGroup}
                                onRemoveNode={removeNode}
                                onRuleFieldChange={updateRuleField}
                                onRuleOperatorChange={updateRuleOperator}
                                onRuleValueChange={updateRuleValue}
                                onGroupCombinatorChange={updateGroupCombinator}
                                onToggleCollapsed={toggleGroupCollapsed}
                            />
                        </DndContext>
                    ) : (
                        <QueryGroup
                            group={queryTree}
                            schema={activeSchema}
                            isRoot
                            isSortable={false}
                            onAddRule={addRule}
                            onAddGroup={addGroup}
                            onRemoveNode={removeNode}
                            onRuleFieldChange={updateRuleField}
                            onRuleOperatorChange={updateRuleOperator}
                            onRuleValueChange={updateRuleValue}
                            onGroupCombinatorChange={updateGroupCombinator}
                            onToggleCollapsed={toggleGroupCollapsed}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}