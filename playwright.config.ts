import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for the fixture application's end-to-end tests.
 *
 * Chromium is the only supported browser so the browser matrix stays reproducible.
 * The web server serves the production build through Vite's preview server; the
 * server is reused when one is already running so local runs stay fast.
 */
export default defineConfig({
  testDir: "./fixture/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
