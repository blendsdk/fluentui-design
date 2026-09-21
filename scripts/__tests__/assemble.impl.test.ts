import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { assembleSkill, DEST_DIR, SOURCE_DIR } from "../assemble.js";

/** Temp directories created by a test, cleaned up after each test. */
const tempDirs: string[] = [];

/**
 * Create a unique temp directory and register it for cleanup.
 *
 * @returns Absolute path to the new directory.
 */
function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "fluentui-design-assemble-"));
  tempDirs.push(dir);
  return dir;
}

/**
 * Create a fake committed skill tree below a project root.
 *
 * @param root - Project root directory.
 * @returns The number of files written.
 */
function makeCommittedSkill(root: string): number {
  const source = join(root, SOURCE_DIR);
  mkdirSync(join(source, "references"), { recursive: true });
  writeFileSync(join(source, "SKILL.md"), "# fluentui-design\n");
  writeFileSync(join(source, "references", "index.md"), "# References\n");
  return 2;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir !== undefined) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("assemble", () => {
  it("should copy the committed tree into the packaged location", () => {
    const root = makeTempDir();
    const expected = makeCommittedSkill(root);

    const result = assembleSkill(root);

    expect(result.files).toBe(expected);
    expect(existsSync(join(root, DEST_DIR, "SKILL.md"))).toBe(true);
    expect(existsSync(join(root, DEST_DIR, "references", "index.md"))).toBe(true);
  });

  it("should fail when the committed skill has no SKILL.md", () => {
    const root = makeTempDir();
    mkdirSync(join(root, SOURCE_DIR), { recursive: true });

    expect(() => assembleSkill(root)).toThrow(/missing SKILL\.md/);
  });

  it("should replace a stale packaged copy", () => {
    const root = makeTempDir();
    makeCommittedSkill(root);
    const stale = join(root, DEST_DIR, "stale.md");
    mkdirSync(join(root, DEST_DIR), { recursive: true });
    writeFileSync(stale, "stale");

    assembleSkill(root);

    expect(existsSync(stale)).toBe(false);
  });
});
