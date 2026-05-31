"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

function subscribe() {
    return () => { };
}

function useIsMounted() {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
}

export function ThemeToggle() {
    const isMounted = useIsMounted();
    const { resolvedTheme, setTheme } = useTheme();

    if (!isMounted) {
        return (
            <Button type="button" variant="outline" disabled>
                Theme
            </Button>
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <Button
            type="button"
            variant="outline"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                <Sun className="mr-2 h-4 w-4" />
            ) : (
                <Moon className="mr-2 h-4 w-4" />
            )}
            {isDark ? "Light" : "Dark"}
        </Button>
    );
}