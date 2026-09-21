import fs, {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BACKUP_PREFIX,
  installSkill,
  main,
  MARKER_FILE,
  readMarker,
  sanitizeForDisplay,
  SKILL_DIR_NAME,
  TEMP_PREFIX,
} from "../../src/skill/install-skill.js";

/**
 * Replace the interactive prompt with one that aborts immediately.
 *
 * The driver only creates a readline interface when it needs to prompt, so
 * mocking it lets tests exercise the abort path without a real terminal.
 */
vi.mock("node:readline/promises", () => ({
  default: {
    createInterface: () => ({
      question: () =>
        Promise.reject(Object.assign(new Error("aborted"), { name: "AbortError" })),
      close: () => undefined,
    }),
  },
}));

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
  vi.restoreAllMocks();
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

  it("should refuse to replace a symlink to an unrelated directory", () => {
    const root = makeTempDir();
    const sourceDir = makeSourceSkill(root);
    const targetDir = join(root, "target");
    const unrelated = join(root, "unrelated");
    mkdirSync(unrelated, { recursive: true });
    const keep = join(unrelated, "keep.txt");
    writeFileSync(keep, "keep me");
    mkdirSync(targetDir, { recursive: true });
    symlinkSync(unrelated, join(targetDir, SKILL_DIR_NAME), "dir");

    expect(() => installSkill({ sourceDir, targetDir, version: "0.1.0" })).toThrow(
      /refusing to replace unrelated directory/,
    );
    expect(readFileSync(keep, "utf8")).toBe("keep me");
  });
});

describe("atomic replacement", () => {
  it("should restore the previous install when the replacement rename fails", () => {
    const root = makeTempDir();
    const sourceDir = makeSourceSkill(root);
    const targetDir = join(root, "target");
    const dest = join(targetDir, SKILL_DIR_NAME);
    installSkill({ sourceDir, targetDir, version: "0.1.0" });

    const realRename = fs.renameSync;
    const spy = vi.spyOn(fs, "renameSync").mockImplementation((oldPath, newPath) => {
      if (String(oldPath).includes(TEMP_PREFIX)) {
        throw new Error("simulated rename failure");
      }
      return realRename(oldPath, newPath);
    });

    expect(() => installSkill({ sourceDir, targetDir, version: "0.2.0" })).toThrow(
      /simulated rename failure/,
    );
    spy.mockRestore();

    expect(existsSync(join(dest, "SKILL.md"))).toBe(true);
    expect(readMarker(dest)?.version).toBe("0.1.0");
    expect(
      fs.readdirSync(targetDir).some((entry) => entry.startsWith(TEMP_PREFIX)),
    ).toBe(false);
  });

  it("should restore the previous install when a link replacement rename fails", () => {
    const root = makeTempDir();
    const sourceDir = makeSourceSkill(root);
    const targetDir = join(root, "target");
    const dest = join(targetDir, SKILL_DIR_NAME);
    installSkill({ sourceDir, targetDir, version: "0.1.0" });

    const realRename = fs.renameSync;
    const spy = vi.spyOn(fs, "renameSync").mockImplementation((oldPath, newPath) => {
      if (String(oldPath).includes(TEMP_PREFIX)) {
        throw new Error("simulated link rename failure");
      }
      return realRename(oldPath, newPath);
    });

    expect(() =>
      installSkill({ sourceDir, targetDir, version: "0.2.0", link: true }),
    ).toThrow(/simulated link rename failure/);
    spy.mockRestore();

    expect(lstatSync(dest).isSymbolicLink()).toBe(false);
    expect(readMarker(dest)?.version).toBe("0.1.0");
  });
});

describe("display sanitization", () => {
  it("should strip terminal escape and bidi control characters", () => {
    expect(sanitizeForDisplay("1.0.0\u001b[31m\u202e2.0.0")).toBe("1.0.0[31m2.0.0");
  });
});

describe("CLI driver", () => {
  it("should install into an explicit target without prompting when not a TTY", async () => {
    const root = makeTempDir();
    const sourceDir = makeSourceSkill(root);
    const targetDir = join(root, "target");

    const code = await main(["install", "--target", targetDir], {
      sourceDir,
      version: "0.1.0",
      home: root,
      cwd: root,
      isTTY: false,
    });

    expect(code).toBe(0);
    expect(existsSync(join(targetDir, SKILL_DIR_NAME, "SKILL.md"))).toBe(true);
  });

  it("should install into project directories without prompting when --project is set", async () => {
    const root = makeTempDir();
    const sourceDir = makeSourceSkill(root);
    const cwd = join(root, "project");
    mkdirSync(join(cwd, ".claude", "skills"), { recursive: true });

    const code = await main(["install", "--project"], {
      sourceDir,
      version: "0.1.0",
      home: join(root, "home"),
      cwd,
      isTTY: true,
    });

    expect(code).toBe(0);
    expect(existsSync(join(cwd, ".claude", "skills", SKILL_DIR_NAME, "SKILL.md"))).toBe(true);
  });

  it("should install into every detected client without prompting when --all is set", async () => {
    const root = makeTempDir();
    const sourceDir = makeSourceSkill(root);
    const home = join(root, "home");
    mkdirSync(join(home, ".claude", "skills"), { recursive: true });

    const code = await main(["install", "--all"], {
      sourceDir,
      version: "0.1.0",
      home,
      cwd: root,
      isTTY: true,
    });

    expect(code).toBe(0);
    expect(existsSync(join(home, ".claude", "skills", SKILL_DIR_NAME, "SKILL.md"))).toBe(true);
  });

  it("should return a cancellation code when the selection prompt aborts", async () => {
    const root = makeTempDir();
    const sourceDir = makeSourceSkill(root);
    const home = join(root, "home");
    mkdirSync(join(home, ".claude", "skills"), { recursive: true });

    const code = await main(["install"], {
      sourceDir,
      version: "0.1.0",
      home,
      cwd: root,
      isTTY: true,
    });

    expect(code).toBe(130);
  });
});
