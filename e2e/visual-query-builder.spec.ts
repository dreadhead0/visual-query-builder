import { expect, test, type Page } from "@playwright/test";

async function selectRadixOption(
    page: Page,
    triggerTestId: string,
    optionName: string,
) {
    await page.getByTestId(triggerTestId).first().click();
    await page.getByRole("option", { name: optionName, exact: true }).click();
}

async function fillFirstValueInput(page: Page, value: string) {
    await page.getByPlaceholder("Enter value").first().fill(value);
}

async function expectRuleCount(page: Page, count: number) {
    await expect(page.getByText(`${count} rules`, { exact: true }).first()).toBeVisible();
}

test.describe("Visual Query Builder browser flows", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.evaluate(() => {
            window.localStorage.clear();
        });
        await page.reload();
        await page.getByText("Query Builder Canvas").waitFor();
    });

    test("loads the builder with preview, validation, and disabled execution", async ({
        page,
    }) => {
        await expect(page.getByText("Visual Query Builder")).toBeVisible();
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

        await expect(
            page.getByRole("heading", { name: "Export query JSON" }),
        ).toBeVisible();

        await expect(
            page.getByRole("textbox", { name: "Exported query JSON" }),
        ).toHaveValue(/"version": 1/);

        await page.keyboard.press("Escape");

        await expect(
            page.getByRole("heading", { name: "Export query JSON" }),
        ).toBeHidden();

        await page.getByTestId("import-json-button").click();

        await expect(
            page.getByRole("heading", { name: "Import query JSON" }),
        ).toBeVisible();

        await page
            .getByRole("textbox", { name: "Import query JSON" })
            .fill("{ bad json");

        await page.getByRole("button", { name: "Import Query" }).click();

        await expect(page.getByText("Expected property name or")).toBeVisible();
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

    test("toggles dark mode and persists theme after refresh", async ({ page }) => {
        await page.getByRole("button", { name: /Switch to dark mode/i }).click();

        const html = page.locator("html");

        await expect(html).toHaveClass(/dark/);

        await page.reload();

        await expect(html).toHaveClass(/dark/);
    });

    test("shows drag handles after adding a second rule", async ({ page }) => {
        await page.keyboard.press("Control+Shift+A");

        await expectRuleCount(page, 2);

        await expect(
            page.getByRole("button", { name: "Drag to reorder" }),
        ).toHaveCount(2);
    });
});