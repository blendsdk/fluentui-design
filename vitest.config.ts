import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for the catalog and verification tooling.
 *
 * Only the unit tests under `scripts/__tests__/` are collected here. The fixture
 * application's browser tests live under `fixture/e2e/` and run through Playwright,
 * so they are deliberately excluded from this runner.
 *
 * Some tests drive the TypeScript compiler, which can take well over the default
 * five seconds on a loaded machine. A generous timeout and a small worker pool
 * keep those tests stable without hiding a genuinely hanging test.
 */
export default defineConfig({
  test: {
    include: ["scripts/__tests__/**/*.test.ts"],
    environment: "node",
    passWithNoTests: false,
    testTimeout: 30_000,
    maxWorkers: 2,
  },
});
