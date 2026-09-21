import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  BACKUP_PREFIX,
  installSkill,
  MARKER_FILE,
  readMarker,
  SKILL_DIR_NAME,
  TEMP_PREFIX,
} from "../../src/skill/install-skill.js";

/** Temp directories created by a test, cleaned up after each test. */
const tempDirs: string[] = [];

/**
 * Create a unique temp directory and register it for cleanup.
 *
 * @returns Absolute path to the new directory.
 */
function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "fluentui-design-impl-"));
  tempDirs.push(dir);
  return dir;
}

/**
 * Create a fake source skill directory containing a `SKILL.md`.
 *
 * @param parent - Directory that holds the fake source skill.
 * @returns Absolute path to the source skill directory.
 */
function makeSourceSkill(parent: string): string {
  const dir = join(parent, "source-skill");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "SKILL.md"), "# fluentui-design\n");
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir !== undefined) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("marker validation", () => {
  it("should treat malformed marker JSON as absent", () => {
    const root = makeTempDir();
    const installed = join(root, SKILL_DIR_NAME);
    mkdirSync(installed, { recursive: true });
    writeFileSync(join(installed, MARKER_FILE), "{ not json");

    expect(readMarker(installed)).toBeUndefined();
  });

  it("should treat a marker with the wrong field types as absent", () => {
    const root = makeTempDir();
    const installed = join(root, SKILL_DIR_NAME);
    mkdirSync(installed, { recursive: true });
    writeFileSync(join(installed, MARKER_FILE), JSON.stringify({ version: 1 }));

    expect(readMarker(installed)).toBeUndefined();
  });
});

describe("install hygiene", () => {
  it("should remove leftover temp and backup directories before installing", () => {
    const root = makeTempDir();
    const sourceDir = makeSourceSkill(root);
    const targetDir = join(root, "target");
    mkdirSync(join(targetDir, `${TEMP_PREFIX}123`), { recursive: true });
    mkdirSync(join(targetDir, `${BACKUP_PREFIX}456`), { recursive: true });

    installSkill({ sourceDir, targetDir, version: "0.1.0" });

    expect(existsSync(join(targetDir, `${TEMP_PREFIX}123`))).toBe(false);
    expect(existsSync(join(targetDir, `${BACKUP_PREFIX}456`))).toBe(false);
  });

  it("should replace an existing install and refresh the marker version", () => {
    const root = makeTempDir();
    const sourceDir = makeSourceSkill(root);
    const targetDir = join(root, "target");

    installSkill({ sourceDir, targetDir, version: "0.1.0" });
    installSkill({ sourceDir, targetDir, version: "0.2.0" });

    const dest = join(targetDir, SKILL_DIR_NAME);
    const marker: unknown = JSON.parse(readFileSync(join(dest, MARKER_FILE), "utf8"));
    expect(marker).toMatchObject({ version: "0.2.0" });
  });

  it("should reject a source directory without a SKILL.md", () => {
    const root = makeTempDir();
    const emptySource = join(root, "empty");
    mkdirSync(emptySource, { recursive: true });

    expect(() =>
      installSkill({ sourceDir: emptySource, targetDir: join(root, "target"), version: "0.1.0" }),
    ).toThrow(/missing SKILL\.md/);
  });
});

describe("symlink installs", () => {
  it("should symlink to the source when link is requested", () => {
    const root = makeTempDir();
    const sourceDir = makeSourceSkill(root);
    const targetDir = join(root, "target");

    const result = installSkill({ sourceDir, targetDir, version: "0.1.0", link: true });

    expect(result.linked).toBe(true);
    const dest = join(targetDir, SKILL_DIR_NAME);
    expect(lstatSync(dest).isSymbolicLink()).toBe(true);
    expect(readlinkSync(dest)).toBe(sourceDir);
  });
});
