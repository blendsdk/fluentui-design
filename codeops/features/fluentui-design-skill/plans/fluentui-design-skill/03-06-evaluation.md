# Evaluation: fluentui-design-skill

> **Document**: 03-06-evaluation.md
> **Parent**: [Index](00-index.md)
> **Implements**: RD-09

## Overview

This component measures the skill's usefulness honestly. It defines twelve concrete tasks, a
seven-dimension rubric, and the recorded results. Because no model provider is authorized
(requirements AR #6, #20; plan AR #10), the results record **deterministic evidence** — the skill
contains the governing rules, the fixture demonstrates the behavior, and the reference gate resolves
the cited ids — and mark agent-answer quality and the skill-vs-baseline comparison `untested`.

## Implementation Details

### Task record (`evaluation/tasks.md`)

One `### EVAL-### — <title>` heading per task, followed by a `| Field | Value |` table:

| Field | Meaning |
| ----- | ------- |
| `input` | The prompt/scenario given to the agent. |
| `expectedDecisionProperties` | What a good answer must decide. |
| `rules` | Cited `RULE-###` ids. |
| `acceptableAlternatives` | Other correct outcomes. |
| `failureConditions` | What makes an answer wrong. |
| `scoring` | How points are awarded for this task. |

The twelve required scenarios are those named in RD-09 Must Have, from "customer management list and
editor" through "reject an unsupported official rule or nonexistent component". Additional tasks are
allowed.

### Rubric (`evaluation/rubric.md`)

Seven dimensions, each scored 0–4 with written anchors at 0, 2, and 4:

| Dimension | Focus |
| --------- | ----- |
| API/version correctness | Only verified v9 exports; no v8/v0 mixing. |
| Task and layout coherence | Regions and surfaces fit the task. |
| Consistency and responsive behavior | Repeated patterns agree; narrow layouts hold. |
| Keyboard/accessibility behavior | Focus, names, semantics, announcements. |
| States, data integrity, error recovery | Loading/empty/no-results/error; no lost work. |
| Evidence accuracy and uncertainty | Claims trace to sources; uncertainty stated. |
| Maintainability and context cost | Bounded, non-duplicated guidance. |

The report shows a per-dimension table plus an unweighted total, so one zero is visible rather than
averaged away.

### Results (`evaluation/results.md`)

Per task, a row with `result` (`pass` / `partial` / `fail` / `untested`), the `evidence` artifact it
cites (a fixture run, a compile result, an axe report path, a reference-gate result), and any
observed defect with its viewport size and the check that found it. Rules:

- Automated accessibility findings are labeled **findings**, never conformance.
- Screen-reader checks appear in a separate section and only if actually performed.
- The skill-vs-baseline comparison section is either a real run under identical conditions or the
  literal `untested` with the reason.

### Reproduction

`scripts/evaluate.ts` (or a documented procedure) regenerates the deterministic evidence: it runs the
reference gate over each task's cited rules and records whether the governing rule and pattern exist.
It never invokes a model.

## Error Handling

| Error Case | Handling Strategy | Ref |
| ---------- | ----------------- | --- |
| A task cites a rule that does not exist | Reproduction script reports it; results mark `fail` | RD-09 |
| Agent comparison not run | Section marked `untested` with reason; never fabricated | plan AR #10 |
| Automated a11y violation found | Recorded as a finding with viewport; not a conformance claim | RD-09 |

## Testing Requirements

- A structural test asserts ≥12 tasks and that all twelve named scenarios are present.
- A test asserts the rubric defines all seven dimensions with 0–4 anchors.
- A test asserts every task in `results.md` cites an artifact or is marked `untested`, and that the
  strings "WCAG compliant" / "accessible" never appear as a claim.
