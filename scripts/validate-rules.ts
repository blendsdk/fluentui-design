import { readJsonFileSync } from "./lib/json.js";
import { loadVerifiedExportsSync } from "./lib/facts.js";
import { runChecks } from "./lib/report.js";
import { RULES_JSON_PATH, validateRulesData } from "./lib/rules.js";
import type { RuleValidationContext } from "./lib/rules.js";
import { parseSources, SOURCES_JSON_PATH } from "./lib/sources.js";
import type { CheckOutcome, GateCheck } from "./lib/report.js";

/**
 * Build the context the rules validator needs.
 *
 * @returns Known source ids and the allowed export allowlist.
 */
function buildContext(): RuleValidationContext {
  const sources = parseSources(readJsonFileSync(SOURCES_JSON_PATH));
  return {
    knownSourceIds: sources.map((source) => source.id),
    allowedExports: loadVerifiedExportsSync().exports,
  };
}

/**
 * Validate the operational rules catalog.
 *
 * @returns A process exit code: `0` when the catalog is valid, otherwise `1`.
 */
async function main(): Promise<number> {
  const checks: GateCheck[] = [
    {
      name: "rules",
      run: (): CheckOutcome => {
        const errors = validateRulesData(readJsonFileSync(RULES_JSON_PATH), buildContext());
        return errors.length === 0
          ? { name: "rules", ok: true }
          : { name: "rules", ok: false, detail: errors.join("; ") };
      },
    },
  ];

  return runChecks(checks);
}

process.exitCode = await main();
