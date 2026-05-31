"use client";

import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { SortableQueryNode } from "./sortable-query-node";
import { QueryRule } from "./query-rule";

import type {
    DataSchema,
    GroupNode,
    LogicalOperator,
    QueryNode,
    QueryOperator,
    QueryValue,
} from "@/features/query-builder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type QueryGroupProps = {
    group: GroupNode;
    schema: DataSchema;
    depth?: number;
    isRoot?: boolean;
    isSortable?: boolean;
    onAddRule: (groupId: string) => void;
    onAddGroup: (groupId: string) => void;
    onRemoveNode: (nodeId: string) => void;
    onRuleFieldChange: (ruleId: string, fieldName: string) => void;
    onRuleOperatorChange: (ruleId: string, operator: QueryOperator) => void;
    onRuleValueChange: (ruleId: string, value: QueryValue) => void;
    onGroupCombinatorChange: (
        groupId: string,
        combinator: LogicalOperator,
    ) => void;
    onToggleCollapsed: (groupId: string) => void;
};

function getChildSummary(children: QueryNode[]) {
    const ruleCount = children.filter((child) => child.type === "rule").length;
    const groupCount = children.filter((child) => child.type === "group").length;

    return `${ruleCount} rule${ruleCount === 1 ? "" : "s"}, ${groupCount} group${groupCount === 1 ? "" : "s"
        }`;
}

export function QueryGroup({
    group,
    schema,
    depth = 0,
    isRoot = false,
    isSortable = true,
    onAddRule,
    onAddGroup,
    onRemoveNode,
    onRuleFieldChange,
    onRuleOperatorChange,
    onRuleValueChange,
    onGroupCombinatorChange,
    onToggleCollapsed,
}: QueryGroupProps) {
    const childSummary = getChildSummary(group.children);
    const isDeepGroup = depth >= 2;

    function renderChild(child: QueryNode) {
        if (child.type === "rule") {
            return (
                <QueryRule
                    rule={child}
                    schema={schema}
                    compact={isDeepGroup}
                    onFieldChange={onRuleFieldChange}
                    onOperatorChange={onRuleOperatorChange}
                    onValueChange={onRuleValueChange}
                    onRemove={onRemoveNode}
                />
            );
        }

        return (
            <QueryGroup
                group={child}
                schema={schema}
                depth={depth + 1}
                isSortable={isSortable}
                onAddRule={onAddRule}
                onAddGroup={onAddGroup}
                onRemoveNode={onRemoveNode}
                onRuleFieldChange={onRuleFieldChange}
                onRuleOperatorChange={onRuleOperatorChange}
                onRuleValueChange={onRuleValueChange}
                onGroupCombinatorChange={onGroupCombinatorChange}
                onToggleCollapsed={onToggleCollapsed}
            />
        );
    }

    const wrapperClassName = isDeepGroup
        ? "min-w-0 border-l border-border/70 pl-3"
        : "liquid-surface min-w-0 rounded-2xl transition-colors duration-200";

    const headerClassName = isDeepGroup
        ? "space-y-3 pb-3"
        : "space-y-3 border-b border-border p-3";

    const bodyClassName = isDeepGroup ? "space-y-2 pb-2" : "space-y-3 p-3";

    return (
        <div className={wrapperClassName} data-depth={depth}>
            <div className={headerClassName}>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={group.collapsed ? "Expand group" : "Collapse group"}
                        onClick={() => onToggleCollapsed(group.id)}
                    >
                        {group.collapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>

                    <Badge variant={isRoot ? "default" : "secondary"}>
                        {isRoot ? "Root group" : "Nested group"}
                    </Badge>

                    <Badge variant="outline">Depth {depth + 1}</Badge>

                    <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                        {childSummary}
                    </span>
                </div>

                <div className="grid min-w-0 gap-2 lg:grid-cols-[120px_minmax(0,1fr)]">
                    <Select
                        name={`${group.id}-combinator`}
                        value={group.combinator}
                        onValueChange={(value) =>
                            onGroupCombinatorChange(group.id, value as LogicalOperator)
                        }
                    >
                        <SelectTrigger className="h-9 w-[88px]">
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap xl:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            data-testid="add-rule-button"
                            className="w-full xl:w-auto"
                            onClick={() => onAddRule(group.id)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Rule
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            data-testid="add-group-button"
                            className="w-full xl:w-auto"
                            onClick={() => onAddGroup(group.id)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Group
                        </Button>

                        {!isRoot && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full sm:col-span-2 xl:w-auto"
                                onClick={() => onRemoveNode(group.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {!group.collapsed && (
                <div className={bodyClassName}>
                    {group.children.length === 0 ? (
                        <div className="liquid-readable rounded-xl border-dashed p-4 text-sm leading-6 text-muted-foreground">
                            This group is empty. Add at least one rule or nested group.
                        </div>
                    ) : isSortable ? (
                        <SortableContext
                            items={group.children.map((child) => child.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {group.children.map((child) => (
                                    <SortableQueryNode
                                        key={child.id}
                                        id={child.id}
                                        parentGroupId={group.id}
                                    >
                                        {renderChild(child)}
                                    </SortableQueryNode>
                                ))}
                            </div>
                        </SortableContext>
                    ) : (
                        <div className="space-y-3">
                            {group.children.map((child) => (
                                <div key={child.id}>{renderChild(child)}</div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}