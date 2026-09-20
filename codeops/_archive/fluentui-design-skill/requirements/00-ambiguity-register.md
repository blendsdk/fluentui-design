# Ambiguity Register: fluentui-design-skill Requirements

> **Status**: ✅ GATE PASSED — all 21 items resolved
> **Last Updated**: 2026-09-20 01:05
> **Authority mode**: Normal mode (no `--auto-design` invoked); one Complexity Escalation packet approved directly by the user
> **CodeOps Artifact Schema**: 1

## Register

| # | Category | Ambiguity / Gap | Options Presented | User Decision | Status |
|---|----------|-----------------|-------------------|---------------|--------|
| 1 | Scope | Full brief in v1 vs. a prioritized slice | Full phased / core slice / research-only | User accepted recommendation: **full brief, executed in phases** | ✅ Resolved |
| 2 | Technical (complexity escalation) | Fixture app + browser automation + validators add dependencies and support frameworks | smaller / approve larger / revise / defer | User: **"i approve"** (direct approval of the larger option) | ✅ Resolved |
| 3 | Technical | Generation model: generated vs. hand-authored vs. hybrid | generated / hand-authored / hybrid | User accepted recommendation: **hybrid — JSON catalogs canonical; deterministic generator emits the index and validates references; pattern/reference prose authored** | ✅ Resolved |
| 4 | Integration points | Skill identity, install target, routing vs. sibling `fluentui` skill | in-repo only / in-repo + install on request / install always | User accepted recommendation: **name `fluentui-design`; build under `skill/`; copy to `.agents/skills/fluentui-design/`; install to `~/.agents/skills/` only on explicit request; cross-link the sibling skill** | ✅ Resolved |
| 5 | Security & compliance | Retention/redistribution of Fluent/Microsoft/Teams/W3C content | summaries+links / retain excerpts / retain screenshots | User accepted recommendation: **concise original summaries + canonical links + locators only; no screenshot retention unless terms permit; Figma recorded inaccessible** | ✅ Resolved |
| 6 | Non-functional | Can a skill-vs-baseline model comparison run? | run comparison / harness only, mark untested | User accepted recommendation: **deliver the harness and mark comparative effectiveness untested unless a provider is authorized; report only recorded evidence** | ✅ Resolved |
| 7 | Naming & terminology | Repository layout / directory names | proposed layout / other | User accepted recommendation: **`sources/`, `rules/`, `research/`, `skill/`, `fixture/`, `evaluation/`, `scripts/`** | ✅ Resolved |
| 8 | Data & state | Version pin reconciliation (9.74.7 vs. sibling schema commit) | pin to sibling commit / re-scrape / track latest | User accepted recommendation: **pin facts to the sibling schema commit; record the corresponding package version; re-pin deliberately** | ✅ Resolved |
| 9 | Naming & terminology | Stable ID schemes | brief prefixes only / new schemes | User accepted recommendation: **canonical `SRC-###` (sources), `RULE-###` (rules), `PAT-###` (patterns); retain the brief's seed IDs as a `seedId` alias** | ✅ Resolved |
| 10 | Data & state | Catalog storage format | JSON+Schema / YAML / SQLite | User accepted recommendation: **JSON canonical + JSON Schema validators; no SQLite** (also constrained by the brief: no external DB service) | ✅ Resolved |
| 11 | Behavioral | Fixture data source and persistence | in-memory / mock server / real backend | User accepted recommendation: **in-memory sample data; no backend or database** | ✅ Resolved |
| 12 | Integration points | How the skill consumes the sibling API skill | live dependency / pinned snapshot / duplicate facts | User accepted recommendation: **pinned schema snapshot for facts; cross-link component references by name/path; no live coupling and no duplication of API docs** | ✅ Resolved |
| 13 | UX & presentation | Authoritative UI wording guidance | Microsoft Writing Style Guide / ad hoc | Brief-specified: **Microsoft Writing Style Guide** | ✅ Resolved |
| 14 | Security & compliance | Fixture-app security posture | implement auth / demo client validation only | User accepted recommendation: **client-side validation demo only; documented server-side validation guidance is the skill's job, not the fixture's; no auth in the fixture** | ✅ Resolved |
| 15 | Non-functional | Context budget and offline use | bounded entry point / embed corpus | Brief-specified: **`SKILL.md` ~200–300 lines; topic references loaded on demand; skill usable offline from bundled references** | ✅ Resolved |
| 16 | Feature gaps | Simpler public-facing pages | always app shell / include concise guidance | Brief-specified: **include concise public-page guidance; never force a dense app shell onto a content site** | ✅ Resolved |
| 17 | Edge cases | RTL, long translations, forced colors, reduced motion, zoom/reflow | in scope / deferred | Brief-specified: **in scope across rules, patterns, and fixture tests** | ✅ Resolved |
| 18 | Behavioral | Permission / read-only states: skill vs. fixture | skill only / fixture only / both | User accepted recommendation: **skill covers permission/read-only patterns; fixture demonstrates an in-memory permission flag** | ✅ Resolved |
| 19 | Technical | Fixture build tool and package manager | Vite+npm / Next+npm / Create React App | User accepted recommendation (part of AR #2): **Vite + React 18 + TypeScript with an npm lockfile** | ✅ Resolved |
| 20 | Integration points | Evaluation without a model provider | require provider / deterministic rubric + untested comparison | User accepted recommendation (aligned with AR #6): **deterministic rubric; comparison marked untested unless a provider is authorized** | ✅ Resolved |
| 21 | Non-functional | Determinism of generated artifacts | best-effort / byte-reproducible | User accepted recommendation: **sorted inputs, LF endings, no timestamps in generated content; a drift gate compares regenerated output** | ✅ Resolved |

## Complexity escalation record (AR #2)

```text
Original goal: produce the evidence-backed FluentUI v9 design/composition Agent Skill, including
  verified examples and a usefulness evaluation, per the master brief.
Extra system or support code: runnable fixture app (Vite + React + TypeScript, npm lockfile),
  browser automation (Playwright Chromium + axe-core), TypeScript generator/validator scripts with
  JSON Schemas for sources.json and rules.json, and an evaluation harness (tasks + rubric).
Why it may be needed: the brief explicitly requires a runnable fixture app with pinned dependencies,
  browser interaction and accessibility checks, catalog/rule validation scripts, and actual
  evaluation results; without them the brief's quality gates cannot be met.
Evidence: master brief sections 9, 10, 11, 12; the repository had no toolchain at start (empty);
  Node 22 + npm/pnpm/yarn present; sibling fluentui-mcp demonstrates the pinned-schema reuse pattern.
Smallest solution that still works: typecheck-only examples (no runnable app, no browser tooling),
  hand-authored catalogs with no schema validators, and a written review instead of an evaluation.
Extra cost: four devDependency groups (build, test, browser automation, accessibility), a fixture
  app tree, generator/validator scripts, a lockfile, and ongoing maintenance.
Independent verdict: Justified — the smallest proposal fails the brief's own gates ("core example
  workflows have been exercised", "focused browser interaction tests", "automated accessibility
  checks where available"); every larger element maps to an explicit deliverable. Optional
  refinement: drop the eval "harness" framing — record tasks, rubric, and actual results via a short
  script or a documented run — to remove automation ceremony that the brief does not require.
Direct user decision: approved larger (user: "i approve").
Post-verdict refinement adopted: keep the fixture app, Playwright + axe, and the schemas/validators;
  keep evaluation lightweight (tasks + rubric + actual results, script or documented run), not an
  automated agent-comparison harness.
```

## Resolution notes

- **AR-2** is the only complexity escalation; the user issued a direct choice on the single visible
  packet, and the independent challenger returned `Justified` before that choice was recorded.
- All other rows were resolved by the user's explicit bulk acceptance ("i approve") of the
  recommendations presented with the packet, or were fixed by the brief itself.
- No row is silently deferred; there are no `⏸ Deferred` rows.
