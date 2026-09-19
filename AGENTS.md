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
| API-fact source | `fluentui-mcp` enhanced schema, repo commit `fdf755c` (read-only dependency) |

Update this table deliberately when the baseline is re-pinned; record the change in the feature's
plan or an ADR.

## Commands

The toolchain is not scaffolded yet, so no build, test, or verify command is defined. Add the
authoritative `verify` command here (via the `analyze-project` skill) as soon as manifests exist.
Do not invent commands.

## Layout

- `codeops/` — CodeOps artifacts (nested layout).
- `codeops/features/<feature>/` — per-feature requirements, plans, and roadmaps.
- Source, research, and skill output directories are defined by the feature plan.

## Generated files

None yet. Once the skill generator and validators exist, list their output directories here so
agents do not hand-edit them.

## CodeOps

| Item | Location |
| --- | --- |
| Layout marker | `codeops/.codeops.yml` (nested; schema 1) |
| Policy/routing | `codeops/codeops.json` |
| Portfolio roadmap | `codeops/00-roadmap.md` |
| Requirements | `codeops/features/<feature>/requirements/` |
| Plans | `codeops/features/<feature>/plans/` |
<!-- CODEOPS-PROJECT:END -->
