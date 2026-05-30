"use client";

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
import {
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { QueryGroup } from "./query-group";

export function QueryBuilder() {
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

        reorderChildren(
            activeParentGroupId,
            String(active.id),
            String(over.id),
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-medium">Query Builder Canvas</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Build nested rules using field, operator, and value controls.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{totalGroups} groups</Badge>
                    <Badge variant="outline">{totalRules} rules</Badge>
                    <Badge variant="outline">Depth {treeDepth}</Badge>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <QueryGroup
                    group={queryTree}
                    schema={activeSchema}
                    isRoot
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
        </div>
    );
}