import { readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";

/**
 * Narrow an unknown JSON value to a plain object.
 *
 * JSON parsing returns `unknown`; most catalogs are objects, not arrays or
 * primitives, so callers use this guard before reading named fields.
 *
 * @param value - Any value produced by `JSON.parse`.
 * @returns `true` when `value` is a non-null, non-array object.
 *
 * @example
 * ```ts
 * const data = JSON.parse(text);
 * if (isJsonObject(data)) {
 *   console.log(data["version"]);
 * }
 * ```
 */
export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Read a UTF-8 JSON file and parse it.
 *
 * The parse error is wrapped with the file path so a failing validator reports
 * which catalog is malformed instead of a bare `Unexpected token` message.
 *
 * @param filePath - Path to the JSON file, relative to the process working directory.
 * @returns The parsed JSON value, still `unknown` until the caller validates it.
 * @throws Error when the file cannot be read or contains invalid JSON.
 */
export async function readJsonFile(filePath: string): Promise<unknown> {
  const text = await readFile(filePath, "utf8");
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse JSON at ${filePath}: ${reason}`);
  }
}

/**
 * Read a UTF-8 JSON file and parse it synchronously.
 *
 * Useful inside validators and tests that must produce an answer without an
 * `await` boundary. The error is wrapped with the file path, as in
 * {@link readJsonFile}.
 *
 * @param filePath - Path to the JSON file, relative to the process working directory.
 * @returns The parsed JSON value.
 * @throws Error when the file cannot be read or contains invalid JSON.
 */
export function readJsonFileSync(filePath: string): unknown {
  const text = readFileSync(filePath, "utf8");
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse JSON at ${filePath}: ${reason}`);
  }
}

/**
 * Serialize a value as stable, human-readable JSON.
 *
 * Output always ends with a single trailing newline and uses two-space
 * indentation so committed files stay byte-reproducible across runs.
 *
 * @param value - Any JSON-serializable value.
 * @returns Pretty-printed JSON text with a trailing newline.
 */
export function stringifyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

/**
 * Write a value to disk as stable JSON.
 *
 * @param filePath - Destination path, relative to the process working directory.
 * @param value - Any JSON-serializable value.
 * @throws Error when the destination cannot be written.
 */
export async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, stringifyJson(value), "utf8");
}
