"use client";

import { memo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    type DataSchema,
    type LogicalOperator,
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

function getLogicBadgeClass(combinator: LogicalOperator) {
    return combinator === "AND" ? "logic-and" : "logic-or";
}

function getLineClass(combinator: LogicalOperator) {
    return combinator === "AND" ? "tree-line-and" : "tree-line-or";
}

function getChildIndentClass(depth: number) {
    if (depth >= 5) {
        return "ml-0.5 pl-1.5";
    }

    if (depth >= 3) {
        return "ml-1 pl-1.5";
    }

    return "ml-2 pl-2";
}

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
    const connectorClass =
        node.type === "group"
            ? node.combinator === "AND"
                ? "tree-connector-and"
                : "tree-connector-or"
            : "tree-connector-neutral";

    const treeConnectorClass = hasConnector
        ? `relative before:absolute before:left-[-0.75rem] before:top-1/2 before:h-px before:w-3 before:border-t ${connectorClass}`
        : "relative";

    const selectedClass = isSelected
        ? "border-l-2 selected-node"
        : "border-l-2 border-transparent transition-colors hover:border-border hover:bg-muted/25";

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
                        className={`min-w-[680px] rounded-xl px-2 py-1.5 text-left ${selectedClass}`}
                        onClick={() => onSelectNode(node.id)}
                    >
                        <div className="grid min-w-[640px] grid-cols-[180px_150px_260px] items-center gap-4 text-sm">
                            <span className="whitespace-nowrap font-medium">
                                {summary.fieldLabel}
                            </span>

                            <span className="whitespace-nowrap text-muted-foreground">
                                {summary.operatorLabel}
                            </span>

                            <span className={value === "No value" ? "whitespace-nowrap text-muted-foreground" : "whitespace-nowrap text-foreground"}>
                                {value}
                            </span>
                        </div>
                    </button>
                </SortableQueryNode>
            </div>
        );
    }

    const groupLineClass = getLineClass(node.combinator);

    return (
        <div className="relative min-w-max">
            <div className={treeConnectorClass}>
                <SortableQueryNode id={node.id} parentGroupId={parentGroupId}>
                    <div className={`tree-group-heading min-w-[680px] rounded-xl px-2 py-1.5 ${selectedClass}`}>
                        <div className="flex min-w-[640px] items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon-xs"
                                aria-label={
                                    node.collapsed ? "Expand group" : "Collapse group"
                                }
                                className={`${getLogicBadgeClass(node.combinator)} shrink-0`}
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
                                data-testid="query-tree-group"
                                aria-label="Edit nested group"
                                className="flex min-w-max flex-1 items-center gap-2 text-left"
                                onClick={() => onSelectNode(node.id)}
                            >
                                <Badge
                                    variant="outline"
                                    className={`shrink-0 ${getLogicBadgeClass(node.combinator)}`}
                                >
                                    {node.combinator}
                                </Badge>

                                <span className="whitespace-nowrap text-sm font-medium">
                                    Nested group
                                </span>

                                <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
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
                    <div className={`relative min-w-max space-y-1 border-l ${groupLineClass} ${getChildIndentClass(depth)}`}>
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
