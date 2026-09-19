# RD-09: Evaluation — Tasks, Rubric & Results

> **Document**: RD-09-evaluation.md
> **Status**: Draft
> **Created**: 2026-09-20
> **Project**: fluentui-design
> **Depends On**: RD-06, RD-07, RD-08
> **CodeOps Artifact Schema**: 1

---

## Feature Overview

This requirement defines how the skill's usefulness is measured honestly. It provides at least
twelve concrete evaluation tasks, a scoring rubric, and the **actual** recorded results. It also
records observed defects and viewport sizes, and it reports automated accessibility findings without
equating them with accessibility conformance.

The evaluation is deliberately lightweight (AR #2 refinement): tasks + rubric + recorded results via
a short script or a documented run. A skill-vs-baseline model comparison is optional and, if not
authorized, is marked **untested** — never fabricated.

**Complexity**: M

---

## Functional Requirements

### Must Have
- [ ] `evaluation/tasks.md` defines at least twelve tasks, including all of: a customer management list and editor; choosing a surface for a short rename vs. a complex multi-section record; correcting a form whose essential fields or errors are hidden in accordions; adapting a wide grid to a narrow viewport; fixing competing primary actions and ambiguous save/cancel behavior; diagnosing v8 APIs accidentally introduced into a v9 project; verifying dialog open/close and return-focus behavior; distinguishing sorting the visible page from sorting a remote dataset; designing a settings page with optional advanced options; handling long translations and RTL layout; reviewing light/dark and forced-colors behavior; and rejecting an unsupported "official" rule or a nonexistent component.
- [ ] Each task records: input, expected decision properties, relevant `RULE-###` IDs, acceptable alternatives, failure conditions, and scoring criteria.
- [ ] `evaluation/rubric.md` scores across: API/version correctness; task and layout coherence; consistency and responsive behavior; keyboard/accessibility behavior; states, data integrity, and error recovery; evidence accuracy and appropriate uncertainty; maintainability and context cost.
- [ ] `evaluation/results.md` records actual results per task, including observed defects, viewport sizes, and which checks were automated versus manual.
- [ ] Automated accessibility findings are reported as findings only, explicitly not as a conformance claim.
- [ ] Screen-reader checks are reported separately and only if actually performed.
- [ ] The skill-vs-baseline comparison is either run under identical conditions or explicitly marked `untested`.

### Should Have
- [ ] A short script or documented procedure reproduces the evaluation.
- [ ] Results note which failure conditions were triggered.

### Won't Have (Out of Scope)
- Fabricated scores or invented comparisons.
- A claim of accessibility conformance from automated tooling alone.
- A heavyweight agent-comparison harness (AR #2 refinement; RD-07 excludes provider dependency).

---

## Technical Requirements

### Task record

| Field | Meaning |
|-------|---------|
| `id` | `EVAL-###`. |
| `input` | The prompt/scenario shown to the agent. |
| `expectedDecisionProperties` | What a good answer must decide. |
| `rules` | `RULE-###` IDs. |
| `acceptableAlternatives` | Other correct outcomes. |
| `failureConditions` | What makes the answer wrong. |
| `scoring` | How points are awarded. |

### Rubric dimensions and weights

Each dimension scored 0–4 with anchors; unweighted total plus a per-dimension table so a single
failure is visible rather than averaged away.

### Evidence discipline

Every result cites the artifact (fixture run, compile result, axe report, screen capture path) or is
marked untested. Viewport sizes are recorded numerically.

---

## Integration Points

### With RD-06 (Skill Package)
- Tasks are answered using the skill; requirements pin the skill before evaluation.

### With RD-07 (Verification Tooling)
- `verify` must be green before results are recorded; the example gate underpins API-correctness scoring.

### With RD-08 (Fixture App)
- Browser and a11y evidence comes from fixture runs.

---

## Scope Decisions

| Decision | Options Considered | Chosen | Rationale | AR Ref |
|----------|-------------------|--------|-----------|--------|
| Comparison | run vs baseline / harness + untested | lightweight results; comparison untested unless authorized | No provider dependency; no fabrication | AR #6, #20 |
| A11y claims | conformance / findings only | findings only | Automated checks are not conformance | AR #6 |
| Result format | prose / per-task records + rubric | structured records | Reproducible and honest | AR #1 |

---

## Security Considerations

- **Data sensitivity**: Evaluation uses synthetic data only.
- **Input validation**: N/A — evaluation harness, not a service.
- **Authentication & authorization**: N/A.
- **Injection risks**: Task prompts using untrusted content (if any) are treated as data; results never execute skill-provided code outside the sandboxed example gate.
- **Encryption needs**: N/A.
- **Rate limiting**: N/A.
- **Infrastructure**: N/A.

---

## Acceptance Criteria

1. [ ] `evaluation/tasks.md` contains at least twelve tasks, and all twelve named scenarios above are present.
2. [ ] Every task lists input, expected decision properties, relevant rule IDs, acceptable alternatives, failure conditions, and scoring criteria.
3. [ ] `evaluation/rubric.md` defines all seven dimensions with 0–4 anchors.
4. [ ] `evaluation/results.md` records a result for every task, citing an artifact or explicitly marked untested.
5. [ ] No result claims accessibility conformance; automated findings are labeled as findings only.
6. [ ] The model comparison section is either filled with an actual run under identical conditions or clearly marked `untested`.
7. [ ] Observed defects include at least viewport size and the check that found them.
8. [ ] Security requirements verified (synthetic data only; no fabricated evidence).
