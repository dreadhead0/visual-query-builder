import {
    removeNodeFromTree,
    toggleGroupCollapsed,
    updateGroupCombinator,
    updateNodeInTree,
    updateRuleValue,
    type GroupNode,
} from "@/features/query-builder";

describe("store utilities", () => {
    const tree: GroupNode = {
        id: "group_root",
        type: "group",
        combinator: "AND",
        collapsed: false,
        children: [
            {
                id: "rule_name",
                type: "rule",
                field: "name",
                operator: "equals",
                value: "Ada",
            },
            {
                id: "group_nested",
                type: "group",
                combinator: "OR",
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
            },
        ],
    };

    it("updates a nested rule immutably", () => {
        const updatedTree = updateNodeInTree(tree, {
            targetId: "rule_age",
            update: (node) => {
                if (node.type !== "rule") {
                    return node;
                }

                return updateRuleValue(node, "25");
            },
        }) as GroupNode;

        const nestedGroup = updatedTree.children[1];

        expect(nestedGroup.type).toBe("group");

        if (nestedGroup.type === "group") {
            const nestedRule = nestedGroup.children[0];

            expect(nestedRule.type).toBe("rule");

            if (nestedRule.type === "rule") {
                expect(nestedRule.value).toBe("25");
            }
        }

        const originalNestedGroup = tree.children[1];

        expect(originalNestedGroup.type).toBe("group");

        if (originalNestedGroup.type === "group") {
            const originalRule = originalNestedGroup.children[0];

            expect(originalRule.type).toBe("rule");

            if (originalRule.type === "rule") {
                expect(originalRule.value).toBe("18");
            }
        }
    });

    it("removes a nested node", () => {
        const updatedTree = removeNodeFromTree(tree, "rule_age") as GroupNode;
        const nestedGroup = updatedTree.children[1];

        expect(nestedGroup.type).toBe("group");

        if (nestedGroup.type === "group") {
            expect(nestedGroup.children).toHaveLength(0);
        }
    });

    it("updates group combinator", () => {
        const updatedGroup = updateGroupCombinator(tree, "OR");

        expect(updatedGroup.combinator).toBe("OR");
    });

    it("toggles group collapsed state", () => {
        const updatedGroup = toggleGroupCollapsed(tree);

        expect(updatedGroup.collapsed).toBe(true);
    });
});