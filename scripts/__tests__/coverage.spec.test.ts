import { describe, expect, it } from "vitest";
import { checkCoverage } from "../lib/coverage.js";
import type { CoverageRow } from "../lib/coverage.js";

/** Build a complete coverage row from a known-good default. */
function row(overrides: Partial<CoverageRow> = {}): CoverageRow {
  return {
    topic: "App shell and navigation",
    sources: ["SRC-001"],
    reviewedEvidence: "Reviewed the shell guidance.",
    extractedRules: ["RULE-001"],
    unresolvedQuestions: [],
    examples: [],
    status: "Supported",
    gapNote: "",
    ...overrides,
  };
}

describe("coverage consistency", () => {
  it("should reject a Supported row whose only source is not analyzed", () => {
    const errors = checkCoverage(
      [row()],
      [{ id: "SRC-001", status: "retrieved" }],
      [{ id: "RULE-001" }],
    );
    expect(errors.join("\n")).toMatch(/SRC-001/);
  });

  it("should reject a rule that no coverage row references", () => {
    const errors = checkCoverage(
      [row()],
      [{ id: "SRC-001", status: "analyzed" }],
      [{ id: "RULE-001" }, { id: "RULE-009" }],
    );
    expect(errors.join("\n")).toMatch(/RULE-009/);
  });

  it("should reject a Gap row with an empty gap note", () => {
    const errors = checkCoverage(
      [row({ status: "Gap", gapNote: "", extractedRules: [] })],
      [{ id: "SRC-001", status: "analyzed" }],
      [],
    );
    expect(errors.join("\n")).toMatch(/gap/i);
  });

  it("should accept a Supported row backed by an analyzed source and a known rule", () => {
    expect(
      checkCoverage([row()], [{ id: "SRC-001", status: "analyzed" }], [{ id: "RULE-001" }]),
    ).toEqual([]);
  });
});
