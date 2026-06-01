"use client";

import { memo } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    type DataSchema,
    type LogicalOperator,
    type QueryNode,
    type QueryOperator,
    type QueryValue,
} from "@/features/query-builder";
import { QueryRule } from "./query-rule";
import { getChildSummary, getRuleSummary } from "./query-builder-helpers";

type SelectedNodeEditorProps = {
    node: QueryNode;
    rootGroupId: string;
    schema: DataSchema;
    onSelectNode: (nodeId: string) => void;
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

function getLogicClass(combinator: LogicalOperator) {
    return combinator === "AND" ? "logic-and" : "logic-or";
}

function SelectedNodeEditorComponent({
    node,
    rootGroupId,
    schema,
    onSelectNode,
    onAddRule,
    onAddGroup,
    onRemoveNode,
    onRuleFieldChange,
    onRuleOperatorChange,
    onRuleValueChange,
    onGroupCombinatorChange,
    onToggleCollapsed,
}: SelectedNodeEditorProps) {
    if (node.type === "rule") {
        const summary = getRuleSummary(node, schema);

        return (
            <section
                data-testid="selected-rule-editor"
                className="liquid-readable flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl"
            >
                <div className="border-b border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold tracking-tight">
                                Editing Rule
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {summary.fieldLabel} · {summary.operatorLabel}
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="button-primary"
                            onClick={() => onSelectNode(rootGroupId)}
                        >
                            Back to root
                        </Button>
                    </div>
                </div>

                <div className="min-w-0 p-4">
                    <QueryRule
                        rule={node}
                        schema={schema}
                        onFieldChange={onRuleFieldChange}
                        onOperatorChange={onRuleOperatorChange}
                        onValueChange={onRuleValueChange}
                        onRemove={onRemoveNode}
                    />
                </div>
            </section>
        );
    }

    return (
        <section
            data-testid="selected-group-editor"
            className="liquid-readable flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl"
        >
            <div className="border-b border-border p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold tracking-tight">
                                    Editing: {" "}
                                    {node.id === rootGroupId
                                        ? "Root group"
                                        : "Nested group"}
                                </p>

                                <Badge variant="outline" className={getLogicClass(node.combinator)}>
                                    {node.combinator}
                                </Badge>
                                <Badge variant="outline" className="accent-primary-soft">
                                    {getChildSummary(node.children)}
                                </Badge>
                            </div>

                            <p className="max-w-md text-sm leading-6 text-muted-foreground">
                                This panel edits only the selected group. Use the tree on
                                the left to inspect or select child rules and nested groups.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                data-testid="add-rule-button"
                                className="button-primary"
                                onClick={() => onAddRule(node.id)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Rule
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                data-testid="add-group-button"
                                className="button-primary"
                                onClick={() => onAddGroup(node.id)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Group
                            </Button>

                            {node.id !== rootGroupId && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="button-danger"
                                    onClick={() => onRemoveNode(node.id)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-5 p-4">
                <div className={`rounded-xl border px-3 py-2 ${getLogicClass(node.combinator)}`}>
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">Logic operator</p>

                        <Select
                            name={`${node.id}-combinator`}
                            value={node.combinator}
                            onValueChange={(value) =>
                                onGroupCombinatorChange(
                                    node.id,
                                    value as LogicalOperator,
                                )
                            }
                        >
                            <SelectTrigger className="h-8 w-[88px] bg-background/50">
                                <SelectValue />
                            </SelectTrigger>

                            <SelectContent
                                position="popper"
                                align="end"
                                className="w-[88px] min-w-[88px]"
                            >
                                <SelectItem value="AND">AND</SelectItem>
                                <SelectItem value="OR">OR</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-background/50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium">Group summary</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {getChildSummary(node.children)}
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={node.collapsed ? "button-success" : "button-primary"}
                            onClick={() => onToggleCollapsed(node.id)}
                        >
                            {node.collapsed ? (
                                <ChevronRight className="mr-2 h-4 w-4" />
                            ) : (
                                <ChevronDown className="mr-2 h-4 w-4" />
                            )}
                            {node.collapsed ? "Expand group" : "Collapse group"}
                        </Button>
                    </div>
                </div>

                <div className="accent-primary-soft rounded-2xl border border-dashed p-4 text-sm leading-6">
                    Select a rule or nested group from the Query Structure tree to edit
                    it here. The form stays focused, so deep nesting will not crush inputs.
                </div>
            </div>
        </section>
    );
}

export const SelectedNodeEditor = memo(SelectedNodeEditorComponent);
