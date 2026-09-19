import { readFileSync } from "node:fs";

/**
 * Narrow an unknown value to a plain object.
 *
 * @param value - Value read from a fixture or a parsed catalog.
 * @returns `true` when the value is a non-null, non-array object.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Read and parse a JSON file relative to the repository root.
 *
 * @param relativePath - Repository-relative path to the JSON file.
 * @returns The parsed JSON value.
 */
export function parseJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(relativePath, "utf8"));
}

/**
 * Read a JSON file that is expected to contain an array.
 *
 * @param relativePath - Repository-relative path to the JSON file.
 * @returns The parsed array.
 * @throws Error when the file does not contain a JSON array.
 */
export function parseJsonArray(relativePath: string): unknown[] {
  const value = parseJson(relativePath);
  if (!Array.isArray(value)) {
    throw new Error(`${relativePath} must contain a JSON array`);
  }
  return value;
}

/**
 * Copy an object and override selected fields.
 *
 * Tests use this to derive an intentionally invalid entry from a known-good one.
 *
 * @param base - The object to copy.
 * @param overrides - Fields that replace the copied values.
 * @returns A new object with the overrides applied.
 */
export function withFields(
  base: Record<string, unknown>,
  overrides: Record<string, unknown>,
): Record<string, unknown> {
  return { ...base, ...overrides };
}
