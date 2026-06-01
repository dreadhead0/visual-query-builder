"use client";

import { useMemo } from "react";
import { Copy } from "lucide-react";

import {
    formatMongoQueryPreview,
    selectActiveSchema,
    selectQueryTree,
    useQueryBuilderStore,
    validateQueryTree,
} from "@/features/query-builder";
import { Button } from "@/components/ui/button";

export function QueryPreview() {
    const activeSchema = useQueryBuilderStore(selectActiveSchema);
    const queryTree = useQueryBuilderStore(selectQueryTree);

    const preview = useMemo(
        () => formatMongoQueryPreview(queryTree, activeSchema),
        [activeSchema, queryTree],
    );

    const validation = useMemo(
        () => validateQueryTree(queryTree, activeSchema),
        [activeSchema, queryTree],
    );

    async function handleCopyPreview() {
        await navigator.clipboard.writeText(preview);
    }

    return (
        <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold tracking-tight">
                        Live Query Preview
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        This updates live as you edit rules and groups.
                    </p>

                    {!validation.isValid && (
                        <p className="mt-3 rounded-xl border border-border bg-background px-3 py-2 text-sm leading-6 text-muted-foreground">
                            Preview is visible for debugging, but the query must be fixed
                            before execution.
                        </p>
                    )}
                </div>

                <Button type="button" variant="outline" size="sm" onClick={handleCopyPreview}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                </Button>
            </div>

            <pre className="max-h-[420px] overflow-auto rounded-xl border border-border bg-background p-4 font-mono text-xs leading-6 text-muted-foreground transition-colors duration-200">
                <code>{preview}</code>
            </pre>
        </div>
    );
}
