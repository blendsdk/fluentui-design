import { readFile } from "node:fs/promises";
import { isJsonObject } from "./lib/json.js";
import { loadVerifiedExportsSync } from "./lib/facts.js";
import { runChecks } from "./lib/report.js";
import type { CheckOutcome, GateCheck } from "./lib/report.js";

/**
 * Read the declared version of a package from either dependency section.
 *
 * A library may be pinned as a runtime dependency or a development dependency,
 * so both sections are searched before reporting the package as absent.
 *
 * @param manifest - Parsed `package.json` object.
 * @param packageName - Package to look up.
 * @returns The declared version range, or `undefined` when absent.
 */
function declaredVersion(manifest: Record<string, unknown>, packageName: string): unknown {
  for (const section of ["dependencies", "devDependencies"]) {
    const group = manifest[section];
    if (isJsonObject(group) && group[packageName] !== undefined) {
      return group[packageName];
    }
  }
  return undefined;
}

/**
 * Confirm the committed allowlist still matches the installed package.
 *
 * The check re-reads the declared dependency version from `package.json` and
 * re-enumerates the installed package's runtime exports, then compares both
 * with the committed allowlist. This catches a dependency bump that was not
 * followed by `npm run extract-facts`.
 *
 * @returns Human-readable errors; empty when the allowlist is current.
 */
async function findDrift(): Promise<string[]> {
  const errors: string[] = [];
  const fact = loadVerifiedExportsSync();

  const manifest = JSON.parse(await readFile("package.json", "utf8")) as unknown;
  if (!isJsonObject(manifest)) {
    return ["package.json must contain a JSON object"];
  }
  const declared = declaredVersion(manifest, fact.package);
  if (declared !== fact.version) {
    errors.push(`allowlist pins ${fact.package}@${fact.version} but package.json declares ${String(declared)}`);
  }

  const module = await import(fact.package);
  const runtime = Object.keys(module)
    .filter((name) => name !== "default")
    .sort((a, b) => a.localeCompare(b));
  const committed = [...fact.exports].sort((a, b) => a.localeCompare(b));

  const missing = runtime.filter((name) => !committed.includes(name));
  const extra = committed.filter((name) => !runtime.includes(name));
  if (missing.length > 0) {
    errors.push(`allowlist is missing ${missing.length} installed export(s): ${missing.join(", ")}`);
  }
  if (extra.length > 0) {
    errors.push(`allowlist lists ${extra.length} export(s) that no longer exist: ${extra.join(", ")}`);
  }

  return errors;
}

/**
 * Validate that the committed facts allowlist is current.
 *
 * @returns A process exit code: `0` when the allowlist is current, otherwise `1`.
 */
async function main(): Promise<number> {
  const checks: GateCheck[] = [
    {
      name: "facts",
      run: async (): Promise<CheckOutcome> => {
        const errors = await findDrift();
        return errors.length === 0
          ? { name: "facts", ok: true }
          : { name: "facts", ok: false, detail: errors.join("; ") };
      },
    },
  ];

  return runChecks(checks);
}

process.exitCode = await main();
