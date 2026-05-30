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
        <aside className="rounded-lg border border-border bg-card p-4">
            <div>
                <p className="text-sm font-medium">Data Source</p>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Choose the schema the query builder should use.
                </p>
            </div>

            <div className="mt-4">
                <Select value={activeSchemaId} onValueChange={handleSchemaChange}>
                    <SelectTrigger>
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

            <div className="mt-4 rounded-md border border-border bg-background p-3">
                <p className="text-sm font-medium">{activeSchema.label}</p>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {activeSchema.description}
                </p>
            </div>

            <div className="mt-4 space-y-2">
                {activeSchema.fields.map((field) => (
                    <div
                        key={field.name}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                    >
                        <span>{field.label}</span>
                        <Badge variant="outline">{field.type}</Badge>
                    </div>
                ))}
            </div>
        </aside>
    );
}