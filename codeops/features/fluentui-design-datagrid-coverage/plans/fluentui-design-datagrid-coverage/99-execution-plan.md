# Execution Plan: DataGrid Evidence and Grid Rules

> **Document**: 99-execution-plan.md
> **Parent**: [Index](00-index.md)
> **Last Updated**: 2026-09-22 00:06
> **Progress**: 15/18 tasks (83%)
> **CodeOps Artifact Schema**: 1

## Overview

Add one analyzed source, five findings, six additive rules, a metadata refresh of the existing grid
rules, coverage rows, and an enriched `PAT-002`; then regenerate, verify, and release. Content only:
no code, dependency, pattern-count, or decision-index change.

**🚨 Update this document after EACH completed task!**

> **⚠️ EXECUTION RULE:** mark `[~]` on implementation, promote to `[x]` only after the task's verify
> passes; update the Progress header and Last Updated after every task; timestamps come from
> `date '+%Y-%m-%d %H:%M'`.

---

## Phase 1: Evidence

> **Phase baseline tree**: 0b3d01a0d05cd41014d959de7b0b08ce9e528415
> **Expected modification set**: `sources/sources.json`, `research/findings.md`, this plan document.
> **Scope mode**: strict

- [x] 1.1.1 Confirm the red state: `SRC-046`, `FND-013`, and `RULE-031` are absent and `RULE-010.unresolved` is non-empty ✅ (completed: 2026-09-22 00:01)
- [x] 1.1.2 Add `SRC-046` to `sources/sources.json` ✅ (completed: 2026-09-22 00:01)
- [x] 1.1.3 Add `FND-013`..`FND-017` to `research/findings.md` ✅ (completed: 2026-09-22 00:01)
- [x] 1.1.4 Run `npm run validate:sources` and confirm it passes ✅ (completed: 2026-09-22 00:01)

**Deliverables**:
- SRC-046 recorded as analyzed
- Findings FND-013..FND-017 recorded
- Source validation passing

**Verify**: `npm run validate:sources`

---

## Phase 2: Rules and Coverage

> **Phase baseline tree**: d4018889f30a97a582731af217719739188f546b
> **Expected modification set**: `rules/rules.json`, `research/coverage.md`, this plan document.
> **Scope mode**: strict

- [x] 2.1.1 Add `RULE-031`..`RULE-036` to `rules/rules.json` ✅ (completed: 2026-09-22 00:03)
- [x] 2.1.2 Refresh `RULE-010`..`RULE-012` metadata only (`unresolved`, `confidence`, `evidenceSourceIds`, `locators`, `derivedFromFindings`), leaving instruction and rationale text untouched ✅ (completed: 2026-09-22 00:03)
- [x] 2.1.3 Update the grid coverage topic and the DataGrid/Table pattern row ✅ (completed: 2026-09-22 00:03)
- [x] 2.1.4 Run `npm run validate:all` and `npm run lint:rules` and confirm they pass ✅ (completed: 2026-09-22 00:03)

**Deliverables**:
- Six additive rules under `data-grid`
- Existing grid rules refreshed without supersede
- Coverage consistent with 12 topics / 8 patterns

**Verify**: `npm run validate:all && npm run lint:rules`

---

## Phase 3: Pattern and Documentation

> **Phase baseline tree**: a3bb8cd0967c44df66b7101d5e1478f21916a3ed
> **Expected modification set**: `skill/references/patterns/PAT-002-list-page.md`, `README.md`,
> `COMPLETION-REPORT.md`, generated Markdown and the `.agents` mirror, this plan document.
> **Scope mode**: strict
> **Ordering correction**: `npm run generate` ran during this phase so `docs.spec` could compare the generated rule index against the catalog; Phase 4 re-ran it (idempotent).

- [x] 3.1.1 Enrich `PAT-002-list-page.md` (frontmatter `rules`/`components` and the Responsive behavior, Accessibility, Edge cases, and Rules applied sections) ✅ (completed: 2026-09-22 00:06)
- [x] 3.1.2 Retire the DataGrid limitation in `README.md` and resolve gap #3 in `COMPLETION-REPORT.md` ✅ (completed: 2026-09-22 00:06)
- [x] 3.1.3 Run `npm run test` and confirm the pattern and documentation specs pass ✅ (completed: 2026-09-22 00:06)

**Deliverables**:
- Pattern enriched and gate-valid
- Documentation no longer claims the page is unanalyzed

**Verify**: `npm run test`

---

## Phase 4: Regenerate and Verify

> **Phase baseline tree**: a3bb8cd0967c44df66b7101d5e1478f21916a3ed
> **Expected modification set**: generated Markdown, the `.agents` mirror, `facts/freshness.json`, this plan document.
> **Scope mode**: strict

- [x] 4.1.1 Run `npm run generate` ✅ (completed: 2026-09-22 00:06)
- [x] 4.1.2 Run `npm run freshness` ✅ (completed: 2026-09-22 00:06)
- [x] 4.1.3 Run `npm run generate:check` and `npm run freshness -- --check` and confirm both pass ✅ (completed: 2026-09-22 00:06)
- [x] 4.1.4 Run `npm run verify` and confirm it passes ✅ (completed: 2026-09-22 00:06)

**Deliverables**:
- Generated files and mirror current
- Freshness hashes regenerated
- Full verification passing

**Verify**: `npm run verify`

---

## Phase 5: Release

> **Phase baseline tree**: _(recorded by the exec-plan skill)_
> **Expected modification set**: version files and changelog produced by the release workflow.
> **Scope mode**: strict

- [ ] 5.1.1 Ensure `main` is pushed and clean
- [ ] 5.1.2 Dispatch `release.yml` with `version_type=minor` and `dist_tag=latest`
- [ ] 5.1.3 Verify the published version and tag (`npm view fluentui-design dist-tags`, `git ls-remote --tags origin`)

**Deliverables**:
- A minor release published from `main`

**Verify**: `npm view fluentui-design dist-tags` and remote tag inspection

---

## Review Evidence

Single review of the feature diff (content change; base lenses + factual grounding against the
`sibling` API skill). No 🔴/🟠 findings.

| Batch | Findings | Ruling | Outcome |
| ----- | -------- | ------ | ------- |
| Review | RV-5301 `FND-016` mislabeled as an implementation fact though it is an extension recommendation | Fix | Reclassified to `derived-recommendation` |
| Review | RV-5302 `RULE-035` bundled a `must` with a derived "measure first" recommendation | Fix | Instruction is now only the memoize/stable-key `must`; the measure-first advice moved to the rationale |
| Review | RV-5303 `RULE-036` derived from `FND-014`, which does not cover selection naming | Fix | Added `FND-018` and pointed `RULE-036` at it |
| Review | RV-5304 the PAT-002 pattern row omitted `RULE-033` | Fix | Added `RULE-033` and named header nesting in the topic evidence |
| Review | RV-5305 `RULE-036` cited WCAG without a criterion locator | Fix | Added `SC 4.1.2 Name, Role, Value` |

---

## Success Criteria

1. All phases completed
2. `npm run verify` passes
3. No spec expectation or count oracle edited
4. Sources, findings, rules, and coverage are mutually consistent
5. `PAT-002`, README, and COMPLETION-REPORT reflect the new evidence
6. Generated output and freshness are current
7. A minor release is published from `main`
