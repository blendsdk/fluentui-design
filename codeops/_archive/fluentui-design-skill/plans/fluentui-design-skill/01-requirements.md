# Requirements: fluentui-design-skill

> **Document**: 01-requirements.md
> **Parent**: [Index](00-index.md)
> **Source**: [RD-01](../../requirements/RD-01-source-catalog.md) … [RD-10](../../requirements/RD-10-maintenance-docs.md) — the OWNING requirements documents

## Scope of this plan (delta view)

This plan implements the full requirement set. The RDs own all functional requirements, technical
requirements, scope decisions, and acceptance criteria; this document is a delta view only.

### In this plan

- **RD-01** Source catalog, JSON Schema, `validate-sources` validator, generated `sources.md`.
- **RD-02** Coverage matrix with Supported/Gap rows and consistency checks.
- **RD-03** Findings with typed authority classes, conflicts, risky-simplification register.
- **RD-04** Rules catalog, schema, validator, actionability lint, generated `rules.md`.
- **RD-05** Eight application patterns and the decision index.
- **RD-06** `SKILL.md`, on-demand references, decision index, `.agents/skills/fluentui-design/` mirror.
- **RD-07** Deterministic generator, reference/example/secret/drift gates, freshness manifest, `verify`.
- **RD-08** Runnable Vite + React 18 + TypeScript fixture app with Playwright + axe tests.
- **RD-09** Twelve evaluation tasks, rubric, recorded results, untested comparison.
- **RD-10** README, maintenance guide, changelog, completion report.

### Deferred / out of this plan

- Repository `LICENSE` and publication/global install — reserved to the user; the plan creates no
  LICENSE and performs no install outside the repository (plan AR #14; requirements AR #4, #5).
- CI pipeline — RD-07 explicitly excludes it; `verify` is local and CI-able only.
- Model-provider evaluation run and skill-vs-baseline comparison — RD-09 marks these `untested`
  unless a provider is authorized (requirements AR #6, #20).

### Applicable Domain Lenses

`web-application` and `data-and-migration` (from discovery). Each execution phase in
`99-execution-plan.md` declares them for review-cluster selection.

## Plan-local decisions

These are decisions this plan makes that the RDs do not already fix. The RDs own requirements; only
plan-level choices appear here.

| Decision | Chosen | AR Ref |
| -------- | ------ | ------ |
| Toolchain shape | One root private ESM npm package; `fixture/` app; one lockfile | AR #2 |
| TS execution / lint | `tsx` runs scripts; ESLint flat config with `typescript-eslint` | AR #3 |
| Schema engine | `ajv` + `ajv-formats`, JSON Schema draft 2020-12 | AR #4 |
| Pinned facts | Re-pin to sibling `d595d79`; commit derived `facts/verified-exports.json` | AR #5 |
| `verify` definition | Full `verify` incl. Playwright + axe; `verify:static` subset | AR #6 |
| Generated-file marker | `<!-- GENERATED FILE — DO NOT EDIT; source: <path> -->` | AR #7 |
| Fixture domain | `Customer` records, ~24 deterministic rows | AR #9 |
| Evaluation execution | Deterministic evidence per task; comparison `untested` | AR #10 |
| Coverage floors | No fixed count; per-topic and per-rule floors | AR #11 |
| Test layout | `scripts/__tests__/*.spec.test.ts` / `*.impl.test.ts`; `fixture/e2e/` | AR #12 |

## Acceptance Criteria

The RDs own the feature acceptance criteria. The plan adds only these integration criteria:

1. [ ] `npm run verify` exits 0 on a clean tree and fails on a deliberately broken catalog, example, reference, secret, or generated file (plan AR #6).
2. [ ] The example gate compiles skill examples against the installed `@fluentui/react-components` 9.74.7 and reports offending imports by name.
3. [ ] The `skill/` tree and `.agents/skills/fluentui-design/` mirror are byte-identical after generation, and the drift gate detects divergence.
4. [ ] `facts/verified-exports.json` records the sibling commit `d595d79` and the source hash `373e64be…78df4aa6`.
5. [ ] Security requirements from each RD are satisfied: no secrets committed, examples are never executed during verification, retrieved content is treated as data, and the fixture demonstrates no unsafe HTML injection.
