# Evaluation

> **Document**: README.md
> **Parent**: [Plan index](../codeops/features/fluentui-design-skill/plans/fluentui-design-skill/00-index.md)
> **Implements**: RD-09

This directory measures the skill's usefulness without a model provider. It holds three documents
and one reproduction gate:

| Document | Purpose |
| --- | --- |
| [tasks.md](tasks.md) | Twelve fixed tasks and the decision properties a good answer must satisfy. |
| [rubric.md](rubric.md) | Seven scoring dimensions with written 0, 2, and 4 anchors. |
| [results.md](results.md) | The recorded results, observed defects, and the comparison status. |

## Reproduction

`npm run check:evaluation` reproduces the deterministic evidence. It verifies that every rule and
pattern the tasks cite exists, and that every result cites an artifact that exists or is marked
`untested` with a reason. It never invokes a model and never executes application code.

## Evidence discipline

Results record what a committed artifact proves, not what an agent answered. No model provider is
authorized, so agent-answer quality and the skill-versus-baseline comparison stay `untested`.
Automated accessibility output is reported as findings only; it is never a conformance claim.
