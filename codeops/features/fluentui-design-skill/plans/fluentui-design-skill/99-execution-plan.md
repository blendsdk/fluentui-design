# Execution Plan: fluentui-design-skill

> **Document**: 99-execution-plan.md
> **Parent**: [Index](00-index.md)
> **Last Updated**: 2026-09-20 01:23
> **Progress**: 5/72 tasks (7%)
> **CodeOps Artifact Schema**: 1

## Overview

Build the `fluentui-design` skill in dependency order: foundation, evidence pipeline, rules and
patterns, skill package, verification tooling, fixture app, evaluation, and close-out. Tooling code
is verified by Vitest; catalog structure is verified by the validators; fixtures are verified by
Playwright + axe. Every phase follows specification-first ordering (`spec tests → red → implement →
green → impl tests → verify`).

**🚨 Update this document after EACH completed task!**

---

## Implementation Phases

| Phase | Title | Tasks |
| ----- | ----- | ----- |
| 0 | Foundation & Toolchain | 5 |
| 1 | Evidence Pipeline (RD-01..RD-03) | 12 |
| 2 | Rules & Patterns (RD-04, RD-05) | 10 |
| 3 | Skill Package & Package Gates (RD-06) | 9 |
| 4 | Verification Tooling (RD-07) | 8 |
| 5 | Fixture App (RD-08) | 11 |
| 6 | Evaluation (RD-09) | 9 |
| 7 | Maintenance, Docs & Close-out (RD-10) | 8 |

**Total: 72 tasks across 8 phases** (no fabricated hour estimates — scope is bounded by the
task-size criteria in the plan quality checklist)

> **⚠️ EXECUTION RULE — APPLIES TO EVERY AGENT EXECUTING THIS PLAN:**
>
> 1. **On implementation:** mark the task `[~]` with a timestamp —
>    `- [~] 1.1.1 Task description ⏳ (implemented: YYYY-MM-DD HH:MM)`
> 2. **On verify pass:** promote it to `[x]` —
>    `- [x] 1.1.1 Task description ✅ (completed: YYYY-MM-DD HH:MM)`
> 3. **Update the Progress header** and Last Updated after EVERY task — never batch.
> 4. **Resume** at the first `[~]`, else the first `[ ]`, scanning top-to-bottom.
> 5. **On blocker:** mark `[!]` and append `Blocked: <short reason>` on the same line.
>
> Timestamps come from `date '+%Y-%m-%d %H:%M'` — never invented.

---

## Phase 0: Foundation & Toolchain

> **Lenses**: `web-application`, `data-and-migration` (informational)
> **Phase baseline tree**: 90d8d576bbef92c068f70109e62684c4651699cf · scope: strict
> **Expected modification set**: `package.json`, `package-lock.json`, `tsconfig.json`, `eslint.config.js`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `scripts/lib/*.ts`, `scripts/__tests__/toolchain.spec.test.ts`, `AGENTS.md`
>
> **Runtime corrections (mechanical)**: `@fluentui/react-icons` currently ships 2.x, not 9.x — corrected in `02-current-state.md`. TypeScript is pinned to `5.9.3` because `typescript-eslint` 8.x requires `>=4.8.4 <6.1.0` (latest TS is 7.x). React is pinned to `18.3.1` because `@fluentui/react-components` 9.74.7 requires React `<20`. Deliverable summary bullets were converted from checkboxes to plain bullets so the plan progress tool counts only the 72 tracked tasks.

### Step 0.1: Repository foundation

**Reference**: [03-04](03-04-verification-tooling.md) §Scripts · plan AR #2, #3, #4, #6
**Objective**: One root toolchain that typechecks, lints, tests, and hosts the catalog scripts.

- [x] 0.1.1 Create `package.json` (private ESM) with pinned devDependencies and scripts (`typecheck`, `lint`, `test`, `extract-facts`, `validate:sources`, `validate:rules`, `validate:all`, `lint:rules`, `check:facts`, `generate`, `generate:check`, `check:refs`, `check:examples`, `scan:secrets`, `freshness`, `verify:static`, `test:e2e`, `verify`); run install to produce `package-lock.json` ✅ (completed: 2026-09-20 01:20)
- [x] 0.1.2 Add `tsconfig.json` (strict, NodeNext), `eslint.config.js` (typescript-eslint flat config), `vitest.config.ts`, `playwright.config.ts` (Chromium), and `.gitignore` entries (`node_modules/`, `dist/`, `playwright-report/`, `test-results/`) ✅ (completed: 2026-09-20 01:20)
- [x] 0.1.3 Create `scripts/lib/json.ts`, `scripts/lib/schema.ts`, `scripts/lib/markdown.ts`, `scripts/lib/report.ts` with documented exports ✅ (completed: 2026-09-20 01:22)
- [x] 0.1.4 [spec-author] Write a smoke spec test for the gate runner/report helper: an injected failing check makes the runner return non-zero and a passing check returns zero; it MUST never spawn `npm` or `verify:static` (recursion risk) — `scripts/__tests__/toolchain.spec.test.ts` (plan AR #6) ✅ (completed: 2026-09-20 01:22)
- [x] 0.1.5 Update `AGENTS.md`: name `npm run verify`, record the pin (`d595d79`, package 9.74.7), and list generated directories ✅ (completed: 2026-09-20 01:23)

**Deliverables**:
- Root toolchain installs and `npm run typecheck` exits 0
- `npm run lint` and `npm run test` run (the only Phase 0 test is the report-helper smoke test)
- All verification passing

**Verify**: `npm run typecheck && npm run lint && npm run test`

> **Post-phase review (correctness)**: no findings — `RV-000`; interop, runner contract, config coherence, and standards checks all passed. Verify passed (typecheck, lint, 5 tests).

---

## Phase 1: Evidence Pipeline (RD-01..RD-03)

> **Lenses**: `web-application`, `data-and-migration` (informational)

### Step 1.1: Specification Tests

**Reference**: [03-01](03-01-evidence-pipeline.md) · [07](07-testing-strategy.md) ST-1..ST-11 · plan AR #5, #7, #11
**Objective**: Encode expected validator behavior from the spec before writing validators.

- [ ] 1.1.1 [spec-author] Write source-catalog spec tests — `scripts/__tests__/sources.spec.test.ts` (ST-1..ST-5)
- [ ] 1.1.2 [spec-author] Write coverage spec tests — `scripts/__tests__/coverage.spec.test.ts` (ST-6..ST-8)
- [ ] 1.1.3 [spec-author] Write findings/conflicts spec tests — `scripts/__tests__/analysis.spec.test.ts` (ST-9..ST-11)
- [ ] 1.1.4 Run the spec tests — verify they FAIL (red phase); record which fail

**Deliverables**:
- Spec tests exist and fail for the right reason (module/behavior absent)

**Verify**: `npm run test -- scripts/__tests__/*.spec.test.ts` (expected RED)

### Step 1.2: Implementation

**Reference**: [03-01](03-01-evidence-pipeline.md) §Implementation Details · plan AR #5, #7
**Objective**: Implement the catalogs, validators, and analysis documents.

- [ ] 1.2.1 Add `sources/sources.schema.json` and `scripts/lib/sources.ts` (`parseSources`, `renderSourcesMarkdown`)
- [ ] 1.2.2 Add `scripts/validate-sources.ts` (schema + integrity checks)
- [ ] 1.2.3 Add `scripts/lib/coverage.ts` (`parseCoverage`, `checkCoverage`) and `scripts/lib/analysis.ts` (`parseFindings`, `parseConflicts`)
- [ ] 1.2.4 Author `sources/sources.json`: all 38 seed entries from the brief plus the catalog-expansion targets, each `analyzed`/`blocked` as its retrieval dictates
- [ ] 1.2.5 Author `research/coverage.md` (12 topics + 8 patterns) and `research/findings.md` + `research/conflicts.md` with the 8-item risky-simplification register
- [ ] 1.2.6 Run the spec tests — verify they PASS (green phase); if any fails, fix the implementation, not the test

**Deliverables**:
- `validate-sources` exits 0 on the committed catalog and non-zero on ST-2..ST-5 inputs
- Coverage and analysis documents parse and satisfy their checks
- All verification passing

**Verify**: `npm run validate:sources && npm run test -- scripts/__tests__/*.spec.test.ts`

### Step 1.3: Implementation Tests & Hardening

**Reference**: [07](07-testing-strategy.md) §Implementation Tests
**Objective**: Cover parser edge cases and finish the phase green.

- [ ] 1.3.1 Write parser implementation tests — `scripts/__tests__/markdown.impl.test.ts` (missing column, extra pipe, CRLF, BOM)
- [ ] 1.3.2 Full verification

**Deliverables**:
- All verification passing

**Verify**: `npm run verify:static`

---

## Phase 2: Rules & Patterns (RD-04, RD-05)

> **Lenses**: `web-application`, `data-and-migration` (informational)

### Step 2.1: Specification Tests

**Reference**: [03-02](03-02-rules-and-patterns.md) · [07](07-testing-strategy.md) ST-12..ST-20 · plan AR #5, #11
**Objective**: Encode rule-validator and pattern-structure expectations first.

- [ ] 2.1.1 [spec-author] Write rule spec tests — `scripts/__tests__/rules.spec.test.ts` (ST-12..ST-16)
- [ ] 2.1.2 [spec-author] Write pattern spec tests — `scripts/__tests__/patterns.spec.test.ts` (ST-17..ST-20)
- [ ] 2.1.3 Run the spec tests — verify they FAIL (red phase)

**Deliverables**:
- Spec tests exist and fail for the right reason

**Verify**: `npm run test -- scripts/__tests__/rules.spec.test.ts scripts/__tests__/patterns.spec.test.ts` (expected RED)

### Step 2.2: Implementation

**Reference**: [03-02](03-02-rules-and-patterns.md) §Implementation Details · plan AR #5, #11
**Objective**: Build the allowlist, rule validators, and the rule/pattern content.

- [ ] 2.2.1 Add `scripts/extract-facts.ts` and generate `facts/verified-exports.json` from the sibling schema at `d595d79`
- [ ] 2.2.2 Add `rules/rules.schema.json`, `scripts/lib/rules.ts`, `scripts/validate-rules.ts`, `scripts/lint-rules.ts`, `scripts/check-facts.ts`
- [ ] 2.2.3 Author `rules/rules.json` across the coverage topics with verified or application-owned mappings
- [ ] 2.2.4 Author the eight pattern documents `skill/references/patterns/PAT-001..008-*.md` with frontmatter
- [ ] 2.2.5 Run the spec tests — verify they PASS (green phase)

**Deliverables**:
- `validate-rules` and `check-facts` exit 0; the lint passes the real catalog
- Eight patterns exist with all sections
- All verification passing

**Verify**: `npm run validate:all && npm run lint:rules && npm run test -- scripts/__tests__/*.spec.test.ts`

### Step 2.3: Implementation Tests & Hardening

- [ ] 2.3.1 Write frontmatter implementation tests — `scripts/__tests__/frontmatter.impl.test.ts`
- [ ] 2.3.2 Full verification

**Deliverables**:
- All verification passing

**Verify**: `npm run verify:static`

---

## Phase 3: Skill Package & Package Gates (RD-06)

> **Lenses**: `web-application`, `data-and-migration` (informational)

### Step 3.1: Specification Tests

**Reference**: [03-03](03-03-skill-package.md) · [03-04](03-04-verification-tooling.md) · [07](07-testing-strategy.md) ST-21..ST-29
**Objective**: Encode package-structure, generation, reference-gate, and drift expectations before implementation. The generator and the reference/drift gates ship with the skill they protect, so this phase can reach green on its own.

- [ ] 3.1.1 [spec-author] Write skill-package, generation, and reference/drift spec tests — `scripts/__tests__/skill-package.spec.test.ts` (ST-21..ST-29)
- [ ] 3.1.2 Run the spec tests — verify they FAIL (red phase)

**Deliverables**:
- Spec tests exist and fail for the right reason

**Verify**: `npm run test -- scripts/__tests__/skill-package.spec.test.ts` (expected RED)

### Step 3.2: Implementation

**Reference**: [03-03](03-03-skill-package.md) §Implementation Details · [03-04](03-04-verification-tooling.md) §Generation algorithm · plan AR #7
**Objective**: Author the entry point and references, and build the full generator, reference gate, and drift gate with them.

- [ ] 3.2.1 Author `skill/SKILL.md` (frontmatter + nine sections + compatibility/re-verify note + sibling-skill co-install contract and absence fallback)
- [ ] 3.2.2 Author `skill/references/foundation/*.md`, `skill/references/checklists/*.md`, `skill/references/maintenance/refresh-and-repin.md`
- [ ] 3.2.3 Implement `scripts/lib/skill.ts` renderers and the full `scripts/generate.ts` (render `sources.md`, `rules.md`, `references/index.md`, `references/rules/index.md`; stale-marker removal from the generated-file allowlist; `.agents/skills/fluentui-design/` mirror; `--check`) — single implementation, no later rewrite
- [ ] 3.2.4 Implement `scripts/check-references.ts` (all id kinds + internal links; `<skill>:…` cross-skill links validated by known skill-name prefix only)
- [ ] 3.2.5 Run the spec tests — verify they PASS (green phase)

**Deliverables**:
- `SKILL.md` frontmatter valid; all nine sections present; ≤320 lines
- Routing index resolves; mirror is byte-identical to `skill/`; `generate:check` detects drift and stale markers
- All verification passing

**Verify**: `npm run generate && npm run generate:check && npm run check:refs && npm run test -- scripts/__tests__/*.spec.test.ts`

### Step 3.3: Implementation Tests & Hardening

- [ ] 3.3.1 Add a test asserting no `skill/**` file fetches remote code and the entry-point line budget — `scripts/__tests__/skill-package.impl.test.ts`
- [ ] 3.3.2 Full verification (scoped: the static gates that exist after Phase 3)

**Deliverables**:
- All verification passing

**Verify**: `npm run typecheck && npm run lint && npm run test && npm run generate:check && npm run check:refs`

---

## Phase 4: Verification Tooling (RD-07)

> **Lenses**: `web-application`, `data-and-migration` (informational)

### Step 4.1: Specification Tests

**Reference**: [03-04](03-04-verification-tooling.md) · [07](07-testing-strategy.md) ST-30..ST-34 · plan AR #5, #6, #7
**Objective**: Encode the example, secret, and freshness gates first. (Generation, reference, and drift gates shipped in Phase 3.)

- [ ] 4.1.1 [spec-author] Write tooling spec tests — `scripts/__tests__/tooling.spec.test.ts` (ST-30..ST-34)
- [ ] 4.1.2 Run the spec tests — verify they FAIL (red phase)

**Deliverables**:
- Spec tests exist and fail for the right reason

**Verify**: `npm run test -- scripts/__tests__/tooling.spec.test.ts` (expected RED)

### Step 4.2: Implementation

**Reference**: [03-04](03-04-verification-tooling.md) §Scripts · plan AR #6, #7
**Objective**: Build the remaining gates and make `verify:static` authoritative.

- [ ] 4.2.1 Implement `scripts/check-examples.ts` (extract, in-memory compile, classify, never execute) over `skill/**` and rule examples; the fixture typecheck is wired in Phase 5
- [ ] 4.2.2 Implement `scripts/scan-secrets.ts`
- [ ] 4.2.3 Implement `scripts/freshness.ts` and write `facts/freshness.json`; wire the full static chain into `verify:static` and `verify`
- [ ] 4.2.4 Run the spec tests — verify they PASS (green phase)

**Deliverables**:
- Example gate names a bad import and never executes code; secret scan flags a fake key and ignores lock hashes
- `npm run verify:static` is authoritative and exits 0

**Verify**: `npm run verify:static`

### Step 4.3: Implementation Tests & Hardening

- [ ] 4.3.1 Write example-classification and secret near-miss tests — `scripts/__tests__/examples.impl.test.ts`, `scripts/__tests__/secrets.impl.test.ts`
- [ ] 4.3.2 Full verification (`verify:static` is authoritative from here; full `verify` runs once the fixture exists in Phase 5)

**Deliverables**:
- All verification passing

**Verify**: `npm run verify:static`

---

## Phase 5: Fixture App (RD-08)

> **Lenses**: `web-application`, `data-and-migration` (informational)

### Step 5.1: Specification Tests

**Reference**: [03-05](03-05-fixture-app.md) · [07](07-testing-strategy.md) ST-35..ST-44
**Objective**: Write the Playwright + axe specs before the app exists.

- [ ] 5.1.1 [spec-author] Write list/filter/selection/action specs — `fixture/e2e/list.spec.ts` (ST-35..ST-37)
- [ ] 5.1.2 [spec-author] Write editor specs incl. errors, pending, dirty — `fixture/e2e/editor.spec.ts` (ST-38..ST-41)
- [ ] 5.1.3 [spec-author] Write overlay focus and a11y specs — `fixture/e2e/overlay-focus.spec.ts`, `fixture/e2e/a11y.spec.ts` (ST-42..ST-44)
- [ ] 5.1.4 Run the E2E specs — verify they FAIL (red phase)

**Deliverables**:
- E2E specs exist and fail because the app/pages are absent

**Verify**: `npm run test:e2e` (expected RED; install Chromium once if needed)

### Step 5.2: Implementation

**Reference**: [03-05](03-05-fixture-app.md) §Implementation Details · AR #9
**Objective**: Build the app and make the flows green.

- [ ] 5.2.1 Add `fixture/index.html`, `fixture/src/main.tsx`, `fixture/src/App.tsx`, `fixture/src/theme.ts`, and query-param state/theme/dir handling
- [ ] 5.2.2 Add `fixture/src/data/customers.ts` and `fixture/src/state/useCustomers.ts` (async simulation, `canEdit`, duplicate-email path)
- [ ] 5.2.3 Add `AppShell`, `CustomersToolbar`, `CustomerGrid`, `states.tsx`
- [ ] 5.2.4 Add `CustomerEditor`, `CustomerDrawer`, `ConfirmDialog` with focus handling and unsaved-changes logic
- [ ] 5.2.5 Wire the fixture typecheck into `check-examples`; run the E2E specs — verify they PASS (green phase)

**Deliverables**:
- All states reachable; zero console errors in tested flows
- Focus returns to triggers after Escape
- All verification passing

**Verify**: `npm run verify`

### Step 5.3: Implementation Tests & Hardening

- [ ] 5.3.1 Add a test asserting the editor payload is never rendered as unsanitized HTML and no `dangerouslySetInnerHTML` exists — `fixture/e2e/editor.spec.ts` (extend)
- [ ] 5.3.2 Full verification

**Deliverables**:
- All verification passing

**Verify**: `npm run verify`

---

## Phase 6: Evaluation (RD-09)

> **Lenses**: `web-application`, `data-and-migration` (informational)

### Step 6.1: Specification Tests

**Reference**: [03-06](03-06-evaluation.md) · [07](07-testing-strategy.md) ST-45..ST-48 · plan AR #10
**Objective**: Encode evaluation-structure expectations first.

- [ ] 6.1.1 [spec-author] Write evaluation spec tests — `scripts/__tests__/evaluation.spec.test.ts` (ST-45..ST-48)
- [ ] 6.1.2 Run the spec tests — verify they FAIL (red phase)

**Deliverables**:
- Spec tests exist and fail for the right reason

**Verify**: `npm run test -- scripts/__tests__/evaluation.spec.test.ts` (expected RED)

### Step 6.2: Implementation

**Reference**: [03-06](03-06-evaluation.md) §Implementation Details · AR #10
**Objective**: Author the tasks, rubric, reproduction script, and results.

- [ ] 6.2.1 Author `evaluation/tasks.md` (≥12 tasks, all named scenarios)
- [ ] 6.2.2 Author `evaluation/rubric.md` (7 dimensions, 0–4 anchors)
- [ ] 6.2.3 Implement `scripts/evaluate.ts` (deterministic evidence; never invokes a model)
- [ ] 6.2.4 Author `evaluation/results.md` from the recorded evidence; mark the comparison `untested`
- [ ] 6.2.5 Run the spec tests — verify they PASS (green phase)

**Deliverables**:
- Every task cites an artifact or is `untested`; no conformance claim
- All verification passing

**Verify**: `npm run verify`

### Step 6.3: Implementation Tests & Hardening

- [ ] 6.3.1 Confirm no fabricated scores: grep results for claims exceeding evidence; fix wording
- [ ] 6.3.2 Full verification

**Deliverables**:
- All verification passing

**Verify**: `npm run verify`

---

## Phase 7: Maintenance, Docs & Close-out (RD-10)

> **Lenses**: `web-application`, `data-and-migration` (informational)

### Step 7.1: Specification Tests

**Reference**: [03-07](03-07-maintenance-and-docs.md) · [07](07-testing-strategy.md) ST-49..ST-51
**Objective**: Encode documentation expectations first.

- [ ] 7.1.1 [spec-author] Write docs spec tests — `scripts/__tests__/docs.spec.test.ts` (ST-49..ST-51)
- [ ] 7.1.2 Run the spec tests — verify they FAIL (red phase)

**Deliverables**:
- Spec tests exist and fail for the right reason

**Verify**: `npm run test -- scripts/__tests__/docs.spec.test.ts` (expected RED)

### Step 7.2: Implementation

**Reference**: [03-07](03-07-maintenance-and-docs.md) §Implementation Details
**Objective**: Write the README, maintenance guide, changelog, and completion report.

- [ ] 7.2.1 Author `README.md` (scope, usage, baseline `d595d79` + 9.74.7, limitations, sibling division of labor)
- [ ] 7.2.2 Author `MAINTENANCE.md` (refresh + re-pin procedure) and `CHANGELOG.md` with the replaced-guidance history section
- [ ] 7.2.3 Author `COMPLETION-REPORT.md` (completed / blocked / untested + highest-impact gaps)
- [ ] 7.2.4 Run the spec tests — verify they PASS (green phase)

**Deliverables**:
- Docs contain all required parts; ids stable; gaps named
- All verification passing

**Verify**: `npm run verify`

### Step 7.3: Final Verification & Completion

- [ ] 7.3.1 Finalize `AGENTS.md` (verify command, pin, generated directories) and confirm no hand-edited generated file remains
- [ ] 7.3.2 Full verification and present the completion summary

**Deliverables**:
- `npm run verify` exits 0 on a clean tree
- All phases complete; no warnings/errors; no dead code

**Verify**: `npm run verify`

---

## Dependencies

```
Phase 0 (foundation)
    ↓
Phase 1 (evidence) ──→ Phase 2 (rules & patterns) ──→ Phase 3 (skill + generator/reference/drift gates)
                                                          ↓
                                              Phase 4 (example/secret/freshness gates)
                                                          ↓
                                                    Phase 5 (fixture)
                                                          ↓
                                                    Phase 6 (evaluation)
                                                          ↓
                                                    Phase 7 (docs & close-out)
```

---

## Success Criteria

**Feature is complete when:**

1. ✅ All phases completed
2. ✅ `npm run verify` passes (static gates + Playwright + axe)
3. ✅ No warnings/errors; no dead code
4. ✅ Security hardened — no secrets committed, examples never executed, retrieved content treated as data, no unsafe HTML injection
5. ✅ Documentation updated (README, MAINTENANCE, CHANGELOG, COMPLETION-REPORT, AGENTS.md)
6. ✅ Every coverage topic Supported or an explicit Gap; derived recommendations labeled
7. ✅ Post-completion project re-analysis (handled by the exec-plan skill)
