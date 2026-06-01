"use client";

import { Keyboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type KeyboardShortcutsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const SHORTCUTS = [
    {
        keys: ["Ctrl/Cmd", "Enter"],
        description: "Run the current valid query",
        tone: "accent-primary-soft",
    },
    {
        keys: ["Ctrl/Cmd", "Shift", "R"],
        description: "Reset the current query",
        tone: "state-warning",
    },
    {
        keys: ["Ctrl/Cmd", "Shift", "A"],
        description: "Add a rule to the root group",
        tone: "accent-action",
    },
    {
        keys: ["Ctrl/Cmd", "Shift", "G"],
        description: "Add a nested group to the root group",
        tone: "logic-or",
    },
    {
        keys: ["Ctrl/Cmd", "Shift", "K"],
        description: "Open this keyboard shortcuts guide",
        tone: "state-valid",
    },
];

export function KeyboardShortcutsDialog({
    open,
    onOpenChange,
}: KeyboardShortcutsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass-modal w-[calc(100vw-2rem)] max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="accent-primary-soft flex h-9 w-9 items-center justify-center rounded-xl border">
                            <Keyboard className="h-5 w-5" />
                        </span>
                        Keyboard shortcuts
                    </DialogTitle>

                    <DialogDescription>
                        Use these shortcuts to move faster while building and testing
                        QueryNest queries.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    {SHORTCUTS.map((shortcut) => (
                        <div
                            key={shortcut.description}
                            className="liquid-readable grid gap-3 rounded-xl p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                        >
                            <p className="text-sm leading-6 text-muted-foreground">
                                {shortcut.description}
                            </p>

                            <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:justify-end">
                                {shortcut.keys.map((key) => (
                                    <kbd
                                        key={key}
                                        className={`${shortcut.tone} rounded-md border px-2 py-1 text-xs font-medium leading-none`}
                                    >
                                        {key}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <Button
                        type="button"
                        className="accent-cta"
                        onClick={() => onOpenChange(false)}
                    >
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}