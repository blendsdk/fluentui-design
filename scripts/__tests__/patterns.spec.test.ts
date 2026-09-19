import { describe, expect, it } from "vitest";
import { loadVerifiedExportsSync } from "../lib/facts.js";
import {
  buildDecisionIndex,
  checkDecisionIndex,
  loadPatternDocumentsSync,
  missingPatternSections,
  parsePatternDocument,
  PATTERN_DECISIONS,
  REQUIRED_PATTERN_SECTIONS,
  validatePatternDocuments,
} from "../lib/patterns.js";
import type { PatternValidationContext } from "../lib/patterns.js";

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
  const body = REQUIRED_PATTERN_SECTIONS.map((section) => `## ${section}\n\nContent.\n`).join("\n");
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
  it("should ship exactly eight pattern files that each contain every section", () => {
    const documents = loadPatternDocumentsSync();
    expect(documents).toHaveLength(8);
    for (const document of documents) {
      expect(missingPatternSections(document)).toEqual([]);
    }
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

  it("should resolve every decision to at least one committed pattern", () => {
    const rows = buildDecisionIndex(loadPatternDocumentsSync());
    expect(rows).toHaveLength(PATTERN_DECISIONS.length);
    expect(checkDecisionIndex(rows)).toEqual([]);
  });
});
