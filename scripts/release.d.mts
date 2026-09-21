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

export function semverBump(version: string, type: "major" | "minor" | "patch"): string;
export function isValidVersion(value: string): boolean;
export function parseCommit(subject: string, body?: string): ParsedCommit | null;
export function determineBump(commits: CommitRecord[]): "major" | "minor" | "patch";
export function buildChangelogEntry(
  version: string,
  date: string,
  commits: CommitRecord[],
  baseline: Baseline,
): string;
export function mergeChangelog(existing: string, entry: string): string;
export function readBaseline(): Baseline;
export function createDependencies(): ReleaseDependencies;
export function parseCli(argv: string[]): ParsedCli;
export function publish(details: PublishDetails): void;
export function main(argv: string[], overrides?: Partial<ReleaseDependencies>): number;
