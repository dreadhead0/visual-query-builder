import {
    createExportedQueryDocument,
    parseImportedQueryJson,
    stringifyExportedQueryDocument,
    type GroupNode,
} from "@/features/query-builder";

describe("query import/export", () => {
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
        ],
    };

    it("exports and imports a valid query document", () => {
        const document = createExportedQueryDocument("users", queryTree);
        const rawJson = stringifyExportedQueryDocument(document);
        const result = parseImportedQueryJson(rawJson);

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.document.schemaId).toBe("users");
            expect(result.document.queryTree).toEqual(queryTree);
        }
    });

    it("rejects broken JSON", () => {
        const result = parseImportedQueryJson("{ bad json");

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(result.error).toBeTruthy();
        }
    });

    it("rejects unknown schema IDs", () => {
        const result = parseImportedQueryJson(
            JSON.stringify({
                version: 1,
                schemaId: "fake-schema",
                queryTree,
                exportedAt: new Date().toISOString(),
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(result.error).toContain("Unknown schemaId");
        }
    });

    it("rejects incompatible imported operators", () => {
        const invalidTree: GroupNode = {
            id: "group_test",
            type: "group",
            combinator: "AND",
            collapsed: false,
            children: [
                {
                    id: "rule_age",
                    type: "rule",
                    field: "age",
                    operator: "contains",
                    value: "18",
                },
            ],
        };

        const result = parseImportedQueryJson(
            JSON.stringify({
                version: 1,
                schemaId: "users",
                queryTree: invalidTree,
                exportedAt: new Date().toISOString(),
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(result.error).toContain("cannot be used");
        }
    });

    it("rejects duplicate node IDs", () => {
        const invalidTree: GroupNode = {
            id: "duplicate",
            type: "group",
            combinator: "AND",
            collapsed: false,
            children: [
                {
                    id: "duplicate",
                    type: "rule",
                    field: "age",
                    operator: "greaterThan",
                    value: "18",
                },
            ],
        };

        const result = parseImportedQueryJson(
            JSON.stringify({
                version: 1,
                schemaId: "users",
                queryTree: invalidTree,
                exportedAt: new Date().toISOString(),
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(result.error).toContain("Duplicate node id");
        }
    });
});