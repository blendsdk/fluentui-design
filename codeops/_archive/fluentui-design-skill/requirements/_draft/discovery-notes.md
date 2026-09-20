# Discovery Notes — fluentui-design-skill

> **Mode**: Full Discovery (make-requirements)
> **Feature slug**: `fluentui-design-skill`
> **Started**: 2026-09-20
> **Status**: Discovery in progress — awaiting user decisions before RD authoring

## Seed

Source: the user's master brief ("Fluent UI React v9: research-to-skill project brief"),
delivered 2026-09-20. The brief is the authoritative product seed. Its summary:

- Produce a reusable, evidence-backed **Agent Skill** so a coding agent can design, implement, and
  review coherent **standalone responsive web applications** with **Fluent UI React v9**.
- Central problem: **application composition** (which surface, where, when, why, and how it works
  with the rest of the app) — not component API recall.
- Default scope: business/admin apps; React + TypeScript; desktop with tablet/mobile adaptations;
  light/dark themes; keyboard; forced colors; reduced motion; zoom/reflow; localization;
  WCAG 2.2 Level AA as a project quality target; new builds and reviews.
- Deliverables: source catalog (`sources.json` + schema + validator + generated `sources.md`),
  coverage matrix, findings, conflicts, rules catalog (`rules.json` + schema), the skill package,
  a runnable TypeScript fixture app, evaluation tasks + rubric + results, maintenance guide,
  changelog, README.
- Explicit quality gates in brief section 12; explicit "risky simplifications" to reject; stable
  rule IDs; derived recommendations must be visibly identified.

## Reconnaissance facts (verified in this session)

| Fact | Value | Evidence |
|------|-------|----------|
| UI library baseline | `@fluentui/react-components` **9.74.7** (latest) | `npm view` 2026-09-20 |
| React peer range | `>=16.14.0 <20.0.0` | `npm view @fluentui/react-components peerDependencies` |
| Sibling API skill | `fluentui-mcp` already generates the `fluentui` v9 Agent Skill (100 references, pinned to repo commit `fdf755c`) | `fluentui-mcp/skills/fluentui/`, `data/v9/fluentui-schema-enhanced.json` |
| Sibling status | v1 complete (RD-08 done); `maximum-enhancement` is planning-only | `git log`, `plans/fluentui-agent-skill/`, `plans/maximum-enhancement/00-index.md` |
| Reusable facts | Enhanced schema: components, props, slots, stories, examples (4.8 MB) | `data/v9/fluentui-schema-enhanced.json` |
| Web research access | GitHub raw, W3C (WCAG 2.2, APG), Microsoft Learn fetch successfully; `react.fluentui.dev` is a client-rendered SPA (shell only) | `webfetch` probes |
| Toolchain present | Node 22.23, npm 10.9, pnpm 11.16, yarn 1.22, `gh`, git | shell probes |

## Relationship to the sibling skill (direction confirmed)

Build a **new, separate `fluentui-design` skill** that **consumes** the finished v9 API skill's
outputs (pinned enhanced schema for implementation facts; component references by cross-link).
Do not wait for `fluentui-mcp` to finish; do not merge into its generated pipeline. Rationale
recorded in the session (different content type, oracle, cadence, and agent trigger; the sibling
forbids hand-edited generated output).

## Selected domain lenses

Read completely before discovery. Re-evaluate if discovery reveals another domain.

| Lens | Applicable? | Why |
|------|-------------|-----|
| `web-application` | Yes | The fixture app is a browser application; the skill's subject matter is browser UI composition, states, a11y, responsive behavior. |
| `data-and-migration` | Yes | Versioned catalogs and rules; stable rule IDs must survive FluentUI/OS refreshes; the brief mandates compatibility language on refresh ("Do not rewrite stable IDs", version boundary, invalidation path). |
| `compiler-and-language` | No (supporting only) | Example compilation is a verification mechanism, not the system's subject. |
| `distributed-and-concurrent` | No | No threads, queues, replicas, or multi-node behavior. |
| `financial-system` | No | No money, ledger, or pricing. |

## Applicable CodeOps constraints

- Nested layout; feature artifacts under `codeops/features/fluentui-design-skill/`.
- Sub-1.0 project: all source/examples in TypeScript or JavaScript; no external database service.
- Specification vs implementation tests separated (`*.spec.test.*` is the immutable oracle).
- Mandatory documentation on public/exported APIs.
- Security non-negotiables apply to the fixture app if it ever handles input.

## Open ambiguities (AR candidates) — recommendations pending user decision

| # | Category | Ambiguity | Recommended resolution |
|---|----------|-----------|------------------------|
| 1 | Scope / complexity | Is the **full** brief in v1, or a prioritized slice? | Full brief, executed in phases (brief explicitly enumerates the deliverables). |
| 2 | Technical (complexity escalation) | Fixture-app toolchain (Vite + React + TS), browser automation (Playwright + axe), and TS validators/generators add dependencies and support frameworks. | Approve as one batched packet; smallest viable: Vite + React 18 + TS + Vitest, Playwright + axe for browser/a11y evidence. |
| 3 | Technical | Generation model: is the skill **generated** from `sources.json`/`rules.json` by scripts, or hand-authored with JSON as evidence? | Hybrid: catalogs are canonical; a deterministic generator emits the Markdown index and validates references; pattern/reference prose is authored. |
| 4 | Integration | Skill identity, install target, and routing vs. the sibling `fluentui` skill. | Name `fluentui-design`; produce in-repo under `.agents/skills/fluentui-design/`; install to `~/.agents/skills/` only on explicit request; cross-link the API skill; declare design/composition triggers. |
| 5 | Licensing | Retention/redistribution of Fluent/Microsoft/Teams/W3C content; Figma assets inaccessible. | Store concise original summaries + canonical links + locators; retain no screenshots unless terms permit; record Figma as inaccessible. |
| 6 | Evaluation | Can we run a skill-vs-baseline model comparison? | Deliver the harness and mark comparative effectiveness **untested** unless a provider is authorized; report only recorded evidence. |
| 7 | Technical | Repository layout / directory names. | Root: `sources/`, `rules/`, `research/`, `skill/` (source of truth for the skill tree), `fixture/`, `evaluation/`, `scripts/`. |
| 8 | Technical | Version pin reconciliation between `9.74.7` and the sibling schema commit (`fdf755c`). | Pin facts to the sibling schema commit; record the package version it corresponds to; re-pin deliberately. |

## Next step

Present the Ambiguity Register (above) for user decisions, including the batched Complexity
Escalation approval packet (item 2). Author RDs once the gate is open.
