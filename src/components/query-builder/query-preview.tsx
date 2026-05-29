"use client";

import { Copy } from "lucide-react";

import {
    formatMongoQueryPreview,
    selectActiveSchema,
    selectQueryTree,
    useQueryBuilderStore,
} from "@/features/query-builder";
import { Button } from "@/components/ui/button";

export function QueryPreview() {
    const activeSchema = useQueryBuilderStore(selectActiveSchema);
    const queryTree = useQueryBuilderStore(selectQueryTree);
    const preview = formatMongoQueryPreview(queryTree, activeSchema);

    async function handleCopyPreview() {
        await navigator.clipboard.writeText(preview);
    }

    return (
        <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium">Live Query Preview</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Mongo-style query generated from the visual query tree.
                    </p>
                </div>

                <Button type="button" variant="outline" size="sm" onClick={handleCopyPreview}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                </Button>
            </div>

            <pre className="max-h-[420px] overflow-auto rounded-lg border border-border bg-muted p-4 text-xs leading-5">
                <code>{preview}</code>
            </pre>
        </div>
    );
}