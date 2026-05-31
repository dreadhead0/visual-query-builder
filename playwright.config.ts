import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: "html",
    use: {
        baseURL: "http://localhost:3000",
        colorScheme: "light",
        trace: "on-first-retry",
    },
    webServer: {
        command: "npm run dev -- --hostname localhost",
        url: "http://localhost:3000",
        reuseExistingServer: false,
        timeout: 120_000,
    },
    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
            },
        },
    ],
});