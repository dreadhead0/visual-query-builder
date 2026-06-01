"use client";

import { memo } from "react";
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
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FolderTree } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type DataSchema, type GroupNode } from "@/features/query-builder";
import { getChildSummary } from "./query-builder-helpers";
import { QueryTreeItem } from "./query-tree-item";

type QueryStructureTreeProps = {
    queryTree: GroupNode;
    schema: DataSchema;
    selectedNodeId: string;
    isDndReady: boolean;
    onSelectNode: (nodeId: string) => void;
    onToggleCollapsed: (groupId: string) => void;
    onDragEnd: (event: DragEndEvent) => void;
};

function QueryStructureTreeComponent({
    queryTree,
    schema,
    selectedNodeId,
    isDndReady,
    onSelectNode,
    onToggleCollapsed,
    onDragEnd,
}: QueryStructureTreeProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const treeContent = (
        <>
            <button
                type="button"
                className={
                    selectedNodeId === queryTree.id
                        ? "tree-group-heading selected-node mb-3 flex w-full min-w-0 items-center gap-2 rounded-xl border-l-2 px-2 py-2 text-left"
                        : "tree-group-heading mb-3 flex w-full min-w-0 items-center gap-2 rounded-xl border-l-2 border-transparent px-2 py-2 text-left transition-colors"
                }
                onClick={() => onSelectNode(queryTree.id)}
            >
                <Badge variant="outline" className="logic-and shrink-0">
                    {queryTree.combinator}
                </Badge>

                <span className="truncate font-medium">Root group</span>

                <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                    {getChildSummary(queryTree.children)}
                </span>
            </button>

            <SortableContext
                items={queryTree.children.map((child) => child.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="min-w-0 space-y-1">
                    {queryTree.children.map((child) => (
                        <QueryTreeItem
                            key={child.id}
                            node={child}
                            parentGroupId={queryTree.id}
                            schema={schema}
                            selectedNodeId={selectedNodeId}
                            onSelectNode={onSelectNode}
                            onToggleCollapsed={onToggleCollapsed}
                        />
                    ))}
                </div>
            </SortableContext>
        </>
    );

    return (
        <section className="flex min-h-0 min-w-0 flex-col rounded-2xl border border-border bg-background/40">
            <div className="border-b border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="accent-primary-soft flex h-8 w-8 items-center justify-center rounded-xl border">
                                <FolderTree className="h-4 w-4" />
                            </span>
                            <p className="text-sm font-semibold tracking-tight">
                                Query Structure
                            </p>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Select any node to edit it without horizontal overflow.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-full border border-[#333333] bg-transparent px-3 text-[color:var(--accent-primary)] hover:border-[#333333] hover:bg-transparent hover:text-[color:var(--accent-primary)]"
                        onClick={() => onSelectNode(queryTree.id)}
                    >
                        Root
                    </Button>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3">
                <div className="min-w-0">
                    {isDndReady ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={onDragEnd}
                        >
                            {treeContent}
                        </DndContext>
                    ) : (
                        treeContent
                    )}
                </div>
            </div>
        </section>
    );
}

export const QueryStructureTree = memo(QueryStructureTreeComponent);
