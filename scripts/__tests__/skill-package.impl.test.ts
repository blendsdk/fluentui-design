import { describe, expect, it } from "vitest";
import {
  checkGeneration,
  createRealFileSystem,
  parseSkillEntry,
  SKILL_DIR,
  SKILL_ENTRY_PATH,
  SKILL_MIRROR_DIR,
} from "../lib/skill.js";

/**
 * Tokens that would indicate a skill file executes or downloads code.
 *
 * The package is documentation: it must never instruct an agent to run remote
 * installers or evaluate fetched content.
 */
const REMOTE_CODE_PATTERNS = [
  /\bchild_process\b/,
  /\bexecSync\b/,
  /\bspawn\(/,
  /\beval\(/,
  /\bfetch\(/,
  /\bXMLHttpRequest\b/,
  /\bcurl\b/,
  /\bwget\b/,
  /\bnpx\b/,
  /npm install/,
];

describe("skill package hardening", () => {
  it("should keep the entry point within the line budget", () => {
    const fs = createRealFileSystem();
    const entry = parseSkillEntry(fs.readFile(SKILL_ENTRY_PATH) ?? "", SKILL_ENTRY_PATH);
    expect(entry.lineCount).toBeGreaterThanOrEqual(150);
    expect(entry.lineCount).toBeLessThanOrEqual(320);
  });

  it("should treat an unmarked extra file in the mirror as stale", () => {
    const base = createRealFileSystem();
    const stalePath = `${SKILL_MIRROR_DIR}/references/foundation/temp-authored.md`;
    const fs = {
      readFile: (path: string): string | undefined =>
        path === stalePath ? "authored copy with no marker\n" : base.readFile(path),
      listFiles: (dir: string): string[] => {
        const listed = new Set(base.listFiles(dir));
        if (stalePath.startsWith(`${dir}/`) || dir === ".") {
          listed.add(stalePath);
        }
        return [...listed].sort((a, b) => a.localeCompare(b));
      },
    };
    expect(checkGeneration(fs).stale).toContain(stalePath);
  });

  it("should contain no instructions that execute or download remote code", () => {
    const fs = createRealFileSystem();
    const offenders: string[] = [];
    for (const path of fs.listFiles(SKILL_DIR).filter((file) => file.endsWith(".md"))) {
      const text = fs.readFile(path) ?? "";
      for (const pattern of REMOTE_CODE_PATTERNS) {
        if (pattern.test(text)) {
          offenders.push(`${path} matches ${String(pattern)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
