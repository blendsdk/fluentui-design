# RD-01: Form Input Coverage and Control-Choice Rules

> **Document**: RD-01-form-inputs-coverage.md
> **Status**: Draft
> **Created**: 2026-09-22
> **Project**: fluentui-design
> **Depends On**: —
> **CodeOps Artifact Schema**: 1

---

## Feature Overview

The skill tells an agent to bind inputs to labels (`RULE-005`), when to validate (`RULE-006`), and
how to lay out a form (`RULE-007`). It does not yet tell the agent **which control** to reach for.
The catalog records the gap as `SRC-039` "Form input components (expansion target)": the canonical
v9 usage pages for the individual inputs were discovered but never analyzed.

This requirement analyzes the form-control usage pages and turns the control-choice, immediacy,
option-content, assistive-navigation, and numeric-bounds guidance into a small set of additive
`forms` rules. It is a content change: no code, dependency, pattern, or decision-key change.

---

## Functional Requirements

### Must Have

- [ ] **Analyzed source.** `SRC-039` becomes `analyzed`, retitled "Form input components", with
      locators for the eight Fluent 2 usage pages plus Field, and a summary that records the
      SpinButton and date/time limitations (AR #1, #2, #3, #4).
- [ ] **Findings.** `FND-019`..`FND-023` record the control-choice, immediacy, option-text,
      inline-popup, and numeric-bounds facts (AR #6).
- [ ] **Rules.** `RULE-037`..`RULE-042` are added under `decisionArea: forms` with actionable
      instructions, evidence, verified component mappings, and verification methods (AR #5).
- [ ] **Coverage.** The forms topic row and the form-page pattern row cite `SRC-039` and the new
      rules; every new rule is mapped; the summary stays `12` topics, `8` patterns, `0` gaps
      (AR #9).
- [ ] **Pattern.** `PAT-004-form-page.md` lists the new rules and reflects the control-choice and
      accessibility guidance in its component-mapping, accessibility, and edge-case sections
      (AR #7).

### Should Have

- [ ] The other discovery targets (`SRC-040`..`SRC-045`) stay as they are; `SRC-040` remains
      partly discovered (AR #1).

### Won't Have (Out of Scope)

- **Date and time controls** — `DatePicker`, `TimePicker`, and `Calendar` are not exports of the
  pinned aggregate (AR #3).
- **A SpinButton usage page** — none exists; the rule is grounded in the package source (AR #2).
- **New patterns, decision keys, evaluation tasks, docs, code, or tests** (AR #7, #8, #10).

---

## Technical Requirements

### Source catalog

`SRC-039` keeps its id and follows `sources/sources.schema.json`. `status: analyzed`, locators are
the eight `.../core/<name>/usage` pages and the Field page, `retrievalDate` is set, and the summary
names the analyzed guidance and the excluded controls.

### Findings and rules

Findings use the `research/findings.md` field set and a valid kind. Rules use the
`rules/rules.schema.json` shape, `decisionArea: forms`, a `verified` component mapping limited to
`facts/verified-exports.json`, and instructions that begin with an imperative verb from the
allowlist in `scripts/lib/rules.ts`.

### Coverage, generation, freshness

`research/coverage.md` rows keep the existing shape. `npm run generate` and `npm run freshness`
must be re-run; `npm run generate:check` and `npm run verify` must pass.

---

## Integration Points

- **With the field source.** `SRC-013` already covers label, helper text, and validation states;
  the new rules choose the control and defer labeling to `RULE-005`.
- **With the fixture.** The fixture record editor already renders these controls; the new rules
  describe an exercised surface.

---

## Security Considerations

N/A — documentation and catalog data only, with no code, input handling, or dependency.

---

## Acceptance Criteria

1. [ ] `npm run validate:sources` exits 0 with `SRC-039` `analyzed`.
2. [ ] `SRC-039` locators resolve to the eight usage pages plus Field, and the summary names the
       SpinButton and date/time limitations.
3. [ ] `FND-019`..`FND-023` exist with valid kinds and resolving `informsRules`.
4. [ ] `RULE-037`..`RULE-042` exist under `decisionArea: forms`; every mapped export is verified.
5. [ ] `npm run validate:all` and `npm run lint:rules` exit 0.
6. [ ] The forms topic and form-page pattern rows cite `SRC-039` and the new rules.
7. [ ] `PAT-004-form-page.md` lists the new rules and reflects the guidance.
8. [ ] `npm run generate:check` and `npm run freshness -- --check` exit 0.
9. [ ] `npm run verify` exits 0.
10. [ ] The feature ships as a minor release from `main`.
