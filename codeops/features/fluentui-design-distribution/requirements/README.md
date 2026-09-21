# fluentui-design — Distribution & Installation Requirements

> **Feature**: fluentui-design-distribution — npm distribution, installation, and release
> **Status**: Complete
> **Created**: 2026-09-21
> **Architecture**: Node ≥22, TypeScript 5.9 (ESM), npm package with a compiled CLI and committed skill payload
> **CodeOps Artifact Schema**: 1

---

## Overview

This feature makes the `fluentui-design` Agent Skill installable from the public npm registry and
releasable through GitHub Actions. It is the packaging layer only: the skill content, sources,
rules, patterns, fixture, and evaluation are unchanged.

The mechanism mirrors the sibling `fluentui-skill` package in `fluentui-mcp`: one npm package that
ships a compiled installer CLI plus the skill tree, a version-integrity check, a conventional-commit
release tool, and CI/release workflows. The `fluentui-design` skill itself remains the deliverable;
this feature only changes how it reaches a user.

## Minimum-Sufficient Baseline

**Original goal:** Publish the skill so a user can install it with one command, and give the
maintainer a reviewed release path.

**Smallest viable design:** Reuse the working `fluentui-mcp` mechanism directly — the same
installer shape, client table, atomic write, marker, version check, and release tool — with the
skill-name constants changed to `fluentui-design`. Assemble the npm payload from the committed
`.agents/skills/fluentui-design/` mirror, which already exists.

**Excluded support machinery:** no monorepo, no bundler, no new test runner, no container, no
hosting service, and no runtime dependencies. The fixture and research docs stay out of the npm
tarball.

**Approved complexity:** the CI and release workflows are the requested feature (parity with the
sibling), not extra machinery; see AR #2 and AR #8. No `Technical (complexity escalation)` entries.

## Domain Glossary

| Term | Definition |
|------|-----------|
| Agent Skill | A directory containing `SKILL.md` plus references that a coding agent loads on demand. |
| Installer | The `fluentui-design skill` CLI command that copies the packaged skill into an agent's skills directory. |
| Mirror | The committed, byte-identical copy of `skill/` at `.agents/skills/fluentui-design/`, produced by the generator. |
| Marker | `.fluentui-design-skill.json`, written into an installed skill directory to record version and provenance. |
| Assemble | The packaging step that copies the mirror into the git-ignored `skills/fluentui-design/` before publish. |
| Baseline | The pinned `@fluentui/react-components` version and `fluentui-mcp` facts commit recorded for each release. |

## Document Index

| # | Document | Description | Depends On |
|---|----------|-------------|------------|
| **AR** | [Ambiguity Register](00-ambiguity-register.md) | Zero-Ambiguity Gate decisions (audit trail) | — |
| **RD-01** | [RD-01 Distribution, Installation, and Release](RD-01-distribution-installation.md) | The complete requirement for this feature | — |

## Dependency Graph

```
RD-01 (npm distribution, installation, release)
```

A single requirement owns the whole cohesive capability.

## Suggested Implementation Order

| Phase | Documents | Description |
|-------|-----------|-------------|
| **A: MVP** | RD-01 | All accept criteria (AR #1 chose a single RD). |

## Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Distribution | Full parity with `fluentui-skill` | Proven mechanism, one install command (AR #2) |
| Payload source | `.agents/skills/fluentui-design/` mirror | Named the installable mirror by the codebase (AR #3) |
| CLI | `src/` compiled by `tsc` to `dist/` | Matches the sibling; keeps TypeScript checked (AR #4) |
| Versioning | Conventional-commit release tool | One reviewed path from commit to publish (AR #13, #14) |

## How to Use These Documents

1. Pick the requirement document (RD-01).
2. Run the make-plan skill to produce the implementation plan.
3. Run the exec-plan skill to implement it.
