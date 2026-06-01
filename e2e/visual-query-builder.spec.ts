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
});