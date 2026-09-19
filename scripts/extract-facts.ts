import { readFile } from "node:fs/promises";
import { isJsonObject, readJsonFileSync, writeJsonFile } from "./lib/json.js";
import { FACTS_JSON_PATH } from "./lib/facts.js";

/**
 * Default location of the sibling API-fact schema, relative to this repository.
 *
 * The schema is recorded as provenance for the pin. It does not expose a
 * structured export list, so it cannot supply the allowlist itself. Set
 * `FLUENTUI_SCHEMA_PATH` to point at a different checkout.
 */
const DEFAULT_SCHEMA_PATH = "../fluentui-mcp/data/v9/fluentui-schema-enhanced.json";

/** The sibling API-fact commit the allowlist is pinned to. */
const SOURCE_COMMIT = "d595d79";

/** The package whose runtime exports are recorded. */
const PACKAGE_NAME = "@fluentui/react-components";

/** Read and parse a JSON file into an object. */
function readObjectSync(filePath: string): Record<string, unknown> {
  const value = readJsonFileSync(filePath);
  if (!isJsonObject(value)) {
    throw new Error(`${filePath} must contain a JSON object`);
  }
  return value;
}

/** Read the schema's declared version for provenance. */
function readSchemaVersion(schemaPath: string): string {
  const schema = readObjectSync(schemaPath);
  return typeof schema["schemaVersion"] === "string" ? schema["schemaVersion"] : "unknown";
}

/**
 * Return the exact version the repository pins for the package.
 *
 * Requiring the installed version to equal the declared pin makes the allowlist
 * a truthful record of the version the repository says it uses.
 */
async function readPinnedVersion(): Promise<string> {
  const manifest = JSON.parse(await readFile("package.json", "utf8")) as unknown;
  if (!isJsonObject(manifest)) {
    throw new Error("package.json must contain a JSON object");
  }
  const dependencies = manifest["dependencies"];
  if (!isJsonObject(dependencies) || typeof dependencies[PACKAGE_NAME] !== "string") {
    throw new Error(`package.json does not pin ${PACKAGE_NAME}`);
  }
  return dependencies[PACKAGE_NAME];
}

/** Read the installed package version from its manifest. */
async function readInstalledVersion(): Promise<string> {
  const manifestPath = `node_modules/${PACKAGE_NAME}/package.json`;
  const manifest = readObjectSync(manifestPath);
  if (typeof manifest["version"] !== "string") {
    throw new Error(`${manifestPath} does not declare a version`);
  }
  return manifest["version"];
}

/** Read the runtime exports of the installed package. */
async function collectRuntimeExports(): Promise<string[]> {
  const module = await import(PACKAGE_NAME);
  return Object.keys(module)
    .filter((name) => name !== "default")
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Regenerate the committed export allowlist and print a short summary.
 *
 * @returns A process exit code: `0` on success, `1` when a check fails.
 */
async function main(): Promise<number> {
  const pinned = await readPinnedVersion();
  const installed = await readInstalledVersion();
  if (pinned !== installed) {
    console.error(
      `The installed ${PACKAGE_NAME}@${installed} does not match the pinned ${pinned}. Run npm install before regenerating the allowlist.`,
    );
    return 1;
  }

  const schemaPath = process.env["FLUENTUI_SCHEMA_PATH"] ?? DEFAULT_SCHEMA_PATH;
  const schemaVersion = readSchemaVersion(schemaPath);
  const exports = await collectRuntimeExports();

  await writeJsonFile(FACTS_JSON_PATH, {
    package: PACKAGE_NAME,
    version: installed,
    sourceCommit: SOURCE_COMMIT,
    schemaVersion,
    generatedFrom: schemaPath,
    exports,
  });
  console.log(`Wrote ${FACTS_JSON_PATH}: ${exports.length} exports of ${PACKAGE_NAME}@${installed}`);
  return 0;
}

process.exitCode = await main();
