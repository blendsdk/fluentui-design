# Current State: fluentui-design-skill

> **Document**: 02-current-state.md
> **Parent**: [Index](00-index.md)

## Existing Implementation

### What Exists

The repository contains the CodeOps structure and a complete, gate-passed requirements set. There is
**no source code, no package manifest, no toolchain, and no skill package yet** — the project starts
from documentation. The only runnable assets are the CodeOps OpenCode skills/subagents under
`.opencode/` and the vendored brief.

### Relevant Files

| File | Purpose | Changes Needed |
| ---- | ------- | -------------- |
| `AGENTS.md` | Project guidance; currently says "no commands yet" | Name `verify`; list generated directories and the pinned facts commit (plan AR #5, #6) |
| `codeops/.codeops.yml` | Nested layout marker, `integrationBranch: main` | None |
| `codeops/codeops.json` | Strict quality profile; independent review on | None |
| `codeops/features/fluentui-design-skill/requirements/RD-01..RD-10` | Owning requirements | None — read-only inputs |
| `.../requirements/_draft/fluentui-v9-skill-project-brief.md` | Vendored brief with the 38-entry seed catalog | None — read-only input |
| `.../requirements/_draft/discovery-notes.md` | Reconnaissance facts and lenses | None — reference |
| `/home/gevik/workdir/github/fluentui-mcp/data/v9/fluentui-schema-enhanced.json` | Sibling pinned facts (commit `d595d79`, hash `373e64be…78df4aa6`, 5,015,229 bytes) | Read-only; source for the derived allowlist |

### Code Analysis

Nothing to analyze; the repository has no executable code. The relevant existing *pattern* to reuse
is the sibling `fluentui-mcp` skill layout (`SKILL.md` + `references/` + a manifest), which this
project intentionally does **not** copy wholesale because the sibling forbids hand-editing generated
output and this skill owns prose, not API facts (AR #4, #12).

## Gaps Identified

### Gap 1: No toolchain

**Current Behavior:** No `package.json`, no TypeScript, no test runner, no lint.
**Required Behavior:** A root toolchain that typechecks, lints, runs tests, and hosts the scripts
(RD-07, plan AR #2, #3).
**Fix Required:** Phase 0 scaffolds the root package and configuration.

### Gap 2: No evidence or rules catalog

**Current Behavior:** The brief lists 38 seed sources; no structured catalog exists.
**Required Behavior:** `sources.json` + schema + validator, coverage matrix, findings, conflicts,
`rules.json` + schema + validator (RD-01..RD-04).
**Fix Required:** Phases 1–2.

### Gap 3: No skill package

**Current Behavior:** No `SKILL.md` or references.
**Required Behavior:** A bounded entry point plus decision-organized references, mirrored into
`.agents/skills/fluentui-design/` (RD-05, RD-06).
**Fix Required:** Phase 3.

### Gap 4: No verification tooling

**Current Behavior:** No generator, validators, gates, or `verify` command.
**Required Behavior:** Deterministic generation and the reference/example/secret/drift gates (RD-07).
**Fix Required:** Phase 4 (with validators built incrementally in Phases 1–2).

### Gap 5: No runnable proof or evaluation

**Current Behavior:** No fixture app or evaluation artifacts.
**Required Behavior:** A Vite + React 18 fixture with states, focus handling, and axe checks; twelve
evaluation tasks with recorded results (RD-08, RD-09).
**Fix Required:** Phases 5–6.

## Dependencies

### Internal Dependencies

- Phase order: foundation → evidence → rules → skill → tooling → fixture → evaluation → docs.
- Every phase depends on the artifacts of the phases above it (see `99-execution-plan.md`).

### External Dependencies

| Dependency | Version | Use | Notes |
| ---------- | ------- | --- | ----- |
| `@fluentui/react-components` | 9.74.7 | Fixture UI; example-gate type resolution | Peer React `>=16.14.0 <20.0.0` |
| `@fluentui/react-icons` | current 2.x at install | Fixture icons | Exact version recorded by the lockfile |
| `react` / `react-dom` | 18.x | Fixture runtime | Locked |
| `vite`, `@vitejs/plugin-react` | current stable | Fixture build | Locked |
| `vitest` | current stable | Unit tests | Locked |
| `@playwright/test`, `@axe-core/playwright` | current stable | Browser + a11y tests | Chromium only |
| `typescript`, `tsx`, `eslint`, `typescript-eslint` | current stable | Toolchain | Locked |
| `ajv`, `ajv-formats` | current stable | JSON Schema validation | Locked |
| Sibling `fluentui-mcp` schema | commit `d595d79` | Facts allowlist source | Read-only; re-pinned deliberately |

## Risks and Concerns

| Risk | Likelihood | Impact | Mitigation |
| ---- | ---------- | ------ | ---------- |
| Dynamic Storybook/source content is hard to fetch; some rules may have thin evidence | Med | Med | Record explicit `Gap` rows and `blocked` sources; never fabricate (RD-02, RD-03) |
| The example gate must type-check skill code without executing it | Med | High | Compile in-memory with the project's TypeScript API; assert no side effects in a test (RD-07) |
| Pinned sibling schema drifts after re-pin | Low | Med | Record commit + hash in the freshness manifest; re-pin deliberately (plan AR #5, RD-10) |
| Playwright browsers not installed in the environment | Med | Low | Document one-time `npx playwright install chromium`; `verify:static` still proves everything except browser flows (plan AR #6) |
| Coverage floors satisfied shallowly | Med | Med | Manual quality review in Phase 6 and the evaluation rubric (plan AR #11) |
