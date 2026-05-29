"use client";

import type { SchemaField, QueryOperator, QueryValue } from "@/features/query-builder";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type QueryValueInputProps = {
    field: SchemaField;
    operator: QueryOperator;
    value: QueryValue;
    onChange: (value: QueryValue) => void;
};

function isRangeValue(
    value: QueryValue,
): value is { from: string | number; to: string | number } {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        "from" in value &&
        "to" in value
    );
}

function getTextInputType(field: SchemaField) {
    if (field.type === "number") {
        return "number";
    }

    if (field.type === "date") {
        return "date";
    }

    return "text";
}

export function QueryValueInput({
    field,
    operator,
    value,
    onChange,
}: QueryValueInputProps) {
    if (operator === "isNull" || operator === "isNotNull") {
        return (
            <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                No value needed
            </div>
        );
    }

    if (operator === "between") {
        const rangeValue = isRangeValue(value) ? value : { from: "", to: "" };

        return (
            <div className="grid gap-2 sm:grid-cols-2">
                <Input
                    type={getTextInputType(field)}
                    value={String(rangeValue.from)}
                    placeholder="From"
                    onChange={(event) =>
                        onChange({
                            from: event.target.value,
                            to: rangeValue.to,
                        })
                    }
                />

                <Input
                    type={getTextInputType(field)}
                    value={String(rangeValue.to)}
                    placeholder="To"
                    onChange={(event) =>
                        onChange({
                            from: rangeValue.from,
                            to: event.target.value,
                        })
                    }
                />
            </div>
        );
    }

    if (field.type === "boolean") {
        return (
            <Select
                value={String(value)}
                onValueChange={(nextValue) => onChange(nextValue === "true")}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select value" />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                </SelectContent>
            </Select>
        );
    }

    if (field.type === "enum" && field.options) {
        return (
            <Select value={String(value)} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select value" />
                </SelectTrigger>

                <SelectContent>
                    {field.options.map((option) => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }

    if (operator === "inArray") {
        return (
            <Input
                value={Array.isArray(value) ? value.join(", ") : ""}
                placeholder="Separate values with commas"
                onChange={(event) =>
                    onChange(
                        event.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean),
                    )
                }
            />
        );
    }

    return (
        <Input
            type={getTextInputType(field)}
            value={String(value ?? "")}
            placeholder="Enter value"
            onChange={(event) => onChange(event.target.value)}
        />
    );
}