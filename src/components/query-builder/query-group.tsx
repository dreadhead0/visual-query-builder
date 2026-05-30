"use client";

import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { SortableQueryNode } from "./sortable-query-node";

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
import { QueryRule } from "./query-rule";

type QueryGroupProps = {
    group: GroupNode;
    schema: DataSchema;
    depth?: number;
    isRoot?: boolean;
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

    return (
        <div
            className="rounded-lg border border-border bg-card"
            style={{ marginLeft: depth > 0 ? 16 : 0 }}
        >
            <div className="flex flex-col gap-3 border-b border-border p-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
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

                    <Select
                        value={group.combinator}
                        onValueChange={(value) =>
                            onGroupCombinatorChange(group.id, value as LogicalOperator)
                        }
                    >
                        <SelectTrigger className="w-[110px]">
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                    </Select>

                    <span className="text-sm text-muted-foreground">{childSummary}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onAddRule(group.id)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Rule
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
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
                            onClick={() => onRemoveNode(group.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                        </Button>
                    )}
                </div>
            </div>

            {!group.collapsed && (
                <div className="space-y-3 p-3">
                    {group.children.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                            This group is empty. Add a rule or nested group to continue.
                        </div>
                    ) : (
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
                                        {child.type === "rule" ? (
                                            <QueryRule
                                                rule={child}
                                                schema={schema}
                                                onFieldChange={onRuleFieldChange}
                                                onOperatorChange={onRuleOperatorChange}
                                                onValueChange={onRuleValueChange}
                                                onRemove={onRemoveNode}
                                            />
                                        ) : (
                                            <QueryGroup
                                                group={child}
                                                schema={schema}
                                                depth={depth + 1}
                                                onAddRule={onAddRule}
                                                onAddGroup={onAddGroup}
                                                onRemoveNode={onRemoveNode}
                                                onRuleFieldChange={onRuleFieldChange}
                                                onRuleOperatorChange={onRuleOperatorChange}
                                                onRuleValueChange={onRuleValueChange}
                                                onGroupCombinatorChange={onGroupCombinatorChange}
                                                onToggleCollapsed={onToggleCollapsed}
                                            />
                                        )}
                                    </SortableQueryNode>
                                ))}
                            </div>
                        </SortableContext>
                    )}
                </div>
            )}
        </div>
    );
}