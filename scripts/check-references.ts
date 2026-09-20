import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { parseConflicts, parseFindings } from "./lib/analysis.js";
import { loadPatternDocumentsSync } from "./lib/patterns.js";
import { runChecks } from "./lib/report.js";
import { checkReferences, createRealFileSystem, SKILL_DIR, validateSkillFile } from "./lib/skill.js";
import { isJsonObject, readJsonFileSync } from "./lib/json.js";
import { RULES_JSON_PATH } from "./lib/rules.js";
import { SOURCES_JSON_PATH } from "./lib/sources.js";
import type { CheckOutcome, GateCheck } from "./lib/report.js";

const FINDINGS_MD_PATH = "research/findings.md";
const CONFLICTS_MD_PATH = "research/conflicts.md";

/**
 * Collect every catalog id that skill prose is allowed to reference.
 *
 * @returns A set of `SRC`, `RULE`, `PAT`, `FND`, and `CNF` ids.
 */
function loadKnownIds(): Set<string> {
  const ids = new Set<string>();

  const sources = readJsonFileSync(SOURCES_JSON_PATH);
  if (Array.isArray(sources)) {
    for (const entry of sources) {
      if (isJsonObject(entry) && typeof entry["id"] === "string") {
        ids.add(entry["id"]);
      }
    }
  }

  const rules = readJsonFileSync(RULES_JSON_PATH);
  if (Array.isArray(rules)) {
    for (const entry of rules) {
      if (isJsonObject(entry) && typeof entry["id"] === "string") {
        ids.add(entry["id"]);
      }
    }
  }

  for (const document of loadPatternDocumentsSync()) {
    if (document.frontmatter.id.length > 0) {
      ids.add(document.frontmatter.id);
    }
  }

  return ids;
}

/**
 * Validate the skill package's entry point and internal references.
 *
 * @returns A process exit code: `0` when every reference resolves, otherwise `1`.
 */
async function main(): Promise<number> {
  const knownIds = loadKnownIds();
  const fs = createRealFileSystem();
  const context = { knownIds, fileExists: (path: string): boolean => existsSync(path) };

  const findings = parseFindings(await readFile(FINDINGS_MD_PATH, "utf8"));
  const conflicts = parseConflicts(await readFile(CONFLICTS_MD_PATH, "utf8"));
  for (const finding of findings) {
    knownIds.add(finding.id);
  }
  for (const conflict of conflicts) {
    knownIds.add(conflict.id);
  }

  const checks: GateCheck[] = [
    {
      name: "skill entry",
      run: (): CheckOutcome => {
        const errors = validateSkillFile();
        return errors.length === 0
          ? { name: "skill entry", ok: true }
          : { name: "skill entry", ok: false, detail: errors.join("; ") };
      },
    },
    {
      name: "references",
      run: (): CheckOutcome => {
        const errors: string[] = [];
        const files = fs.listFiles(SKILL_DIR).filter((path) => path.endsWith(".md"));
        for (const path of files) {
          const markdown = fs.readFile(path);
          if (markdown !== undefined) {
            errors.push(...checkReferences(path, markdown, context));
          }
        }
        return errors.length === 0
          ? { name: "references", ok: true }
          : { name: "references", ok: false, detail: errors.join("; ") };
      },
    },
  ];

  return runChecks(checks);
}

process.exitCode = await main();
