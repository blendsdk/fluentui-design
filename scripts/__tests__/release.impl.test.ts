import { describe, expect, it } from "vitest";
import {
  buildChangelogEntry,
  determineBump,
  main,
  mergeChangelog,
  parseCommit,
} from "../../scripts/release.mjs";
import { checkVersions } from "../../scripts/check-version.mjs";
import type { ReleaseDependencies } from "../../scripts/release.mjs";

/** The pinned baseline every generated section must carry. */
const BASELINE = { packageVersion: "9.74.7", sourceCommit: "d595d79" };

/**
 * Build release dependencies that touch nothing outside memory.
 *
 * The write operations record their name into `writes`, so a test can assert
 * that a dry run performed no side effect. Git reads are answered from fixed
 * values instead of the real repository.
 *
 * @param writes - Collector for the names of operations that would write.
 * @returns A dependency set suitable for `main`.
 */
function makeDeps(writes: string[]): Partial<ReleaseDependencies> {
  return {
    changedSinceLastTag: () => true,
    readCommits: () => [{ subject: "feat: add a page" }],
    currentVersion: () => "1.2.3",
    assertTagAbsent: () => {},
    readBaseline: () => BASELINE,
    applyVersion: () => {
      writes.push("applyVersion");
    },
    updateChangelog: () => {
      writes.push("updateChangelog");
    },
    commitAndTag: () => {
      writes.push("commitAndTag");
    },
    publish: () => {
      writes.push("publish");
    },
    gitPush: () => {
      writes.push("gitPush");
    },
    log: () => {},
    error: () => {},
  };
}

describe("changelog merge ordering", () => {
  it("should insert the new section above the newest release", () => {
    const existing = "# Changelog\n\n## [0.1.0] - 2026-09-20\n\n- old\n";
    const entry = "## 0.2.0 — 2026-10-01\n\n- new\n\n";

    const merged = mergeChangelog(existing, entry);

    expect(merged.indexOf("## 0.2.0")).toBeLessThan(merged.indexOf("## [0.1.0]"));
    expect(merged).toContain("- old");
  });

  it("should replace an Unreleased section instead of duplicating it", () => {
    const existing = "# Changelog\n\n## Unreleased\n\n- work in progress\n\n## 0.1.0\n\n- old\n";
    const entry = "## 0.2.0 — 2026-10-01\n\n- new\n\n";

    const merged = mergeChangelog(existing, entry);

    expect(merged).not.toContain("Unreleased");
    expect(merged).not.toContain("work in progress");
    expect(merged).toContain("## 0.2.0");
  });
});

describe("bump edge cases", () => {
  it("should bump patch for an empty commit set", () => {
    expect(determineBump([])).toBe("patch");
  });

  it("should bump patch and group an unconventional message as other", () => {
    expect(determineBump([{ subject: "tidy some things" }])).toBe("patch");
    expect(parseCommit("tidy some things")?.type).toBe("other");
  });

  it("should still produce a section for an empty commit set", () => {
    const entry = buildChangelogEntry("0.2.0", "2026-10-01", [], BASELINE);

    expect(entry).toContain("## 0.2.0");
    expect(entry).toContain("No user-facing changes");
  });
});

describe("dry-run behavior", () => {
  it("should report the next version and write nothing", () => {
    const writes: string[] = [];

    const code = main(["version", "--dry-run"], makeDeps(writes));

    expect(code).toBe(0);
    expect(writes).toEqual([]);
  });
});

describe("version literal scanning", () => {
  it("should accept matching declarations and clean sources", () => {
    const result = checkVersions(
      { version: "1.2.3" },
      { version: "1.2.3", packages: { "": { version: "1.2.3" } } },
      [],
    );

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should name a source file that hardcodes the version", () => {
    const result = checkVersions(
      { version: "1.2.3" },
      { version: "1.2.3", packages: { "": { version: "1.2.3" } } },
      [{ path: "src/app.ts", content: 'export const version = "1.2.3";' }],
    );

    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("src/app.ts");
  });

  it("should ignore an exempt test file that mentions the version", () => {
    const result = checkVersions(
      { version: "1.2.3" },
      { version: "1.2.3", packages: { "": { version: "1.2.3" } } },
      [{ path: "scripts/__tests__/x.test.ts", content: 'expect(v).toBe("1.2.3");' }],
    );

    expect(result.ok).toBe(true);
  });
});
