# Evidence Pipeline: fluentui-design-skill

> **Document**: 03-01-evidence-pipeline.md
> **Parent**: [Index](00-index.md)
> **Implements**: RD-01, RD-02, RD-03

## Overview

This component owns the project's knowledge substrate: the canonical source catalog (RD-01), the
coverage matrix (RD-02), and the findings/conflicts analysis (RD-03). It defines the JSON data
models, their JSON Schemas, the TypeScript validators, and the strict Markdown table conventions the
consistency checks parse. It does not own the generator CLI, which lives in
[03-04](03-04-verification-tooling.md) and calls the render functions defined here.

## Architecture

### Current Architecture

Nothing exists. The brief's 38 seed entries and the 12 coverage topics are prose tables. The seed
catalog is vendored at `requirements/_draft/fluentui-v9-skill-project-brief.md`.

### Proposed Changes

Introduce a small, boring data layer: JSON is canonical, Markdown is derived or strictly formatted
for parsing, and one validator per catalog fails loudly on the first structural problem.

```
sources/sources.json ──┐
sources/sources.schema.json
                       ├─ validate-sources.ts ─┐
research/coverage.md ──┤                        ├─ check-references.ts (Phase 4)
research/findings.md ──┤  coverage/findings     │
research/conflicts.md ─┘  parsers              ┘
rules/rules.json ────── generate.ts → sources/sources.md, rules/rules.md
```

## Implementation Details

### Shared library modules

| Module | Responsibility |
| ------ | -------------- |
| `scripts/lib/json.ts` | `readJson<T>`, `sortById`, `stableStringify` (sorted keys, LF) |
| `scripts/lib/schema.ts` | Compile a JSON Schema with `ajv`/`ajv-formats`; format `ErrorObject[]` into messages |
| `scripts/lib/markdown.ts` | `GENERATED_MARKER`, `renderTable`, `normalizeLf`, `stripGeneratedMarker` |
| `scripts/lib/report.ts` | `collect(category, message)`, `failIfAny()`, exit codes |

### New Types/Interfaces

```ts
/** One reviewed evidence source in the canonical catalog (RD-01). */
export interface SourceEntry {
  id: string;                 // ^SRC-\d{3}$
  seedId: string | null;      // brief alias, e.g. "F04"
  title: string;
  publisher: string;
  requestedUrl: string;
  resolvedUrl: string;
  category: SourceCategory;
  platform: SourcePlatform;
  productScope: string;
  tags: string[];
  applicableVersion: string | null;
  publicationDate: string | null;
  retrievalDate: string;
  status: SourceStatus;
  accessLimitation: string | null;
  exclusionReason: string | null;
  locators: SourceLocator[];
  summary: string;
  evidenceRefs: string[];     // FND-### / CNF-###
  conflicts: string[];        // CNF-###
  linkedRuleIds: string[];    // RULE-###
  licenseNotes: string;
}
```

`SourceStatus` is a const union (`'discovered' | 'retrieved' | 'analyzed' | 'blocked' | 'obsolete' | 'excluded'`), matching the RD-01 lifecycle. `SourceCategory` and `SourcePlatform` are const unions mirroring the RD-01 schema tables. All arrays are sorted before write (plan AR #7).

```ts
/** A parsed coverage row (RD-02). */
export interface CoverageRow {
  topic: string;
  sources: string[];
  reviewedEvidence: string;
  extractedRules: string[];
  unresolvedQuestions: string[];
  examples: string[];
  status: 'Supported' | 'Gap';
  gapNote: string;
}
```

### New Functions/Methods

| Function | File | Behavior |
| -------- | ---- | -------- |
| `parseSources(raw): SourceEntry[]` | `scripts/lib/sources.ts` | JSON parse + cast via schema validation, never `as` casts |
| `validateSources(entries): string[]` | `scripts/validate-sources.ts` | Schema + integrity checks; returns human-readable errors |
| `renderSourcesMarkdown(entries): string` | `scripts/lib/sources.ts` | Sorted table; begins with `GENERATED_MARKER` |
| `parseCoverage(md): CoverageRow[]` | `scripts/lib/coverage.ts` | Parses the fixed coverage tables in `research/coverage.md` |
| `checkCoverage(rows, sources, rules): string[]` | `scripts/lib/coverage.ts` | Floors and consistency rules |
| `parseFindings(md): Finding[]`, `parseConflicts(md): Conflict[]` | `scripts/lib/analysis.ts` | Structural parse of the analysis docs |

### Validator behavior (`scripts/validate-sources.ts`)

1. Read `sources/sources.json`; validate against `sources/sources.schema.json`.
2. Assert unique `id`; every `seedId` from the brief appears exactly once and no unknown `seedId` exists.
3. Assert `blocked`/`excluded` entries carry a non-empty `accessLimitation`/`exclusionReason`.
4. Assert `linkedRuleIds` match `^RULE-\d{3}$` and `evidenceRefs` match `^(FND|CNF)-\d{3}$`.
5. Print each error as `sources.json: <id|index> — <message>` on stderr; exit 1 on any error.

`checkCoverage` floors (plan AR #11): every `Supported` row cites ≥1 source whose status is
`analyzed` and ≥1 rule; every `Gap` row has a non-empty `gapNote`; every rule appears in ≥1 row;
every cited `SRC-###` exists; the header counts equal the row counts.

### Constraints for the Markdown analysis docs

- `research/findings.md` uses one `### FND-### — <title>` heading per finding, followed by a
  `| Field | Value |` table with exactly the RD-03 fields. `kind` must be one of the seven values.
- `research/conflicts.md` uses one `### CNF-### — <title>` heading per conflict with the RD-03 fields;
  `resolution` is free text or the literal `unresolved`.
- Any heading mismatch or unknown enum is a validator error, so the docs cannot drift structurally.

## Code Examples

### Example: rendering a deterministic source table

```ts
/** Renders the readable source catalog. Deterministic: sorted by id, LF endings. */
export function renderSourcesMarkdown(entries: SourceEntry[]): string {
  const rows = [...entries].sort((a, b) => a.id.localeCompare(b.id));
  return GENERATED_MARKER + '\n\n' + renderTable(
    ['ID', 'Title', 'Publisher', 'Status', 'Category', 'Resolved URL'],
    rows.map((e) => [e.id, e.title, e.publisher, e.status, e.category, e.resolvedUrl]),
  );
}
```

## Error Handling

| Error Case | Handling Strategy | Ref |
| ---------- | ----------------- | --- |
| Schema violation | Report `ajv` error path + message; exit 1 | RD-01 |
| Duplicate `id` / `seedId` | Report both locations; exit 1 | RD-01 |
| Dangling `SRC-###` in coverage | Report the row and unknown id; exit 1 | RD-02 |
| Unknown finding `kind` | Report heading + expected enum; exit 1 | RD-03 |
| Retrieved content contains instructions | Treated as data; never executed or followed | RD-01 |

## Testing Requirements

- Specification tests for `validate-sources` accept/reject cases, coverage floors, and the findings/conflicts structure (`ST-1`..`ST-11`).
- Implementation tests for table parsing edge cases (missing column, extra pipe, CRLF input).
- No network access in any test.
