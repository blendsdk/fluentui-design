import { describe, expect, it } from "vitest";
import {
  buildChangelogEntry,
  determineBump,
  parseCommit,
  semverBump,
} from "../../scripts/release.mjs";
import { checkVersions } from "../../scripts/check-version.mjs";

/**
 * The pinned baseline the changelog section must record.
 *
 * These are the two upstream values the skill was built against: the Fluent UI
 * React package version and the API-fact commit.
 */
const SPEC_BASELINE = { packageVersion: "9.74.7", sourceCommit: "d595d79" };

describe("release version rules", () => {
  it("should bump the requested position and reset lower positions", () => {
    expect(semverBump("1.2.3", "major")).toBe("2.0.0");
    expect(semverBump("1.2.3", "minor")).toBe("1.3.0");
    expect(semverBump("1.2.3", "patch")).toBe("1.2.4");
  });

  it("should parse a conventional commit and ignore bookkeeping commits", () => {
    const chore = parseCommit("chore: x");
    expect(chore).not.toBeNull();
    expect(chore?.type).toBe("chore");
    expect(parseCommit("chore(release): x")).toBeNull();
    expect(parseCommit("Merge branch 'x'")).toBeNull();
  });

  it("should choose the bump from the strongest commit in the set", () => {
    expect(determineBump([{ subject: "feat: add a page" }])).toBe("minor");
    expect(determineBump([{ subject: "fix: correct a guard" }])).toBe("patch");
    expect(determineBump([{ subject: "feat!: change the contract" }])).toBe("major");
  });

  it("should record the version and pinned baseline in the changelog section", () => {
    const entry = buildChangelogEntry(
      "1.2.0",
      "2026-01-01",
      [{ subject: "feat: add a page" }],
      SPEC_BASELINE,
    );

    expect(entry).toContain("1.2.0");
    expect(entry).toContain("### Baseline");
    expect(entry).toContain("9.74.7");
    expect(entry).toContain("d595d79");
  });
});

describe("version parity check", () => {
  it("should fail and name the drift when the lockfile version differs", () => {
    const result = checkVersions(
      { version: "1.2.3" },
      { version: "1.2.2", packages: { "": { version: "1.2.2" } } },
      [],
    );

    expect(result.ok).toBe(false);
    const message = result.errors.join("\n");
    expect(message).toContain("package-lock.json");
    expect(message).toContain("1.2.2");
  });
});
