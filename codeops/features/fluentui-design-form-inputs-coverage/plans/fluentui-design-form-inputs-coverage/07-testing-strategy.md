# Testing Strategy: Form Input Evidence and Control-Choice Rules

> **Document**: 07-testing-strategy.md
> **Parent**: [Index](00-index.md)

## Overview

Content change; the oracle is the existing evidence pipeline. No new test file is required — adding
entries to the catalogs subjects them to the existing assertions.

## Specification Test Cases

| # | Input / Scenario | Expected | Enforced by |
|---|------------------|----------|-------------|
| ST-1 | `validate:sources` | exits 0; `SRC-039` is `analyzed` with resolving locators and a summary naming the SpinButton and date/time limitations | `validate-sources.ts`; `sources.spec.test.ts` |
| ST-2 | Parse `research/findings.md` | `FND-019`..`FND-023` exist with valid kinds and resolving `informsRules` | `analysis.spec.test.ts` |
| ST-3 | `validate:rules` | exits 0; `RULE-037`..`RULE-042` exist under `forms` with verified exports and known sources | `rules.spec.test.ts` |
| ST-4 | `lint:rules` | exits 0; instructions start with an allowlisted imperative verb | `lint-rules.ts` |
| ST-5 | Coverage cross-check | the forms topic and form-page pattern rows cite `SRC-039` and the new rules; every new rule is mapped; summary stays 12/8/0/0 | `coverage.spec.test.ts`; `validate-sources.ts` |
| ST-6 | Parse `PAT-004-form-page.md` | frontmatter lists `RULE-037`..`RULE-042`; sections mention control choice, immediacy, option text, and numeric bounds | `patterns.spec.test.ts`; `frontmatter.impl.test.ts` |
| ST-7 | `npm run generate:check` | exits 0 | `generate.ts --check` |
| ST-8 | `npm run freshness -- --check` | exits 0 | `freshness.ts` |
| ST-9 | `npm run verify` | exits 0 | full gate |
| ST-10 | Release on `main` | a minor release is published and tagged | `release.yml` |

## Test Categories

| Gate | ST Cases |
| ---- | -------- |
| `validate:sources` | ST-1, ST-2, ST-5 |
| `validate:rules` + `lint:rules` | ST-3, ST-4 |
| `generate:check` + `freshness --check` | ST-7, ST-8 |
| `docs.spec.test.ts` / `patterns.spec.test.ts` | ST-6 |
| `npm run verify` | ST-9 |

Implementation and end-to-end tests are unchanged; the fixture record editor already exercises the
controls.

## Verification Checklist

- [ ] Every ST case maps to an existing gate
- [ ] Red phase: `SRC-039` is `discovered` and `RULE-037` is absent before editing
- [ ] Green phase: `npm run verify` exits 0 after editing
- [ ] No existing spec expectation or count oracle edited
- [ ] `npm run generate` and `npm run freshness` outputs committed
