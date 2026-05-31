"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

import {
    selectActiveSchema,
    selectQueryTree,
    useQueryBuilderStore,
    validateQueryTree,
} from "@/features/query-builder";
import { Badge } from "@/components/ui/badge";

export function ValidationPanel() {
    const activeSchema = useQueryBuilderStore(selectActiveSchema);
    const queryTree = useQueryBuilderStore(selectQueryTree);
    const validation = validateQueryTree(queryTree, activeSchema);

    if (validation.isValid) {
        return (
            <div className="rounded-xl border border-border bg-background p-3 transition-colors duration-200">
                <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4" />

                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">Query is valid</p>
                            <Badge variant="outline">Ready</Badge>
                        </div>

                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            This query can be executed against the selected mock dataset.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-background p-3 transition-colors duration-200">
            <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4" />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">Fix before running</p>
                        <Badge variant="destructive">
                            {validation.errors.length} error
                            {validation.errors.length === 1 ? "" : "s"}
                        </Badge>
                    </div>

                    <ul className="mt-3 space-y-2">
                        {validation.errors.map((error) => (
                            <li
                                key={error.id}
                                className="rounded-lg border border-border bg-muted px-3 py-2 text-sm leading-6"
                            >
                                {error.message}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}