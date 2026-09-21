# Build, Assemble, and Integrity: fluentui-design Distribution

> **Document**: 03-02-build-assemble-and-integrity.md
> **Parent**: [Index](00-index.md)

## Overview

This component produces the compiled CLI, assembles the npm payload from the committed mirror, keeps
the package version honest, and generates release changelog sections that carry the pinned baseline.
It is the build-and-release machinery behind the publishable package.

## Architecture

### Current Architecture

`tsconfig.json` is `noEmit`; the mirror `.agents/skills/fluentui-design/` is generated but not
copied anywhere for packaging; `facts/freshness.json` pins the baseline but nothing consumes it;
there is no version or release tooling.

### Proposed Changes

- Add `tsconfig.build.json` compiling `src/**` to `dist/`.
- Add `scripts/assemble.ts` copying the mirror to `skills/fluentui-design/`.
- Add `scripts/check-version.mjs` and `scripts/release.mjs` (with baseline injection).
- Teach the drift walk to skip `dist/` and `skills/`.

## Implementation Details

### New Types/Interfaces

```ts
// scripts/assemble.ts
export const SOURCE_DIR = ".agents/skills/fluentui-design";
export const DEST_DIR = "skills/fluentui-design";
export interface AssembleResult { sourceDir: string; destDir: string; files: number; }
export function assembleSkill(cwd?: string): AssembleResult;

// scripts/release.mjs (ESM, JSDoc-typed)
export function semverBump(version, type);      // "1.0.0", "minor" -> "1.1.0"
export function isValidVersion(value);           // x.y.z
export function parseCommit(subject, body?);     // type/scope/breaking, ignores Merge + chore(release)
export function determineBump(commits);          // major | minor | patch
export function buildChangelogEntry(version, date, commits, baseline); // includes Baseline table
export function mergeChangelog(existing, entry); // prepend section
```

### Build (`tsconfig.build.json`)

`extends` the root config but sets `noEmit: false`, `outDir: "dist"`, `rootDir: "src"`,
`declaration: true`, `sourceMap: true`, and `include: ["src/**/*.ts"]`. The root `tsconfig.json`
adds `src/**/*.ts` to its `include` so the CLI is type-checked by `npm run typecheck`.

### Assemble (`scripts/assemble.ts`)

Copies `.agents/skills/fluentui-design/` to `skills/fluentui-design/`, replacing the destination
each run (AR #3). Fails when the source lacks `SKILL.md`. Reports the copied file count. Runs in
`prepack` so `npm pack`/`npm publish` always package a fresh copy.

### Version integrity (`scripts/check-version.mjs`)

Reads `package.json#version`, `package-lock.json#version`, and
`package-lock.json#packages[""].version`; all three must match and be plain semver. Scans `src/`
and `scripts/` for a whole-word version literal and fails if found, exempting `CHANGELOG.md`,
`package.json`, `package-lock.json`, and test files (AR #12). Wired into `verify:static`.

### Release (`scripts/release.mjs`)

Subcommands `version`, `publish`, `release`; flags `--type auto|patch|minor|major`, `--tag
latest|next|beta`, `--access public`, `--dry-run`, `--ci`, `--no-git-commit`, `--git-push`. Derives
the bump from conventional commits since the last tag (`feat`→minor, breaking→major, else patch;
`feat!`/`fix!` handled), writes `package.json` + `package-lock.json`, prepends a `CHANGELOG.md`
section, commits, tags `vX.Y.Z`, and publishes. Unlike the sibling, the generated section includes
a Baseline table read from `facts/freshness.json` `pinned.packageVersion` and `pinned.sourceCommit`
(AR #13).

### Drift-gate skip

`scripts/lib/skill.ts` `listFilesSync` currently skips `node_modules` and `.git`; add `dist` and
`skills` so a built tree produces no `WARN marked file outside the managed set` (AR #17).

## Integration Points

- `prepack` runs `clean` + `build:cli` + `assemble`; `prepublishOnly` runs `verify:static` (AR #9).
- `verify:static` gains `check:version` before `generate:check`.
- The release tool is invoked by the release workflow (03-03), never directly in the plan except in
  tests.

## Error Handling

| Error Case | Handling Strategy | AR Ref |
| ---------- | ----------------- | ------ |
| `assemble` source missing `SKILL.md` | Throw and exit 1 | #3 |
| `check:version` drift | Print which declaration disagrees; exit 1 | #12 |
| Hardcoded version literal | Name the offending files; exit 1 | #12 |
| `release` without `--tag` | Print guidance; exit 2 | #13 |
| `publish` without `--tag` | Print guidance; exit 2 | #13 |
| Dirty git tree during release | Refuse; exit 1 | #13 |
| Tag already exists | Refuse; exit 1 | #13 |

> **Traceability:** every strategy references its requirements AR entry (`../../requirements/00-ambiguity-register.md`).

## Testing Requirements

- Specification tests for the manifest/packaging contract (ST-1..ST-8) and the release tool
  (ST-17..ST-21) — see 07.
- Implementation tests for assemble file counts, changelog merge ordering, and determineBump edge
  cases (empty commit set, unconventional message).
