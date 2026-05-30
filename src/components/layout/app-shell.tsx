"use client";

import { useEffect, useState } from "react";

import {
    DataSourcePanel,
    QueryBuilder,
    QueryJsonActions,
    QueryLibrary,
    QueryPreview,
    QueryResults,
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
    const [executedQueryTree, setExecutedQueryTree] = useState<GroupNode | null>(
        null,
    );
    const [executedSchema, setExecutedSchema] = useState<DataSchema | null>(null);

    const activeSchema = useQueryBuilderStore(selectActiveSchema);
    const queryTree = useQueryBuilderStore(selectQueryTree);
    const resetQuery = useQueryBuilderStore((state) => state.resetQuery);
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

    function resetExecutionState() {
        setRunId(0);
        setIsRunning(false);
        setExecutedQueryTree(null);
        setExecutedSchema(null);
    }

    function handleResetQuery() {
        resetQuery();
        resetExecutionState();
    }

    function handleRunQuery() {
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
    }

    function handleSchemaChange() {
        resetExecutionState();
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
                <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <Badge variant="secondary" className="w-fit">
                            Stage 8 Project
                        </Badge>

                        <div className="space-y-1">
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Visual Query Builder
                            </h1>

                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                                Build complex database and API filters visually using rules,
                                nested groups, live previews, validation, and simulated query
                                execution.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <QueryJsonActions onImportSuccess={resetExecutionState} />

                        <Button variant="outline" onClick={handleResetQuery}>
                            Reset
                        </Button>

                        <Button
                            disabled={!validation.isValid || isRunning}
                            onClick={handleRunQuery}
                        >
                            {isRunning ? "Running..." : "Run Query"}
                        </Button>
                    </div>
                </header>

                <div className="grid flex-1 gap-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)_360px]">
                    <DataSourcePanel onSchemaChange={handleSchemaChange} />

                    <section className="rounded-lg border border-border bg-card p-4">
                        <QueryBuilder />
                    </section>

                    <aside className="space-y-4 rounded-lg border border-border bg-card p-4">
                        <QueryPreview />
                        <ValidationPanel />
                    </aside>
                </div>

                <QueryLibrary onLoadQuery={resetExecutionState} />

                <QueryResults
                    runId={runId}
                    isRunning={isRunning}
                    executedQueryTree={executedQueryTree}
                    executedSchema={executedSchema}
                />
            </section>
        </main>
    );
}