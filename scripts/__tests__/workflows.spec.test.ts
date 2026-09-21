import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** Repository-relative path to the CI workflow. */
const CI_WORKFLOW = ".github/workflows/ci.yml";

/** Repository-relative path to the manual release workflow. */
const RELEASE_WORKFLOW = ".github/workflows/release.yml";

/** Repository-relative path to the user-facing README. */
const README = "README.md";

/**
 * Read a text file relative to the repository root.
 *
 * @param relativePath - Repository-relative path to the file.
 * @returns The file contents.
 * @throws Error when the file does not exist.
 */
function readText(relativePath: string): string {
  if (!existsSync(relativePath)) {
    throw new Error(`${relativePath} does not exist`);
  }
  return readFileSync(relativePath, "utf8");
}

/**
 * Collapse runs of whitespace so YAML assertions are insensitive to indentation
 * and line breaks.
 *
 * @param text - Raw file contents.
 * @returns The contents with every whitespace run replaced by a single space.
 */
function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Return the slice of normalized text between two markers.
 *
 * This lets a test assert on one workflow job without matching text that belongs
 * to a different job.
 *
 * @param text - Normalized text to search.
 * @param startMarker - Marker that opens the slice.
 * @param endMarker - Marker that closes the slice.
 * @returns The text from the start marker to the end marker (exclusive).
 * @throws Error when the start marker is absent.
 */
function section(text: string, startMarker: string, endMarker: string): string {
  const start = text.indexOf(startMarker);
  if (start === -1) {
    throw new Error(`missing marker '${startMarker}'`);
  }
  const end = text.indexOf(endMarker, start + startMarker.length);
  return end === -1 ? text.slice(start) : text.slice(start, end);
}

describe("CI workflow", () => {
  it("should run on pushes to main, on pull requests, and on Node 24", () => {
    const workflow = normalize(readText(CI_WORKFLOW));

    expect(workflow).toMatch(/push: branches: \[main\]/);
    expect(workflow).toContain("pull_request:");
    expect(workflow).toMatch(/node-version: 24\b/);
    expect(workflow).toMatch(/contents: read/);
  });

  it("should install Chromium, run the full verify, and inspect the pack payload", () => {
    const workflow = normalize(readText(CI_WORKFLOW));

    expect(workflow).toContain("npx playwright install --with-deps chromium");
    expect(workflow).toContain("npm run verify");
    expect(workflow).toContain("npm pack --dry-run");
  });
});

describe("release workflow dispatch inputs", () => {
  it("should accept a version type and a dist-tag with the documented choices", () => {
    const workflow = normalize(readText(RELEASE_WORKFLOW));

    expect(workflow).toContain("workflow_dispatch:");

    const versionType = section(workflow, "version_type:", "dist_tag:");
    expect(versionType).toContain("type: choice");
    for (const choice of ["auto", "patch", "minor", "major"]) {
      expect(versionType).toContain(choice);
    }
    expect(versionType).toMatch(/default: auto/);

    const distTag = section(workflow, "dist_tag:", "jobs:");
    expect(distTag).toContain("type: choice");
    for (const choice of ["latest", "next", "beta"]) {
      expect(distTag).toContain(choice);
    }
    expect(distTag).toMatch(/default: latest/);
  });
});

describe("release workflow validation guard", () => {
  it("should fail a latest release that is not dispatched from main", () => {
    const workflow = normalize(readText(RELEASE_WORKFLOW));
    const validate = section(workflow, "validate:", "release:");

    expect(validate).toMatch(/if:/);
    expect(validate).toContain("latest");
    expect(validate).toContain("main");
    expect(validate).toContain("exit 1");
  });
});

describe("release workflow publish permissions", () => {
  it("should grant the OIDC id-token only to the release job", () => {
    const workflow = normalize(readText(RELEASE_WORKFLOW));
    const releaseStart = workflow.indexOf("release:");

    expect(releaseStart).toBeGreaterThan(-1);
    expect(workflow.slice(0, releaseStart)).not.toContain("id-token: write");
    expect(workflow.slice(releaseStart)).toContain("id-token: write");

    const ci = normalize(readText(CI_WORKFLOW));
    expect(ci).not.toContain("id-token");
  });
});

describe("README install section", () => {
  it("should document the one-line install command", () => {
    const readme = readText(README);

    expect(readme).toMatch(/^## Install\s*$/m);
    expect(readme).toContain("npx -y fluentui-design skill install");
  });
});
