# RD-07: Verification Tooling

> **Document**: RD-07-verification-tooling.md
> **Status**: Draft
> **Created**: 2026-09-20
> **Project**: fluentui-design
> **Depends On**: RD-01, RD-04, RD-06
> **CodeOps Artifact Schema**: 1

---

## Feature Overview

This requirement defines the scripts that turn the catalogs and skill into trustworthy artifacts.
It covers deterministic generation, catalog validators, a reference/link integrity gate, an example
compilation gate, a secret scan, and a drift gate that fails when committed generated files differ
from a fresh regeneration. These are the project's mechanical oracles: they make trust reproducible
rather than asserted.

All tooling is TypeScript or JavaScript and runs locally with no network dependency.

**Complexity**: L

---

## Functional Requirements

### Must Have
- [ ] A deterministic generator emits `sources/sources.md`, `rules/rules.md`, and the skill reference index and any generated links from the JSON catalogs.
- [ ] Catalog validators exist for sources (RD-01) and rules (RD-04) and are runnable together.
- [ ] A reference-integrity gate asserts that every `SRC-###`, `RULE-###`, `PAT-###`, `FND-###`, and `CNF-###` reference resolves, and that every internal Markdown link target exists.
- [ ] An example gate extracts TypeScript/JavaScript code blocks from the skill and checks that every import and named export resolves against the pinned `@fluentui/react-components` package; it type-checks the fixture's examples.
- [ ] A secret scan rejects committed content containing credential patterns (API keys, tokens, private keys).
- [ ] A drift gate regenerates derived files and fails if the committed tree differs.
- [ ] A freshness manifest records the pinned facts commit and the hashes of generation inputs.
- [ ] A single `verify` command runs typecheck, lint, tests, generation, the drift gate, the reference gate, the example gate, and the secret scan.
- [ ] Generation is byte-reproducible: sorted inputs, LF endings, and no timestamps inside generated content.

### Should Have
- [ ] The generator can run in a check mode that changes nothing and reports differences.
- [ ] The example gate reports which import, export, or prop a failing example used.

### Won't Have (Out of Scope)
- Requiring a model provider to verify (AR #6, #20).
- New CI infrastructure; the verify command is local and CI-able but no pipeline is added.
- A second build system for the tooling beyond the project's TypeScript setup.

---

## Technical Requirements

### Scripts

| Script | Purpose |
|--------|---------|
| `scripts/generate.ts` | Render derived Markdown from JSON catalogs; `--check` mode diffs without writing. |
| `scripts/validate-sources.ts` | Source schema + integrity (RD-01). |
| `scripts/validate-rules.ts` | Rule schema + integrity (RD-04). |
| `scripts/check-references.ts` | Resolve all cross-IDs and Markdown link targets. |
| `scripts/check-examples.ts` | Resolve imports/exports/props against the pinned package; type-check examples. |
| `scripts/scan-secrets.ts` | Reject credential patterns. |
| `scripts/check-drift.ts` | Regenerate and compare with the committed tree. |
| `scripts/freshness.ts` | Write/verify the manifest (pinned commit + input hashes). |

### Determinism rules

- Sort arrays and entries by ID before rendering.
- Normalize line endings to LF.
- Never write timestamps into generated content; provenance lives in the manifest.
- Remove stale generated files by a marker line before writing.

### Example gate mechanics

Extract fenced ```tsx/```ts/```js blocks, compile them in-memory against the pinned package types,
and classify failures as `api` (missing package/symbol/member) or `general` (type mismatch). `api`
failures block; `general` failures are reported and repaired.

---

## Integration Points

### With RD-01/RD-04 (Catalogs)
- Validators are the catalogs' integrity gates; the generator renders their Markdown views.

### With RD-06 (Skill Package)
- The generated index and links live in the skill; the drift gate guards them.

### With RD-08/RD-09 (Fixture and Evaluation)
- The example gate reuses the fixture's dependency lock to compile examples; evaluation depends on a green verify.

---

## Scope Decisions

| Decision | Options Considered | Chosen | Rationale | AR Ref |
|----------|-------------------|--------|-----------|--------|
| Generation model | generated / hand-authored / hybrid | hybrid with drift gate | Keeps catalogs canonical and output honest | AR #3 |
| Determinism | best-effort / byte-reproducible | byte-reproducible | Enables a reliable drift gate | AR #21 |
| Provider dependency | require provider / none | none for verification | Verification must be offline and deterministic | AR #20 |
| Tooling language | mixed / TS + JS | TypeScript/JavaScript only | Brief mandates it | AR #1 |

---

## Security Considerations

- **Data sensitivity**: The secret scan prevents credentials from entering committed content.
- **Input validation**: Validators treat catalogs as untrusted input and reject malformed entries.
- **Authentication & authorization**: N/A.
- **Injection risks**: The example gate must not execute example code; it compiles/type-checks only, so no arbitrary code runs during verification.
- **Encryption needs**: N/A.
- **Rate limiting**: N/A.
- **Infrastructure**: No network access during verification; no deployment.

---

## Acceptance Criteria

1. [ ] Running `verify` on a clean tree exits 0; introducing a bad import into a skill example makes the example gate exit non-zero and name the offending import.
2. [ ] Editing a generated file without regenerating makes the drift gate exit non-zero; regenerating restores a clean exit.
3. [ ] Regenerating twice from the same catalogs produces byte-identical output.
4. [ ] Inserting a fake API key into a tracked file makes the secret scan fail.
5. [ ] A dangling `RULE-###` or a broken internal Markdown link makes the reference gate fail.
6. [ ] The example gate does not execute example code (verified by observing that a side-effecting example does not perform its side effect during verification).
7. [ ] Security requirements verified (secret scan active; no arbitrary code execution; no network in verify).
