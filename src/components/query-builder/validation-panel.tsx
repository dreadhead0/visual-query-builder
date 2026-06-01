"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronRight, LocateFixed } from "lucide-react";

import {
    selectActiveSchema,
    selectQueryTree,
    useQueryBuilderStore,
    validateQueryTree,
} from "@/features/query-builder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function dispatchSelectNode(nodeId: string) {
    window.dispatchEvent(
        new CustomEvent("querynest:select-node", {
            detail: {
                nodeId,
            },
        }),
    );
}

export function ValidationPanel() {
    const activeSchema = useQueryBuilderStore(selectActiveSchema);
    const queryTree = useQueryBuilderStore(selectQueryTree);
    const [isExpanded, setIsExpanded] = useState(true);

    const validation = useMemo(
        () => validateQueryTree(queryTree, activeSchema),
        [activeSchema, queryTree],
    );

    if (validation.isValid) {
        return (
            <div className="state-valid rounded-xl border p-3 transition-colors duration-200">
                <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4" />

                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">Query is valid</p>
                            <Badge variant="outline" className="state-valid">
                                Ready
                            </Badge>
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
        <div className="state-danger rounded-xl border p-3 transition-colors duration-200">
            <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4" />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold">Fix before running</p>
                            <Badge variant="outline" className="state-danger">
                                {validation.errors.length} error
                                {validation.errors.length === 1 ? "" : "s"}
                            </Badge>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="button-danger"
                            aria-expanded={isExpanded}
                            onClick={() => setIsExpanded((current) => !current)}
                        >
                            {isExpanded ? (
                                <ChevronDown className="mr-2 h-4 w-4" />
                            ) : (
                                <ChevronRight className="mr-2 h-4 w-4" />
                            )}
                            {isExpanded ? "Hide fixes" : "Show fixes"}
                        </Button>
                    </div>

                    {isExpanded && (
                        <ul className="mt-3 max-h-[280px] space-y-2 overflow-auto pr-1">
                            {validation.errors.map((error, index) => (
                                <li key={error.id}>
                                    <button
                                        type="button"
                                        className="validation-issue-button flex w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm leading-6 transition-colors"
                                        onClick={() => dispatchSelectNode(error.nodeId)}
                                    >
                                        <LocateFixed className="mt-1 h-3.5 w-3.5 shrink-0" />
                                        <span>
                                            <span className="font-semibold">
                                                Issue {index + 1}:
                                            </span>{" "}
                                            {error.message}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
