"use client";

import { memo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    type DataSchema,
    type QueryNode,
} from "@/features/query-builder";
import { SortableQueryNode } from "./sortable-query-node";
import {
    getChildSummary,
    getReadableRuleValue,
    getRuleSummary,
} from "./query-builder-helpers";

type QueryTreeItemProps = {
    node: QueryNode;
    parentGroupId: string;
    schema: DataSchema;
    selectedNodeId: string;
    depth?: number;
    onSelectNode: (nodeId: string) => void;
    onToggleCollapsed: (groupId: string) => void;
};

function QueryTreeItemComponent({
    node,
    parentGroupId,
    schema,
    selectedNodeId,
    depth = 0,
    onSelectNode,
    onToggleCollapsed,
}: QueryTreeItemProps) {
    const isSelected = node.id === selectedNodeId;
    const hasConnector = depth > 0;

    const treeConnectorClass = hasConnector
        ? "relative before:absolute before:left-[-0.75rem] before:top-1/2 before:h-px before:w-3 before:bg-border"
        : "relative";

    if (node.type === "rule") {
        const summary = getRuleSummary(node, schema);
        const value = getReadableRuleValue(node);

        return (
            <div className={treeConnectorClass}>
                <SortableQueryNode id={node.id} parentGroupId={parentGroupId}>
                    <button
                        type="button"
                        data-testid="query-tree-rule"
                        aria-label={`Edit rule ${summary.fieldLabel}`}
                        className={
                            isSelected
                                ? "w-full border-l-2 border-primary bg-primary/10 px-2 py-1.5 text-left"
                                : "w-full border-l-2 border-transparent px-2 py-1.5 text-left transition-colors hover:border-border hover:bg-muted/25"
                        }
                        onClick={() => onSelectNode(node.id)}
                    >
                        <div className="grid min-w-0 gap-2 text-sm sm:grid-cols-[minmax(120px,1fr)_minmax(90px,0.65fr)_minmax(120px,1fr)] sm:items-center">
                            <span className="truncate font-medium">
                                {summary.fieldLabel}
                            </span>

                            <span className="truncate text-muted-foreground">
                                {summary.operatorLabel}
                            </span>

                            <span className="truncate text-muted-foreground">
                                {value}
                            </span>
                        </div>
                    </button>
                </SortableQueryNode>
            </div>
        );
    }

    return (
        <div className="relative min-w-0">
            <div className={treeConnectorClass}>
                <SortableQueryNode id={node.id} parentGroupId={parentGroupId}>
                    <div
                        className={
                            isSelected
                                ? "border-l-2 border-primary bg-primary/10 px-2 py-1.5"
                                : "border-l-2 border-transparent px-2 py-1.5 transition-colors hover:border-border hover:bg-muted/25"
                        }
                    >
                        <div className="flex min-w-0 items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                aria-label={
                                    node.collapsed ? "Expand group" : "Collapse group"
                                }
                                className="shrink-0"
                                onClick={() => onToggleCollapsed(node.id)}
                            >
                                {node.collapsed ? (
                                    <ChevronRight className="h-3 w-3" />
                                ) : (
                                    <ChevronDown className="h-3 w-3" />
                                )}
                            </Button>

                            <button
                                type="button"
                                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                onClick={() => onSelectNode(node.id)}
                            >
                                <Badge variant="secondary" className="shrink-0">
                                    {node.combinator}
                                </Badge>

                                <span className="truncate text-sm font-medium">
                                    Nested group
                                </span>

                                <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                                    {getChildSummary(node.children)}
                                </span>
                            </button>
                        </div>
                    </div>
                </SortableQueryNode>
            </div>

            {!node.collapsed && node.children.length > 0 && (
                <SortableContext
                    items={node.children.map((child) => child.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="relative ml-4 min-w-0 space-y-1 border-l border-border/70 pl-3">
                        {node.children.map((child) => (
                            <QueryTreeItem
                                key={child.id}
                                node={child}
                                parentGroupId={node.id}
                                schema={schema}
                                selectedNodeId={selectedNodeId}
                                depth={depth + 1}
                                onSelectNode={onSelectNode}
                                onToggleCollapsed={onToggleCollapsed}
                            />
                        ))}
                    </div>
                </SortableContext>
            )}
        </div>
    );
}

export const QueryTreeItem = memo(QueryTreeItemComponent);
