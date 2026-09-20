import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  applyGeneration,
  checkGeneration,
  checkReferences,
  createRealFileSystem,
  expectedArtifacts,
  parseSkillEntry,
  REQUIRED_SKILL_SECTIONS,
  SKILL_ENTRY_PATH,
  SKILL_MIRROR_DIR,
  SKILL_NAME,
  validateSkillEntry,
} from "../lib/skill.js";
import type { SkillEntry, SkillFileSystem } from "../lib/skill.js";

/** Read the committed entry point as text. */
function entryText(): string {
  return readFileSync(SKILL_ENTRY_PATH, "utf8");
}

/** Build a filesystem view that overlays changed and added files on disk. */
function overlayFs(
  overrides: Record<string, string> = {},
  extra: Record<string, string> = {},
): SkillFileSystem {
  const base = createRealFileSystem();
  const all = { ...overrides, ...extra };
  return {
    readFile: (path: string): string | undefined =>
      path in all ? all[path] : base.readFile(path),
    listFiles: (dir: string): string[] => {
      const listed = new Set(base.listFiles(dir));
      for (const path of Object.keys(all)) {
        if (dir === "." || path === dir || path.startsWith(`${dir}/`)) {
          listed.add(path);
        }
      }
      return [...listed].sort((a, b) => a.localeCompare(b));
    },
  };
}

/** Parse the committed entry point with one required section removed. */
function entryWithoutSection(section: string): SkillEntry {
  const entry = parseSkillEntry(entryText(), SKILL_ENTRY_PATH);
  const sections = { ...entry.sections };
  delete sections[section];
  return { ...entry, sections };
}

describe("skill package entry point", () => {
  it("should name the skill after its containing directory", () => {
    const entry = parseSkillEntry(entryText(), SKILL_ENTRY_PATH);
    expect(entry.frontmatter.name).toBe("fluentui-design");
    expect(entry.frontmatter.name).toBe(SKILL_NAME);
    expect(entry.frontmatter.name).toBe(SKILL_MIRROR_DIR.split("/").at(-1));
  });

  it("should require exactly the nine template sections", () => {
    expect([...REQUIRED_SKILL_SECTIONS]).toEqual([
      "Triggers and non-triggers",
      "Reconnaissance",
      "Task classification",
      "Design-before-code checklist",
      "Surface decision workflow",
      "Implementation constraints",
      "Accessibility and visual review",
      "Tradeoff explanation",
      "Evidence fallback",
    ]);
  });

  it("should require an evidence fallback section", () => {
    const errors = validateSkillEntry(entryWithoutSection("Evidence fallback"), SKILL_NAME);
    expect(errors.join("\n")).toMatch(/Evidence fallback/);
  });
});

describe("reference gate", () => {
  it("should resolve a routing link relative to its document", () => {
    const seen: string[] = [];
    const errors = checkReferences("skill/references/index.md", "[Gone](patterns/missing.md)", {
      knownIds: new Set<string>(),
      fileExists: (path) => {
        seen.push(path);
        return false;
      },
    });
    expect(seen).toEqual(["skill/references/patterns/missing.md"]);
    expect(errors.join("\n")).toMatch(/missing\.md/);
  });

  it("should accept a routing link that resolves to an existing file", () => {
    const target = "skill/references/patterns/PAT-001-application-shell.md";
    const errors = checkReferences(
      "skill/references/index.md",
      "[Shell](patterns/PAT-001-application-shell.md)",
      { knownIds: new Set(["PAT-001"]), fileExists: (path) => path === target },
    );
    expect(errors).toEqual([]);
  });

  it("should reject a reference that is not a known id", () => {
    const errors = checkReferences("skill/SKILL.md", "See RULE-777 for details.", {
      knownIds: new Set(["RULE-001"]),
      fileExists: () => true,
    });
    expect(errors.join("\n")).toMatch(/RULE-777/);
  });

  it("should reject a markdown link whose target is missing", () => {
    const seen: string[] = [];
    const errors = checkReferences("skill/SKILL.md", "[Button](references/button.md)", {
      knownIds: new Set<string>(),
      fileExists: (path) => {
        seen.push(path);
        return false;
      },
    });
    expect(seen).toEqual(["skill/references/button.md"]);
    expect(errors.join("\n")).toMatch(/references\/button\.md/);
  });

  it("should accept a cross-skill link validated by prefix only", () => {
    const errors = checkReferences(
      "skill/SKILL.md",
      "[Button](fluentui:references/components/button.md)",
      { knownIds: new Set<string>(), fileExists: () => false },
    );
    expect(errors).toEqual([]);
  });
});

describe("generation and drift gates", () => {
  it("should produce byte-identical output when generated twice", () => {
    const first = expectedArtifacts();
    const second = expectedArtifacts();
    expect(second).toEqual(first);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it("should detect a changed byte in the mirror", () => {
    const target = `${SKILL_MIRROR_DIR}/references/index.md`;
    const base = createRealFileSystem();
    const problems = checkGeneration(
      overlayFs({ [target]: `${base.readFile(target) ?? ""} ` }),
    );
    expect(problems.drifted).toContain(target);
  });

  it("should detect a hand-edited generated file", () => {
    const target = "sources/sources.md";
    const base = createRealFileSystem();
    const problems = checkGeneration(
      overlayFs({ [target]: `${base.readFile(target) ?? ""} ` }),
    );
    expect(problems.drifted).toContain(target);
  });

  it("should remove a stale generated file when regenerating", () => {
    const stalePath = `${SKILL_MIRROR_DIR}/references/rules/stale.md`;
    const fs = overlayFs({}, { [stalePath]: "<!-- GENERATED FILE — DO NOT EDIT; source: x -->\n" });
    const problems = checkGeneration(fs);
    expect(problems.stale).toContain(stalePath);

    const removed: string[] = [];
    const written: string[] = [];
    const applied = applyGeneration(fs, (path) => written.push(path), (path) => removed.push(path));
    expect(applied.stale).toContain(stalePath);
    expect(removed).toContain(stalePath);
    expect(written.length).toBeGreaterThan(0);
  });
});
