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

type DataSourceBarProps = {
    onSchemaChange?: () => void;
};

function getFieldTypeClass(type: string) {
    return `field-type-${type}`;
}

export function DataSourceBar({ onSchemaChange }: DataSourceBarProps) {
    const schemas = useQueryBuilderStore(selectSchemas);
    const activeSchema = useQueryBuilderStore(selectActiveSchema);
    const activeSchemaId = useQueryBuilderStore((state) => state.activeSchemaId);
    const setActiveSchema = useQueryBuilderStore((state) => state.setActiveSchema);

    function handleSchemaChange(schemaId: string) {
        setActiveSchema(schemaId);
        onSchemaChange?.();
    }

    return (
        <section className="liquid-panel rounded-[1.75rem] p-4" aria-label="Data Source">
            <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold tracking-tight">Data Source</p>
                        <Badge variant="outline" className="accent-primary-soft">
                            {schemas.length} schemas
                        </Badge>
                    </div>

                    <Select
                        name="active-schema"
                        value={activeSchemaId}
                        onValueChange={handleSchemaChange}
                    >
                        <SelectTrigger
                            data-testid="schema-select-trigger"
                            className="accent-primary-soft w-full"
                        >
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

                    <p className="text-sm leading-6 text-muted-foreground">
                        {activeSchema.description}
                    </p>
                </div>

                <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                Available fields
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                These schema fields drive the builder controls, validation,
                                preview, and result columns.
                            </p>
                        </div>

                        <Badge variant="secondary" className="accent-primary-soft">
                            {activeSchema.fields.length} fields
                        </Badge>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {activeSchema.fields.map((field) => (
                            <div
                                key={field.name}
                                className={`liquid-readable ${getFieldTypeClass(field.type)} flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-sm`}
                            >
                                <span className="font-medium">{field.label}</span>
                                <Badge variant="outline" className={getFieldTypeClass(field.type)}>
                                    {field.type}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
