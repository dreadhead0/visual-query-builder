"use client";

import { Trash2 } from "lucide-react";

import {
    getFieldByName,
    getOperatorsForFieldType,
    type DataSchema,
    type RuleNode,
} from "@/features/query-builder";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { QueryValueInput } from "./query-value-input";

type QueryRuleProps = {
    rule: RuleNode;
    schema: DataSchema;
    compact?: boolean;
    onFieldChange: (ruleId: string, fieldName: string) => void;
    onOperatorChange: (ruleId: string, operator: RuleNode["operator"]) => void;
    onValueChange: (ruleId: string, value: RuleNode["value"]) => void;
    onRemove: (ruleId: string) => void;
};

export function QueryRule({
    rule,
    schema,
    compact = false,
    onFieldChange,
    onOperatorChange,
    onValueChange,
    onRemove,
}: QueryRuleProps) {
    const selectedField = getFieldByName(schema, rule.field) ?? schema.fields[0];
    const operators = getOperatorsForFieldType(selectedField.type);

    return (
        <div className="liquid-readable min-w-0 rounded-2xl p-3 transition-colors duration-200 hover:bg-muted/35">
            <div
                className={
                    compact
                        ? "grid min-w-0 gap-2"
                        : "grid min-w-0 gap-3 xl:grid-cols-[minmax(120px,1fr)_minmax(120px,1fr)_minmax(160px,1.2fr)_auto]"
                }
            >
                <Select
                    name={`${rule.id}-field`}
                    value={rule.field}
                    onValueChange={(fieldName) => onFieldChange(rule.id, fieldName)}
                >
                    <SelectTrigger data-testid="rule-field-trigger" className="min-w-0">
                        <SelectValue placeholder="Select field" />
                    </SelectTrigger>

                    <SelectContent>
                        {schema.fields.map((field) => (
                            <SelectItem key={field.name} value={field.name}>
                                {field.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    name={`${rule.id}-operator`}
                    value={rule.operator}
                    onValueChange={(operator) =>
                        onOperatorChange(rule.id, operator as RuleNode["operator"])
                    }
                >
                    <SelectTrigger
                        data-testid="rule-operator-trigger"
                        className="min-w-0"
                    >
                        <SelectValue placeholder="Select operator" />
                    </SelectTrigger>

                    <SelectContent>
                        {operators.map((operator) => (
                            <SelectItem key={operator.value} value={operator.value}>
                                {operator.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <QueryValueInput
                    ruleId={rule.id}
                    field={selectedField}
                    operator={rule.operator}
                    value={rule.value}
                    onChange={(value) => onValueChange(rule.id, value)}
                />

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Remove rule"
                    className={compact ? "w-full" : ""}
                    onClick={() => onRemove(rule.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}