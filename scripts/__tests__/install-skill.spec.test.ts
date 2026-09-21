import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  detectClients,
  installSkill,
  parseArgs,
  resolveTargets,
  uninstallSkill,
  MARKER_FILE,
  SKILL_DIR_NAME,
} from "../../src/skill/install-skill.js";

/** Temp directories created by a test, cleaned up after each test. */
const tempDirs: string[] = [];

/**
 * Create a unique temp directory and register it for cleanup.
 *
 * @returns Absolute path to the new directory.
 */
function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "fluentui-design-spec-"));
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

describe("skill installer argument parsing", () => {
  it("should parse install flags", () => {
    const parsed = parseArgs(["install", "--target", "/x", "--link", "--dry-run"]);
    expect(parsed.command).toBe("install");
    expect(parsed.options.targets).toEqual(["/x"]);
    expect(parsed.options.link).toBe(true);
    expect(parsed.options.dryRun).toBe(true);
  });

  it("should report an error when --target has no directory", () => {
    const parsed = parseArgs(["status", "--target"]);
    expect(parsed.error).toMatch(/--target requires a directory argument/);
  });
});

describe("skill client detection and target resolution", () => {
  it("should detect only installed clients", () => {
    const home = "/home/tester";
    const cwd = "/work/app";
    const claudeGlobal = join(home, ".claude", "skills");

    const detected = detectClients({
      home,
      cwd,
      exists: (path) => path === claudeGlobal,
    });

    const ids = detected.map((client) => client.id);
    expect(ids).toContain("claude");
    expect(ids).not.toContain("opencode");
    expect(ids).not.toContain("codex");
    expect(ids).not.toContain("agents");
  });

  it("should return explicit targets verbatim", () => {
    const targets = resolveTargets(
      {
        targets: ["/a/skills", "/b/skills"],
        project: false,
        link: false,
        dryRun: false,
        all: false,
      },
      [],
    );
    expect(targets).toEqual(["/a/skills", "/b/skills"]);
  });
});

describe("skill install and uninstall behavior", () => {
  it("should copy the skill and write a versioned marker", () => {
    const root = makeTempDir();
    const sourceDir = makeSourceSkill(root);
    const targetDir = join(root, "target");
    mkdirSync(targetDir, { recursive: true });

    const result = installSkill({ sourceDir, targetDir, version: "0.1.0" });

    const dest = join(targetDir, SKILL_DIR_NAME);
    expect(result.installed).toBe(true);
    expect(existsSync(join(dest, "SKILL.md"))).toBe(true);

    const markerPath = join(dest, MARKER_FILE);
    expect(existsSync(markerPath)).toBe(true);
    const marker: unknown = JSON.parse(readFileSync(markerPath, "utf8"));
    expect(marker).toEqual(
      expect.objectContaining({
        version: "0.1.0",
        source: expect.anything(),
        installedAt: expect.anything(),
      }),
    );
  });

  it("should write nothing and report dryRun", () => {
    const root = makeTempDir();
    const sourceDir = makeSourceSkill(root);
    const targetDir = join(root, "target");
    mkdirSync(targetDir, { recursive: true });

    const result = installSkill({ sourceDir, targetDir, version: "0.1.0", dryRun: true });

    expect(result.dryRun).toBe(true);
    expect(existsSync(join(targetDir, SKILL_DIR_NAME))).toBe(false);
  });

  it("should refuse to replace an unrelated directory", () => {
    const root = makeTempDir();
    const sourceDir = makeSourceSkill(root);
    const targetDir = join(root, "target");
    const unrelated = join(targetDir, SKILL_DIR_NAME);
    mkdirSync(unrelated, { recursive: true });
    const sentinel = join(unrelated, "keep.txt");
    writeFileSync(sentinel, "keep me");

    expect(() => installSkill({ sourceDir, targetDir, version: "0.1.0" })).toThrow(
      /refusing to replace unrelated directory/,
    );
    expect(readFileSync(sentinel, "utf8")).toBe("keep me");
  });

  it("should remove only the skill directory", () => {
    const root = makeTempDir();
    const targetDir = join(root, "target");
    const installed = join(targetDir, SKILL_DIR_NAME);
    const sibling = join(targetDir, "other-skill");
    mkdirSync(installed, { recursive: true });
    mkdirSync(sibling, { recursive: true });
    writeFileSync(join(installed, "SKILL.md"), "# installed\n");
    writeFileSync(join(sibling, "SKILL.md"), "# other\n");

    const result = uninstallSkill({ targetDir });

    expect(result.removed).toBe(true);
    expect(existsSync(installed)).toBe(false);
    expect(existsSync(sibling)).toBe(true);
  });
});
