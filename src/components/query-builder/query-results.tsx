"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, ChevronLeft, ChevronRight } from "lucide-react";

import {
    executeQueryTree,
    getMockDatasetBySchemaId,
    type DataSchema,
    type GroupNode,
    type MockRecord,
    type SortDirection,
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

const PAGE_SIZE = 5;

type QueryResultsProps = {
    runId: number;
    isRunning: boolean;
    executedQueryTree: GroupNode | null;
    executedSchema: DataSchema | null;
};

function formatCellValue(value: MockRecord[string]) {
    if (value === null || value === undefined) {
        return "—";
    }

    return String(value);
}

function getRecordKey(record: MockRecord, index: number) {
    const preferredKey =
        record.id ?? record.orderId ?? record.email ?? record.title ?? record.name;

    return preferredKey ? String(preferredKey) : `record-${index}`;
}

export function QueryResults({
    runId,
    isRunning,
    executedQueryTree,
    executedSchema,
}: QueryResultsProps) {
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [page, setPage] = useState(1);

    const dataset = executedSchema
        ? getMockDatasetBySchemaId(executedSchema.id)
        : null;

    const execution = useMemo(() => {
        if (!dataset || !executedQueryTree || !executedSchema || runId === 0) {
            return {
                records: [],
                total: 0,
            };
        }

        return executeQueryTree({
            queryTree: executedQueryTree,
            schema: executedSchema,
            records: dataset.records,
            sortField,
            sortDirection,
        });
    }, [
        dataset,
        executedQueryTree,
        executedSchema,
        runId,
        sortDirection,
        sortField,
    ]);

    const totalPages = Math.max(1, Math.ceil(execution.total / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);

    const paginatedRecords = execution.records.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE,
    );

    function handleSortFieldChange(fieldName: string) {
        setSortField(fieldName);
        setPage(1);
    }

    function handleToggleSortDirection() {
        setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    }

    if (isRunning) {
        return (
            <section className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-semibold tracking-tight">Execution Results</p>
                <div className="mt-3 rounded-xl border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
                    Running query against mock dataset...
                </div>
            </section>
        );
    }

    if (runId === 0) {
        return (
            <section className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-semibold tracking-tight">Execution Results</p>
                <div className="mt-3 rounded-xl border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
                    Build a valid query, then run it to inspect matching mock records here.
                </div>
            </section>
        );
    }

    return (
        <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-semibold tracking-tight">
                        Execution Results
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Showing records from the {executedSchema?.label} mock dataset.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{execution.total} results</Badge>

                    <Select
                        name="results-sort-field"
                        value={sortField ?? ""}
                        onValueChange={handleSortFieldChange}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Sort field" />
                        </SelectTrigger>

                        <SelectContent>
                            {executedSchema?.fields.map((field) => (
                                <SelectItem key={field.name} value={field.name}>
                                    {field.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleToggleSortDirection}
                    >
                        <ArrowDownUp className="mr-2 h-4 w-4" />
                        {sortDirection.toUpperCase()}
                    </Button>
                </div>
            </div>

            {execution.total === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-border bg-background p-6 text-sm leading-6 text-muted-foreground">
                    No records matched this query. Try loosening one of your filters.
                </div>
            ) : (
                <>
                    <div className="mt-4 overflow-x-auto rounded-xl border border-border">
                        <table className="w-full min-w-[720px] text-left text-sm">
                            <thead className="border-b border-border bg-background">
                                <tr>
                                    {executedSchema?.fields.map((field) => (
                                        <th
                                            key={field.name}
                                            className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                                        >
                                            {field.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedRecords.map((record, index) => (
                                    <tr
                                        key={getRecordKey(record, index)}
                                        className="border-b border-border transition-colors last:border-b-0 hover:bg-muted/40"
                                    >
                                        {executedSchema?.fields.map((field) => (
                                            <td key={field.name} className="px-3 py-3">
                                                {formatCellValue(record[field.name])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {safePage} of {totalPages}
                        </p>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={safePage === 1}
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Previous
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={safePage === totalPages}
                                onClick={() =>
                                    setPage((current) => Math.min(totalPages, current + 1))
                                }
                            >
                                Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}