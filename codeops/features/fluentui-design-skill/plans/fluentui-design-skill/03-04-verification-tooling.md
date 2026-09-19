# Verification Tooling: fluentui-design-skill

> **Document**: 03-04-verification-tooling.md
> **Parent**: [Index](00-index.md)
> **Implements**: RD-07

## Overview

This component is the project's mechanical oracle. It turns the catalogs and the skill into
trustworthy artifacts with a deterministic generator and five gates: reference integrity, example
compilation, secret scanning, facts-allowlist checking, and drift detection. Everything runs offline.
No gate executes example code or calls the network.

## Implementation Details

### New Types/Interfaces

```ts
/** The derived allowlist of verified library facts (plan AR #5). */
export interface VerifiedExports {
  pinnedCommit: string;      // sibling fluentui-mcp commit, e.g. "d595d79"
  sourceHash: string;        // sha256 of the sibling enhanced schema at that commit
  packageVersion: string;    // @fluentui/react-components version, e.g. "9.74.7"
  exports: string[];         // sorted top-level export names
  subcomponents: Record<string, string[]>; // e.g. { "Dialog": ["DialogSurface", ...] }
}
```

### Scripts

| Script | Purpose |
| ------ | ------- |
| `scripts/generate.ts` | Render `sources/sources.md`, `rules/rules.md`, `skill/references/index.md`, `skill/references/rules/index.md`, and the `.agents/skills/fluentui-design/` mirror. `--check` diffs without writing. |
| `scripts/extract-facts.ts` | Read the sibling enhanced schema and write `facts/verified-exports.json`. Run only at re-pin. |
| `scripts/check-facts.ts` | Assert `facts/verified-exports.json` is well-formed and that its `exports`/`subcomponents` are sorted and unique. |
| `scripts/validate-sources.ts` | RD-01 schema + integrity. |
| `scripts/validate-rules.ts` | RD-04 schema + integrity + allowlist check. |
| `scripts/lint-rules.ts` | Actionability lint (warnings; empty-instruction error). |
| `scripts/check-references.ts` | Resolve all `SRC/RULE/PAT/FND/CNF` ids and internal Markdown links. |
| `scripts/check-examples.ts` | Compile skill code blocks against the pinned package types; typecheck the fixture. Never execute. |
| `scripts/scan-secrets.ts` | Reject credential patterns in tracked content. |
| `scripts/check-drift.ts` | Run `generate.ts --check` and compare the mirror. |
| `scripts/freshness.ts` | Write/verify `facts/freshness.json` (pinned commit + input hashes). |

### Generation algorithm (`generate.ts`)

1. Read `sources.json`, `rules.json`, and the `PAT-###` frontmatter.
2. Sort every entry by id; render Markdown with LF endings; prefix each generated file with
   `GENERATED_MARKER`.
3. Before writing, find generated files under the managed roots that carry the marker and delete
   stale ones (plan AR #7).
4. Write generated Markdown, then mirror `skill/` → `.agents/skills/fluentui-design/` with a clean
   copy.
5. In `--check` mode, perform all reads and renders in memory and report any difference; write nothing.

Determinism rules (RD-07): sorted inputs, LF endings, no timestamps in generated content, and a
stable trailing newline.

### Example gate algorithm (`check-examples.ts`)

1. Extract fenced ```` ```ts ````/```` ```tsx ````/```` ```js ```` blocks from `skill/**` and from
   `positiveExample`/`antiPattern` fields in `rules.json`.
2. Create an in-memory TypeScript program that resolves `@fluentui/react-components` from the
   installed `node_modules`.
3. Classify each diagnostic: `api` (unknown import/symbol/member) blocks; `general` (type mismatch)
   is reported and repaired.
4. Report failures as `<file>:<line> — <message>`, naming the offending import/export/member.
5. Also run `tsc --noEmit` over `fixture/`. **No code is executed.**

### Secret scan patterns

Reject high-confidence credential shapes: PEM private keys, `AKIA[0-9A-Z]{16}` (AWS), `ghp_`/`github_pat_`
(GitHub), `sk-` API keys, `xox[baprs]-` (Slack), and `-----BEGIN PRIVATE KEY-----`. Scan tracked
text files, excluding `package-lock.json` integrity hashes and the vendored brief. Report
`file:line — pattern-name`; exit 1 on any match.

### `verify` composition

| Command | Runs |
| ------- | ---- |
| `verify:static` | `typecheck` → `lint` → `test` (Vitest) → `validate:all` → `lint:rules` → `check:facts` → `generate:check` → `check:refs` → `check:examples` → `scan:secrets` → `freshness --check` |
| `test:e2e` | `playwright test` (Chromium; starts the Vite preview server) |
| `verify` | `verify:static` → `test:e2e` |

Browsers are installed once with `npx playwright install chromium`; this is documented in the README
(plan AR #6). `verify:static` is the fast, browser-free subset and is what runs in inner loops.

### Freshness manifest

`facts/freshness.json` records the pinned sibling commit, the sibling schema hash, the pinned package
version, and hashes of the generation inputs (`sources.json`, `rules.json`, pattern frontmatter). It
contains no timestamps so regeneration is stable. `freshness.ts --check` fails when a recorded hash
does not match the current inputs.

## Error Handling

| Error Case | Handling Strategy | AR Ref |
| ---------- | ----------------- | ------ |
| Committed generated file edited by hand | Drift gate reports the file and a diff summary; exit 1 | RD-07 |
| Skill example imports a non-existent export | Example gate reports `api` failure + offending import; exit 1 | plan AR #5 |
| Marker line accidentally removed from a generated file | Drift gate still detects content mismatch; exit 1 | RD-07 |
| Secret pattern matches a lockfile hash | Pattern excludes lockfile integrity lines; other matches always fail | RD-07 |
| Sibling schema unavailable at verify time | `check-facts` is offline and never reads the sibling; re-pin uses `extract-facts` explicitly | plan AR #5 |

## Testing Requirements

- Specification tests for each gate's pass/fail behavior and the determinism guarantee (`ST-22`..`ST-34`).
- A test asserts no example side effect occurs during `check-examples`.
- A test asserts `generate --check` produces byte-identical output on a second run.
