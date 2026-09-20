import { describe, expect, it } from "vitest";
import { loadVerifiedExportsSync } from "../lib/facts.js";
import {
  buildDecisionIndex,
  checkDecisionIndex,
  loadPatternDocumentsSync,
  parsePatternDocument,
  PATTERN_DECISIONS,
  REQUIRED_PATTERN_SECTIONS,
  validatePatternDocuments,
} from "../lib/patterns.js";
import type { PatternDocument, PatternValidationContext } from "../lib/patterns.js";

/**
 * The twelve template sections required by the application-patterns requirement.
 * These literals are the oracle; they must not be derived from the implementation.
 */
const TEMPLATE_SECTIONS = [
  "User task",
  "When to use / when not",
  "Region order",
  "Component mapping",
  "Interaction flow",
  "State ownership",
  "Responsive behavior",
  "Accessibility",
  "Edge cases",
  "Rules applied",
  "Derived decisions",
  "Tests",
];

/** The seventeen decision keys required by the application-patterns requirement. */
const DECISION_KEYS = [
  "command-scope",
  "navigation-model",
  "edit-surface",
  "form-layout",
  "field-annotation",
  "submit-feedback",
  "save-model",
  "data-surface",
  "data-processing-location",
  "selection-scope",
  "row-activation",
  "data-resilience",
  "virtualization",
  "modal-behavior",
  "progressive-disclosure",
  "feedback-channel",
  "permission-state",
];

/** Return the required sections that a document does not render with content. */
function emptySections(document: PatternDocument): string[] {
  return TEMPLATE_SECTIONS.filter((section) => (document.sections[section] ?? "").length === 0);
}

/** A validation context with one known rule and the pinned allowlist. */
function context(): PatternValidationContext {
  return {
    knownRuleIds: ["RULE-001"],
    allowedExports: loadVerifiedExportsSync().exports,
  };
}

/**
 * Build a pattern document whose only frontmatter/body gaps are the ones a test
 * intends to introduce.
 */
function pattern(frontmatter: string): string {
  const body = TEMPLATE_SECTIONS.map((section) => `## ${section}\n\nContent.\n`).join("\n");
  return `---\n${frontmatter}\n---\n\n# Title\n\n${body}`;
}

const VALID_FRONTMATTER = [
  "id: PAT-001",
  "title: Application shell",
  "decisions: [command-scope]",
  "rules: [RULE-001]",
  "components: [Button]",
  "derived: [application-owned shell]",
].join("\n");

describe("pattern documents", () => {
  it("should ship exactly eight pattern files that each contain every template section", () => {
    const documents = loadPatternDocumentsSync();
    expect(documents).toHaveLength(8);
    for (const document of documents) {
      expect(emptySections(document)).toEqual([]);
    }
  });

  it("should use exactly the required section and decision vocabularies", () => {
    expect([...REQUIRED_PATTERN_SECTIONS]).toEqual(TEMPLATE_SECTIONS);
    expect([...PATTERN_DECISIONS]).toEqual(DECISION_KEYS);
  });

  it("should reject a pattern whose decision key is not in the vocabulary", () => {
    const text = pattern(VALID_FRONTMATTER.replace("command-scope", "made-up-key"));
    const errors = validatePatternDocuments([parsePatternDocument("x.md", text)], context());
    expect(errors.join("\n")).toMatch(/made-up-key/);
    expect(errors.join("\n")).toMatch(/valid/i);
  });

  it("should reject a component that is not a verified export", () => {
    const text = pattern(VALID_FRONTMATTER.replace("[Button]", "[Foo]"));
    const errors = validatePatternDocuments([parsePatternDocument("x.md", text)], context());
    expect(errors.join("\n")).toMatch(/Foo/);
  });

  it("should resolve every required decision to at least one committed pattern", () => {
    const documents = loadPatternDocumentsSync();
    for (const decision of DECISION_KEYS) {
      const claiming = documents.filter((document) =>
        document.frontmatter.decisions.includes(decision),
      );
      expect(claiming.length, `decision ${decision} must be resolved`).toBeGreaterThan(0);
    }
    const rows = buildDecisionIndex(documents);
    expect(rows.map((row) => row.decision)).toEqual(DECISION_KEYS);
    expect(checkDecisionIndex(rows)).toEqual([]);
  });
});
