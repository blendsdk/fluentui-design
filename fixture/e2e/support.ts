import { test as base, expect } from "@playwright/test";

/**
 * Shared Playwright fixtures for the fixture application's end-to-end tests.
 *
 * Every test runs with a `consoleGuard` fixture that records browser console
 * errors and uncaught page errors, then fails the test if any were produced.
 * This enforces the requirement that the tested flows run without console
 * errors or React warnings.
 */
export const test = base.extend<{ consoleGuard: void }>({
  consoleGuard: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") {
          errors.push(message.text());
        }
      });
      page.on("pageerror", (error) => {
        errors.push(error.message);
      });

      await use();

      expect(errors, `browser console errors:\n${errors.join("\n")}`).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** The list page loads its data through the deterministic `ready` state. */
export const LIST_URL = "/?state=ready";

/** Build a URL for a runtime state, theme, and text direction. */
export function url(options: {
  state?: string;
  theme?: "light" | "dark";
  dir?: "ltr" | "rtl";
  open?: "new" | "edit";
}): string {
  const params = new URLSearchParams();
  params.set("state", options.state ?? "ready");
  if (options.theme) {
    params.set("theme", options.theme);
  }
  if (options.dir) {
    params.set("dir", options.dir);
  }
  if (options.open) {
    params.set("open", options.open);
  }
  return `/?${params.toString()}`;
}

/** Parse the number of save calls the fixture recorded in the browser. */
export async function readSaveCount(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(() => {
    const value = (globalThis as Record<string, unknown>)["__fluentuiFixtureSaveCalls"];
    return typeof value === "number" ? value : 0;
  });
}
