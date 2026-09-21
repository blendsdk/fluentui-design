# Requirements: fluentui-design Distribution

> **Document**: 01-requirements.md
> **Parent**: [Index](00-index.md)
> **Source**: [RD-01](../../requirements/RD-01-distribution-installation.md) — the OWNING requirements doc

## Scope of this plan (delta view)

### In this plan

- RD-01 Must Have items — package identity, CLI, install/status/uninstall, atomic install, marker,
  replace guard, selection options, packaging, publish payload, zero runtime dependencies, version
  integrity, release tool, changelog baseline, CI, release workflow, repository, license, docs.
- RD-01 Should Have — status names each target directory.

### Deferred / out of this plan

- RD-01 **Won't Have: the first npm publish** — performed manually once; the plan documents the
  trusted-publisher setup and leaves publishing to a follow-up (requirements AR #14).

## Plan-local decisions

| Decision | Chosen | AR Ref |
| -------- | ------ | ------ |
| Verify command for every task | `npm run verify` | PL #1 |
| Source/test/workflow file names | the approved naming set | PL #2 |
| Repository creation placement | executable final task (Phase 4) | PL #3 |
| Installer test isolation | temp directories via injectable `home`/`cwd` | PL #4 |

## Acceptance Criteria

The owning acceptance criteria are in [RD-01 §Acceptance Criteria](../../requirements/RD-01-distribution-installation.md).
This plan adds no plan-local criteria; every spec test case in `07-testing-strategy.md` traces to an
RD-01 criterion or a requirements AR entry.
