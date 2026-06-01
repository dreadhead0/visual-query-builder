"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import {
    DataSourceBar,
    KeyboardShortcutsDialog,
    QueryBuilder,
    QueryJsonActions,
    QueryLibrary,
    QueryPreview,
    QueryResults,
    useKeyboardShortcuts,
    ValidationPanel,
} from "@/components/query-builder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    selectActiveSchema,
    selectQueryTree,
    useQueryBuilderStore,
    validateQueryTree,
    type DataSchema,
    type GroupNode,
} from "@/features/query-builder";

export function AppShell() {
    const [runId, setRunId] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
    const [executedQueryTree, setExecutedQueryTree] = useState<GroupNode | null>(
        null,
    );
    const [executedSchema, setExecutedSchema] = useState<DataSchema | null>(null);

    const activeSchema = useQueryBuilderStore(selectActiveSchema);
    const queryTree = useQueryBuilderStore(selectQueryTree);
    const resetQuery = useQueryBuilderStore((state) => state.resetQuery);
    const addRootRule = useQueryBuilderStore((state) => state.addRule);
    const addRootGroup = useQueryBuilderStore((state) => state.addGroup);
    const hydrateStoredQueries = useQueryBuilderStore(
        (state) => state.hydrateStoredQueries,
    );
    const recordQueryExecution = useQueryBuilderStore(
        (state) => state.recordQueryExecution,
    );

    const validation = validateQueryTree(queryTree, activeSchema);

    useEffect(() => {
        hydrateStoredQueries();
    }, [hydrateStoredQueries]);

    const resetExecutionState = useCallback(() => {
        setRunId(0);
        setIsRunning(false);
        setExecutedQueryTree(null);
        setExecutedSchema(null);
    }, []);

    const handleResetQuery = useCallback(() => {
        resetQuery();
        resetExecutionState();
    }, [resetExecutionState, resetQuery]);

    const handleRunQuery = useCallback(() => {
        if (!validation.isValid) {
            return;
        }

        const querySnapshot = structuredClone(queryTree);
        const schemaSnapshot = structuredClone(activeSchema);

        setIsRunning(true);

        window.setTimeout(() => {
            setExecutedQueryTree(querySnapshot);
            setExecutedSchema(schemaSnapshot);
            recordQueryExecution();
            setRunId((current) => current + 1);
            setIsRunning(false);
        }, 450);
    }, [activeSchema, queryTree, recordQueryExecution, validation.isValid]);

    const handleSchemaChange = useCallback(() => {
        resetExecutionState();
    }, [resetExecutionState]);

    const handleAddRootRule = useCallback(() => {
        addRootRule(queryTree.id);
    }, [addRootRule, queryTree.id]);

    const handleAddRootGroup = useCallback(() => {
        addRootGroup(queryTree.id);
    }, [addRootGroup, queryTree.id]);

    const handleOpenShortcuts = useCallback(() => {
        setIsShortcutsOpen(true);
    }, []);

    useKeyboardShortcuts({
        onRunQuery: handleRunQuery,
        onResetQuery: handleResetQuery,
        onAddRootRule: handleAddRootRule,
        onAddRootGroup: handleAddRootGroup,
        onOpenShortcuts: handleOpenShortcuts,
    });

    return (
        <main className="min-h-screen bg-background text-foreground">
            <section className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-3 py-4 sm:px-5 lg:px-8">
                <header className="liquid-shell rounded-[2rem] p-4 sm:p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Landing
                                    </Link>
                                </Button>

                                <Badge
                                    variant="outline"
                                    className="min-h-7 rounded-full border border-[#2f2f2f] bg-transparent px-3 py-1.5 text-xs text-foreground hover:bg-transparent"
                                >
                                    QueryNest Workspace
                                </Badge>

                                <Badge
                                    variant="outline"
                                    className="min-h-7 rounded-full border border-[#2f2f2f] bg-transparent px-3 py-1.5 text-xs text-foreground hover:bg-transparent"
                                >
                                    Visual Query Builder
                                </Badge>

                                <Badge
                                    variant="outline"
                                    className="min-h-7 rounded-full border border-[#2f2f2f] bg-transparent px-3 py-1.5 text-xs text-foreground hover:bg-transparent"
                                >
                                    {activeSchema.label} schema
                                </Badge>
                            </div>

                            <div>
                                <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                                    QueryNest
                                </h1>

                                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                                    A visual query builder for nesting filters, previewing JSON,
                                    validating inputs, and running mock records.
                                </p>
                            </div>
                        </div>

                        <div className="liquid-panel rounded-3xl p-3">
                            <div className="flex flex-wrap gap-2 xl:justify-end">
                                <QueryJsonActions onImportSuccess={resetExecutionState} />
                                <ThemeToggle />

                                <Button
                                    variant="outline"
                                    className="accent-action"
                                    onClick={handleOpenShortcuts}
                                >
                                    Shortcuts
                                </Button>

                                <Button
                                    variant="outline"
                                    className="button-neutral !text-[color:var(--accent-warning)] hover:!text-[color:var(--accent-warning)]"
                                    onClick={handleResetQuery}
                                >
                                    Reset
                                </Button>
                            </div>

                            <div className="mt-3 flex flex-col items-start gap-2 text-left">
                                <Button
                                    size="lg"
                                    className="accent-cta w-full max-w-[230px] justify-center"
                                    disabled={!validation.isValid || isRunning}
                                    onClick={handleRunQuery}
                                >
                                    <Play className="mr-2 h-4 w-4" />
                                    {isRunning ? "Running query..." : "Run Query"}
                                </Button>

                                <p className="max-w-[280px] text-left text-xs leading-5 text-muted-foreground">
                                    The run button unlocks once every rule is valid.
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid gap-4 py-5">
                    <DataSourceBar onSchemaChange={handleSchemaChange} />

                    <div className="grid min-h-[620px] gap-4 xl:grid-cols-[minmax(0,1fr)_365px] 2xl:grid-cols-[minmax(0,1fr)_385px]">
                        <section className="liquid-panel min-w-0 rounded-[1.75rem] p-4">
                            <QueryBuilder />
                        </section>

                        <aside className="liquid-panel space-y-4 rounded-[1.75rem] p-3 xl:sticky xl:top-4 xl:self-start 2xl:p-4">
                            <QueryPreview />
                            <ValidationPanel />
                        </aside>
                    </div>
                </div>

                <div className="grid gap-4 pb-6">
                    <QueryLibrary onLoadQuery={resetExecutionState} />

                    <QueryResults
                        runId={runId}
                        isRunning={isRunning}
                        executedQueryTree={executedQueryTree}
                        executedSchema={executedSchema}
                    />
                </div>

                <KeyboardShortcutsDialog
                    open={isShortcutsOpen}
                    onOpenChange={setIsShortcutsOpen}
                />
            </section>
        </main>
    );
}