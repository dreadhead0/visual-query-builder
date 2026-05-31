import {
    DATA_SCHEMAS,
    validateQueryTree,
    type GroupNode,
} from "@/features/query-builder";

const usersSchema = DATA_SCHEMAS.find((schema) => schema.id === "users");

if (!usersSchema) {
    throw new Error("Users schema missing");
}

describe("validateQueryTree", () => {
    it("marks an empty value as invalid when the operator requires a value", () => {
        const queryTree: GroupNode = {
            id: "group_test",
            type: "group",
            combinator: "AND",
            collapsed: false,
            children: [
                {
                    id: "rule_name",
                    type: "rule",
                    field: "name",
                    operator: "equals",
                    value: "",
                },
            ],
        };

        const validation = validateQueryTree(queryTree, usersSchema);

        expect(validation.isValid).toBe(false);
        expect(validation.errors[0]?.message).toBe("This rule needs a value.");
    });

    it("accepts null checks without requiring a value", () => {
        const queryTree: GroupNode = {
            id: "group_test",
            type: "group",
            combinator: "AND",
            collapsed: false,
            children: [
                {
                    id: "rule_email",
                    type: "rule",
                    field: "email",
                    operator: "isNull",
                    value: null,
                },
            ],
        };

        const validation = validateQueryTree(queryTree, usersSchema);

        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });

    it("rejects invalid number ranges", () => {
        const queryTree: GroupNode = {
            id: "group_test",
            type: "group",
            combinator: "AND",
            collapsed: false,
            children: [
                {
                    id: "rule_age",
                    type: "rule",
                    field: "age",
                    operator: "between",
                    value: {
                        from: "50",
                        to: "18",
                    },
                },
            ],
        };

        const validation = validateQueryTree(queryTree, usersSchema);

        expect(validation.isValid).toBe(false);
        expect(validation.errors[0]?.message).toContain("valid number range");
    });

    it("rejects empty groups", () => {
        const queryTree: GroupNode = {
            id: "group_empty",
            type: "group",
            combinator: "AND",
            collapsed: false,
            children: [],
        };

        const validation = validateQueryTree(queryTree, usersSchema);

        expect(validation.isValid).toBe(false);
        expect(validation.errors[0]?.message).toBe(
            "This group is empty. Add at least one rule or nested group.",
        );
    });

    it("rejects invalid regex patterns", () => {
        const queryTree: GroupNode = {
            id: "group_test",
            type: "group",
            combinator: "AND",
            collapsed: false,
            children: [
                {
                    id: "rule_name",
                    type: "rule",
                    field: "name",
                    operator: "regex",
                    value: "[",
                },
            ],
        };

        const validation = validateQueryTree(queryTree, usersSchema);

        expect(validation.isValid).toBe(false);
        expect(validation.errors[0]?.message).toBe(
            "Enter a valid regular expression pattern.",
        );
    });
});