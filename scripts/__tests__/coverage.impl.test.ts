import { describe, expect, it } from "vitest";
import { checkCoverage } from "../lib/coverage.js";
import type { CoverageRow } from "../lib/coverage.js";

/** Build a complete coverage row from a known-good default. */
function row(overrides: Partial<CoverageRow> = {}): CoverageRow {
  return {
    topic: "App shell",
    sources: ["SRC-001"],
    reviewedEvidence: "Reviewed.",
    extractedRules: [],
    unresolvedQuestions: [],
    examples: [],
    status: "Supported",
    gapNote: "",
    ...overrides,
  };
}

describe("coverage implementation edges", () => {
  it("should report a row whose status is neither Supported nor Gap", () => {
    const errors = checkCoverage(
      [row({ status: "supported" })],
      [{ id: "SRC-001", status: "analyzed" }],
      [],
    );
    expect(errors.join("\n")).toMatch(/invalid status/i);
  });

  it("should report an unknown status rather than treating it as a Gap", () => {
    const errors = checkCoverage(
      [row({ status: "GAP", extractedRules: ["RULE-001"] })],
      [{ id: "SRC-001", status: "analyzed" }],
      [],
    );
    expect(errors.join("\n")).toMatch(/invalid status/i);
  });
});
