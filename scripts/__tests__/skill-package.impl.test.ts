import { describe, expect, it } from "vitest";
import {
  createRealFileSystem,
  ENTRY_LINE_MIN,
  ENTRY_LINE_SOFT_MAX,
  parseSkillEntry,
  SKILL_DIR,
  SKILL_ENTRY_PATH,
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
    expect(entry.lineCount).toBeGreaterThanOrEqual(ENTRY_LINE_MIN);
    expect(entry.lineCount).toBeLessThanOrEqual(ENTRY_LINE_SOFT_MAX);
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
