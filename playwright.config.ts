import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the Customer Account API E2E suite.
 *
 * Public smoke tests (logged-out flows) run against `npm run dev` without
 * any Shopify configuration. Authenticated tests skip themselves when the
 * `TEST_CUSTOMER_EMAIL` / `TEST_CUSTOMER_PASSWORD` env vars are missing
 * (see `tests/e2e/customer-account.spec.ts`).
 *
 * Browsers must be installed once with `npx playwright install chromium`.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
