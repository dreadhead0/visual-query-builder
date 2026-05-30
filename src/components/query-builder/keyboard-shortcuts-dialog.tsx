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
    },
    {
        keys: ["Ctrl/Cmd", "Shift", "R"],
        description: "Reset the current query",
    },
    {
        keys: ["Ctrl/Cmd", "Shift", "A"],
        description: "Add a rule to the root group",
    },
    {
        keys: ["Ctrl/Cmd", "Shift", "G"],
        description: "Add a nested group to the root group",
    },
    {
        keys: ["Ctrl/Cmd", "Shift", "K"],
        description: "Open this keyboard shortcuts guide",
    },
];

export function KeyboardShortcutsDialog({
    open,
    onOpenChange,
}: KeyboardShortcutsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />
                        Keyboard shortcuts
                    </DialogTitle>

                    <DialogDescription>
                        Use these shortcuts to move faster while building and testing
                        queries.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    {SHORTCUTS.map((shortcut) => (
                        <div
                            key={shortcut.description}
                            className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <p className="text-sm text-muted-foreground">
                                {shortcut.description}
                            </p>

                            <div className="flex flex-wrap gap-1">
                                {shortcut.keys.map((key) => (
                                    <kbd
                                        key={key}
                                        className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium"
                                    >
                                        {key}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <Button type="button" onClick={() => onOpenChange(false)}>
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}