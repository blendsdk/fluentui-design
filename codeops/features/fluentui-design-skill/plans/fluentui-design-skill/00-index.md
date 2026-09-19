# fluentui-design-skill Implementation Plan

> **Feature**: An evidence-backed Agent Skill for composing standalone web applications with Fluent UI React v9
> **Status**: Planning Complete
> **Created**: 2026-09-20
> **Implements**: fluentui-design-skill/RD-01, fluentui-design-skill/RD-02, fluentui-design-skill/RD-03, fluentui-design-skill/RD-04, fluentui-design-skill/RD-05, fluentui-design-skill/RD-06, fluentui-design-skill/RD-07, fluentui-design-skill/RD-08, fluentui-design-skill/RD-09, fluentui-design-skill/RD-10
> **CodeOps Artifact Schema**: 1

## Overview

This plan builds `fluentui-design`, an installable Agent Skill that helps a coding agent design,
implement, and review coherent web applications with Fluent UI React v9. The subject is
**application composition** — which surface, where, when, and how it fits the rest of the app — not
component API recall. The plan turns the ten approved requirements (RD-01..RD-10) into a buildable
sequence: a validated evidence catalog, a coverage matrix, reasoned findings and conflicts, an
operational rules catalog, eight application patterns, the skill package itself, a deterministic
verification toolchain, a runnable fixture application, an honest evaluation, and maintenance docs.

The work is knowledge-heavy, so most deliverables are Markdown or JSON rather than runtime code. The
two executable surfaces are small: TypeScript catalog scripts (validators, generator, gates) and a
Vite + React 18 fixture app that proves the patterns and examples. All tooling runs offline; the
`verify` command is the single mechanical oracle for catalog integrity, example correctness, and
documentation drift.

The plan is grounded in the user's brief (`requirements/_draft/fluentui-v9-skill-project-brief.md`),
which supplies the 38-entry seed source catalog and the quality gates, and in the sibling
`fluentui-mcp` repository, which supplies pinned component facts. The skill does not duplicate the
sibling's API documentation; it cross-links it and owns the design/composition layer.

## Minimum-Sufficient Baseline

**Original goal:** Turn the brief into an evidence-backed Agent Skill for Fluent UI React v9
application composition, with verified examples and an evaluation of its usefulness.

**Smallest viable design:** A curated Markdown skill (`SKILL.md` + on-demand references) backed by a
JSON source catalog and a JSON rules catalog with validators, plus a small runnable fixture app.

**Excluded machinery:** No database or hosted service; no runtime server or MCP proxy; no vector
store; no model-provider dependency; no CI pipeline; no repository LICENSE; no workspaces or second
packaging system.

**Approved complexity:** Requirements AR #2 (`Technical (complexity escalation)`) — the Vite + React
18 + TypeScript fixture app, Playwright + axe-core browser/accessibility evidence, and JSON Schema
validators plus a generator. Independently challenged (`Justified`) and approved by the user. Plan
AR #13 re-checked that this plan stays inside that surface.

## Applicable Domain Lenses

Discovery selected two lenses (recorded in `requirements/_draft/discovery-notes.md`); every plan
phase carries them so review clusters match the work:

| Lens | Why it applies |
| ---- | -------------- |
| `web-application` | The skill's subject is browser UI composition (surfaces, states, a11y, responsive behavior) and the fixture is a browser app. |
| `data-and-migration` | Versioned catalogs, stable source/rule/pattern IDs that must survive FluentUI/OS refreshes, and a deliberate re-pin/rollback path. |

## Document Index

| #   | Document | Description |
| --- | -------- | ----------- |
| AR  | [Ambiguity Register](00-ambiguity-register.md) | Zero-Ambiguity Gate decisions (audit trail) |
| 00  | [Index](00-index.md) | This document — overview and navigation |
| 01  | [Requirements](01-requirements.md) | Scope of this plan (thin delta over RD-01..RD-10) |
| 02  | [Current State](02-current-state.md) | What exists today and the gaps to close |
| 03-01 | [Evidence Pipeline](03-01-evidence-pipeline.md) | Source catalog, coverage matrix, findings and conflicts (RD-01..RD-03) |
| 03-02 | [Rules and Patterns](03-02-rules-and-patterns.md) | Rules catalog and the eight patterns (RD-04..RD-05) |
| 03-03 | [Skill Package](03-03-skill-package.md) | `SKILL.md`, references, decision index, mirror (RD-06) |
| 03-04 | [Verification Tooling](03-04-verification-tooling.md) | Generator, validators, gates, `verify` (RD-07) |
| 03-05 | [Fixture App](03-05-fixture-app.md) | Vite + React 18 application and its tests (RD-08) |
| 03-06 | [Evaluation](03-06-evaluation.md) | Tasks, rubric, recorded results (RD-09) |
| 03-07 | [Maintenance and Docs](03-07-maintenance-and-docs.md) | Refresh workflow, changelog, README, completion (RD-10) |
| 07  | [Testing Strategy](07-testing-strategy.md) | Specification test cases and verification |
| 99  | [Execution Plan](99-execution-plan.md) | Phases, sessions, and task checklist |

## Quick Reference

### Usage Example

The executor for any task reads its owning document, not this index. For example, Phase 2's rules
work is specified in `03-02-rules-and-patterns.md`; the expected validator behavior is fixed by the
`ST-*` cases in `07-testing-strategy.md`; the build steps live in `99-execution-plan.md`.

### Key Decisions

| Decision | Outcome | AR Ref |
| -------- | ------- | ------ |
| Toolchain shape | One root ESM npm package; `fixture/` app; one lockfile | AR #2 (plan) |
| TS execution / lint | `tsx` + ESLint flat config with `typescript-eslint` | AR #3 (plan) |
| Schema validation | `ajv` + `ajv-formats`, draft 2020-12 | AR #4 (plan) |
| Pinned facts | Sibling `d595d79`, derived `facts/verified-exports.json` allowlist | AR #5 (plan) |
| `verify` | Full command incl. Playwright + axe; `verify:static` subset | AR #6 (plan) |
| Generated files | Fixed marker line; drift gate compares regeneration | AR #7 (plan) |
| Fixture data | Synthetic `Customer` records | AR #9 (plan) |
| Evaluation | Deterministic evidence; model comparison `untested` | AR #10 (plan) |
| Coverage floors | No fixed count; per-topic/per-rule floors enforced | AR #11 (plan) |
| Test layout | `scripts/__tests__/*.spec.test.ts`; E2E in `fixture/e2e/` | AR #12 (plan) |

## Related Files

Created or modified by this plan:

| Path | Purpose |
| ---- | ------- |
| `package.json`, `package-lock.json`, `tsconfig.json`, `eslint.config.js`, `vitest.config.ts`, `playwright.config.ts` | Root toolchain |
| `sources/sources.json`, `sources/sources.schema.json`, `sources/sources.md` | Source catalog + schema + generated view (RD-01) |
| `facts/verified-exports.json`, `scripts/extract-facts.ts` | Derived allowlist from the pinned sibling schema (plan AR #5) |
| `research/coverage.md`, `research/findings.md`, `research/conflicts.md` | Analysis artifacts (RD-02, RD-03) |
| `rules/rules.json`, `rules/rules.schema.json`, `rules/rules.md` | Rules catalog + schema + generated view (RD-04) |
| `skill/SKILL.md`, `skill/references/**` | The skill package (RD-05, RD-06) |
| `.agents/skills/fluentui-design/**` | Generated mirror of `skill/` (RD-06) |
| `scripts/*.ts`, `scripts/__tests__/**` | Generator, validators, gates, and their tests (RD-07) |
| `fixture/**` | Runnable Vite + React 18 app and E2E specs (RD-08) |
| `evaluation/tasks.md`, `evaluation/rubric.md`, `evaluation/results.md` | Evaluation set and results (RD-09) |
| `README.md`, `CHANGELOG.md`, `MAINTENANCE.md`, `COMPLETION-REPORT.md` | Docs and close-out (RD-10) |
| `AGENTS.md` | Name the `verify` command and the generated directories |
| `codeops/features/fluentui-design-skill/requirements/_draft/fluentui-v9-skill-project-brief.md` | Vendored read-only seed input |
