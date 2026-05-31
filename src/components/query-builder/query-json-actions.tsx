"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Upload } from "lucide-react";

import {
    createExportedQueryDocument,
    parseImportedQueryJson,
    selectQueryTree,
    stringifyExportedQueryDocument,
    useQueryBuilderStore,
} from "@/features/query-builder";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type QueryJsonActionsProps = {
    onImportSuccess?: () => void;
};

export function QueryJsonActions({ onImportSuccess }: QueryJsonActionsProps) {
    const activeSchemaId = useQueryBuilderStore((state) => state.activeSchemaId);
    const queryTree = useQueryBuilderStore(selectQueryTree);
    const loadQueryTree = useQueryBuilderStore((state) => state.loadQueryTree);

    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importText, setImportText] = useState("");
    const [importError, setImportError] = useState<string | null>(null);

    const exportedJson = useMemo(() => {
        const document = createExportedQueryDocument(activeSchemaId, queryTree);

        return stringifyExportedQueryDocument(document);
    }, [activeSchemaId, queryTree]);

    async function handleCopyExport() {
        await navigator.clipboard.writeText(exportedJson);
    }

    function handleDownloadExport() {
        const blob = new Blob([exportedJson], {
            type: "application/json",
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `${activeSchemaId}-query.json`;
        link.click();

        window.URL.revokeObjectURL(url);
    }

    function handleImportQuery() {
        const result = parseImportedQueryJson(importText);

        if (!result.success) {
            setImportError(result.error);
            return;
        }

        loadQueryTree(result.document.schemaId, result.document.queryTree);
        onImportSuccess?.();

        setImportError(null);
        setImportText("");
        setIsImportOpen(false);
    }

    function handleImportTextChange(value: string) {
        setImportText(value);

        if (importError) {
            setImportError(null);
        }
    }

    return (
        <>
            <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" data-testid="export-json-button">
                        <Download className="mr-2 h-4 w-4" />
                        Export JSON
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Export query JSON</DialogTitle>
                        <DialogDescription>
                            Copy or download the current schema and query tree as a reusable
                            JSON document.
                        </DialogDescription>
                    </DialogHeader>

                    <Textarea
                        name="exported-query-json"
                        aria-label="Exported query JSON"
                        readOnly
                        value={exportedJson}
                        className="min-h-[320px] font-mono text-xs"
                    />

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={handleCopyExport}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                        </Button>

                        <Button type="button" onClick={handleDownloadExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" data-testid="import-json-button">
                        <Upload className="mr-2 h-4 w-4" />
                        Import JSON
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Import query JSON</DialogTitle>
                        <DialogDescription>
                            Paste an exported query JSON document. The import will be
                            validated before it is loaded into the builder.
                        </DialogDescription>
                    </DialogHeader>

                    <Textarea
                        name="import-query-json"
                        aria-label="Import query JSON"
                        value={importText}
                        placeholder="Paste exported query JSON here..."
                        className="min-h-[320px] font-mono text-xs"
                        onChange={(event) => handleImportTextChange(event.target.value)}
                    />

                    {importError && (
                        <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm leading-6 text-muted-foreground">
                            {importError}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setImportText("");
                                setImportError(null);
                            }}
                        >
                            Clear
                        </Button>

                        <Button
                            type="button"
                            disabled={importText.trim() === ""}
                            onClick={handleImportQuery}
                        >
                            Import Query
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}