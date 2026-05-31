import {
    DATA_SCHEMAS,
    executeQueryTree,
    getMockDatasetBySchemaId,
    type GroupNode,
} from "@/features/query-builder";

const usersSchema = DATA_SCHEMAS.find((schema) => schema.id === "users");
const usersDataset = getMockDatasetBySchemaId("users");

if (!usersSchema || !usersDataset) {
    throw new Error("Users schema or dataset missing");
}

describe("executeQueryTree", () => {
    it("filters records using AND logic", () => {
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
                    operator: "greaterThan",
                    value: "18",
                },
                {
                    id: "rule_country",
                    type: "rule",
                    field: "country",
                    operator: "equals",
                    value: "Nigeria",
                },
            ],
        };

        const result = executeQueryTree({
            queryTree,
            schema: usersSchema,
            records: usersDataset.records,
            sortField: null,
            sortDirection: "asc",
        });

        expect(result.total).toBeGreaterThan(0);
        expect(result.records.every((record) => Number(record.age) > 18)).toBe(
            true,
        );
        expect(result.records.every((record) => record.country === "Nigeria")).toBe(
            true,
        );
    });

    it("filters records using OR logic", () => {
        const queryTree: GroupNode = {
            id: "group_test",
            type: "group",
            combinator: "OR",
            collapsed: false,
            children: [
                {
                    id: "rule_country",
                    type: "rule",
                    field: "country",
                    operator: "equals",
                    value: "Ghana",
                },
                {
                    id: "rule_status",
                    type: "rule",
                    field: "status",
                    operator: "equals",
                    value: "suspended",
                },
            ],
        };

        const result = executeQueryTree({
            queryTree,
            schema: usersSchema,
            records: usersDataset.records,
            sortField: null,
            sortDirection: "asc",
        });

        expect(result.total).toBeGreaterThan(0);
        expect(
            result.records.every(
                (record) =>
                    record.country === "Ghana" || record.status === "suspended",
            ),
        ).toBe(true);
    });

    it("sorts records by selected field", () => {
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
                    operator: "greaterThan",
                    value: "0",
                },
            ],
        };

        const result = executeQueryTree({
            queryTree,
            schema: usersSchema,
            records: usersDataset.records,
            sortField: "age",
            sortDirection: "asc",
        });

        const ages = result.records.map((record) => Number(record.age));
        const sortedAges = [...ages].sort((a, b) => a - b);

        expect(ages).toEqual(sortedAges);
    });

    it("returns an empty result when no records match", () => {
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
                    operator: "greaterThan",
                    value: "500",
                },
            ],
        };

        const result = executeQueryTree({
            queryTree,
            schema: usersSchema,
            records: usersDataset.records,
            sortField: null,
            sortDirection: "asc",
        });

        expect(result.total).toBe(0);
        expect(result.records).toEqual([]);
    });
});