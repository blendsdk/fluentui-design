import { describe, expect, it } from "vitest";
import { parseFrontmatter } from "../lib/frontmatter.js";
import {
  buildDecisionIndex,
  checkDecisionIndex,
  missingPatternSections,
  parsePatternDocument,
  REQUIRED_PATTERN_SECTIONS,
} from "../lib/patterns.js";

describe("frontmatter parsing", () => {
  it("should return empty frontmatter when no fence is present", () => {
    const parsed = parseFrontmatter("# Heading\n\nBody.");
    expect(parsed.frontmatter).toEqual({});
    expect(parsed.body).toBe("# Heading\n\nBody.");
  });

  it("should treat a document with an opening fence and no closing fence as body", () => {
    const parsed = parseFrontmatter("---\nid: PAT-001\n");
    expect(parsed.frontmatter).toEqual({});
  });

  it("should parse inline lists, quoted values, and empty lists", () => {
    const parsed = parseFrontmatter(
      ['---', 'title: "Record detail"', "rules: [RULE-001, RULE-002]", "derived: []", "---", "body"].join("\n"),
    );
    expect(parsed.frontmatter["title"]).toBe("Record detail");
    expect(parsed.frontmatter["rules"]).toEqual(["RULE-001", "RULE-002"]);
    expect(parsed.frontmatter["derived"]).toEqual([]);
    expect(parsed.body).toBe("body");
  });

  it("should read single-quoted and plain values", () => {
    const parsed = parseFrontmatter(["---", "title: 'Shell'", "id: PAT-001", "---", ""].join("\n"));
    expect(parsed.frontmatter["title"]).toBe("Shell");
    expect(parsed.frontmatter["id"]).toBe("PAT-001");
  });
});

describe("pattern document parsing", () => {
  const sections = REQUIRED_PATTERN_SECTIONS.map((section) => `## ${section}\n\nContent.`).join("\n");
  const markdown = `---\nid: PAT-009\ntitle: Test\n---\n\n# Test\n\n${sections}\n`;

  it("should key sections by their heading text", () => {
    const document = parsePatternDocument("skill/references/patterns/PAT-009-test.md", markdown);
    expect(document.sections["User task"]).toBe("Content.");
    expect(missingPatternSections(document)).toEqual([]);
  });

  it("should report a section that is present but empty", () => {
    const withEmpty = markdown.replace("## Tests\n\nContent.", "## Tests\n");
    const document = parsePatternDocument("PAT-009-test.md", withEmpty);
    expect(missingPatternSections(document)).toEqual(["Tests"]);
  });

  it("should fall back to the file name when frontmatter has no id", () => {
    const document = parsePatternDocument(
      "skill/references/patterns/PAT-010-fallback.md",
      `---\ntitle: Fallback\n---\n\n${sections}\n`,
    );
    expect(document.frontmatter.id).toBe("PAT-010");
  });
});

describe("decision index", () => {
  it("should union rules across patterns that share a decision", () => {
    const make = (id: string, decisions: string, rules: string): string =>
      `---\nid: ${id}\ntitle: T\ndecisions: [${decisions}]\nrules: [${rules}]\ncomponents: []\nderived: []\n---\n\n${REQUIRED_PATTERN_SECTIONS.map((s) => `## ${s}\n\nX.`).join("\n")}\n`;
    const documents = [
      parsePatternDocument("a.md", make("PAT-001", "save-model", "RULE-002, RULE-001")),
      parsePatternDocument("b.md", make("PAT-002", "save-model", "RULE-003")),
    ];
    const rows = buildDecisionIndex(documents);
    const saveModel = rows.find((row) => row.decision === "save-model");
    expect(saveModel?.patterns).toEqual(["PAT-001", "PAT-002"]);
    expect(saveModel?.rules).toEqual(["RULE-001", "RULE-002", "RULE-003"]);
  });

  it("should report every decision when no pattern resolves any", () => {
    expect(checkDecisionIndex(buildDecisionIndex([]))).toHaveLength(17);
  });
});
