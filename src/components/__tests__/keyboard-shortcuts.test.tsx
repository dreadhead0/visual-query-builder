import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppShell } from "@/components/layout/app-shell";
import { useQueryBuilderStore } from "@/features/query-builder";

function resetStore() {
    useQueryBuilderStore.getState().setActiveSchema("users");
    useQueryBuilderStore.getState().resetQuery();
    useQueryBuilderStore.getState().clearQueryHistory();
}

describe("keyboard shortcuts", () => {
    beforeEach(() => {
        resetStore();
    });

    it("opens the shortcuts dialog with Ctrl + Shift + K", async () => {
        const user = userEvent.setup();

        render(<AppShell />);

        await user.keyboard("{Control>}{Shift>}k{/Shift}{/Control}");

        expect(screen.getByText("Keyboard shortcuts")).toBeInTheDocument();
        expect(screen.getByText("Run the current valid query")).toBeInTheDocument();
    });

    it("adds a root rule with Ctrl + Shift + A", async () => {
        const user = userEvent.setup();

        render(<AppShell />);

        expect(screen.getByText("1 rules")).toBeInTheDocument();

        await user.keyboard("{Control>}{Shift>}a{/Shift}{/Control}");

        expect(screen.getByText("2 rules")).toBeInTheDocument();
    });

    it("adds a root group with Ctrl + Shift + G", async () => {
        const user = userEvent.setup();

        render(<AppShell />);

        expect(screen.getByText("1 groups")).toBeInTheDocument();

        await user.keyboard("{Control>}{Shift>}g{/Shift}{/Control}");

        expect(screen.getByText("2 groups")).toBeInTheDocument();
    });
});