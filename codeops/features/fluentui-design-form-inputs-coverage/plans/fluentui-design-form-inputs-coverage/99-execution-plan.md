# Execution Plan: Form Input Evidence and Control-Choice Rules

> **Document**: 99-execution-plan.md
> **Parent**: [Index](00-index.md)
> **Last Updated**: 2026-09-22 17:27
> **Progress**: 12/16 tasks (75%)
> **CodeOps Artifact Schema**: 1

## Overview

Resolve `SRC-039`, add five findings and six additive `forms` rules, update coverage and `PAT-004`,
regenerate, verify, release. Content only.

**🚨 Update this document after EACH completed task!**

> **⚠️ EXECUTION RULE:** mark `[~]` on implementation, promote to `[x]` only after the task's verify
> passes; update the Progress header and Last Updated after every task.

---

## Phase 1: Evidence

> **Phase baseline tree**: 9fc8ffe411730d217d2448c30a5cad6f70d6764c
> **Expected modification set**: `sources/sources.json`, `research/findings.md`, this plan document.
> **Scope mode**: strict

- [x] 1.1.1 Confirm the red state: `SRC-039` is `discovered` and `RULE-037` is absent ✅ (completed: 2026-09-22 17:24)
- [x] 1.1.2 Update `SRC-039` in `sources/sources.json` to `analyzed` with the usage-page locators ✅ (completed: 2026-09-22 17:24)
- [x] 1.1.3 Add `FND-019`..`FND-023` to `research/findings.md` ✅ (completed: 2026-09-22 17:24)
- [x] 1.1.4 Run `npm run validate:sources` and confirm it passes ✅ (completed: 2026-09-22 17:24)

**Deliverables**: SRC-039 analyzed; findings recorded; source validation passing

**Verify**: `npm run validate:sources`

---

## Phase 2: Rules and Coverage

> **Phase baseline tree**: 987f03f910db83c19ff5c93e244e4c8dbdf29569
> **Expected modification set**: `rules/rules.json`, `research/coverage.md`, this plan document.
> **Scope mode**: strict

- [x] 2.1.1 Add `RULE-037`..`RULE-042` to `rules/rules.json` ✅ (completed: 2026-09-22 17:25)
- [x] 2.1.2 Update the forms coverage topic and the form-page pattern row ✅ (completed: 2026-09-22 17:25)
- [x] 2.1.3 Run `npm run validate:all` and `npm run lint:rules` and confirm they pass ✅ (completed: 2026-09-22 17:25)

**Deliverables**: six additive `forms` rules; coverage consistent

**Verify**: `npm run validate:all && npm run lint:rules`

---

## Phase 3: Pattern

> **Phase baseline tree**: fbad74241fb53479e3f934cda41c68058b186ecd
> **Expected modification set**: `skill/references/patterns/PAT-004-form-page.md`, generated Markdown and the `.agents` mirror, this plan document.
> **Scope mode**: strict
> **Ordering note**: `npm run generate` runs here so `docs.spec` can compare the generated rule index against the catalog.

- [x] 3.1.1 Enrich `PAT-004-form-page.md` (frontmatter and Component mapping, Accessibility, Edge cases, Rules applied) ✅ (completed: 2026-09-22 17:27)
- [x] 3.1.2 Run `npm run generate` ✅ (completed: 2026-09-22 17:27)
- [x] 3.1.3 Run `npm run test` and confirm the pattern and documentation specs pass ✅ (completed: 2026-09-22 17:27)

**Deliverables**: pattern enriched; generated output current

**Verify**: `npm run test`

---

## Phase 4: Regenerate and Verify

> **Phase baseline tree**: fbad74241fb53479e3f934cda41c68058b186ecd
> **Expected modification set**: generated Markdown, the `.agents` mirror, `facts/freshness.json`, this plan document.
> **Scope mode**: strict

- [x] 4.1.1 Run `npm run freshness` ✅ (completed: 2026-09-22 17:27)
- [x] 4.1.2 Run `npm run generate:check` and `npm run freshness -- --check` and confirm both pass ✅ (completed: 2026-09-22 17:27)
- [x] 4.1.3 Run `npm run verify` and confirm it passes ✅ (completed: 2026-09-22 17:27)

**Deliverables**: freshness current; full verification passing

**Verify**: `npm run verify`

---

## Phase 5: Release

> **Phase baseline tree**: _(release; version files only)_
> **Scope mode**: strict

- [ ] 5.1.1 Ensure `main` is pushed and clean
- [ ] 5.1.2 Dispatch `release.yml` with `version_type=minor` and `dist_tag=latest`
- [ ] 5.1.3 Verify the published version and tag

**Deliverables**: a minor release published from `main`

**Verify**: `npm view fluentui-design dist-tags` and remote tag inspection

---

## Success Criteria

1. All phases completed
2. `npm run verify` passes
3. No spec expectation or count oracle edited
4. Sources, findings, rules, and coverage are mutually consistent
5. `PAT-004` reflects the new evidence
6. Generated output and freshness are current
7. A minor release is published from `main`
