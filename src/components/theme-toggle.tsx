"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
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