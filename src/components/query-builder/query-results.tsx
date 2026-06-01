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

const PAGE_SIZE = 25;
const ROW_HEIGHT = 48;
const VIRTUAL_CONTAINER_HEIGHT = 320;
const OVERSCAN = 4;

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
    const [scrollTop, setScrollTop] = useState(0);

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

    const virtualRowCount = paginatedRecords.length;
    const visibleRowCount = Math.ceil(VIRTUAL_CONTAINER_HEIGHT / ROW_HEIGHT);
    const startIndex = Math.max(
        0,
        Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN,
    );
    const endIndex = Math.min(
        virtualRowCount,
        startIndex + visibleRowCount + OVERSCAN * 2,
    );
    const virtualRecords = paginatedRecords.slice(startIndex, endIndex);
    const topSpacerHeight = startIndex * ROW_HEIGHT;
    const bottomSpacerHeight = Math.max(0, (virtualRowCount - endIndex) * ROW_HEIGHT);

    function handleSortFieldChange(fieldName: string) {
        setSortField(fieldName);
        setPage(1);
        setScrollTop(0);
    }

    function handleToggleSortDirection() {
        setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
        setScrollTop(0);
    }

    function handlePreviousPage() {
        setPage((current) => Math.max(1, current - 1));
        setScrollTop(0);
    }

    function handleNextPage() {
        setPage((current) => Math.min(totalPages, current + 1));
        setScrollTop(0);
    }

    if (isRunning) {
        return (
            <section className="liquid-panel rounded-[1.75rem] p-4">
                <p className="text-sm font-semibold tracking-tight">Execution Results</p>

                <div className="liquid-readable mt-3 rounded-2xl border-dashed p-6 text-sm text-muted-foreground">
                    Running query against mock dataset...
                </div>
            </section>
        );
    }

    if (runId === 0) {
        return (
            <section className="liquid-panel rounded-[1.75rem] p-4">
                <p className="text-sm font-semibold tracking-tight">Execution Results</p>

                <div className="liquid-readable mt-3 rounded-2xl border-dashed p-6 text-sm leading-6 text-muted-foreground">
                    Build a valid query, then run it to inspect matching mock records here.
                </div>
            </section>
        );
    }

    return (
        <section className="liquid-panel rounded-[1.75rem] p-4">
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
                    <Badge variant="outline" className="accent-primary-soft">{execution.total} results</Badge>
                    <Badge variant="outline" className="state-valid">Virtualized rows</Badge>

                    <Select
                        name="results-sort-field"
                        value={sortField ?? ""}
                        onValueChange={handleSortFieldChange}
                    >
                        <SelectTrigger className="accent-action w-[160px]">
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
                        className="accent-action"
                        onClick={handleToggleSortDirection}
                    >
                        <ArrowDownUp className="mr-2 h-4 w-4" />
                        {sortDirection.toUpperCase()}
                    </Button>
                </div>
            </div>

            {execution.total === 0 ? (
                <div className="liquid-readable mt-4 rounded-2xl border-dashed p-6 text-sm leading-6 text-muted-foreground">
                    No records matched this query. Try loosening one of your filters.
                </div>
            ) : (
                <>
                    <div className="liquid-readable mt-4 overflow-hidden rounded-2xl">
                        <div
                            className="max-h-[320px] overflow-auto"
                            onScroll={(event) =>
                                setScrollTop(event.currentTarget.scrollTop)
                            }
                        >
                            <table className="w-full min-w-[720px] table-fixed text-left text-sm">
                                <colgroup>
                                    {executedSchema?.fields.map((field) => (
                                        <col key={field.name} />
                                    ))}
                                </colgroup>

                                <thead className="sticky top-0 z-10 border-b border-border bg-background">
                                    <tr>
                                        {executedSchema?.fields.map((field) => (
                                            <th
                                                key={field.name}
                                                className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                                            >
                                                <span className="block truncate">
                                                    {field.label}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {topSpacerHeight > 0 && (
                                        <tr aria-hidden="true">
                                            <td
                                                colSpan={executedSchema?.fields.length ?? 1}
                                                style={{ height: topSpacerHeight }}
                                            />
                                        </tr>
                                    )}

                                    {virtualRecords.map((record, index) => {
                                        const actualIndex = startIndex + index;

                                        return (
                                            <tr
                                                key={getRecordKey(record, actualIndex)}
                                                className="result-row border-b border-border transition-colors last:border-b-0"
                                                style={{ height: ROW_HEIGHT }}
                                            >
                                                {executedSchema?.fields.map((field) => (
                                                    <td
                                                        key={field.name}
                                                        className="px-3 py-3 align-middle"
                                                    >
                                                        <span className="block truncate">
                                                            {formatCellValue(record[field.name])}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}

                                    {bottomSpacerHeight > 0 && (
                                        <tr aria-hidden="true">
                                            <td
                                                colSpan={executedSchema?.fields.length ?? 1}
                                                style={{ height: bottomSpacerHeight }}
                                            />
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {safePage} of {totalPages} · Showing{" "}
                            {paginatedRecords.length} records on this page
                        </p>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="result-action"
                                disabled={safePage === 1}
                                onClick={handlePreviousPage}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Previous
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="result-action"
                                disabled={safePage === totalPages}
                                onClick={handleNextPage}
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