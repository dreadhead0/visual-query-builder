"use client";

import { memo } from "react";
import { Plus, Trash2 } from "lucide-react";

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
                className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-background/40"
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
            className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-background/40"
        >
            <div className="border-b border-border p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold tracking-tight">
                                    Editing:{" "}
                                    {node.id === rootGroupId
                                        ? "Root group"
                                        : "Nested group"}
                                </p>

                                <Badge variant="secondary">{node.combinator}</Badge>
                                <Badge variant="outline">
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
                <div className="rounded-xl border border-border bg-background/40 px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-muted-foreground">
                            Logic
                        </p>

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
                            <SelectTrigger className="h-8 w-[88px]">
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
                            onClick={() => onToggleCollapsed(node.id)}
                        >
                            {node.collapsed ? "Expand group" : "Collapse group"}
                        </Button>
                    </div>
                </div>

                <div className="rounded-2xl border border-dashed border-border bg-background/30 p-4 text-sm leading-6 text-muted-foreground">
                    Select a rule or nested group from the Query Structure tree to edit
                    it here. This keeps the editor focused and prevents repeated forms
                    from crowding the workspace.
                </div>
            </div>
        </section>
    );
}

export const SelectedNodeEditor = memo(SelectedNodeEditorComponent);
