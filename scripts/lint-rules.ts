import { readJsonFileSync } from "./lib/json.js";
import { loadVerifiedExportsSync } from "./lib/facts.js";
import { lintRules, parseRules, RULES_JSON_PATH } from "./lib/rules.js";
import type { RuleValidationContext } from "./lib/rules.js";
import { parseSources, SOURCES_JSON_PATH } from "./lib/sources.js";

/**
 * Build the context the rules parser needs.
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
 * Report non-operational rule instructions.
 *
 * Warnings are printed but do not fail the run: the lint exists to prompt a
 * human review, while a missing or malformed instruction is already rejected by
 * `validate:rules`. The command still fails when the catalog itself cannot be
 * parsed.
 *
 * @returns A process exit code: `0` after a successful lint, otherwise `1`.
 */
async function main(): Promise<number> {
  const rules = parseRules(readJsonFileSync(RULES_JSON_PATH), buildContext());
  const warnings = lintRules(rules);

  if (warnings.length === 0) {
    console.log(`PASS rules actionability (${rules.length} rules)`);
    return 0;
  }

  console.warn(`WARN rules actionability: ${warnings.length} instruction(s) need review`);
  for (const warning of warnings) {
    console.warn(`  - ${warning}`);
  }
  return 0;
}

process.exitCode = await main();
