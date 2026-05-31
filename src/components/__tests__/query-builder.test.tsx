import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { QueryBuilder } from "@/components/query-builder";
import { useQueryBuilderStore } from "@/features/query-builder";

function resetStore() {
    useQueryBuilderStore.getState().setActiveSchema("users");
    useQueryBuilderStore.getState().resetQuery();
}

describe("QueryBuilder", () => {
    beforeEach(() => {
        resetStore();
    });

    it("renders the default root group and rule", () => {
        render(<QueryBuilder />);

        expect(screen.getByText("Query Builder Canvas")).toBeInTheDocument();
        expect(screen.getByText("Root group")).toBeInTheDocument();
        expect(screen.getByText("1 groups")).toBeInTheDocument();
        expect(screen.getByText("1 rules")).toBeInTheDocument();
    });

    it("adds a rule through the group action", async () => {
        const user = userEvent.setup();

        render(<QueryBuilder />);

        const addRuleButtons = screen.getAllByRole("button", {
            name: /add rule/i,
        });

        await user.click(addRuleButtons[0]);

        expect(screen.getByText("2 rules")).toBeInTheDocument();
    });

    it("adds a nested group through the group action", async () => {
        const user = userEvent.setup();

        render(<QueryBuilder />);

        const addGroupButtons = screen.getAllByRole("button", {
            name: /add group/i,
        });

        await user.click(addGroupButtons[0]);

        expect(screen.getByText("2 groups")).toBeInTheDocument();
        expect(screen.getByText("Depth 3")).toBeInTheDocument();
    });
});