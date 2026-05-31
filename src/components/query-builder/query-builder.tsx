"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
    ChevronDown,
    ChevronRight,
    FolderTree,
    Plus,
    Trash2,
} from "lucide-react";

import {
    countGroups,
    countRules,
    findNodeById,
    getFieldByName,
    getOperatorDefinition,
    getTreeDepth,
    selectActiveSchema,
    selectQueryTree,
    useQueryBuilderStore,
    type DataSchema,
    type GroupNode,
    type LogicalOperator,
    type QueryNode,
    type QueryOperator,
    type QueryValue,
    type RuleNode,
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
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SortableQueryNode } from "./sortable-query-node";
import { QueryRule } from "./query-rule";

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

type QueryTreeItemProps = {
    node: QueryNode;
    parentGroupId: string;
    selectedNodeId: string;
    depth?: number;
    onSelectNode: (nodeId: string) => void;
    onToggleCollapsed: (groupId: string) => void;
};

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

function getChildSummary(children: QueryNode[]) {
    const ruleCount = children.filter((child) => child.type === "rule").length;
    const groupCount = children.filter((child) => child.type === "group").length;

    return `${ruleCount} rule${ruleCount === 1 ? "" : "s"}, ${groupCount} group${groupCount === 1 ? "" : "s"
        }`;
}

function getRuleSummary(rule: RuleNode, schema: DataSchema) {
    const field = getFieldByName(schema, rule.field);
    const operator = getOperatorDefinition(rule.operator);

    return {
        fieldLabel: field?.label ?? rule.field,
        operatorLabel: operator?.label ?? rule.operator,
    };
}

function getReadableRuleValue(rule: RuleNode) {
    if (Array.isArray(rule.value)) {
        return rule.value.join(", ") || "No value";
    }

    if (typeof rule.value === "object" && rule.value !== null) {
        if ("from" in rule.value && "to" in rule.value) {
            return `${String(rule.value.from)} → ${String(rule.value.to)}`;
        }

        return "Range value";
    }

    return String(rule.value ?? "No value") || "No value";
}

function getNodeLabel(node: QueryNode, schema: DataSchema, isRoot = false) {
    if (node.type === "group") {
        return isRoot ? "Root" : "Nested group";
    }

    return getRuleSummary(node, schema).fieldLabel;
}

function getNodePath(root: GroupNode, targetId: string, schema: DataSchema) {
    const path: string[] = [];

    function walk(node: QueryNode, isRoot = false): boolean {
        path.push(getNodeLabel(node, schema, isRoot));

        if (node.id === targetId) {
            return true;
        }

        if (node.type === "group") {
            for (const child of node.children) {
                if (walk(child)) {
                    return true;
                }
            }
        }

        path.pop();
        return false;
    }

    walk(root, true);

    return path;
}

function findFirstRuleId(node: QueryNode): string | null {
    if (node.type === "rule") {
        return node.id;
    }

    for (const child of node.children) {
        const ruleId = findFirstRuleId(child);

        if (ruleId) {
            return ruleId;
        }
    }

    return null;
}

function QueryTreeItem({
    node,
    parentGroupId,
    selectedNodeId,
    depth = 0,
    onSelectNode,
    onToggleCollapsed,
}: QueryTreeItemProps) {
    const activeSchema = useQueryBuilderStore(selectActiveSchema);
    const isSelected = node.id === selectedNodeId;
    const hasConnector = depth > 0;

    const treeConnectorClass = hasConnector
        ? "relative before:absolute before:left-[-0.75rem] before:top-1/2 before:h-px before:w-3 before:bg-border"
        : "relative";

    if (node.type === "rule") {
        const summary = getRuleSummary(node, activeSchema);
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

function SelectedNodeEditor({
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

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const totalRules = countRules(queryTree);
    const totalGroups = Math.max(0, countGroups(queryTree) - 1);
    const treeDepth = getTreeDepth(queryTree);
    const firstRuleId = findFirstRuleId(queryTree);
    const selectedCandidate = selectedNodeId
        ? findNodeById(queryTree, selectedNodeId)
        : null;
    const selectedNode = selectedCandidate ?? findNodeById(queryTree, firstRuleId ?? "") ?? queryTree;
    const selectedPath = useMemo(
        () => getNodePath(queryTree, selectedNode.id, activeSchema),
        [activeSchema, queryTree, selectedNode.id],
    );
    function handleSelectNode(nodeId: string) {
        setSelectedNodeId(nodeId);
    }

    function handleRemoveNode(nodeId: string) {
        removeNode(nodeId);

        if (selectedNode.id === nodeId) {
            setSelectedNodeId(queryTree.id);
        }
    }

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
                        Use the tree to navigate nested logic, then edit the selected
                        group or rule in the editor panel.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                        {totalGroups} nested group{totalGroups === 1 ? "" : "s"}
                    </Badge>
                    <Badge variant="outline">{totalRules} rules</Badge>
                    <Badge variant="outline">Depth {treeDepth}</Badge>
                </div>
            </div>

            <div className="grid min-h-[560px] min-w-0 gap-4 xl:grid-cols-[minmax(520px,1.35fr)_minmax(360px,0.85fr)]">
                <section className="flex min-h-0 min-w-0 flex-col rounded-2xl border border-border bg-background/40">
                    <div className="border-b border-border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <FolderTree className="h-4 w-4" />
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
                                onClick={() => setSelectedNodeId(queryTree.id)}
                            >
                                Root
                            </Button>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-auto p-3">
                        <div className="min-w-[620px]">
                        <button
                            type="button"
                            className={
                                selectedNode.id === queryTree.id
                                    ? "mb-3 flex w-full min-w-0 items-center gap-2 border-l-2 border-primary bg-primary/10 px-2 py-2 text-left"
                                    : "mb-3 flex w-full min-w-0 items-center gap-2 border-l-2 border-transparent px-2 py-2 text-left transition-colors hover:border-border hover:bg-muted/25"
                            }
                            onClick={() => setSelectedNodeId(queryTree.id)}
                        >
                            <Badge variant="default" className="shrink-0">
                                {queryTree.combinator}
                            </Badge>

                            <span className="truncate font-medium">Root group</span>

                            <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                                {getChildSummary(queryTree.children)}
                            </span>
                        </button>

                        {isDndReady ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
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
                                                selectedNodeId={selectedNode.id}
                                                onSelectNode={handleSelectNode}
                                                onToggleCollapsed={toggleGroupCollapsed}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <div className="min-w-0 space-y-1">
                                {queryTree.children.map((child) => (
                                    <QueryTreeItem
                                        key={child.id}
                                        node={child}
                                        parentGroupId={queryTree.id}
                                        selectedNodeId={selectedNode.id}
                                        onSelectNode={handleSelectNode}
                                        onToggleCollapsed={toggleGroupCollapsed}
                                    />
                                ))}
                            </div>
                        )}
                        </div>
                    </div>
                </section>

                <div className="min-h-0 min-w-0 overflow-hidden space-y-3">
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