import {
    addChildToGroup,
    countGroups,
    countRules,
    getTreeDepth,
    reorderChildrenInGroup,
    type GroupNode,
    type RuleNode,
} from "@/features/query-builder";

const firstRule: RuleNode = {
    id: "rule_first",
    type: "rule",
    field: "name",
    operator: "equals",
    value: "Ada",
};

const secondRule: RuleNode = {
    id: "rule_second",
    type: "rule",
    field: "age",
    operator: "greaterThan",
    value: "18",
};

const thirdRule: RuleNode = {
    id: "rule_third",
    type: "rule",
    field: "country",
    operator: "equals",
    value: "Nigeria",
};

describe("tree utilities", () => {
    it("counts rules, groups, and depth recursively", () => {
        const tree: GroupNode = {
            id: "group_root",
            type: "group",
            combinator: "AND",
            collapsed: false,
            children: [
                firstRule,
                {
                    id: "group_nested",
                    type: "group",
                    combinator: "OR",
                    collapsed: false,
                    children: [secondRule],
                },
            ],
        };

        expect(countRules(tree)).toBe(2);
        expect(countGroups(tree)).toBe(2);
        expect(getTreeDepth(tree)).toBe(3);
    });

    it("adds a child to a target group immutably", () => {
        const tree: GroupNode = {
            id: "group_root",
            type: "group",
            combinator: "AND",
            collapsed: false,
            children: [firstRule],
        };

        const updatedTree = addChildToGroup(tree, {
            parentGroupId: "group_root",
            child: secondRule,
        }) as GroupNode;

        expect(updatedTree.children).toHaveLength(2);
        expect(tree.children).toHaveLength(1);
    });

    it("reorders children inside the root group", () => {
        const tree: GroupNode = {
            id: "group_root",
            type: "group",
            combinator: "AND",
            collapsed: false,
            children: [firstRule, secondRule],
        };

        const updatedTree = reorderChildrenInGroup(tree, {
            parentGroupId: "group_root",
            activeId: "rule_second",
            overId: "rule_first",
        }) as GroupNode;

        expect(updatedTree.children.map((child) => child.id)).toEqual([
            "rule_second",
            "rule_first",
        ]);
    });

    it("reorders children inside a nested group without changing other groups", () => {
        const tree: GroupNode = {
            id: "group_root",
            type: "group",
            combinator: "AND",
            collapsed: false,
            children: [
                firstRule,
                {
                    id: "group_nested",
                    type: "group",
                    combinator: "OR",
                    collapsed: false,
                    children: [secondRule, thirdRule],
                },
            ],
        };

        const updatedTree = reorderChildrenInGroup(tree, {
            parentGroupId: "group_nested",
            activeId: "rule_third",
            overId: "rule_second",
        }) as GroupNode;

        expect(updatedTree.children[0]).toEqual(firstRule);

        const nestedGroup = updatedTree.children[1];

        expect(nestedGroup.type).toBe("group");

        if (nestedGroup.type === "group") {
            expect(nestedGroup.children.map((child) => child.id)).toEqual([
                "rule_third",
                "rule_second",
            ]);
        }

        const originalNestedGroup = tree.children[1];

        expect(originalNestedGroup.type).toBe("group");

        if (originalNestedGroup.type === "group") {
            expect(originalNestedGroup.children.map((child) => child.id)).toEqual([
                "rule_second",
                "rule_third",
            ]);
        }
    });
});