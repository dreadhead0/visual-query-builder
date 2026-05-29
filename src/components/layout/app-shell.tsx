"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QueryBuilder, QueryPreview } from "@/components/query-builder";
import {
    selectActiveSchema,
    useQueryBuilderStore,
} from "@/features/query-builder";

export function AppShell() {
    const activeSchema = useQueryBuilderStore(selectActiveSchema);
    const resetQuery = useQueryBuilderStore((state) => state.resetQuery);

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
                        <Button variant="outline">Import JSON</Button>
                        <Button variant="outline">Save Preset</Button>
                        <Button variant="outline" onClick={resetQuery}>
                            Reset
                        </Button>
                        <Button>Run Query</Button>
                    </div>
                </header>

                <div className="grid flex-1 gap-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)_360px]">
                    <aside className="rounded-lg border border-border bg-card p-4">
                        <p className="text-sm font-medium">Data Source</p>

                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            The active schema is{" "}
                            <span className="font-medium">{activeSchema.label}</span>.
                        </p>

                        <div className="mt-4 space-y-2">
                            {activeSchema.fields.map((field) => (
                                <div
                                    key={field.name}
                                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                                >
                                    <span>{field.label}</span>
                                    <Badge variant="outline">{field.type}</Badge>
                                </div>
                            ))}
                        </div>
                    </aside>

                    <section className="rounded-lg border border-border bg-card p-4">
                        <QueryBuilder />
                    </section>

                    <aside className="rounded-lg border border-border bg-card p-4">
                        <QueryPreview />
                    </aside>
                </div>

                <section className="rounded-lg border border-border bg-card p-4">
                    <p className="text-sm font-medium">Execution Results</p>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Mock query results, result count, loading state, empty state,
                        pagination, and sorting will live here.
                    </p>
                </section>
            </section>
        </main>
    );
}