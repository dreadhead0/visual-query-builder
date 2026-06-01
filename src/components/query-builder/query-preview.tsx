"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

import {
    formatMongoQueryPreview,
    selectActiveSchema,
    selectQueryTree,
    useQueryBuilderStore,
    validateQueryTree,
} from "@/features/query-builder";
import { Button } from "@/components/ui/button";

function getJsonTokenClass(token: string, isKey: boolean) {
    if (isKey && token.startsWith('"$')) {
        return "json-operator";
    }

    if (isKey) {
        return "json-key";
    }

    if (token.startsWith('"')) {
        return "json-string";
    }

    if (/^-?\d+(\.\d+)?$/.test(token)) {
        return "json-number";
    }

    if (token === "true" || token === "false" || token === "null") {
        return "json-number";
    }

    return "json-punctuation";
}

function renderHighlightedJson(source: string): ReactNode[] {
    const tokenPattern =
        /("(?:\\.|[^"\\])*")(\s*:)?|-?\d+(?:\.\d+)?|true|false|null|[{}\[\],:]/g;
    const nodes: ReactNode[] = [];
    let lastIndex = 0;
    let tokenIndex = 0;

    for (const match of source.matchAll(tokenPattern)) {
        const token = match[0];
        const start = match.index ?? 0;

        if (start > lastIndex) {
            nodes.push(source.slice(lastIndex, start));
        }

        const stringToken = match[1];
        const keySuffix = match[2] ?? "";
        const isKey = Boolean(stringToken && keySuffix);

        if (stringToken) {
            nodes.push(
                <span
                    key={`token-${tokenIndex}`}
                    className={getJsonTokenClass(stringToken, isKey)}
                >
                    {stringToken}
                </span>,
            );

            if (keySuffix) {
                nodes.push(
                    <span key={`token-${tokenIndex}-colon`} className="json-punctuation">
                        {keySuffix}
                    </span>,
                );
            }
        } else {
            nodes.push(
                <span
                    key={`token-${tokenIndex}`}
                    className={getJsonTokenClass(token, false)}
                >
                    {token}
                </span>,
            );
        }

        lastIndex = start + token.length;
        tokenIndex += 1;
    }

    if (lastIndex < source.length) {
        nodes.push(source.slice(lastIndex));
    }

    return nodes;
}

export function QueryPreview() {
    const activeSchema = useQueryBuilderStore(selectActiveSchema);
    const queryTree = useQueryBuilderStore(selectQueryTree);
    const [hasCopied, setHasCopied] = useState(false);

    const preview = useMemo(
        () => formatMongoQueryPreview(queryTree, activeSchema),
        [activeSchema, queryTree],
    );

    const highlightedPreview = useMemo(
        () => renderHighlightedJson(preview),
        [preview],
    );

    const validation = useMemo(
        () => validateQueryTree(queryTree, activeSchema),
        [activeSchema, queryTree],
    );

    useEffect(() => {
        if (!hasCopied) {
            return;
        }

        const timeoutId = window.setTimeout(() => setHasCopied(false), 1400);

        return () => window.clearTimeout(timeoutId);
    }, [hasCopied]);

    async function handleCopyPreview() {
        await navigator.clipboard.writeText(preview);
        setHasCopied(true);
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
                        <p className="status-pill-danger mt-3 rounded-xl border px-3 py-2 text-sm leading-6">
                            Preview stays visible for debugging, but the query needs a fix
                            before execution.
                        </p>
                    )}
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={
                        hasCopied ? "Live query preview copied" : "Copy live query preview"
                    }
                    className={
                        hasCopied
                            ? "h-8 w-8 border-0 bg-transparent p-0 text-[color:var(--accent-success)] hover:bg-transparent hover:text-[color:var(--accent-success)]"
                            : "h-8 w-8 border-0 bg-transparent p-0 text-[color:var(--accent-primary)] hover:bg-transparent hover:text-[color:var(--accent-primary)]"
                    }
                    onClick={handleCopyPreview}
                >
                    {hasCopied ? (
                        <Check className="h-4 w-4" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <pre className="liquid-readable max-h-[420px] overflow-auto rounded-xl p-4 font-mono text-xs leading-6 transition-colors duration-200">
                <code>{highlightedPreview}</code>
            </pre>
        </div>
    );
}
