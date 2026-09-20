import { describe, expect, it } from "vitest";
import {
  checkEvaluationCoverage,
  collectEvaluationCitations,
  extractPatternIds,
  extractRuleIds,
  parseEvaluationResults,
  parseEvaluationTasks,
  parseRubricDimensions,
} from "../lib/evaluation.js";
import type { EvaluationResult, EvaluationTask } from "../lib/evaluation.js";

/** Build a task with sensible defaults for the fields a test does not set. */
function task(overrides: Partial<EvaluationTask> = {}): EvaluationTask {
  return {
    id: "EVAL-001",
    title: "Example",
    scenario: "customer-list-and-editor",
    fields: { scenario: "customer-list-and-editor", rules: "RULE-010" },
    ...overrides,
  };
}

/** Build a result with sensible defaults for the fields a test does not set. */
function result(overrides: Partial<EvaluationResult> = {}): EvaluationResult {
  return { taskId: "EVAL-001", title: "Example", result: "pass", evidence: "", ...overrides };
}

describe("citation extraction", () => {
  it("should find unique rule ids anywhere in a block of text", () => {
    expect(extractRuleIds("Pair RULE-010 with RULE-010, then RULE-011.")).toEqual([
      "RULE-010",
      "RULE-011",
    ]);
  });

  it("should find unique pattern ids anywhere in a block of text", () => {
    expect(extractPatternIds("See PAT-002 and PAT-005.")).toEqual(["PAT-002", "PAT-005"]);
  });

  it("should collect a rule cited only in a non-rules task field", () => {
    const tasks = [
      task({
        fields: {
          scenario: "customer-list-and-editor",
          rules: "RULE-010",
          expectedDecisionProperties: "prefer RULE-999",
        },
      }),
    ];
    const citations = collectEvaluationCitations(tasks, []);
    expect(citations.rules).toContain("RULE-999");
  });

  it("should collect ids cited in result evidence", () => {
    const citations = collectEvaluationCitations(
      [],
      [result({ evidence: "`rules/rules.json` resolves RULE-010 and PAT-005" })],
    );
    expect(citations.rules).toEqual(["RULE-010"]);
    expect(citations.patterns).toEqual(["PAT-005"]);
  });
});

describe("evaluation task parsing", () => {
  it("should tolerate CRLF line endings", () => {
    const markdown = [
      "### EVAL-001 — Example",
      "",
      "| Field | Value |",
      "| --- | --- |",
      "| scenario | customer-list-and-editor |",
      "",
    ].join("\r\n");
    const tasks = parseEvaluationTasks(markdown);
    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.scenario).toBe("customer-list-and-editor");
  });

  it("should return no tasks when no heading is present", () => {
    expect(parseEvaluationTasks("# Evaluation\n\nNo tasks yet.")).toEqual([]);
  });

  it("should let a repeated field keep its last value", () => {
    const markdown = [
      "### EVAL-002 — Repeated",
      "",
      "| Field | Value |",
      "| --- | --- |",
      "| rules | RULE-010 |",
      "| rules | RULE-011 |",
    ].join("\n");
    expect(parseEvaluationTasks(markdown)[0]?.fields["rules"]).toBe("RULE-011");
  });
});

describe("evaluation result parsing", () => {
  it("should read the result and evidence fields", () => {
    const markdown = [
      "### EVAL-003 — Example",
      "",
      "| Field | Value |",
      "| --- | --- |",
      "| result | partial |",
      "| evidence | `rules/rules.json` |",
    ].join("\n");
    const results = parseEvaluationResults(markdown);
    expect(results[0]?.result).toBe("partial");
    expect(results[0]?.evidence).toBe("`rules/rules.json`");
  });
});

describe("rubric parsing", () => {
  it("should ignore tables that are not anchor tables", () => {
    const markdown = ["| Item | Rule |", "| --- | --- |", "| Total | Sum |"].join("\n");
    expect(parseRubricDimensions(markdown)).toEqual([]);
  });

  it("should read anchors by their header names", () => {
    const markdown = [
      "| Dimension | 0 | 2 | 4 |",
      "| --- | --- | --- | --- |",
      "| Example | none | some | all |",
    ].join("\n");
    expect(parseRubricDimensions(markdown)).toEqual([
      { name: "Example", anchors: { 0: "none", 2: "some", 4: "all" } },
    ]);
  });
});

describe("result coverage", () => {
  it("should accept an untested result that gives a reason", () => {
    const errors = checkEvaluationCoverage(
      [task()],
      [result({ result: "untested", evidence: "no provider authorized" })],
      () => false,
    );
    expect(errors).toEqual([]);
  });

  it("should reject an untested result without a reason", () => {
    const errors = checkEvaluationCoverage(
      [task()],
      [result({ result: "untested", evidence: "  " })],
      () => false,
    );
    expect(errors.join("\n")).toMatch(/no reason/);
  });

  it("should reject an unknown result value", () => {
    const errors = checkEvaluationCoverage([task()], [result({ result: "maybe" })], () => true);
    expect(errors.join("\n")).toMatch(/invalid result/);
  });

  it("should reject a passing result with no artifact", () => {
    const errors = checkEvaluationCoverage([task()], [result({ evidence: "looks fine" })], () => true);
    expect(errors.join("\n")).toMatch(/cites no artifact/);
  });

  it("should reject a cited artifact that does not exist", () => {
    const errors = checkEvaluationCoverage(
      [task()],
      [result({ evidence: "`evaluation/missing.md`" })],
      () => false,
    );
    expect(errors.join("\n")).toMatch(/cites missing artifact/);
  });

  it("should reject a result with no matching task", () => {
    const errors = checkEvaluationCoverage([], [result()], () => true);
    expect(errors.join("\n")).toMatch(/no matching task/);
  });

  it("should reject a task with no result", () => {
    const errors = checkEvaluationCoverage([task()], [], () => true);
    expect(errors.join("\n")).toMatch(/has no result/);
  });
});
