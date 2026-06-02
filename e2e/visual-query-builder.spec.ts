import { expect, test, type Page } from "@playwright/test";

async function openFirstRuleEditor(page: Page) {
    if (
        await page
            .getByTestId("rule-field-trigger")
            .first()
            .isVisible()
            .catch(() => false)
    ) {
        return;
    }

    await page.getByTestId("query-tree-rule").first().click();

    await expect(page.getByTestId("selected-rule-editor")).toBeVisible();
    await expect(page.getByTestId("rule-field-trigger").first()).toBeVisible();
    await expect(page.getByTestId("rule-operator-trigger").first()).toBeVisible();
}

async function selectRadixOption(
    page: Page,
    triggerTestId: string,
    optionName: string,
) {
    if (triggerTestId.startsWith("rule-")) {
        await openFirstRuleEditor(page);
    }

    await page.getByTestId(triggerTestId).first().click();
    await page.getByRole("option", { name: optionName, exact: true }).click();
}

async function fillFirstValueInput(page: Page, value: string) {
    await openFirstRuleEditor(page);

    const input = page.getByPlaceholder("Enter value").first();

    await expect(input).toBeVisible();
    await input.fill(value);
}

async function expectRuleCount(page: Page, count: number) {
    await expect(
        page.getByText(`${count} rules`, { exact: true }).first(),
    ).toBeVisible();
}

async function importQueryJson(page: Page, payload: unknown) {
    await page.getByTestId("import-json-button").click();

    const dialog = page.getByTestId("import-json-dialog");

    await expect(dialog).toBeVisible();

    await page
        .getByTestId("import-json-textarea")
        .fill(JSON.stringify(payload, null, 2));

    await dialog
        .getByRole("button", { name: "Import Query", exact: true })
        .click();

    await expect(dialog).not.toBeVisible();
}

test.describe("Landing page", () => {
    test("links users into the query builder", async ({ page }) => {
        await page.goto("/");

        await expect(
            page.getByRole("heading", {
                name: "Build complex queries without writing raw syntax.",
            }),
        ).toBeVisible();

        await page.getByRole("link", { name: /Get Started/i }).first().click();

        await expect(page).toHaveURL(/\/builder/);
        await expect(page.getByText("Query Builder Canvas")).toBeVisible();
    });
});

test.describe("Visual Query Builder browser flows", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/builder");
        await page.evaluate(() => {
            window.localStorage.clear();
        });
        await page.reload();
        await page.getByText("Query Builder Canvas").waitFor();
    });

    test("loads the builder with preview, validation, and disabled execution", async ({
        page,
    }) => {
        await expect(page.getByRole("heading", { name: "QueryNest" })).toBeVisible();
        await expect(page.getByText("Data Source")).toBeVisible();
        await expect(page.getByText("Query Builder Canvas")).toBeVisible();
        await expect(page.getByText("Live Query Preview")).toBeVisible();

        await expect(page.getByText("This rule needs a value.")).toBeVisible();

        await expect(
            page.getByRole("button", { name: "Run Query" }),
        ).toBeDisabled();
    });

    test("shows validation error and prevents invalid execution", async ({
        page,
    }) => {
        await expect(page.getByText("This rule needs a value.")).toBeVisible();

        await expect(
            page.getByRole("button", { name: "Run Query" }),
        ).toBeDisabled();
    });

    test("switches schemas and runs product query", async ({ page }) => {
        await selectRadixOption(page, "schema-select-trigger", "Products");

        await expect(
            page.getByText("Product catalogue records for inventory filtering."),
        ).toBeVisible();

        await expect(page.getByText("Price")).toBeVisible();

        await selectRadixOption(page, "rule-field-trigger", "Price");
        await selectRadixOption(page, "rule-operator-trigger", "Less than");

        await fillFirstValueInput(page, "50");

        await page.getByRole("button", { name: "Run Query" }).click();

        await expect(
            page.getByText("Showing records from the Products mock dataset."),
        ).toBeVisible();

        await expect(page.getByText("Wireless Keyboard")).toBeVisible();
    });

    test("opens keyboard shortcuts and uses shortcut to add a rule", async ({
        page,
    }) => {
        await page.keyboard.press("Control+Shift+K");

        await expect(
            page.getByRole("heading", { name: "Keyboard shortcuts" }),
        ).toBeVisible();

        await expect(page.getByText("Run the current valid query")).toBeVisible();

        await page.getByRole("button", { name: "Done" }).click();

        await expectRuleCount(page, 1);

        await page.keyboard.press("Control+Shift+A");

        await expectRuleCount(page, 2);
    });

    test("exports and rejects invalid imported JSON", async ({ page }) => {
        await page.getByTestId("export-json-button").click();

        await expect(page.getByTestId("export-json-dialog")).toBeVisible();

        await expect(page.getByTestId("export-json-textarea")).toHaveValue(
            /"version": 1/,
        );

        await page.keyboard.press("Escape");

        await expect(page.getByTestId("export-json-dialog")).toBeHidden();

        await page.getByTestId("import-json-button").click();

        await expect(page.getByTestId("import-json-dialog")).toBeVisible();

        await page.getByTestId("import-json-textarea").fill("{ bad json");

        await page
            .getByTestId("import-json-dialog")
            .getByRole("button", { name: "Import Query", exact: true })
            .click();
        await expect(page.getByTestId("import-json-error")).toContainText(
            /Expected property name|Unexpected token|JSON/i,
        );
    });

    test("saves a preset and keeps it after refresh", async ({ page }) => {
        await fillFirstValueInput(page, "Ada");

        await page.getByRole("tab", { name: "Presets" }).click();

        await page.getByLabel("Preset name").fill("Ada query");
        await page.getByRole("button", { name: /Save Current/i }).click();

        await expect(page.getByText("Ada query")).toBeVisible();

        await page.reload();

        await page.getByRole("tab", { name: "Presets" }).click();

        await expect(page.getByText("Ada query")).toBeVisible();
    });

    test("toggles light mode and persists theme after refresh", async ({ page }) => {
        const html = page.locator("html");

        await expect(html).toHaveClass(/dark/);

        await page
            .getByRole("button", { name: /Light|Switch to light mode/i })
            .click();

        await expect(html).toHaveClass(/light/);

        await page.reload();

        await expect(html).toHaveClass(/light/);
    });

    test("shows drag handles after adding a second rule", async ({ page }) => {
        await page.keyboard.press("Control+Shift+A");

        await expectRuleCount(page, 2);

        await expect(
            page.getByRole("button", { name: "Drag to reorder" }),
        ).toHaveCount(2);
    });

    test("collapses and expands a nested group from the editor", async ({ page }) => {
        await page.keyboard.press("Control+Shift+G");

        await expect(page.getByText(/1\s*nested group/i)).toBeVisible();

        const nestedGroupNode = page.getByTestId("query-tree-group").first();

        await expect(nestedGroupNode).toBeVisible();

        await nestedGroupNode.click();

        const groupEditor = page.getByTestId("selected-group-editor");

        await expect(groupEditor).toBeVisible();

        await groupEditor.getByRole("button", { name: "Collapse group" }).click();

        await expect(
            groupEditor.getByRole("button", { name: "Expand group" }),
        ).toBeVisible();

        await groupEditor.getByRole("button", { name: "Expand group" }).click();

        await expect(
            groupEditor.getByRole("button", { name: "Collapse group" }),
        ).toBeVisible();
    });

    test("handles very deep nested groups without breaking the builder", async ({
        page,
    }) => {
        await page.setViewportSize({ width: 1366, height: 900 });

        const deepNestedQuery = {
            version: 1,
            schemaId: "users",
            queryTree: {
                id: "group_root_deep_test",
                type: "group",
                combinator: "AND",
                collapsed: false,
                children: [
                    {
                        id: "group_depth_1",
                        type: "group",
                        combinator: "AND",
                        collapsed: false,
                        children: [
                            {
                                id: "group_depth_2",
                                type: "group",
                                combinator: "AND",
                                collapsed: false,
                                children: [
                                    {
                                        id: "group_depth_3",
                                        type: "group",
                                        combinator: "AND",
                                        collapsed: false,
                                        children: [
                                            {
                                                id: "group_depth_4",
                                                type: "group",
                                                combinator: "AND",
                                                collapsed: false,
                                                children: [
                                                    {
                                                        id: "group_depth_5",
                                                        type: "group",
                                                        combinator: "AND",
                                                        collapsed: false,
                                                        children: [
                                                            {
                                                                id: "group_depth_6",
                                                                type: "group",
                                                                combinator: "AND",
                                                                collapsed: false,
                                                                children: [
                                                                    {
                                                                        id: "rule_deep_age",
                                                                        type: "rule",
                                                                        field: "age",
                                                                        operator: "greaterThan",
                                                                        value: 18,
                                                                    },
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        };

        await importQueryJson(page, deepNestedQuery);

        await expect(page.getByText(/Depth 8/i)).toBeVisible();
        await expect(page.getByText(/1 rules/i).first()).toBeVisible();
        await expect(page.getByText(/Query is valid/i)).toBeVisible();

        const queryStructure = page
            .getByText("Query Structure")
            .locator("xpath=ancestor::section[1]");

        await expect(queryStructure).toBeVisible();

        const treeScroll = queryStructure.locator(".query-tree-scroll");

        await expect(treeScroll).toBeVisible();

        const hasHorizontalScroll = await treeScroll.evaluate((element) => {
            return element.scrollWidth > element.clientWidth;
        });

        expect(hasHorizontalScroll).toBeTruthy();

        await treeScroll.evaluate((element) => {
            element.scrollLeft = element.scrollWidth;
        });

        await expect(page.getByText("Age").first()).toBeVisible();
        await expect(page.getByText("Greater than").first()).toBeVisible();

        const lastNestedGroup = page.getByTestId("query-tree-group").last();

        await lastNestedGroup.click();

        const groupEditor = page.getByTestId("selected-group-editor");

        await expect(groupEditor).toBeVisible();

        await groupEditor.getByRole("button", { name: "Collapse group" }).click();
        await expect(
            groupEditor.getByRole("button", { name: "Expand group" }),
        ).toBeVisible();

        await groupEditor.getByRole("button", { name: "Expand group" }).click();
        await expect(
            groupEditor.getByRole("button", { name: "Collapse group" }),
        ).toBeVisible();

        await expect(page.getByRole("button", { name: /Run Query/i })).toBeEnabled();
    });

    test("handles many rules in one group and still executes the query", async ({
        page,
    }) => {
        await page.setViewportSize({ width: 1366, height: 900 });

        const ruleTemplates = [
            {
                field: "name",
                operator: "contains",
                value: "a",
            },
            {
                field: "email",
                operator: "contains",
                value: "example",
            },
            {
                field: "age",
                operator: "greaterThan",
                value: 18,
            },
            {
                field: "purchases",
                operator: "greaterThan",
                value: 5,
            },
            {
                field: "status",
                operator: "equals",
                value: "active",
            },
            {
                field: "country",
                operator: "equals",
                value: "Nigeria",
            },
            {
                field: "isVerified",
                operator: "equals",
                value: true,
            },
        ];

        const manyRules = Array.from({ length: 25 }, (_, index) => {
            const template = ruleTemplates[index % ruleTemplates.length];

            return {
                id: `rule_many_${index + 1}`,
                type: "rule",
                field: template.field,
                operator: template.operator,
                value: template.value,
            };
        });

        const manyRulesQuery = {
            version: 1,
            schemaId: "users",
            queryTree: {
                id: "group_root_many_rules_test",
                type: "group",
                combinator: "OR",
                collapsed: false,
                children: manyRules,
            },
        };

        await importQueryJson(page, manyRulesQuery);

        await expect(page.getByText(/25 rules/i).first()).toBeVisible();
        await expect(page.getByText(/Query is valid/i)).toBeVisible();

        await expect(page.getByText("Name").first()).toBeVisible();
        await expect(page.getByText("Email").first()).toBeVisible();
        await expect(page.getByText("Age").first()).toBeVisible();

        await expect(page.getByRole("button", { name: /Run Query/i })).toBeEnabled();

        await page.getByRole("button", { name: /Run Query/i }).click();

        await expect(page.getByText(/Execution Results/i)).toBeVisible();
        await expect(
            page.getByText("Showing records from the Users mock dataset."),
        ).toBeVisible();
        await expect(page.getByText(/results/i).first()).toBeVisible();

        await page.getByRole("button", { name: /ASC/i }).click();

        await expect(page.getByRole("button", { name: /DESC/i })).toBeVisible();
    });

    test("handles multiple rules and nested groups with mixed logic", async ({
        page,
    }) => {
        await page.setViewportSize({ width: 1366, height: 900 });

        const mixedGroupQuery = {
            version: 1,
            schemaId: "users",
            queryTree: {
                id: "group_root_mixed_test",
                type: "group",
                combinator: "OR",
                collapsed: false,
                children: [
                    {
                        id: "group_demographic_filters",
                        type: "group",
                        combinator: "AND",
                        collapsed: false,
                        children: [
                            {
                                id: "rule_age_gt_18",
                                type: "rule",
                                field: "age",
                                operator: "greaterThan",
                                value: 18,
                            },
                            {
                                id: "rule_country_nigeria",
                                type: "rule",
                                field: "country",
                                operator: "equals",
                                value: "Nigeria",
                            },
                        ],
                    },
                    {
                        id: "group_account_filters",
                        type: "group",
                        combinator: "AND",
                        collapsed: false,
                        children: [
                            {
                                id: "rule_status_active",
                                type: "rule",
                                field: "status",
                                operator: "equals",
                                value: "active",
                            },
                            {
                                id: "rule_purchases_gt_10",
                                type: "rule",
                                field: "purchases",
                                operator: "greaterThan",
                                value: 10,
                            },
                            {
                                id: "group_verified_recent",
                                type: "group",
                                combinator: "AND",
                                collapsed: false,
                                children: [
                                    {
                                        id: "rule_is_verified",
                                        type: "rule",
                                        field: "isVerified",
                                        operator: "equals",
                                        value: true,
                                    },
                                    {
                                        id: "rule_created_after",
                                        type: "rule",
                                        field: "createdAt",
                                        operator: "after",
                                        value: "2025-01-01",
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: "group_search_filters",
                        type: "group",
                        combinator: "OR",
                        collapsed: false,
                        children: [
                            {
                                id: "rule_name_starts_a",
                                type: "rule",
                                field: "name",
                                operator: "startsWith",
                                value: "A",
                            },
                            {
                                id: "rule_email_contains_example",
                                type: "rule",
                                field: "email",
                                operator: "contains",
                                value: "example",
                            },
                        ],
                    },
                ],
            },
        };

        await importQueryJson(page, mixedGroupQuery);

        await expect(page.getByText(/4 nested groups/i).first()).toBeVisible();
        await expect(page.getByText(/8 rules/i).first()).toBeVisible();
        await expect(page.getByText(/Query is valid/i)).toBeVisible();

        await expect(page.getByText(/\$or/i).first()).toBeVisible();
        await expect(page.getByText(/\$and/i).first()).toBeVisible();

        await expect(page.getByRole("button", { name: /Run Query/i })).toBeEnabled();

        await page.getByRole("button", { name: /Run Query/i }).click();

        await expect(
            page.getByText("Showing records from the Users mock dataset."),
        ).toBeVisible();

        await expect(page.getByText(/results/i).first()).toBeVisible();
    });
});
