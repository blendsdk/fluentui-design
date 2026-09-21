# Testing Strategy: DataGrid Evidence and Grid Rules

> **Document**: 07-testing-strategy.md
> **Parent**: [Index](00-index.md)

## Overview

This is a content change, so the oracle is the existing evidence pipeline: the source, finding,
rule, coverage, pattern, and documentation gates already validate every catalog entry generically.
No new test file is required. Adding entries to the catalogs automatically subjects them to the same
assertions, which is exactly the specification-first behaviour we want.

### Coverage Goals

| Code type | Target |
| --------- | ------ |
| Catalog data (sources, findings, rules, coverage) | Fully gate-validated |
| Pattern document | Fully gate-validated |
| Documentation claims | Manually checked and grep-asserted |

End-to-end browser tests are unchanged; the fixture's DataGrid list page already runs keyboard and
axe checks.

## Specification Test Cases (MANDATORY)

> Derived from RD-01. Expectations are fixed before editing; a failing gate means the content is
> wrong, not the gate.

| # | Input / Scenario | Expected | Enforced by |
|---|------------------|----------|-------------|
| ST-1 | `validate:sources` with the updated `sources.json` | exits 0; `SRC-046` exists with `status: analyzed`, valid locators, and a summary | `scripts/validate-sources.ts`; `sources.spec.test.ts` |
| ST-2 | Parse `research/findings.md` | `FND-013`..`FND-017` exist with valid kinds, ≥1 source, and `informsRules` that resolve to known rules | `analysis.spec.test.ts`; `validate:sources.ts` findings check |
| ST-3 | `validate:rules` with the updated `rules.json` | exits 0; `RULE-031`..`RULE-036` exist under `decisionArea: data-grid` with known `evidenceSourceIds` and exports that are in the verified allowlist | `rules.spec.test.ts`; `validate-rules.ts` |
| ST-4 | `lint:rules` | exits 0; every new instruction is actionable | `lint-rules.ts` |
| ST-5 | `RULE-010` metadata | `unresolved` is empty; `evidenceSourceIds` includes `SRC-046`; `instruction` text is byte-identical to before | `rules.spec.test.ts` + diff review |
| ST-6 | Coverage cross-check | the grid topic and DataGrid/Table pattern rows cite `SRC-046` and the new rules; every new rule is mapped by ≥1 row; summary stays 12/8/0/0 | `validate-sources.ts` coverage check; `coverage.spec.test.ts` |
| ST-7 | Parse `PAT-002-list-page.md` | frontmatter `rules` lists `RULE-031`..`RULE-036`; the Accessibility, Responsive behavior, and Edge cases sections mention sorting, focus mode, resizing, selection labels, and virtualization | `patterns.spec.test.ts`; `frontmatter.impl.test.ts` |
| ST-8 | Grep `README.md` and `COMPLETION-REPORT.md` | neither contains the "DataGrid usage page was not analyzed" claim | `docs.spec.test.ts` |
| ST-9 | `npm run generate:check` | exits 0 (generated Markdown and mirror are current) | `generate.ts --check` |
| ST-10 | `npm run freshness -- --check` | exits 0 (input hashes regenerated) | `freshness.ts` |
| ST-11 | `npm run verify` | exits 0 | full gate |
| ST-12 | Release dispatch on `main` | a minor release is published and tagged | `release.yml` |

## Test Categories

### Specification Tests

| Gate | ST Cases | Notes |
| ---- | -------- | ----- |
| `validate:sources` | ST-1, ST-2, ST-6 | source, findings, conflicts, coverage |
| `validate:rules` + `lint:rules` | ST-3, ST-4 | rule validity and actionability |
| `generate:check` | ST-9 | derived output and mirror |
| `freshness --check` | ST-10 | input hash integrity |
| `docs.spec.test.ts` | ST-7, ST-8 | pattern and documentation claims |
| `npm run verify` | ST-11 | the full pipeline |

### Implementation Tests

N/A — no code changes.

### Integration / End-to-End Tests

The fixture DataGrid keyboard and axe tests are unchanged and continue to cover the surface the
rules describe.

## Test Data

None. All fixtures are the committed catalog files.

## Verification Checklist

- [ ] Every ST case maps to an existing gate
- [ ] Red phase: the new catalog entries are absent, so ST-1/ST-3/ST-6 fail before editing
- [ ] Green phase: `npm run verify` exits 0 after editing
- [ ] No existing spec expectation was edited (no count oracle changes)
- [ ] `npm run generate` and `npm run freshness` outputs committed
