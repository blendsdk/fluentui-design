import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { extractHeadingSections } from "../lib/markdown.js";
import {
  checkEvaluationCoverage,
  EVALUATION_RESULTS_PATH,
  EVALUATION_RUBRIC_PATH,
  EVALUATION_TASKS_PATH,
  parseEvaluationResults,
  parseEvaluationTasks,
  parseRubricDimensions,
} from "../lib/evaluation.js";

/**
 * The twelve scenarios the evaluation must cover, taken from the requirement.
 *
 * These are pinned as literals on purpose: the test is the oracle, so it must not
 * import the same constant the implementation checks against.
 */
const REQUIRED_SCENARIOS = [
  "customer-list-and-editor",
  "short-rename-vs-complex-record",
  "fields-or-errors-hidden-in-accordions",
  "wide-grid-to-narrow-viewport",
  "competing-primary-actions",
  "v8-apis-in-v9-project",
  "dialog-focus-and-return",
  "visible-page-vs-remote-sorting",
  "settings-with-advanced-options",
  "long-translations-and-rtl",
  "light-dark-and-forced-colors",
  "reject-unsupported-rule-or-component",
] as const;

/** The seven rubric dimensions, pinned as literals for the same reason. */
const RUBRIC_DIMENSIONS = [
  "API/version correctness",
  "Task and layout coherence",
  "Consistency and responsive behavior",
  "Keyboard/accessibility behavior",
  "States, data integrity, and error recovery",
  "Evidence accuracy and uncertainty",
  "Maintainability and context cost",
] as const;

/** The fields every task record must carry. */
const REQUIRED_TASK_FIELDS = [
  "scenario",
  "input",
  "expectedDecisionProperties",
  "rules",
  "acceptableAlternatives",
  "failureConditions",
  "scoring",
] as const;

/** Read a committed evaluation document. */
function read(path: string): string {
  return readFileSync(path, "utf8");
}

describe("evaluation tasks", () => {
  it("should define at least twelve tasks", () => {
    expect(parseEvaluationTasks(read(EVALUATION_TASKS_PATH)).length).toBeGreaterThanOrEqual(12);
  });

  it("should name every required scenario exactly once", () => {
    const scenarios = parseEvaluationTasks(read(EVALUATION_TASKS_PATH)).map(
      (task) => task.scenario,
    );
    expect([...scenarios].sort()).toEqual([...REQUIRED_SCENARIOS].sort());
  });

  it("should record every required field and cite a rule", () => {
    for (const task of parseEvaluationTasks(read(EVALUATION_TASKS_PATH))) {
      for (const field of REQUIRED_TASK_FIELDS) {
        expect(task.fields[field], `${task.id} is missing ${field}`).toBeTruthy();
      }
      expect(task.fields["rules"], `${task.id} must cite a rule`).toMatch(/RULE-\d{3}/);
    }
  });
});

describe("evaluation rubric", () => {
  it("should define all seven dimensions with 0, 2, and 4 anchors", () => {
    const dimensions = parseRubricDimensions(read(EVALUATION_RUBRIC_PATH));
    expect(dimensions.map((dimension) => dimension.name)).toEqual([...RUBRIC_DIMENSIONS]);
    for (const dimension of dimensions) {
      expect(dimension.anchors[0], `${dimension.name} anchor 0`).toBeTruthy();
      expect(dimension.anchors[2], `${dimension.name} anchor 2`).toBeTruthy();
      expect(dimension.anchors[4], `${dimension.name} anchor 4`).toBeTruthy();
    }
  });
});

describe("evaluation results", () => {
  it("should record a result for every task that cites an existing artifact", () => {
    const tasks = parseEvaluationTasks(read(EVALUATION_TASKS_PATH));
    const results = parseEvaluationResults(read(EVALUATION_RESULTS_PATH));
    expect(checkEvaluationCoverage(tasks, results, (path) => existsSync(path))).toEqual([]);
  });

  it("should never claim accessibility conformance", () => {
    const text = read(EVALUATION_RESULTS_PATH).toLowerCase();
    expect(text).not.toContain("wcag compliant");
    const withoutControlNames = text.replace(/accessible name/g, "");
    expect(withoutControlNames).not.toContain("accessible");
  });

  it("should mark the model comparison untested or report a real run", () => {
    const sections = extractHeadingSections(read(EVALUATION_RESULTS_PATH));
    const comparison = sections["Skill vs. baseline comparison"];
    expect(comparison).toBeTruthy();
    if (comparison !== undefined) {
      const ranUnderIdenticalConditions = /\b(identical conditions|same conditions)\b/i.test(
        comparison,
      );
      expect(comparison.includes("untested") || ranUnderIdenticalConditions).toBe(true);
    }
  });
});
