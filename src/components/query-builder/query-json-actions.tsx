"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
    type UIEvent,
} from "react";
import { createPortal } from "react-dom";
import { Check, Copy, Download, Upload, X } from "lucide-react";

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
    tone?: "export" | "import";
    children: ReactNode;
    onClose: () => void;
};

type JsonToken = {
    value: string;
    type: "plain" | "key" | "string" | "number" | "operator" | "punctuation";
};

const JSON_TOKEN_PATTERN =
    /("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?)|(true|false|null)|([{}[\]:,])/g;

function getStringTokenValue(token: string) {
    try {
        return JSON.parse(token) as string;
    } catch {
        return token.replace(/^"|"$/g, "");
    }
}

function tokenizeJson(json: string): JsonToken[] {
    const tokens: JsonToken[] = [];
    let previousIndex = 0;
    let match: RegExpExecArray | null;

    JSON_TOKEN_PATTERN.lastIndex = 0;

    while ((match = JSON_TOKEN_PATTERN.exec(json)) !== null) {
        if (match.index > previousIndex) {
            tokens.push({
                value: json.slice(previousIndex, match.index),
                type: "plain",
            });
        }

        const token = match[0];
        const stringToken = match[1];
        const numberToken = match[2];
        const literalToken = match[3];
        const punctuationToken = match[4];

        if (stringToken) {
            const stringValue = getStringTokenValue(stringToken);
            const remaining = json.slice(JSON_TOKEN_PATTERN.lastIndex);
            const nextSignificantCharacter = remaining.trimStart().at(0);

            if (stringValue.startsWith("$")) {
                tokens.push({ value: token, type: "operator" });
            } else if (nextSignificantCharacter === ":") {
                tokens.push({ value: token, type: "key" });
            } else {
                tokens.push({ value: token, type: "string" });
            }
        } else if (numberToken || literalToken) {
            tokens.push({ value: token, type: "number" });
        } else if (punctuationToken) {
            tokens.push({ value: token, type: "punctuation" });
        }

        previousIndex = JSON_TOKEN_PATTERN.lastIndex;
    }

    if (previousIndex < json.length) {
        tokens.push({ value: json.slice(previousIndex), type: "plain" });
    }

    return tokens;
}

function JsonSyntaxPreview({
    value,
    label,
}: {
    value: string;
    label?: string;
}) {
    const tokens = useMemo(() => tokenizeJson(value), [value]);

    return (
        <div className="space-y-2">
            {label && (
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {label}
                </p>
            )}

            <div className="liquid-readable max-h-[360px] w-full max-w-full overflow-auto rounded-2xl p-4">
                <pre className="min-w-max whitespace-pre font-mono text-xs leading-6">
                    <code>
                        {tokens.map((token, index) => {
                            if (token.type === "plain") {
                                return token.value;
                            }

                            return (
                                <span
                                    key={`${token.type}-${index}`}
                                    className={`json-${token.type}`}
                                >
                                    {token.value}
                                </span>
                            );
                        })}
                    </code>
                </pre>
            </div>
        </div>
    );
}
function EditableJsonTextarea({
    value,
    error,
    onChange,
}: {
    value: string;
    error: string | null;
    onChange: (value: string) => void;
}) {
    const previewRef = useRef<HTMLPreElement | null>(null);

    const tokens = useMemo(() => tokenizeJson(value), [value]);
    const hasValue = value.trim() !== "";

    function syncPreviewScroll(event: UIEvent<HTMLTextAreaElement>) {
        if (!previewRef.current) {
            return;
        }

        previewRef.current.scrollTop = event.currentTarget.scrollTop;
        previewRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }

    return (
        <div className="relative h-[260px] overflow-hidden rounded-2xl border border-border bg-background/70">
            {hasValue && (
                <pre
                    ref={previewRef}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-6"
                >
                    <code>
                        {tokens.map((token, index) => {
                            if (token.type === "plain") {
                                return token.value;
                            }

                            return (
                                <span
                                    key={`${token.type}-${index}`}
                                    className={`json-${token.type}`}
                                >
                                    {token.value}
                                </span>
                            );
                        })}
                    </code>
                </pre>
            )}

            <textarea
                data-testid="import-json-textarea"
                name="import-query-json"
                aria-label="Import query JSON"
                aria-invalid={Boolean(error)}
                value={value}
                placeholder="Paste exported query JSON here..."
                className={
                    hasValue
                        ? "relative z-10 h-[260px] w-full resize-none overflow-auto rounded-2xl border-0 bg-transparent p-4 font-mono text-xs leading-6 text-transparent caret-foreground outline-none selection:bg-foreground/20 focus-visible:ring-0"
                        : "relative z-10 h-[260px] w-full resize-none overflow-auto rounded-2xl border-0 bg-transparent p-4 font-mono text-xs leading-6 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-0"
                }
                spellCheck={false}
                onScroll={syncPreviewScroll}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}

function QueryJsonModal({
    open,
    title,
    description,
    testId,
    tone = "export",
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
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 px-4 backdrop-blur-2xl"
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
                className="glass-modal relative z-[10000] w-full max-w-2xl overflow-hidden rounded-[1.75rem] p-5"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span
                                className={`flex h-8 w-8 items-center justify-center rounded-full border ${tone === "export" ? "accent-export" : "accent-import"}`}
                            >
                                {tone === "export" ? (
                                    <Download className="h-4 w-4" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                            </span>
                            <h2 id={`${testId}-title`} className="text-base font-semibold">
                                {title}
                            </h2>
                        </div>

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
                        className="button-neutral rounded-full"
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
    const [hasCopiedExport, setHasCopiedExport] = useState(false);

    const exportedJson = useMemo(() => {
        const document = createExportedQueryDocument(activeSchemaId, queryTree);

        return stringifyExportedQueryDocument(document);
    }, [activeSchemaId, queryTree]);

    useEffect(() => {
        if (!hasCopiedExport) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setHasCopiedExport(false);
        }, 1500);

        return () => window.clearTimeout(timeoutId);
    }, [hasCopiedExport]);

    async function handleCopyExport() {
        await navigator.clipboard.writeText(exportedJson);
        setHasCopiedExport(true);
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
                className="accent-export"
                onClick={() => {
                    setHasCopiedExport(false);
                    setIsExportOpen(true);
                }}
            >
                <Download className="mr-2 h-4 w-4" />
                Export JSON
            </Button>

            <Button
                type="button"
                variant="outline"
                data-testid="import-json-button"
                className="accent-import"
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
                tone="export"
                onClose={() => {
                    setHasCopiedExport(false);
                    setIsExportOpen(false);
                }}
            >
                <Textarea
                    data-testid="export-json-textarea"
                    name="exported-query-json"
                    aria-label="Exported query JSON"
                    readOnly
                    value={exportedJson}
                    tabIndex={-1}
                    className="sr-only"
                />

                <JsonSyntaxPreview
                    value={exportedJson}
                    label="Highlighted export preview"
                />

                <div className="mt-4 flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={
                            hasCopiedExport
                                ? "Exported query JSON copied"
                                : "Copy exported query JSON"
                        }
                        className={
                            hasCopiedExport
                                ? "h-9 w-9 border-0 bg-transparent p-0 text-[color:var(--accent-success)] hover:bg-transparent hover:text-[color:var(--accent-success)]"
                                : "h-9 w-9 border-0 bg-transparent p-0 text-[color:var(--accent-primary)] hover:bg-transparent hover:text-[color:var(--accent-primary)]"
                        }
                        onClick={handleCopyExport}
                    >
                        {hasCopiedExport ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Download exported query JSON"
                        className="h-9 w-9 border-0 bg-transparent p-0 text-[color:var(--accent-or)] hover:bg-transparent hover:text-[color:var(--accent-or)]"
                        onClick={handleDownloadExport}
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </QueryJsonModal>

            <QueryJsonModal
                open={isImportOpen}
                title="Import query JSON"
                description="Paste an exported query JSON document. The import will be validated before it is loaded into the builder."
                testId="import-json-dialog"
                tone="import"
                onClose={() => setIsImportOpen(false)}
            >
                <EditableJsonTextarea
                    value={importText}
                    error={importError}
                    onChange={handleImportTextChange}
                />

                {importError && (
                    <div
                        data-testid="import-json-error"
                        className="status-pill-danger mt-3 rounded-xl border px-3 py-2 text-sm leading-6"
                    >
                        {importError}
                    </div>
                )}

                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        className="button-neutral"
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
                        className="accent-cta"
                        onClick={handleImportQuery}
                    >
                        Import Query
                    </Button>
                </div>
            </QueryJsonModal>
        </>
    );
}
