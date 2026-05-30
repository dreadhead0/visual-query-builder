"use client";

import { useEffect } from "react";

type KeyboardShortcutOptions = {
    enabled?: boolean;
    onRunQuery: () => void;
    onResetQuery: () => void;
    onAddRootRule: () => void;
    onAddRootGroup: () => void;
    onOpenShortcuts: () => void;
};

function isMacPlatform() {
    if (typeof navigator === "undefined") {
        return false;
    }

    return navigator.platform.toLowerCase().includes("mac");
}

function isTypingTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    const tagName = target.tagName.toLowerCase();

    return (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        target.isContentEditable
    );
}

function hasPrimaryModifier(event: KeyboardEvent) {
    return isMacPlatform() ? event.metaKey : event.ctrlKey;
}

export function useKeyboardShortcuts({
    enabled = true,
    onRunQuery,
    onResetQuery,
    onAddRootRule,
    onAddRootGroup,
    onOpenShortcuts,
}: KeyboardShortcutOptions) {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            const key = event.key.toLowerCase();
            const hasPrimaryKey = hasPrimaryModifier(event);
            const isTyping = isTypingTarget(event.target);

            if (!hasPrimaryKey && key !== "escape") {
                return;
            }

            if (hasPrimaryKey && key === "enter") {
                event.preventDefault();
                onRunQuery();
                return;
            }

            if (isTyping) {
                return;
            }

            if (hasPrimaryKey && event.shiftKey && key === "r") {
                event.preventDefault();
                onResetQuery();
                return;
            }

            if (hasPrimaryKey && event.shiftKey && key === "a") {
                event.preventDefault();
                onAddRootRule();
                return;
            }

            if (hasPrimaryKey && event.shiftKey && key === "g") {
                event.preventDefault();
                onAddRootGroup();
                return;
            }

            if (hasPrimaryKey && event.shiftKey && key === "k") {
                event.preventDefault();
                onOpenShortcuts();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [
        enabled,
        onAddRootGroup,
        onAddRootRule,
        onOpenShortcuts,
        onResetQuery,
        onRunQuery,
    ]);
}