#!/usr/bin/env node
/**
 * Version-parity guard for the `fluentui-design` package.
 *
 * The package version must exist in exactly one place: the `version` field of
 * `package.json`. This check fails the build when that value drifts from
 * `package-lock.json`, when it is not a plain semantic version, or when a
 * shipped source file hardcodes the current version instead of deriving it.
 *
 * @module check-version
 */

import { readFileSync, readdirSync, realpathSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { isValidVersion } from "./release.mjs";

/** Repository root: this file lives in `<root>/scripts/`. */
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

/**
 * Directories that ship code or tooling and therefore must not hardcode the
 * product version.
 */
const SCANNED_DIRS = ["src", "scripts"];

/**
 * Files that legitimately contain the version and are exempt from the scan.
 *
 * The manifest and lockfile declare it, and the changelog records it.
 */
const EXEMPT_FILES = new Set(["package.json", "package-lock.json", "CHANGELOG.md"]);

/**
 * Reports whether a path is a test file that may legitimately mention versions.
 *
 * @param name - Path relative to the repository root.
 * @returns True when the file is exempt because it is test-only.
 */
function isTestFile(name) {
  return name.includes("__tests__") || name.endsWith(".test.ts") || name.endsWith(".test.mjs");
}

/**
 * Recursively lists the files under a directory.
 *
 * @param dir - Absolute directory to walk.
 * @returns Absolute file paths.
 */
function listFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

/**
 * Finds the scanned files that contain the version string as a whole word.
 *
 * Exempt files and test files are skipped. The whole-word guard stops a
 * version from matching inside a longer number that merely contains it.
 *
 * @param version - Version to search for.
 * @param scanFiles - Files to inspect, each with a relative `path` and `content`.
 * @returns The relative paths that hardcode the version.
 */
function findVersionLiterals(version, scanFiles) {
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(?<![0-9.])${escaped}(?![0-9.])`);
  const hits = [];

  for (const file of scanFiles) {
    if (EXEMPT_FILES.has(file.path) || isTestFile(file.path)) continue;
    if (pattern.test(file.content)) hits.push(file.path);
  }

  return hits;
}

/**
 * Collects the shipped source files that must not hardcode the version.
 *
 * @returns Relative path and content for every scannable file.
 * @throws When a scanned directory or file cannot be read, so a permissions
 * problem can never silently shrink the scan.
 */
function collectScanFiles() {
  const files = [];

  for (const dir of SCANNED_DIRS) {
    let paths;
    try {
      paths = listFiles(join(ROOT, dir));
    } catch (error) {
      throw new Error(`cannot read ${dir}/ for the version scan: ${messageOf(error)}`);
    }

    for (const absolute of paths) {
      const name = relative(ROOT, absolute);
      if (EXEMPT_FILES.has(name) || isTestFile(name)) continue;
      try {
        files.push({ path: name, content: readFileSync(absolute, "utf-8") });
      } catch (error) {
        throw new Error(`cannot read ${name} for the version scan: ${messageOf(error)}`);
      }
    }
  }

  return files;
}

/**
 * Renders an unknown thrown value as a message.
 *
 * @param error - Value caught from a failing operation.
 * @returns A human-readable message.
 */
function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Checks that the package version is declared once and matches its lockfile.
 *
 * @param packageJson - Parsed `package.json`.
 * @param packageLock - Parsed `package-lock.json`.
 * @param scanFiles - Files to scan for a hardcoded version literal.
 * @returns Whether the tree is consistent, plus a message per problem found.
 */
export function checkVersions(packageJson, packageLock, scanFiles) {
  const errors = [];
  const packageVersion = packageJson?.version;

  if (typeof packageVersion !== "string" || !isValidVersion(packageVersion)) {
    return {
      ok: false,
      errors: [`package.json version is not plain semver: ${String(packageVersion)}`],
    };
  }

  const lockVersion = packageLock?.version;
  if (lockVersion !== packageVersion) {
    errors.push(
      `package-lock.json version=${String(lockVersion)} disagrees with package.json version=${packageVersion}`,
    );
  }

  const lockRootVersion = packageLock?.packages?.[""]?.version;
  if (lockRootVersion !== packageVersion) {
    errors.push(
      `package-lock.json packages[""].version=${String(lockRootVersion)} disagrees with package.json version=${packageVersion}`,
    );
  }

  const literals = findVersionLiterals(packageVersion, scanFiles);
  if (literals.length > 0) {
    errors.push(
      `the product version ${packageVersion} is hardcoded in: ${literals.join(", ")}; derive it from package.json instead`,
    );
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Loads the repository state the parity check runs against.
 *
 * @returns The parsed manifest, the parsed lockfile, and the scanned files.
 */
export function loadRepositoryState() {
  return {
    packageJson: JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8")),
    packageLock: JSON.parse(readFileSync(join(ROOT, "package-lock.json"), "utf-8")),
    scanFiles: collectScanFiles(),
  };
}

/**
 * Runs the parity check against the repository.
 *
 * @param load - Loader for the repository state; injectable for tests.
 * @returns Process exit code; `0` when every declaration agrees.
 */
export function main(load = loadRepositoryState) {
  let state;
  try {
    state = load();
  } catch (error) {
    console.error(`error: ${messageOf(error)}`);
    return 1;
  }

  const result = checkVersions(state.packageJson, state.packageLock, state.scanFiles);

  if (!result.ok) {
    for (const error of result.errors) console.error(`error: ${error}`);
    return 1;
  }

  console.log(`version ok: ${state.packageJson.version}`);
  return 0;
}

/**
 * True when this module is the process entry point.
 *
 * @returns True when this file is the entry point.
 */
function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return fileURLToPath(import.meta.url) === realpathSync(process.argv[1]);
  } catch {
    return false;
  }
}

if (isMainModule()) {
  process.exitCode = main();
}
