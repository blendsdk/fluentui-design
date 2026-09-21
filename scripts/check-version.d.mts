/**
 * Type declarations for the version-parity check.
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

export function checkVersions(
  packageJson: { version?: unknown },
  packageLock: { version?: unknown; packages?: Record<string, { version?: unknown }> },
  scanFiles: ScannedFile[],
): VersionCheckResult;

export function main(): number;
