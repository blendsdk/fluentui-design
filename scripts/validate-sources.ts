import { access, readFile } from "node:fs/promises";
import { isJsonObject, readJsonFile, readJsonFileSync } from "./lib/json.js";
import { runChecks } from "./lib/report.js";
import { checkCoverage, checkCoverageSummary, parseCoverage } from "./lib/coverage.js";
import { parseConflicts, parseFindings, validateConflicts, validateFindings } from "./lib/analysis.js";
import { parseSources, SOURCES_JSON_PATH, validateSourcesFile } from "./lib/sources.js";
import type { CoverageRuleRef, CoverageSourceRef } from "./lib/coverage.js";
import type { CheckOutcome, GateCheck } from "./lib/report.js";

const COVERAGE_MD_PATH = "research/coverage.md";
const FINDINGS_MD_PATH = "research/findings.md";
const CONFLICTS_MD_PATH = "research/conflicts.md";
const RULES_JSON_PATH = "rules/rules.json";

/**
 * Build a check outcome from a list of errors.
 *
 * @param name - Check name shown in the report.
 * @param errors - Problems found by the check.
 * @returns A passing outcome when there are no errors, otherwise a failure.
 */
function toOutcome(name: string, errors: readonly string[]): CheckOutcome {
  if (errors.length === 0) {
    return { name, ok: true };
  }
  return { name, ok: false, detail: errors.join("; ") };
}

/**
 * Read rule ids when the rules catalog already exists.
 *
 * The evidence pipeline runs before the rules catalog in the build order, so an
 * absent file means "no rules yet" rather than an error. The rule-to-coverage
 * mapping is enforced once the catalog exists.
 *
 * @returns Minimal rule references, or an empty list when the catalog is absent.
 */
async function loadRuleRefs(): Promise<CoverageRuleRef[]> {
  try {
    await access(RULES_JSON_PATH);
  } catch {
    return [];
  }
  const data = await readJsonFile(RULES_JSON_PATH);
  if (!Array.isArray(data)) {
    return [];
  }
  return data.flatMap((entry) =>
    isJsonObject(entry) && typeof entry["id"] === "string" ? [{ id: entry["id"] }] : [],
  );
}

/**
 * Validate the evidence pipeline: the source catalog, the coverage matrix, the
 * findings, and the conflicts.
 *
 * @returns A process exit code: `0` when every check passes, otherwise `1`.
 */
async function main(): Promise<number> {
  const checks: GateCheck[] = [
    {
      name: "sources",
      run: (): CheckOutcome => toOutcome("sources", validateSourcesFile()),
    },
    {
      name: "coverage",
      run: async (): Promise<CheckOutcome> => {
        const entries = parseSources(readJsonFileSync(SOURCES_JSON_PATH));
        const sources: CoverageSourceRef[] = entries.map((entry) => ({
          id: entry.id,
          status: entry.status,
        }));
        const rules = await loadRuleRefs();
        const document = parseCoverage(await readFile(COVERAGE_MD_PATH, "utf8"));
        const errors = [
          ...checkCoverage([...document.topics, ...document.patterns], sources, rules),
          ...checkCoverageSummary(document),
        ];
        return toOutcome("coverage", errors);
      },
    },
    {
      name: "findings",
      run: async (): Promise<CheckOutcome> => {
        const findings = parseFindings(await readFile(FINDINGS_MD_PATH, "utf8"));
        return toOutcome("findings", validateFindings(findings));
      },
    },
    {
      name: "conflicts",
      run: async (): Promise<CheckOutcome> => {
        const conflicts = parseConflicts(await readFile(CONFLICTS_MD_PATH, "utf8"));
        return toOutcome("conflicts", validateConflicts(conflicts));
      },
    },
  ];

  return runChecks(checks);
}

process.exitCode = await main();
