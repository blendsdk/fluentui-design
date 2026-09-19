import { describe, expect, it } from "vitest";
import { validateConflicts, validateFindings } from "../lib/analysis.js";
import type { Conflict, Finding } from "../lib/analysis.js";

/** Build a complete finding from a known-good default. */
function finding(overrides: Partial<Finding> = {}): Finding {
  return {
    id: "FND-001",
    statement: "The app shell owns global navigation.",
    kind: "official-fluent-guidance",
    sources: ["SRC-007 (section: Navigation)"],
    versionScope: "v9",
    confidence: "High",
    informsRules: ["RULE-001"],
    ...overrides,
  };
}

/** Build a complete conflict from a known-good default. */
function conflict(overrides: Partial<Conflict> = {}): Conflict {
  return {
    id: "CNF-001",
    issue: "Guidance differs on modal focus.",
    sources: ["SRC-003 (v9)", "SRC-022 (APG)"],
    resolution: "Follow the released behavior.",
    rationale: "Released behavior governs runtime.",
    uncertainty: "None material.",
    tested: "untested",
    ...overrides,
  };
}

describe("finding validation", () => {
  it("should reject a finding whose kind is not one of the seven classes", () => {
    const errors = validateFindings([finding({ kind: "official" })]);
    expect(errors.join("\n")).toMatch(/kind/i);
  });

  it("should reject a normative accessibility finding with no success criterion", () => {
    const errors = validateFindings([
      finding({
        kind: "normative-accessibility-requirement",
        sources: ["SRC-022 (ARIA Authoring Practices Guide)"],
      }),
    ]);
    expect(errors.join("\n")).toMatch(/success criterion|SC\b/i);
  });

  it("should accept a normative accessibility finding that cites a success criterion", () => {
    const errors = validateFindings([
      finding({
        kind: "normative-accessibility-requirement",
        sources: ["SRC-021 (WCAG 2.2 SC 2.4.7 Focus Visible)"],
      }),
    ]);
    expect(errors).toEqual([]);
  });
});

describe("conflict validation", () => {
  it("should reject an unresolved conflict with no stated uncertainty", () => {
    const errors = validateConflicts([conflict({ resolution: "unresolved", uncertainty: "" })]);
    expect(errors.join("\n")).toMatch(/uncertainty/i);
  });

  it("should accept a resolved conflict with rationale and uncertainty", () => {
    expect(validateConflicts([conflict()])).toEqual([]);
  });
});
