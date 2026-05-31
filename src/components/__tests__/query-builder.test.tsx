import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { QueryBuilder } from "@/components/query-builder/query-builder";
import { useQueryBuilderStore } from "@/features/query-builder";

describe("QueryBuilder", () => {
    beforeEach(() => {
        useQueryBuilderStore.getState().resetQuery();
    });

    it("renders the query structure and selected rule editor", () => {
        render(<QueryBuilder />);

        expect(screen.getByText("Query Builder Canvas")).toBeInTheDocument();
        expect(screen.getByText("Query Structure")).toBeInTheDocument();

        expect(screen.getByTestId("selected-rule-editor")).toBeInTheDocument();
        expect(screen.getByTestId("query-tree-rule")).toBeInTheDocument();

        expect(screen.getByTestId("rule-field-trigger")).toBeInTheDocument();
        expect(screen.getByTestId("rule-operator-trigger")).toBeInTheDocument();
    });

    it("adds a rule through the root group action", async () => {
        const user = userEvent.setup();

        render(<QueryBuilder />);

        await user.click(screen.getByRole("button", { name: /back to root/i }));

        const addRuleButtons = screen.getAllByRole("button", {
            name: /add rule/i,
        });

        await user.click(addRuleButtons[0]);

        expect(screen.getByText("2 rules")).toBeInTheDocument();
    });

    it("adds a nested group through the root group action", async () => {
        const user = userEvent.setup();

        render(<QueryBuilder />);

        await user.click(screen.getByRole("button", { name: /back to root/i }));

        const addGroupButtons = screen.getAllByRole("button", {
            name: /add group/i,
        });

        await user.click(addGroupButtons[0]);

        expect(screen.getByText("2 groups")).toBeInTheDocument();
    });
});