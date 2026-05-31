import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./vitest.setup.ts"],
        slowTestThreshold: 5000,
        exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/.next/**",
            "**/e2e/**",
            "**/playwright-report/**",
            "**/test-results/**",
        ],
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});