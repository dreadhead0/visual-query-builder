"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Copy, Download, Upload, X } from "lucide-react";

import {
    createExportedQueryDocument,
    parseImportedQueryJson,
    selectQueryTree,
    stringifyExportedQueryDocument,
    useQueryBuilderStore,
} from "@/features/query-builder";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type QueryJsonActionsProps = {
    onImportSuccess?: () => void;
};

type QueryJsonModalProps = {
    open: boolean;
    title: string;
    description: string;
    testId: string;
    children: ReactNode;
    onClose: () => void;
};

function QueryJsonModal({
    open,
    title,
    description,
    testId,
    children,
    onClose,
}: QueryJsonModalProps) {
    useEffect(() => {
        if (!open) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, open]);

    if (!open || typeof document === "undefined") {
        return null;
    }

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/85 px-4 backdrop-blur-xl"
            role="presentation"
            data-testid={`${testId}-backdrop`}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${testId}-title`}
                aria-describedby={`${testId}-description`}
                data-testid={testId}
                className="relative z-[10000] max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-border bg-card p-5"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 id={`${testId}-title`} className="text-base font-semibold">
                            {title}
                        </h2>

                        <p
                            id={`${testId}-description`}
                            className="mt-2 text-sm leading-6 text-muted-foreground"
                        >
                            {description}
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Close ${title}`}
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="mt-4">{children}</div>
            </div>
        </div>,
        document.body,
    );
}

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
            <Button
                type="button"
                variant="outline"
                data-testid="export-json-button"
                onClick={() => setIsExportOpen(true)}
            >
                <Download className="mr-2 h-4 w-4" />
                Export JSON
            </Button>

            <Button
                type="button"
                variant="outline"
                data-testid="import-json-button"
                onClick={() => setIsImportOpen(true)}
            >
                <Upload className="mr-2 h-4 w-4" />
                Import JSON
            </Button>

            <QueryJsonModal
                open={isExportOpen}
                title="Export query JSON"
                description="Copy or download the current schema and query tree as a reusable JSON document."
                testId="export-json-dialog"
                onClose={() => setIsExportOpen(false)}
            >
                <Textarea
                    data-testid="export-json-textarea"
                    name="exported-query-json"
                    aria-label="Exported query JSON"
                    readOnly
                    value={exportedJson}
                    className="min-h-[320px] font-mono text-xs"
                />

                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" onClick={handleCopyExport}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                    </Button>

                    <Button type="button" onClick={handleDownloadExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                </div>
            </QueryJsonModal>

            <QueryJsonModal
                open={isImportOpen}
                title="Import query JSON"
                description="Paste an exported query JSON document. The import will be validated before it is loaded into the builder."
                testId="import-json-dialog"
                onClose={() => setIsImportOpen(false)}
            >
                <Textarea
                    data-testid="import-json-textarea"
                    name="import-query-json"
                    aria-label="Import query JSON"
                    value={importText}
                    placeholder="Paste exported query JSON here..."
                    className="min-h-[320px] font-mono text-xs"
                    onChange={(event) => handleImportTextChange(event.target.value)}
                />

                {importError && (
                    <div
                        data-testid="import-json-error"
                        className="mt-3 rounded-md border border-border bg-muted px-3 py-2 text-sm leading-6 text-muted-foreground"
                    >
                        {importError}
                    </div>
                )}

                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
                </div>
            </QueryJsonModal>
        </>
    );
}