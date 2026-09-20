# Evaluation Results

> **Document**: results.md
> **Parent**: [README](README.md)
> **Implements**: RD-09

These results record **deterministic evidence only**. No model provider is authorized, so no agent
answer was produced and no dimension score was awarded. Each row states what a committed artifact
proves: the governing rule exists, the pattern that routes the decision exists, and, where a
fixture check exists, the built application demonstrates the behavior.

| Result | Meaning |
| --- | --- |
| pass | A committed automated check exercises the expected decision and passes. |
| partial | The governing rules and patterns exist and the reference gate resolves them, and any automated check exercises only part of the expected decision. |
| fail | A cited rule, pattern, or artifact is missing, or a check fails. |
| untested | No deterministic check applies. A reason is given instead of an artifact. |

**What this is not:** an agent-answer quality score. That requires a model run, which is out of
scope for this evaluation. Dimension scores in [rubric.md](rubric.md) are awarded only from a real
run; none was performed, so the rubric is recorded unpopulated.

## Results

### EVAL-001 — Customer management list and editor

| Field | Value |
| --- | --- |
| result | pass |
| evidence | Fixture checks in `fixture/e2e/list.spec.ts` and `fixture/e2e/editor.spec.ts` cover filtering, the empty and no-results states, create, edit, and duplicate-email recovery; `skill/references/patterns/PAT-002-list-page.md` routes the decision. |
| check | automated |
| viewport | 1280x720 |

### EVAL-002 — Short rename versus complex multi-section record

| Field | Value |
| --- | --- |
| result | partial |
| evidence | `skill/references/patterns/PAT-005-contextual-edit.md` and `skill/references/patterns/PAT-003-record-detail.md` route the surface choice; rules RULE-008 and RULE-009 resolve in `rules/rules.json`. No automated check chooses between surfaces. |
| check | reference gate |
| viewport | not applicable |

### EVAL-003 — Essential fields or errors hidden in accordions

| Field | Value |
| --- | --- |
| result | partial |
| evidence | `skill/references/patterns/PAT-006-settings-page.md` records the disclosure rule that task-required content stays visible; rules RULE-013 and RULE-014 resolve in `rules/rules.json`. |
| check | reference gate |
| viewport | not applicable |

### EVAL-004 — Wide grid adapted to a narrow viewport

| Field | Value |
| --- | --- |
| result | partial |
| evidence | `fixture/e2e/a11y.spec.ts` loads the list at more than one width; `skill/references/patterns/PAT-002-list-page.md` records the responsive column decision. |
| check | automated |
| viewport | 1280x800 and 375x812 |

### EVAL-005 — Competing primary actions and ambiguous save or cancel

| Field | Value |
| --- | --- |
| result | partial |
| evidence | `fixture/e2e/editor.spec.ts` asserts the commit and dismiss paths and the unsaved-changes choice; `skill/references/patterns/PAT-004-form-page.md` routes command hierarchy. |
| check | automated |
| viewport | 1280x720 |

### EVAL-006 — v8 APIs introduced into a v9 project

| Field | Value |
| --- | --- |
| result | pass |
| evidence | `facts/verified-exports.json` pins the v9 export set, and `scripts/check-examples.ts` fails any example that imports an export the set does not contain. |
| check | automated |
| viewport | not applicable |

### EVAL-007 — Dialog open and close with return focus

| Field | Value |
| --- | --- |
| result | partial |
| evidence | `fixture/e2e/overlay-focus.spec.ts` opens the dialog and drawer and asserts that Escape closes each overlay and returns focus to its trigger. Focus entry, focus trapping, and background inertness are not asserted. `skill/references/patterns/PAT-005-contextual-edit.md` routes the surface. |
| check | automated |
| viewport | 1280x720 |

### EVAL-008 — Sorting the visible page versus a remote dataset

| Field | Value |
| --- | --- |
| result | partial |
| evidence | `skill/references/patterns/PAT-002-list-page.md` records the client-versus-remote sort decision and the matching header state; rules RULE-010 and RULE-011 resolve in `rules/rules.json`. |
| check | reference gate |
| viewport | not applicable |

### EVAL-009 — Settings page with optional advanced options

| Field | Value |
| --- | --- |
| result | partial |
| evidence | `skill/references/patterns/PAT-006-settings-page.md` routes grouping and advanced disclosure; rules RULE-013 and RULE-014 resolve in `rules/rules.json`. |
| check | reference gate |
| viewport | not applicable |

### EVAL-010 — Long translations and RTL layout

| Field | Value |
| --- | --- |
| result | partial |
| evidence | `skill/references/patterns/PAT-004-form-page.md` records logical-property and long-label handling; the fixture exposes a mirrored-direction parameter in `fixture/src/main.tsx`. |
| check | reference gate |
| viewport | not applicable |

### EVAL-011 — Light, dark, and forced-colors review

| Field | Value |
| --- | --- |
| result | partial |
| evidence | `fixture/e2e/a11y.spec.ts` scans the list in the light and dark themes; rules RULE-017, RULE-018, and RULE-019 resolve in `rules/rules.json`. Forced-colors mode is not automated. |
| check | automated and reference gate |
| viewport | 1280x800 |

### EVAL-012 — Reject an unsupported rule or a nonexistent component

| Field | Value |
| --- | --- |
| result | pass |
| evidence | `rules/rules.json` separates verified mappings from application-owned ones, and `facts/verified-exports.json` is the only allowed export source checked by `scripts/check-facts.ts`. |
| check | automated |
| viewport | not applicable |

## Observed defects

Each defect was found by a named check at a recorded viewport. All were fixed before this record was
written.

| Defect | Viewport | Found by | Status |
| --- | --- | --- | --- |
| Saving the first record from the empty state did not render the new row. | 1280x720 | `fixture/e2e/list.spec.ts` regression case | fixed |
| Grid selection checkboxes had no accessible name. | 1280x800 | axe `label` rule via `fixture/e2e/a11y.spec.ts` | fixed |
| The unsaved-changes dialog left the drawer inert while both were open. | 1280x720 | manual interaction during fixture development; no automated assertion covers inertness | fixed |
| Clearing filters dismissed the error and loading states. | 1280x720 | `fixture/e2e/list.spec.ts` regression case | fixed |

## Automated findings

Automated checks report **findings**, not conformance. A clean axe run means the checked rules passed
on the checked page at the checked viewport; it does not establish that the application meets any
standard. The axe scan excludes Fluent's focus-sentinel nodes (`[data-tabster-dummy]`), which are
framework internals, not page content.

## Screen-reader checks

None performed. No screen-reader session was run, so no result is recorded here.

## Skill vs. baseline comparison

Status: `untested`.

No model provider is authorized for this project, so no comparison was run. Running a skill answer
and a baseline answer under identical conditions, with the same model, prompt, and scoring, is
required before this section reports a comparison. Until then it stays `untested` and no difference
is claimed.
