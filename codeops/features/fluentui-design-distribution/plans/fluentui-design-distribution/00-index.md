# fluentui-design Distribution Implementation Plan

> **Feature**: Publish the skill as the npm package `fluentui-design` with an installer CLI, release tooling, CI, and a public GitHub repository.
> **Status**: Planning Complete
> **Created**: 2026-09-21
> **Implements**: fluentui-design-distribution/RD-01
> **CodeOps Artifact Schema**: 1

## Overview

The skill is complete but only usable by manual copy. This plan adds the packaging layer that
turns it into an installable npm package. It mirrors the proven `fluentui-skill` mechanism from
`fluentui-mcp`: a compiled TypeScript CLI, an atomic installer that writes a version marker, a
version-integrity check, a conventional-commit release tool, and GitHub Actions workflows.

Nothing in the skill content changes. The npm payload is assembled from the committed
`.agents/skills/fluentui-design/` mirror, so the published skill is byte-identical to the
repository tree.

## Minimum-Sufficient Baseline

**Original goal:** make the skill installable with one command and give the maintainer a reviewed
release path.

**Smallest viable design:** port the sibling's installer, version check, and release tool with the
skill name changed to `fluentui-design`; assemble from the existing mirror; reuse the existing
`npm run verify` gate.

**Excluded machinery:** no monorepo, no bundler, no new test runner, no container, no hosting
service, no runtime dependencies. The fixture and research artifacts stay out of the tarball.

**Approved complexity:** CI and release workflows are the requested feature (parity with the
sibling), not extra machinery — see requirements AR #2 and AR #8. No `Technical (complexity
escalation)` entries were raised.

## Document Index

| #   | Document | Description |
| --- | -------- | ----------- |
| AR  | [Ambiguity Register](00-ambiguity-register.md) | Zero-Ambiguity Gate decisions (audit trail) |
| 00  | [Index](00-index.md) | This document — overview and navigation |
| 01  | [Requirements](01-requirements.md) | Delta view of the implemented RD |
| 02  | [Current State](02-current-state.md) | Analysis of the current packaging state |
| 03-01 | [Packaged CLI and Installer](03-01-packaged-cli-and-installer.md) | Manifest, CLI, installer |
| 03-02 | [Build, Assemble, and Integrity](03-02-build-assemble-and-integrity.md) | Build, assemble, version check, release tool |
| 03-03 | [Release, CI, and Repository](03-03-release-ci-and-repository.md) | Workflows, docs, GitHub repository |
| 07  | [Testing Strategy](07-testing-strategy.md) | ST cases and verification |
| 99  | [Execution Plan](99-execution-plan.md) | Phases, sessions, and task checklist |

## Quick Reference

### Usage Examples

```bash
npx -y fluentui-design skill install        # install into detected agent skill dirs
npx -y fluentui-design skill status         # show the installed version
npx -y fluentui-design skill uninstall      # remove the installed skill
npm run assemble                            # build skills/fluentui-design from the mirror
npm run check:version                       # assert one version source
node scripts/release.mjs release --type auto --tag latest
```

### Key Decisions

| Decision | Outcome |
| -------- | ------- |
| Distribution mechanism | Full parity with `fluentui-skill` (AR #2) |
| Payload source | `.agents/skills/fluentui-design/` mirror (AR #3) |
| CLI | `src/` compiled by `tsc` to `dist/` (AR #4) |
| Versioning | Conventional-commit release tool with baseline injection (AR #13) |
| Repository | public `blendsdk/fluentui-design`, `main` (AR #6) |

## Related Files

Created: `src/bin.ts`, `src/skill/install-skill.ts`, `tsconfig.build.json`, `scripts/assemble.ts`,
`scripts/check-version.mjs`, `scripts/release.mjs`, `.github/workflows/ci.yml`,
`.github/workflows/release.yml`, `LICENSE`, and the new test files.

Modified: `package.json`, `tsconfig.json`, `.gitignore`, `scripts/lib/skill.ts` (walk skip),
`README.md`, `MAINTENANCE.md`.
