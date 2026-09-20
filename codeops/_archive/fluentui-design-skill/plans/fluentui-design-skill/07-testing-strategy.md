# Testing Strategy: fluentui-design-skill

> **Document**: 07-testing-strategy.md
> **Parent**: [Index](00-index.md)

## Testing Overview

### Coverage Goals

| Code type | Target |
| --------- | ------ |
| Catalog validators and gates (core logic) | 90% |
| Markdown/frontmatter parsers and renderers | 85% |
| Fixture UI interaction (E2E) | Key flows covered; zero console errors |
| Docs/config (Markdown, JSON Schema, configs) | Structural validation only |

- Test names state behavior: `should [expected behavior] when [condition]`.
- E2E tests run against the fixture with Playwright (Chromium); `verify:static` covers the
  browser-free subset.
- Coverage targets are a plan decision recorded here (not derived from an AR entry); adjust only through the Ambiguity Register, never silently.

## 🚨 Specification Test Cases (MANDATORY — NON-NEGOTIABLE)

> Derived exclusively from the RDs, the component specs, and the Ambiguity Register. These define
> expected behavior before implementation. **Immutable-oracle rule:** if the implementation disagrees
> with an ST case, the implementation is wrong. In-code traceability comments restate the behavior in
> plain language, never as an ST/AR id or a `codeops/` path.

### Source catalog (RD-01)

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|------------------|----------------------------|--------|
| ST-1 | Run `validate-sources` on the committed catalog | Exit 0; no errors | RD-01 AC1 |
| ST-2 | Add a second entry with `id: "SRC-001"` | Exit 1; message names the duplicate id | RD-01 AC1 |
| ST-3 | An entry with `status: "blocked"` and `accessLimitation: null` | Exit 1; message says the limitation is required | RD-01 AC1 |
| ST-4 | An entry with `id: "SRC-1"` (2 digits) | Exit 1; schema regex failure | RD-01 |
| ST-5 | The I01 entry where requested ≠ resolved URL | Both URLs stored; resolved is the canonical host | RD-01 AC4 |
| ST-6 | A `Supported` coverage row citing only a non-`analyzed` source | Exit 1; reports the row and source | RD-02 AC2 |

### Coverage, findings, conflicts (RD-02, RD-03)

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|------------------|----------------------------|--------|
| ST-7 | A rule exists that no coverage row references | Exit 1; names the unmapped rule | RD-02 AC4 |
| ST-8 | A `Gap` row with an empty `gapNote` | Exit 1; names the row | RD-02 AC3 |
| ST-9 | A finding whose `kind` is `official` (not in the seven) | Exit 1; lists valid kinds | RD-03 AC1 |
| ST-10 | A normative accessibility finding with no SC/spec citation | Exit 1; requires a citation | RD-03 AC2 |
| ST-11 | A conflict with `resolution: unresolved` but no `uncertainty` | Exit 1; requires uncertainty | RD-03 AC3 |

### Rules (RD-04)

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|------------------|----------------------------|--------|
| ST-12 | Two rules share `id: "RULE-004"` | Exit 1; duplicate id | RD-04 AC1 |
| ST-13 | A rule cites `SRC-999` that is absent | Exit 1; names the rule and source | RD-04 AC1 |
| ST-14 | A rule maps to verified export `Foo` not in the allowlist | Exit 1; names the unknown export | RD-04 AC3, plan AR #5 |
| ST-15 | A rule with `instruction: ""` | Exit 1; instruction required | RD-04 AC2 |
| ST-16 | A draft rule with `instruction: "Make it intuitive."` | Lint warns (banned phrase); committed catalog passes | RD-04 AC5 |

### Patterns and decision index (RD-05)

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|------------------|----------------------------|--------|
| ST-17 | Inspect `skill/references/patterns/` | Exactly 8 `PAT-###` files, each with every template section | RD-05 AC1 |
| ST-18 | A pattern frontmatter uses `decisions: [made-up-key]` | Generator exits 1; lists valid decision keys | RD-05 AC4 |
| ST-19 | Generate the decision index | All 17 decisions resolve to ≥1 pattern | RD-05 AC4 |
| ST-20 | A pattern maps to a non-allowlisted export | Exit 1; names the mapping | RD-05 AC2 |

### Skill package (RD-06)

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|------------------|----------------------------|--------|
| ST-21 | Read `skill/SKILL.md` frontmatter | `name === "fluentui-design"` equals the directory name | RD-06 AC1 |
| ST-22 | Remove the "evidence fallback" section | Reference gate exits 1; required section missing | RD-06 AC2 |
| ST-23 | Point a routing link at a missing file | Reference gate exits 1; names the link | RD-06 AC3 |
| ST-24 | Change one byte in the mirror | Drift gate exits 1; names the file | RD-06 AC6 |

### Verification tooling (RD-07)

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|------------------|----------------------------|--------|
| ST-25 | Run `generate` twice | Second run produces byte-identical output | RD-07 AC3 |
| ST-26 | Hand-edit a generated file, then run the drift gate | Exit 1; reports the changed file | RD-07 AC2 |
| ST-27 | Add a stale marker file, then regenerate | The stale file is removed | RD-07 |
| ST-28 | Reference a non-existent `RULE-777` | Reference gate exits 1 | RD-07 AC5 |
| ST-29 | A Markdown link to a missing target | Reference gate exits 1 | RD-07 AC5 |
| ST-30 | An example imports `Bogus` from the package | Example gate exits 1; names `Bogus` | RD-07 AC1, plan AR #5 |
| ST-31 | An example with an observable side effect | The side effect does not occur during verification | RD-07 AC6 |
| ST-32 | Insert `AKIA0123456789ABCDEF` into a tracked file | Secret scan exits 1; names the file/pattern | RD-07 AC4 |
| ST-33 | A lockfile `integrity` hash line | Secret scan does not flag it | RD-07 |
| ST-34 | Change an input hash without updating the manifest | `freshness --check` exits 1 | RD-07 |

### Fixture app (RD-08)

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|------------------|----------------------------|--------|
| ST-35 | Type "al" in the search box | Only customers matching "al" are shown | RD-08 AC2 |
| ST-36 | Filter to a term with no matches | The "no results" state shows, not the empty state | RD-08 AC2 |
| ST-37 | Select no rows / one row | The contextual action is disabled / enabled | RD-08 AC2 |
| ST-38 | Submit the editor with an empty name | Inline error under the field; no save occurs | RD-08 AC3 |
| ST-39 | Submit a duplicate email | Server-error message; no stack trace or internal detail | RD-08 AC3, security |
| ST-40 | Double-click submit while pending | Exactly one save call; the button is disabled | RD-08 AC3 |
| ST-41 | Close a dirty editor, then Cancel / then Confirm | Cancel keeps the draft; Confirm discards it | RD-08 AC4 |
| ST-42 | Open the dialog, press Escape | It closes and focus returns to the trigger | RD-08 AC5 |
| ST-43 | Open the drawer, press Escape | It closes and focus returns to the trigger | RD-08 AC5 |
| ST-44 | Run axe at 1280×800 and 375×812, light and dark | Zero critical/serious violations | RD-08 AC6 |

### Evaluation and docs (RD-09, RD-10)

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|------------------|----------------------------|--------|
| ST-45 | Read `evaluation/tasks.md` | ≥12 tasks; all twelve named scenarios present | RD-09 AC1 |
| ST-46 | Read `evaluation/rubric.md` | 7 dimensions, each with 0–4 anchors | RD-09 AC3 |
| ST-47 | Inspect `evaluation/results.md` | Every task cites an artifact or is `untested`; no conformance claim | RD-09 AC4, AC5 |
| ST-48 | Inspect the comparison section | Filled with a real run or literally `untested` | RD-09 AC6 |
| ST-49 | Read `README.md` | Contains scope, usage, baseline, limitations | RD-10 AC1 |
| ST-50 | A source marked `blocked` | Noted in the completion report | RD-10 AC4 |
| ST-51 | Search generated docs for an id with two titles | No id appears with two different titles | RD-10 AC5 |

## Test Categories

### Specification Tests (from ST-cases above)
> Written BEFORE implementation. Filed as `*.spec.test.ts`.

| Test File | ST Cases Covered | Component |
| --------- | ---------------- | --------- |
| `scripts/__tests__/sources.spec.test.ts` | ST-1..ST-5 | Source catalog |
| `scripts/__tests__/coverage.spec.test.ts` | ST-6..ST-8 | Coverage |
| `scripts/__tests__/analysis.spec.test.ts` | ST-9..ST-11 | Findings/conflicts |
| `scripts/__tests__/rules.spec.test.ts` | ST-12..ST-16 | Rules |
| `scripts/__tests__/patterns.spec.test.ts` | ST-17..ST-20 | Patterns |
| `scripts/__tests__/skill-package.spec.test.ts` | ST-21..ST-29 | Skill package + generation/reference/drift gates |
| `scripts/__tests__/tooling.spec.test.ts` | ST-30..ST-34 | Example/secret/freshness gates |
| `scripts/__tests__/toolchain.spec.test.ts` | plan AR #6 (smoke) | Gate runner/report helper |
| `scripts/__tests__/evaluation.spec.test.ts` | ST-45..ST-48 | Evaluation |
| `scripts/__tests__/docs.spec.test.ts` | ST-49..ST-51 | Maintenance/docs |
| `fixture/e2e/*.spec.ts` | ST-35..ST-44 | Fixture (Playwright) |

### Implementation Tests (edge cases, internals)
> Written AFTER implementation. Filed as `*.impl.test.ts`.

| Test File | Description | Priority |
| --------- | ----------- | -------- |
| `scripts/__tests__/markdown.impl.test.ts` | Table rendering: missing column, extra pipe, CRLF input | High |
| `scripts/__tests__/frontmatter.impl.test.ts` | Frontmatter parser: empty arrays, quoted values, BOM | Med |
| `scripts/__tests__/examples.impl.test.ts` | Diagnostic classification `api` vs `general` | High |
| `scripts/__tests__/secrets.impl.test.ts` | Near-miss patterns that must not match | Med |

### Integration Tests

| Test | Components | Description |
| ---- | ---------- | ----------- |
| `generate` → gates | Generator + all gates | Regenerate, then run every gate on a clean tree |
| Example gate ↔ fixture lock | Example gate + fixture | Examples resolve against the installed pinned package |
| Evaluation reproduction | Evaluation + reference gate | Each task's cited rules resolve |

### End-to-End Tests

| Scenario | Steps | Expected Result |
| -------- | ----- | --------------- |
| List workflow | Filter → select → contextual action → confirm | Action applies to the selected row; success shown |
| Editor workflow | Open → invalid submit → fix → duplicate email → change → save | Errors and recovery behave as specified; one save |
| Overlay focus | Open drawer/dialog → Escape | Closes; focus returns to trigger |
| Accessibility (axe) | Run axe on list and editor at 1280×800 and 375×812, light and dark | Zero critical/serious violations (ST-44) |

## Test Data

### Fixtures Needed
- `fixture/src/data/customers.ts` — 24 synthetic rows, including a very long name and a duplicate email.
- Small invalid catalog snippets built in-test for each validator failure case.

### Mock Requirements
- Real `@fluentui/react-components` and real DOM in unit tests where practical. No network mocks.
- The fixture's async operations use timers, not a mock server; Playwright drives the real browser.

## Verification Checklist
- [ ] All specification test cases (ST-*) defined with concrete input/output pairs
- [ ] Every ST case traces to a requirement, component spec, or AR entry
- [ ] Specification tests written BEFORE implementation and verified to FAIL (red phase)
- [ ] All specification tests pass after implementation (green phase)
- [ ] Implementation tests written for edge cases and internals
- [ ] All unit / integration / E2E tests pass under `npm run verify`
- [ ] No regressions; no console errors in E2E flows
- [ ] Coverage meets goals
