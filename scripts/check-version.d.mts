/**
 * Type declarations for the JSDoc-typed version-parity check.
 *
 * The implementation is plain ESM JavaScript so it runs under `node` without a
 * build step. These declarations give the TypeScript tests a typed surface.
 */

/** A file considered for a hardcoded version literal. */
export interface ScannedFile {
  /** Path relative to the repository root. */
  path: string;
  /** Full file contents. */
  content: string;
}

/** The outcome of a version-parity check. */
export interface VersionCheckResult {
  /** True when every declaration agrees and no literal was found. */
  ok: boolean;
  /** One message per problem found; empty when `ok` is true. */
  errors: string[];
}

/** The repository inputs the parity check runs against. */
export interface RepositoryState {
  /** Parsed `package.json`. */
  packageJson: { version?: unknown };
  /** Parsed `package-lock.json`. */
  packageLock: { version?: unknown; packages?: Record<string, { version?: unknown }> };
  /** Files to scan for a hardcoded version literal. */
  scanFiles: ScannedFile[];
}

/**
 * Checks that the package version is declared once and matches its lockfile.
 *
 * @param packageJson - Parsed `package.json`.
 * @param packageLock - Parsed `package-lock.json`.
 * @param scanFiles - Files to scan for a hardcoded version literal.
 * @returns Whether the tree is consistent, plus a message per problem found.
 */
export function checkVersions(
  packageJson: { version?: unknown },
  packageLock: { version?: unknown; packages?: Record<string, { version?: unknown }> },
  scanFiles: ScannedFile[],
): VersionCheckResult;

/**
 * Loads the repository state the parity check runs against.
 *
 * @returns The parsed manifest, the parsed lockfile, and the scanned files.
 */
export function loadRepositoryState(): RepositoryState;

/**
 * Runs the parity check against the repository.
 *
 * @param load - Loader for the repository state; injectable for tests.
 * @returns Process exit code; `0` when every declaration agrees.
 */
export function main(load?: () => RepositoryState): number;
