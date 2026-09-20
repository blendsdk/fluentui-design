import { readFileSync } from "node:fs";
import { loadVerifiedExportsSync } from "./lib/facts.js";
import {
  buildFreshnessManifest,
  diffFreshness,
  FRESHNESS_JSON_PATH,
  parseFreshnessManifest,
} from "./lib/freshness.js";
import type { FreshnessInput } from "./lib/freshness.js";
import { readJsonFileSync, stringifyJson } from "./lib/json.js";
import { loadPatternDocumentsSync } from "./lib/patterns.js";
import { runChecks } from "./lib/report.js";
import { RULES_JSON_PATH } from "./lib/rules.js";
import { SOURCES_JSON_PATH } from "./lib/sources.js";
import { writeFile } from "node:fs/promises";
import type { CheckOutcome, GateCheck } from "./lib/report.js";

/**
 * Collect the files whose content the generated output depends on.
 *
 * @returns The catalog files and every pattern document.
 */
function collectInputs(): FreshnessInput[] {
  const paths = [SOURCES_JSON_PATH, RULES_JSON_PATH];
  for (const document of loadPatternDocumentsSync()) {
    paths.push(document.path);
  }
  return paths.map((path) => ({ path, text: readFileSync(path, "utf8") }));
}

/**
 * Build the freshness manifest from the current tree.
 *
 * @returns The current manifest.
 */
function currentManifest() {
  const fact = loadVerifiedExportsSync();
  return buildFreshnessManifest(collectInputs(), {
    sourceCommit: fact.sourceCommit,
    packageVersion: fact.version,
  });
}

/**
 * Write or verify the freshness manifest.
 *
 * Without `--check` the manifest is written; with `--check` nothing is written
 * and a changed input makes the command exit non-zero.
 *
 * @returns A process exit code: `0` when the tree is fresh, otherwise `1`.
 */
async function main(): Promise<number> {
  const computed = currentManifest();

  if (!process.argv.includes("--check")) {
    await writeFile(FRESHNESS_JSON_PATH, stringifyJson(computed), "utf8");
    console.log(`Wrote ${FRESHNESS_JSON_PATH}`);
    return 0;
  }

  const checks: GateCheck[] = [
    {
      name: "freshness",
      run: (): CheckOutcome => {
        const recorded = parseFreshnessManifest(readJsonFileSync(FRESHNESS_JSON_PATH));
        const errors = diffFreshness(recorded, computed);
        return errors.length === 0
          ? { name: "freshness", ok: true }
          : { name: "freshness", ok: false, detail: errors.join("; ") };
      },
    },
  ];

  return runChecks(checks);
}

process.exitCode = await main();
