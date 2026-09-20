# Preflight Report: fluentui-design-skill Implementation Plan

> **Status**: ✅ PASSED — all 15 findings resolved (0 critical, 5 major, 6 minor, 4 observation)
> **Iteration**: 2 (re-scan after fixes)
> **Artifact**: Implementation plan (13 documents) at `codeops/features/fluentui-design-skill/plans/fluentui-design-skill/`
> **Artifact revision**: git tree blob `085f73b41c11872c20c5c01ffbabec59fdc3048f` (HEAD `a54a1a9`); post-fix working tree is the revision under review for iteration 2
> **Scope mode**: strict (no `--explore-scope`)
> **Codebase Grounded**: 1 requirements set (11 RDs + README + AR), 13 plan docs, sibling `fluentui-mcp` skill/schema audited
> **Last Updated**: 2026-09-20

> **SAME-SESSION REVIEW**: This artifact was created earlier in the current session (commit
> `a54a1a9`). Same-agent bias risk is elevated. Consider running preflight in a new session for
> maximum review independence.

## Audit target and context

| Item | Value |
| ---- | ----- |
| Audit target | The 13 plan documents under `codeops/features/fluentui-design-skill/plans/fluentui-design-skill/` |
| Context (not audited) | `requirements/RD-01..RD-10`, `requirements/README.md`, `requirements/00-ambiguity-register.md`, `requirements/_draft/*`, sibling `fluentui-mcp` |
| Modification set | None yet — preflight is review-only until the user authorizes fixes |

## Codebase Context Summary

**Tech stack (planned):** root private ESM npm package; `tsx` + `eslint` + `typescript-eslint`;
`ajv` + `ajv-formats`; Vitest; Vite + React 18 + TypeScript fixture; Playwright (Chromium) +
`@axe-core/playwright`; `@fluentui/react-components` 9.74.7.

**Architecture:** JSON catalogs are canonical; a deterministic generator derives Markdown views and a
byte-identical skill mirror; catalog validators and gates (reference, example, secret, drift,
freshness) form one `verify` command.

**Key facts verified against the real filesystem:**

| Claim in plan | Verified value |
| ------------- | -------------- |
| Sibling HEAD is `d595d79` | ✅ `d595d79dc7833f2c8ed8b71a49aa4a0f29b7d602` |
| Schema sha256 `373e64be…78df4aa6`, 5,015,229 bytes | ✅ matches `fluentui-mcp/data/v9/fluentui-schema-enhanced.json` |
| `fdf755c` is not a sibling object | ✅ `git cat-file -t fdf755c` → "Not a valid object name" |
| Sibling skill forbids hand-edits | ✅ `fluentui-mcp/README.md:86` — "generated, never hand-edited" |
| Sibling skill layout | `fluentui-mcp/skills/fluentui/` = `SKILL.md` + `references/{categories,components,foundation,quick-reference,recipes}/` |
| Sibling skill installed for the agent | ❌ NOT present in `~/.agents/skills/` or `~/.config/opencode/skills/` |
| Repo has a root toolchain | ❌ none; `.opencode/` has its own `package.json` |

**Reference verification:** 12 external references checked — 10 verified, 2 unverifiable/unresolved
(the sibling's embedded upstream commit semantics; runtime resolution of the sibling-skill cross-link).

### Summary by Dimension

| # | Dimension | Findings | Highest severity |
|---|-----------|----------|------------------|
| 1 | Ambiguities | 0 | — |
| 2 | Implicit Assumptions | 1 | 🟡 |
| 3 | Logical Contradictions | 1 | 🟠 |
| 4 | Completeness Gaps | 1 | 🟡 |
| 5 | Dependency Issues | 2 | 🟠 |
| 6 | Feasibility Concerns | 1 | 🟠 |
| 7 | Testability | 1 | 🟡 |
| 8 | Security Blind Spots | 0 | — |
| 9 | Edge Cases | 1 | 🔵 |
| 10 | Scope Creep Indicators | 0 | — |
| 11 | Ordering & Sequencing | 1 | 🟠 |
| 12 | Consistency | 5 | 🟡 |
| 13 | Codebase Alignment | 1 | 🔵 |

### Summary by Severity

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0 | — |
| MAJOR | 5 | pending decisions |
| MINOR | 6 | pending decisions |
| OBSERVATION | 4 | pending decisions |

### Domain lenses

Requirements discovery selected `web-application` and `data-and-migration`
(`requirements/_draft/discovery-notes.md:47-54`). The plan does not restate them (see `PF-007`); this
scan therefore applied a web-application cluster (surfaces, focus, states, a11y) and a
data-and-migration cluster (stable IDs, re-pin/compatibility, drift).

---

## Findings

### PF-001: Phase 3 cannot go green because its gates arrive in Phase 4 🟠 MAJOR

**Dimension:** 11 — Ordering & Sequencing
**Location:** `99-execution-plan.md:175-202` (Phase 3), `:216-238` (Phase 4); `03-03-skill-package.md:98`
**Codebase evidence:** Phase 3 spec tests cover ST-22..ST-24, which exercise the reference gate and
drift gate; Phase 3 Verify runs `npm run generate && npm run check:refs`; but `check-references.ts`
is a Phase 4 task (`99-execution-plan.md:238`). `generate.ts` is built in `3.2.3` and then built
again "full" in `4.2.1` (`:194` vs `:236`).

**The Problem:** A phase whose Verify command calls a script created in a later phase can never
reach a green verify. The ordering also double-owns `generate.ts` (partial in Phase 3, full in
Phase 4), so the same file is implemented twice.

**Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A | Move the full generator + reference gate + drift gate into Phase 3 | Skill and its guards ship green together; no double implementation | Scripts land in the RD-06 phase; touch 03-03, 03-04, 07, 99 |
| B | Keep phases; Phase 3 tests only frontmatter (ST-21), move ST-22..24 and `check:refs` to Phase 4 | Small edits, preserves RD ownership cleanly | Phase 3 blocks the mirror/generator; skill still untested by gates |
| C | Merge Phases 3 and 4 | One coherent skill+tools phase | Loses the smaller phase boundary; renumbering |

**Recommendation:** Option A — the generator and drift/reference gates are the skill's own guards;
ship them with the content they protect and delete the duplicate `generate` task.
**Related:** PF-004 (same root cause family: verify wiring vs phase order).
**User Decision:** Resolved — User accepted recommendation (Option A), iteration 2 verified the fix.

### PF-002: The reference gate would fail the skill's required sibling cross-links 🟠 MAJOR

**Dimension:** 3 — Logical Contradictions
**Location:** `03-03-skill-package.md:78`, `03-04-verification-tooling.md:39`
**Codebase evidence:** RD-06 AC4 requires cross-links to the sibling `fluentui` skill; RD-07 AC5
requires the reference gate to fail on any Markdown link whose target is missing. The sibling's
files (`fluentui-mcp/skills/fluentui/references/components/button.md`) do not exist inside this repo.

**The Problem:** Two approved requirements conflict as planned: the skill must link to sibling files,
and the gate must reject links to missing files. Nothing exempts cross-skill links, so the intended
cross-links become gate failures.

**Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A | Define an explicit external-link convention (e.g. `fluentui:references/…`) that the gate treats as external and validates only for shape/known skill name | Honors both requirements; gate stays strict on local links | A typo'd sibling path is not caught locally |
| B | Reference the sibling by skill name + section text only; no file paths | No gate conflict, simplest | Loses precise deep links |
| C | Vendor the sibling references into this repo | Links resolve locally | Duplicates API docs (forbidden by AR #12) |

**Recommendation:** Option A — keep precise cross-links but gate them by convention, and record the
sibling layout in the compatibility note.
**User Decision:** Resolved — User accepted recommendation (Option A), iteration 2 verified the fix.

### PF-003: The Phase 0 smoke test can recurse into itself 🟠 MAJOR

**Dimension:** 6 — Feasibility Concerns
**Location:** `99-execution-plan.md:63`; `03-04-verification-tooling.md:81`; `07-testing-strategy.md:127-136`
**Codebase evidence:** `verify:static` runs `test` (Vitest). Task `0.1.4` asks for a test that
"asserts `verify:static` runs". A test inside the Vitest suite that spawns `verify:static` re-enters
Vitest and never terminates. The file `scripts/__tests__/toolchain.spec.test.ts` is also absent from
the testing-strategy table.

**The Problem:** As written, the smoke test risks infinite recursion and is not part of the declared
test plan.

**Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A | Test the gate runner/report helper directly with an injected failing check; never spawn npm | Fast, deterministic, no self-reference | Does not prove `package.json` wiring |
| B | Spawn one isolated script (`tsx scripts/validate-sources.ts`) against a temp bad fixture | Proves a real gate exits non-zero | More moving parts |
| C | Drop the Phase 0 smoke test | Simplest | No early toolchain signal |

**Recommendation:** Option A; add the file to the testing-strategy table (see `PF-010`).
**User Decision:** Resolved — User accepted recommendation (Option A), iteration 2 verified the fix.

### PF-004: Phase Verify commands reference scripts that do not exist yet 🟠 MAJOR

**Dimension:** 5 — Dependency Issues
**Location:** `99-execution-plan.md:109` and `:246-258`; `03-04-verification-tooling.md:81`
**Codebase evidence:** Phase 1 Verify runs `npm run validate:all`, but `validate-rules.ts` is created
in Phase 2 (`:148`). Phase 4 Verify runs `verify:static`, which includes `check-examples`, whose
fixture typecheck is wired only in Phase 5 (`:288`). So `verify:static` means different things in
different phases, and Phase 1's aggregate fails.

**The Problem:** Verbs are wired to gates whose inputs/implementations arrive later; the plan does not
state which gate set is authoritative at each phase.

**Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A | Give each phase a scoped verify (only gates it owns) and name the first phase where the full aggregate is authoritative | Every phase can truthfully go green | AGENTS.md `verify` stays incomplete until late |
| B | Front-load all catalog gates so both validators exist in Phase 1 | Aggregate valid earlier | Pulls RD-04 work into Phase 1 |
| C | Gates skip when inputs are absent | Aggregate always "runs" | Green-by-absence risk |

**Recommendation:** Option A — scope each phase's Verify exactly; mark the authoritative `verify` at
Phase 4 (static) and Phase 5 (full).
**Related:** PF-001.
**User Decision:** Resolved — User accepted recommendation (Option A), iteration 2 verified the fix.

### PF-005: The sibling-skill dependency has no runtime contract 🟠 MAJOR

**Dimension:** 5 — Dependency Issues
**Location:** `03-03-skill-package.md:78`; `00-index.md:96`; `01-requirements.md:34`
**Codebase evidence:** The sibling skill is at `fluentui-mcp/skills/fluentui/` and is not installed in
`~/.agents/skills/` or `~/.config/opencode/skills/`. The plan never states a co-install requirement,
a stable cross-link base, or behavior when the sibling is absent.

**The Problem:** The skill's "no duplicated API docs" strategy depends on a target that may not exist
for the agent. Missing contract = dead references or invented props at answer time.

**Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A | Define the contract (skill name + `references/<path>` layout), require co-install, and state an absence fallback | Precise, testable, degrades safely | Cross-links still tied to the pinned sibling revision |
| B | Link to the sibling repo's absolute path | Works on this machine | Not portable |
| C | Mention the sibling generically; no paths | Always safe | Weakens the cross-link requirement |

**Recommendation:** Option A — the fallback is already a required `SKILL.md` section, so this closes
the loop.
**Related:** PF-002.
**User Decision:** Resolved — User accepted recommendation (Option A), iteration 2 verified the fix.

### PF-006: Specification-test ranges are mis-cited in three component specs 🟡 MINOR

**Dimension:** 12 — Consistency
**Location:** `03-02-rules-and-patterns.md:131`, `03-03-skill-package.md:98`, `03-01-evidence-pipeline.md:152`
**Codebase evidence:** `07-testing-strategy.md:128-136` assigns rules = ST-12..ST-16, patterns =
ST-17..ST-20, skill package = ST-21..ST-24. `03-02` says rules lint is ST-9..ST-16 (ST-9..11 are
findings/conflicts); `03-03` says skill package is ST-17..ST-21; `03-01` says ST-1..ST-8 (omits the
analysis cases ST-9..ST-11 it owns).

**The Problem:** Spec-test citations are the oracle map; wrong ranges send the spec author to the
wrong cases.

**Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A | Correct all three ranges to match `07` (03-01 → ST-1..ST-11; 03-02 → ST-12..ST-16; 03-03 → ST-21..ST-24) | One source of truth | None |
| B | Make `07` the only place ST ranges appear; specs link to it | Less duplication | Larger rewrite |

**Recommendation:** Option A.
**User Decision:** Resolved — User accepted recommendation (Option A), iteration 2 verified the fix.

### PF-007: Applicable domain lenses are not declared at plan level 🟡 MINOR

**Dimension:** 4 — Completeness Gaps
**Location:** `00-index.md`, `01-requirements.md`; `99-execution-plan.md:53`
**Codebase evidence:** Discovery selected `web-application` and `data-and-migration`
(`requirements/_draft/discovery-notes.md:47-54`). The plan records lenses only on Phase 0; other
phases have none, and no top-level document states the lens set.

**The Problem:** Reviewers and phase gates select their clusters from the declared lenses; a partial
declaration weakens that selection and traceability.

**Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A | Declare the two lenses (with one-line rationale) in `00-index.md` and add a matching Lenses line to every phase | Consistent, reviewer-ready | Small edits across 8 phases |
| B | Declare lenses once in `00-index.md` only | Less churn | Phase reviewers must look up |

**Recommendation:** Option A.
**User Decision:** Resolved — User accepted recommendation (Option A), iteration 2 verified the fix.

### PF-008: The "AR Ref" column in component specs holds RD ids 🟡 MINOR

**Dimension:** 12 — Consistency
**Location:** `03-01:142-148`, `03-02:120-126`, `03-05:107-113`, `03-06:70-74`, `03-07:54-58`
**Codebase evidence:** Each Error Handling table is headed `| Error Case | Handling Strategy | AR Ref |`
but the values are `RD-01`, `RD-04`, `RD-08`, `RD-09`, `RD-10`. Bare `AR #n` elsewhere is ambiguous
between the requirements AR and the plan AR.

**The Problem:** Traceability column names do not match their contents, and AR references are
unqualified across two separate registers.

**Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A | Rename the column to `Ref`/`Source` and qualify every AR as `requirements AR #n` or `plan AR #n` | Unambiguous traceability | Touch all five specs |
| B | Leave column but fix values to AR ids | Minimal | Requires inventing AR links |

**Recommendation:** Option A.
**User Decision:** Resolved — User accepted recommendation (Option A), iteration 2 verified the fix.

### PF-009: Drift checking and validator aggregation are duplicated/inconsistent 🟡 MINOR

**Dimension:** 12 — Consistency
**Location:** `03-04-verification-tooling.md:33,42`; `99-execution-plan.md:60`
**Codebase evidence:** `generate.ts --check` and `check-drift.ts` ("Run `generate.ts --check` and
compare the mirror") perform the same comparison, and both are wired into `verify:static`. The
Phase 0 script list (`99:60`) includes `generate:check` but omits the per-catalog scripts
(`validate-sources`, `validate-rules`) and `check-drift` that `03-04` defines.

**The Problem:** Two owners for one guarantee invites drift in implementation and confusing failures.

**Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A | Keep `generate --check` as the drift mechanism and drop `check-drift.ts`; align the 0.1.1 script list with 03-04 | One guarantee, one script | Edit two docs |
| B | Keep both but document one as the wrapper | Minimal | Redundant |

**Recommendation:** Option A.
**User Decision:** Resolved — User accepted recommendation (Option A), iteration 2 verified the fix.

### PF-010: The Phase 0 test file is missing from the testing strategy 🟡 MINOR

**Dimension:** 7 — Testability
**Location:** `07-testing-strategy.md:125-136`; `99-execution-plan.md:63`
**Codebase evidence:** The test-file table lists `toolchain` nowhere, yet Phase 0 creates
`scripts/__tests__/toolchain.spec.test.ts`. The End-to-End table (`07:156-162`) also omits the
a11y/ST-44 scenario.

**The Problem:** A test file exists in the execution plan but not in the test plan; coverage
accounting is incomplete.

**Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A | Add `toolchain.spec.test.ts` to the table and add an a11y row to the E2E table | Complete | None |
| B | Remove the Phase 0 smoke test instead | Simpler | Loses early signal |

**Recommendation:** Option A (paired with the `PF-003` resolution).
**User Decision:** Resolved — User accepted recommendation (Option A), iteration 2 verified the fix.

### PF-011: Deriving `verified-exports.json` from the sibling schema is under-specified 🟡 MINOR

**Dimension:** 2 — Implicit Assumptions
**Location:** `03-04-verification-tooling.md:18-27`, `:34`
**Codebase evidence:** The sibling schema exposes 62 `components[]` and 4 `utilities[]` entries, each
with `packageName` (e.g. `@fluentui/react-accordion`, version 9.12.0), `name`, `importPath`,
`importStatement`, `additionalExports` — it has **no** top-level `@fluentui/react-components` export
list. The plan's `VerifiedExports` assumes `exports: string[]` (top-level export names),
`subcomponents: Record<string,string[]>`, and one `packageVersion` (9.74.7).

**The Problem:** The transform from the schema's per-package shape to the meta-package allowlist (and
the meaning of the single `packageVersion`) is assumed, not specified, so `extract-facts.ts` is
underdetermined.

**Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A | Specify the extraction rule: component `name` + `additionalExports` become export names; `slots`/`relatedComponents` become subcomponents; keep per-source `packageName/packageVersion` instead of one meta version | Precise and faithful | Schema edit |
| B | State it as an author-time manual allowlist derived from the schema | Simple | Re-pin becomes manual |

**Recommendation:** Option A.
**User Decision:** Resolved — User accepted recommendation (Option A), iteration 2 verified the fix.

### PF-012: AR #5 wording conflates the schema's embedded upstream commit with a sibling object 🔵 OBSERVATION

**Dimension:** 13 — Codebase Alignment
**Location:** `00-ambiguity-register.md:18`, `:96-97`
**Codebase evidence:** The sibling schema at `d595d79` itself contains
`sources.fluentui.commit = "fdf755ce26d41c57452b79fb23fc4a590630a1b5"`. `fdf755c` is a real value —
it is the **upstream Fluent UI source commit**, not a sibling-repo commit.

**The Problem:** The corrective pin is right, but saying `fdf755c` "does not exist" is only true as a
sibling object; the value is meaningful inside the schema. A future re-pin could misread this.

**Recommendation:** Add one clarifying sentence to AR #5 distinguishing the two hashes.
**User Decision:** Resolved — User accepted recommendation (Option A), iteration 2 verified the fix.

### PF-013: Coverage targets are attributed to the wrong AR entries 🔵 OBSERVATION

**Dimension:** 12 — Consistency
**Location:** `07-testing-strategy.md:20`
**Codebase evidence:** "Coverage targets are plan AR #6/#12" — plan AR #6 is the `verify` command
and plan AR #12 is the test layout; neither sets coverage percentages.

**Recommendation:** Replace with the actual source (the 90%/85% goals come from the plan's testing
strategy, not an AR), or record them as an approved plan decision.
**User Decision:** Resolved — User accepted recommendation (Option A), iteration 2 verified the fix.

### PF-014: Stale-marker deletion could remove a mis-marked hand-authored file 🔵 OBSERVATION

**Dimension:** 9 — Edge Cases
**Location:** `03-04-verification-tooling.md:50`; `99-execution-plan.md:236`
**Codebase evidence:** The generator deletes any file carrying `GENERATED_MARKER` under managed roots.
A hand-authored file that accidentally begins with the marker would be deleted.

**Recommendation:** Restrict deletion to a known generated-file allowlist (or managed subpaths) rather
than any marked file.
**User Decision:** Resolved — User accepted recommendation (Option A), iteration 2 verified the fix.

### PF-015: An external dependency is listed as "latest 9.x" yet "pinned" 🔵 OBSERVATION

**Dimension:** 2 — Implicit Assumptions
**Location:** `02-current-state.md:82`
**Codebase evidence:** `@fluentui/react-icons` version is "latest 9.x" with the note "Pinned by the
lockfile" — a lockfile pins a resolved version, not "latest".

**Recommendation:** State the intended resolution (e.g. "resolve current 9.x at install; exact version
recorded by the lockfile") so the baseline is unambiguous.
**User Decision:** Resolved — User accepted recommendation (Option A), iteration 2 verified the fix.

---

## Iteration log

| Iteration | Findings | Notes |
| --------- | -------- | ----- |
| 1 | 15 (0🔴 / 5🟠 / 6🟡 / 4🔵) | First scan; one challenger dispatched for the MAJOR batch (converged on all five). |
| 2 | 0 new | Bounded re-scan of every change and its direct dependency surface: all 15 fixes verified, no regressions. |

## Verdict — Iteration 2

**✅ PREFLIGHT PASSED — all 15 findings resolved; 0 unresolved critical/major; 0 accepted-risk notes.**

Verified in iteration 2:

| Finding | Fix verified |
| ------- | ------------ |
| PF-001 | Phase 3 now ships the full generator + reference gate + drift gate; duplicate `generate` task removed (9 + 8 tasks, total 72) |
| PF-002 | `<skill>:…` external cross-skill link convention added to `03-03` and the reference gate in `03-04` |
| PF-003 | Task `0.1.4` tests the gate helper with an injected failing check and forbids spawning `verify:static` |
| PF-004 | Per-phase Verify scoped (P0 toolchain, P1 `validate:sources`, P2 `validate:all`, P3 package gates, P4 `verify:static`, P5+ full `verify`) |
| PF-005 | Co-install contract + absence fallback stated in `03-03` cross-link section |
| PF-006 | ST ranges corrected in `03-01`/`03-02`/`03-03`; `07` table remapped |
| PF-007 | Lenses declared in `00-index` + `01-requirements` and on all 8 phases |
| PF-008 | `AR Ref` columns renamed to `Ref` in the five component specs |
| PF-009 | `check-drift.ts` removed; drift owned solely by `generate --check`; `0.1.1` script list aligned |
| PF-010 | `toolchain.spec.test.ts` and the axe/a11y E2E row added to `07` |
| PF-011 | `extract-facts.ts` extraction rule specified against the schema's per-package shape |
| PF-012 | AR #5 distinguishes the embedded upstream commit from a sibling-repo object |
| PF-013 | Coverage-target attribution corrected in `07` |
| PF-014 | Stale-marker deletion restricted to the generated-file allowlist |
| PF-015 | `react-icons` baseline wording corrected in `02-current-state` |

**Next consumer:** `exec-plan` (the artifact now passes preflight; roadmap advances to `Plan Preflighted`).
