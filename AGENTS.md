# AGENTS.md

<!-- CODEOPS-PROJECT:START -->
## Project

`fluentui-design` is a research-to-skill project. It produces an evidence-backed **Agent Skill**
that helps a coding agent design, implement, and review coherent standalone web applications with
**Fluent UI React v9**. The central problem is *application composition* — which surface to use,
where it belongs, and how it works with the rest of the app — not component API recall.

The skill is a **separate, complementary** artifact to the API-focused `fluentui` skill generated
by the sibling `fluentui-mcp` repository. This project owns the sourced design/composition layer
(rules, patterns, evidence); it consumes the API skill's pinned facts instead of re-scraping them.

## Version baseline

| Item | Value |
|------|-------|
| UI library | `@fluentui/react-components` **9.74.7** (latest stable at research date 2026-09-19) |
| React peer range | `>=16.14.0 <20.0.0` |
| API-fact source | `fluentui-mcp` enhanced schema at repo commit `d595d79` (read-only dependency); facts re-pinned deliberately, not re-scraped |

Update this table deliberately when the baseline is re-pinned; record the change in the feature's
plan or an ADR.

## Commands

The root package owns the toolchain. One command is authoritative:

| Command | Purpose |
|---------|---------|
| `npm run verify` | Full verification: typecheck → lint → unit tests → catalog/skill/gate checks → Playwright + axe. Use before declaring work done. |
| `npm run verify:static` | Browser-free subset of `verify`; use for fast inner-loop checks. |
| `npm run typecheck` | `tsc --noEmit` over scripts and configs. |
| `npm run lint` | ESLint over the repository. |
| `npm run test` | Vitest unit tests under `scripts/__tests__/`. |
| `npm run test:e2e` | Playwright browser tests under `fixture/e2e/` (install Chromium once with `npx playwright install chromium`). |

`verify` needs no network and no model provider. Run it after every change and before every commit.

## Layout

- `codeops/` — CodeOps artifacts (nested layout).
- `codeops/features/<feature>/` — per-feature requirements, plans, and roadmaps.
- `scripts/` — TypeScript validators, generator, and gates; tests in `scripts/__tests__/`.
- `sources/`, `rules/`, `research/`, `facts/` — JSON catalogs and analysis artifacts.
- `skill/` — the authored Agent Skill (`SKILL.md` + `references/`).
- `fixture/` — Vite + React 18 application and its Playwright specs.
- `evaluation/` — evaluation tasks, rubric, and recorded results.

## Generated files

Never hand-edit these; run `npm run generate` and let the drift gate (`npm run generate:check`)
catch divergence.

| Path | Built from |
|------|-----------|
| `sources/sources.md` | `sources/sources.json` |
| `rules/rules.md` | `rules/rules.json` |
| `skill/references/index.md`, `skill/references/rules/index.md` | catalog ids and pattern frontmatter |
| `.agents/skills/fluentui-design/**` | byte-identical mirror of `skill/` |

Generated files start with a `<!-- GENERATED FILE — DO NOT EDIT` marker.

## CodeOps

| Item | Location |
| --- | --- |
| Layout marker | `codeops/.codeops.yml` (nested; schema 1) |
| Policy/routing | `codeops/codeops.json` |
| Portfolio roadmap | `codeops/00-roadmap.md` |
| Requirements | `codeops/features/<feature>/requirements/` |
| Plans | `codeops/features/<feature>/plans/` |
<!-- CODEOPS-PROJECT:END -->
