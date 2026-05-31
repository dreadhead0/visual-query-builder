import {
    DATA_SCHEMAS,
    generateMongoQuery,
    type GroupNode,
} from "@/features/query-builder";

const usersSchema = DATA_SCHEMAS.find((schema) => schema.id === "users");

if (!usersSchema) {
    throw new Error("Users schema missing");
}

describe("generateMongoQuery", () => {
    it("generates a Mongo query for a number comparison", () => {
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

        expect(generateMongoQuery(queryTree, usersSchema)).toEqual({
            $and: [
                {
                    age: {
                        $gt: 18,
                    },
                },
            ],
        });
    });

    it("generates nested AND/OR groups recursively", () => {
        const queryTree: GroupNode = {
            id: "group_root",
            type: "group",
            combinator: "OR",
            collapsed: false,
            children: [
                {
                    id: "rule_country",
                    type: "rule",
                    field: "country",
                    operator: "equals",
                    value: "Nigeria",
                },
                {
                    id: "group_nested",
                    type: "group",
                    combinator: "AND",
                    collapsed: false,
                    children: [
                        {
                            id: "rule_status",
                            type: "rule",
                            field: "status",
                            operator: "equals",
                            value: "active",
                        },
                        {
                            id: "rule_purchases",
                            type: "rule",
                            field: "purchases",
                            operator: "greaterThan",
                            value: "10",
                        },
                    ],
                },
            ],
        };

        expect(generateMongoQuery(queryTree, usersSchema)).toEqual({
            $or: [
                {
                    country: {
                        $eq: "Nigeria",
                    },
                },
                {
                    $and: [
                        {
                            status: {
                                $eq: "active",
                            },
                        },
                        {
                            purchases: {
                                $gt: 10,
                            },
                        },
                    ],
                },
            ],
        });
    });

    it("escapes special regex characters for contains", () => {
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
                    operator: "contains",
                    value: ".*",
                },
            ],
        };

        expect(generateMongoQuery(queryTree, usersSchema)).toEqual({
            $and: [
                {
                    name: {
                        $regex: "\\.\\*",
                        $options: "i",
                    },
                },
            ],
        });
    });

    it("preserves raw regex only for the regex operator", () => {
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
                    value: "^Ada",
                },
            ],
        };

        expect(generateMongoQuery(queryTree, usersSchema)).toEqual({
            $and: [
                {
                    name: {
                        $regex: "^Ada",
                        $options: "i",
                    },
                },
            ],
        });
    });
});