"use client";

import {
    selectActiveSchema,
    selectSchemas,
    useQueryBuilderStore,
} from "@/features/query-builder";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type DataSourcePanelProps = {
    onSchemaChange?: () => void;
};

export function DataSourcePanel({ onSchemaChange }: DataSourcePanelProps) {
    const schemas = useQueryBuilderStore(selectSchemas);
    const activeSchema = useQueryBuilderStore(selectActiveSchema);
    const activeSchemaId = useQueryBuilderStore((state) => state.activeSchemaId);
    const setActiveSchema = useQueryBuilderStore((state) => state.setActiveSchema);

    function handleSchemaChange(schemaId: string) {
        setActiveSchema(schemaId);
        onSchemaChange?.();
    }

    return (
        <aside className="rounded-2xl border border-border bg-card p-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold tracking-tight">Data Source</p>
                    <Badge variant="outline">{schemas.length} schemas</Badge>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                    Start here. Pick the dataset your query should filter.
                </p>
            </div>

            <div className="mt-4">
                <Select
                    name="active-schema"
                    value={activeSchemaId}
                    onValueChange={handleSchemaChange}
                >
                    <SelectTrigger data-testid="schema-select-trigger">
                        <SelectValue placeholder="Select schema" />
                    </SelectTrigger>

                    <SelectContent>
                        {schemas.map((schema) => (
                            <SelectItem key={schema.id} value={schema.id}>
                                {schema.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{activeSchema.label}</p>
                    <Badge variant="secondary">Active</Badge>
                </div>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {activeSchema.description}
                </p>
            </div>

            <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Available fields
                    </p>
                    <span className="text-xs text-muted-foreground">
                        {activeSchema.fields.length} total
                    </span>
                </div>

                {activeSchema.fields.map((field) => (
                    <div
                        key={field.name}
                        className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 text-sm transition-colors hover:bg-muted/40"
                    >
                        <span className="font-medium">{field.label}</span>
                        <Badge variant="outline">{field.type}</Badge>
                    </div>
                ))}
            </div>
        </aside>
    );
}