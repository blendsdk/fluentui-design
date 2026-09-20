import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import {
  checkEvaluationCoverage,
  EVALUATION_RESULTS_PATH,
  EVALUATION_TASKS_PATH,
  extractPatternIds,
  extractRuleIds,
  loadKnownPatternIds,
  loadKnownRuleIds,
  parseEvaluationResults,
  parseEvaluationTasks,
} from "./lib/evaluation.js";
import { runChecks } from "./lib/report.js";
import type { CheckOutcome, GateCheck } from "./lib/report.js";

/**
 * Reproduce the evaluation's deterministic evidence.
 *
 * The script reads the committed task and result documents and verifies three
 * facts that do not need a model: every rule and pattern the tasks or results
 * name exists in the catalog, and every task result either cites an artifact
 * that exists or is marked `untested` with a reason. It records what it checked
 * and exits non-zero when a claim cannot be traced to a committed artifact. It
 * never invokes a model or executes application code.
 *
 * @returns A process exit code: `0` when every check passes, otherwise `1`.
 */
async function main(): Promise<number> {
  const tasks = parseEvaluationTasks(await readFile(EVALUATION_TASKS_PATH, "utf8"));
  const results = parseEvaluationResults(await readFile(EVALUATION_RESULTS_PATH, "utf8"));
  const knownRules = loadKnownRuleIds();
  const knownPatterns = loadKnownPatternIds();

  const taskText = tasks.flatMap((task) => Object.values(task.fields)).join("\n");
  const resultText = results.map((result) => result.evidence).join("\n");
  const ruleCitations = extractRuleIds(`${taskText}\n${resultText}`);
  const patternCitations = extractPatternIds(`${taskText}\n${resultText}`);

  const checks: GateCheck[] = [
    {
      name: "evaluation rules",
      run: (): CheckOutcome => {
        const missing = ruleCitations.filter((id) => !knownRules.has(id));
        return missing.length === 0
          ? {
              name: "evaluation rules",
              ok: true,
              detail: `${ruleCitations.length} cited rules resolve`,
            }
          : {
              name: "evaluation rules",
              ok: false,
              detail: `unknown rules: ${missing.join(", ")}`,
            };
      },
    },
    {
      name: "evaluation patterns",
      run: (): CheckOutcome => {
        const missing = patternCitations.filter((id) => !knownPatterns.has(id));
        return missing.length === 0
          ? {
              name: "evaluation patterns",
              ok: true,
              detail: `${patternCitations.length} cited patterns resolve`,
            }
          : {
              name: "evaluation patterns",
              ok: false,
              detail: `unknown patterns: ${missing.join(", ")}`,
            };
      },
    },
    {
      name: "evaluation results",
      run: (): CheckOutcome => {
        const errors = checkEvaluationCoverage(tasks, results, (path) => existsSync(path));
        return errors.length === 0
          ? {
              name: "evaluation results",
              ok: true,
              detail: `${results.length} results cite existing artifacts`,
            }
          : {
              name: "evaluation results",
              ok: false,
              detail: errors.join("; "),
            };
      },
    },
  ];

  return runChecks(checks);
}

process.exitCode = await main();
