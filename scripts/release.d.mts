/**
 * Type declarations for the JSDoc-typed release tool.
 *
 * The implementation is plain ESM JavaScript so it runs under `node` without a
 * build step. These declarations give the TypeScript tests a typed surface.
 */

/** The pinned upstream versions recorded in a changelog section. */
export interface Baseline {
  /** Version of the Fluent UI React package the skill documents. */
  packageVersion: string;
  /** Commit in the API-fact source the skill was generated from. */
  sourceCommit: string;
}

/** A commit message reduced to the fields the release rules need. */
export interface CommitRecord {
  /** First line of the commit message. */
  subject: string;
  /** Remaining lines, used to detect a `BREAKING CHANGE` marker. */
  body?: string;
}

/** The result of parsing one commit message. */
export interface ParsedCommit {
  /** Conventional type, or `other` when the message is unconventional. */
  type: string;
  /** Parenthesised scope, or `null`. */
  scope: string | null;
  /** True when the commit marks a breaking change. */
  breaking: boolean;
  /** Human-readable message with the conventional prefix removed. */
  subject: string;
}

/** Options accepted by every release subcommand. */
export interface ReleaseOptions {
  type: "auto" | "patch" | "minor" | "major";
  tag: string | null;
  access: string;
  dryRun: boolean;
  ci: boolean;
  noGitCommit: boolean;
  gitPush: boolean;
}

/** The parsed command line. */
export interface ParsedCli {
  command: string;
  options: ReleaseOptions;
  error?: string;
}

/** Inputs to a publish command. */
export interface PublishDetails {
  tag: string;
  access?: string;
  dryRun?: boolean;
}

/** Every side-effecting operation the release tool uses. */
export interface ReleaseDependencies {
  readBaseline(): Baseline;
  assertCleanTree(): void;
  changedSinceLastTag(): boolean;
  readCommits(): CommitRecord[];
  currentVersion(): string;
  assertTagAbsent(version: string): void;
  applyVersion(version: string): void;
  updateChangelog(version: string, commits: CommitRecord[], baseline: Baseline): void;
  commitAndTag(version: string, options: ReleaseOptions): void;
  publish(details: PublishDetails): void;
  gitPush(): void;
  log(message: string): void;
  error(message: string): void;
}

/**
 * Bumps a plain semantic version by one position.
 *
 * @param version - Current version, for example `"1.0.0"`.
 * @param type - Which position to bump.
 * @returns The next version.
 * @throws When `version` is not plain `x.y.z` or `type` is unknown.
 */
export function semverBump(version: string, type: "major" | "minor" | "patch"): string;

/**
 * Tests whether a string is a plain semantic version.
 *
 * @param value - Candidate string.
 * @returns True for `x.y.z`.
 */
export function isValidVersion(value: string): boolean;

/**
 * Parses one commit into the fields the bump rules need.
 *
 * @param subject - Commit subject line.
 * @param body - Commit body, used only for the breaking-change marker.
 * @returns A parsed commit, or `null` when the commit is ignored.
 */
export function parseCommit(subject: string, body?: string): ParsedCommit | null;

/**
 * Determines the semantic version bump implied by a set of commits.
 *
 * @param commits - Commit records.
 * @returns `"major"`, `"minor"`, or `"patch"`.
 */
export function determineBump(commits: CommitRecord[]): "major" | "minor" | "patch";

/**
 * Builds the Markdown section for one release, including its Baseline table.
 *
 * @param version - Version being released.
 * @param date - Release date as `YYYY-MM-DD`.
 * @param commits - Commit records written since the last tag.
 * @param baseline - Pinned `{ packageVersion, sourceCommit }` values.
 * @returns A Markdown section ending in a newline.
 * @throws When the baseline is missing either pinned value.
 */
export function buildChangelogEntry(
  version: string,
  date: string,
  commits: CommitRecord[],
  baseline: Baseline,
): string;

/**
 * Inserts a release section into an existing changelog.
 *
 * @param existing - Current `CHANGELOG.md` contents.
 * @param entry - Generated Markdown section.
 * @returns Updated changelog contents.
 */
export function mergeChangelog(existing: string, entry: string): string;

/**
 * Reads the pinned baseline from `facts/freshness.json`.
 *
 * @returns Pinned `{ packageVersion, sourceCommit }` values.
 * @throws When the facts file is missing the pinned fields.
 */
export function readBaseline(): Baseline;

/**
 * Builds the default set of side-effecting operations.
 *
 * @returns The default dependencies used by `main`.
 */
export function createDependencies(): ReleaseDependencies;

/**
 * Parses the command line.
 *
 * @param argv - Arguments after the executable.
 * @returns The command, parsed options, and an error message when invalid.
 */
export function parseCli(argv: string[]): ParsedCli;

/**
 * Publishes the current package version to npm.
 *
 * @param details - Publish inputs.
 */
export function publish(details: PublishDetails): void;

/**
 * Runs the release CLI.
 *
 * @param argv - Arguments after the executable.
 * @param overrides - Operations to replace, used by tests.
 * @returns Process exit code.
 */
export function main(argv: string[], overrides?: Partial<ReleaseDependencies>): number;
