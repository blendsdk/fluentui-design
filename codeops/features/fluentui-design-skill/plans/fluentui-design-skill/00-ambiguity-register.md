# Ambiguity Register: fluentui-design-skill Implementation Plan

> **Status**: ✅ GATE PASSED — all 14 items resolved
> **Last Updated**: 2026-09-20 00:59
> **Authority mode**: Auto-design (`--auto-design`) — eligible technical decisions delegated and recorded; no reserved decision taken
> **Policy version**: 1
> **Root invocation ID**: mp-fds-20260920-0059
> **CodeOps Artifact Schema**: 1

## Register

| # | Category | Ambiguity / Gap | Options Presented | Decision | Status |
|---|----------|-----------------|-------------------|----------|--------|
| 1 | Scope / Integration | Does one plan implement the whole feature or a single RD? | full feature (RD-01..RD-10) / one RD / subset | User directive: plan the `fluentui-design-skill` feature; plan implements **all ten RDs** | ✅ Resolved |
| 2 | Technical | Repository toolchain shape | single root package / npm workspaces / separate packages | Delegated (auto-design): single root private ESM package + `fixture/` app; one lockfile | ✅ Resolved |
| 3 | Technical | Running TypeScript tooling and linting | `tsx` + ESLint / compile with `tsc` then run / Node native strip-types | Delegated (auto-design): `tsx` to run scripts; ESLint flat config + `typescript-eslint` | ✅ Resolved |
| 4 | Technical | JSON Schema validation engine | `ajv` / hand-rolled validator / no validator | Delegated (auto-design): `ajv` + `ajv-formats` (draft 2020-12) | ✅ Resolved |
| 5 | Data & state | Pinned facts source; recorded hash `fdf755c` is the upstream Fluent UI commit embedded inside the schema, not a sibling-repo object | re-pin to HEAD + derived allowlist / vendor 4.8 MB schema / live cross-repo read | Delegated (auto-design): re-pin to sibling `d595d79`; commit a small derived allowlist | ✅ Resolved |
| 6 | Integration | The exact `verify` command | full verify incl. browser / static-only / other | Delegated (auto-design): `verify` (full) + `verify:static` subset | ✅ Resolved |
| 7 | Naming / Format | Marking and refreshing generated files | marker line + drift gate / no marker | Delegated (auto-design): one fixed generated marker; generator removes stale marker files | ✅ Resolved |
| 8 | Data & state | The brief's 38-entry seed catalog is not in the repository | vendor brief / reconstruct from memory / descope seed IDs | Resolved: user supplied the brief path; vendored as a read-only planning input | ✅ Resolved |
| 9 | Data & state | Fixture domain and data model | customers / generic items / products | Delegated (auto-design): `Customer` records, ~24 synthetic rows | ✅ Resolved |
| 10 | Behavioral | How evaluation results are produced without an authorized model provider | deterministic evidence + untested comparison / run a provider / fabricate | Delegated (auto-design): record structural/deterministic evidence; mark agent comparison `untested` | ✅ Resolved |
| 11 | Data & state | Minimum rule/pattern coverage counts | a fixed numeric target / no fixed target with per-topic floors | Delegated (auto-design): no fixed count; coverage floors enforced by the validator | ✅ Resolved |
| 12 | Naming | Test file placement and naming | `scripts/__tests__/*.spec.test.ts` / co-located / single folder | Delegated (auto-design): `*.spec.test.ts` + `*.impl.test.ts` under `scripts/__tests__/`; E2E under `fixture/e2e/` | ✅ Resolved |
| 13 | Technical (complexity escalation) | Does planning add a material support surface beyond approved AR #2? | within approved surface / new escalation packet | Resolved: within AR #2 (build, test, browser, a11y, schema validators); no escalation triggered | ✅ Resolved |
| 14 | Security & compliance | Repository `LICENSE` and publication/global install | decide now / leave to the user | Resolved as a scope boundary: no repository LICENSE is created and no publication occurs; both remain user-owned and appear in no executable task | ✅ Resolved |

## Delegated decision records (auto-design provenance)

```text
AR-2 — Repository toolchain shape
Authority: AI — delegated by --auto-design
Eligibility: internal architecture / build mechanism; no product or scope consequence
Objective: one offline, deterministic toolchain that both validates catalogs and builds the fixture
Decision: a single private ESM npm package at the repo root owns all devDependencies and scripts;
  the Vite app lives in fixture/ and is built/served through root scripts; one package-lock.json
Evidence: RD-07 requires one verify command and a shared pinned package for the example gate;
  RD-01/RD-04 require TypeScript validators; the repo is a single-purpose research-to-skill project
Rejected alternatives: npm workspaces (extra indirection for one app); separate fixture package
  (duplicate installs, two lockfiles)
Strongest counterargument: a root app directory keeps tooling and app concerns separate and better
  mirrors multi-package projects
Confidence: High — would change only if a second deployable app is authorized
Hardening: in-context only (standard stakes); no challenger required
Policy version: 1
Root invocation ID: mp-fds-20260920-0059
Reopen triggers: a second runnable app or a published package is authorized
```

```text
AR-3 — TypeScript execution and linting
Authority: AI — delegated by --auto-design
Eligibility: implementation mechanism / developer tooling
Objective: run TypeScript catalog scripts and enforce written coding standards
Decision: tsx runs scripts/ directly; ESLint flat config with typescript-eslint lints TS/TSX
Evidence: Node 22 runs .ts only with experimental flags and erasable-syntax limits; tsc adds a
  build step before every script; RD-07 verify requires "lint"
Rejected alternatives: tsc build-then-run (slower, stale-dist drift); Node native strip-types
  (experimental, rejects enums/namespaces); no lint step (violates RD-07)
Strongest counterargument: adding tsx + eslint grows the dependency surface
Confidence: High — would change if the repo standardizes on a different runner
Hardening: in-context only
Policy version: 1
Root invocation ID: mp-fds-20260920-0059
Reopen triggers: the tooling standard changes or Node enables stable native TS execution
```

```text
AR-4 — JSON Schema validation engine
Authority: AI — delegated by --auto-design
Eligibility: implementation mechanism for an approved requirement (JSON Schema validators)
Objective: validate sources.json and rules.json against their schemas, offline
Decision: ajv + ajv-formats, JSON Schema draft 2020-12
Evidence: RD-01/RD-04 require JSON Schema files plus validators; the schemas use uri and date formats
Rejected alternatives: a hand-rolled validator (error-prone, re-implements a standard); no runtime
  validation (schemas become decorative and cannot gate)
Strongest counterargument: a hand-rolled structural check needs no dependency and the schemas are small
Confidence: High — would change if only a handful of fields needed checking
Hardening: in-context only
Policy version: 1
Root invocation ID: mp-fds-20260920-0059
Reopen triggers: the schemas move off JSON Schema or ajv is replaced by an approved standard
```

```text
AR-5 — Pinned facts source (corrects a stale hash)
Authority: AI — delegated by --auto-design
Eligibility: data/version mechanism; preserves the AR #8 strategy (pin to the sibling schema commit)
Objective: ground rules/skill facts in the sibling API schema without duplicating API docs
Decision: pin to sibling HEAD d595d79 (sha256 373e64be…78df4aa6 of
  data/v9/fluentui-schema-enhanced.json, identical in worktree and committed tree); commit a small
  derived facts/verified-exports.json (export + subcomponent names + component metadata) produced by
  scripts/extract-facts.ts; validators check componentMapping against it; the example gate
  type-checks against the installed @fluentui/react-components 9.74.7
Evidence: the previously recorded hash fdf755c is the upstream `sources.fluentui.commit` embedded
  inside the sibling schema, not a sibling-repo object (`git cat-file -t fdf755c` -> "Not a valid
  object name"); the sibling HEAD is d595d79 and the schema file hash is 373e64be...; the full schema
  is 5,015,229 bytes (too large to vendor); AR #12 forbids duplication
Rejected alternatives: vendor the 4.8 MB schema (large, duplicates the sibling); read the sibling
  repo at verify time (breaks offline determinism and couples repositories)
Strongest counterargument: the derived allowlist is a second artifact to keep in sync on re-pin
Confidence: High — re-pinning is exactly the AR #8 "re-pin deliberately" procedure
Hardening: in-context only; the change corrects a non-existent hash, not a user decision
Policy version: 1
Root invocation ID: mp-fds-20260920-0059
Reopen triggers: the sibling schema changes at a new pin and the allowlist must be regenerated
```

```text
AR-6 — The verify command
Authority: AI — delegated by --auto-design
Eligibility: implementation mechanism for the approved verification requirement
Objective: one command that proves catalog, skill, and example integrity
Decision: `npm run verify` = typecheck → lint → unit tests → generate --check (drift) →
  check-references → check-examples → scan-secrets → Playwright + axe; `npm run verify:static`
  runs the same minus the browser step (for fast, browser-free loops). AGENTS.md is updated to name
  verify as the project command.
Evidence: RD-07 requires one verify command over those gates; RD-08 says fixture tests run under
  verify; browser binaries are an approved dependency but are installed once, not per run
Rejected alternatives: static-only verify (RD-08 tests would be excluded); two unrelated commands
  with no authoritative one
Strongest counterargument: a browser step makes the authoritative verify slower and environment-bound
Confidence: Med — depends on Playwright browsers being installed; that is documented
Hardening: in-context only
Policy version: 1
Root invocation ID: mp-fds-20260920-0059
Reopen triggers: verify runtime becomes a problem or the browser step is split out
```

```text
AR-7 — Generated-file marker
Authority: AI — delegated by --auto-design
Eligibility: internal format/convention; zero product impact
Objective: make generated files unmistakable and keep them reproducible
Decision: every generated file starts with `<!-- GENERATED FILE — DO NOT EDIT; source: <path> -->`;
  the generator removes stale generated files that still carry the marker, then writes fresh ones;
  SOURCES.md/RULES.md/index.md/mirror are compared by the drift gate
Evidence: RD-07 requires removing stale generated files by a marker line and a byte-reproducible drift gate
Rejected alternatives: no marker (editors cannot tell hand-authored from generated)
Strongest counterargument: a marker slightly pollutes rendered Markdown
Confidence: High
Hardening: in-context only
Policy version: 1
Root invocation ID: mp-fds-20260920-0059
Reopen triggers: a generated artifact cannot carry an HTML comment
```

```text
AR-9 — Fixture domain and data model
Authority: AI — delegated by --auto-design
Eligibility: internal data model for an approved fixture
Objective: exercise list/grid, editor, drawer, dialog, and all runtime states with meaningful data
Decision: a Customer record { id, name, email, status, owner, updatedAt, notes }; ~24 synthetic
  rows with varied lengths and statuses; seeded deterministically
Evidence: RD-09 task 1 names "customer management list and editor"; RD-08 requires long labels and
  multiple states
Rejected alternatives: generic "items" (weaker narrative); products (introduces money semantics)
Strongest counterargument: any synthetic domain would do
Confidence: High
Hardening: in-context only
Policy version: 1
Root invocation ID: mp-fds-20260920-0059
Reopen triggers: the evaluation tasks change domain
```

```text
AR-10 — Evaluation execution and comparative claims
Authority: AI — delegated by --auto-design
Eligibility: implements the acceptance criteria RD-09 already fixed (results may be marked untested)
Objective: honest usefulness evidence without a model provider
Decision: record structural/deterministic evidence per task (the rule/pattern exists, the fixture
  demonstrates the behavior, reference gate resolves the cited rules); mark the skill-vs-baseline
  model comparison `untested`; never claim accessibility conformance
Evidence: AR #6/#20 fix "comparison untested unless a provider is authorized"; RD-09 AC 4/6 permit
  an `untested` result; verification is provider-free
Rejected alternatives: run a provider (not authorized); fabricate scores (forbidden)
Strongest counterargument: without a provider, answer-quality remains unmeasured
Confidence: High — follows RD-09 verbatim
Hardening: in-context only
Policy version: 1
Root invocation ID: mp-fds-20260920-0059
Reopen triggers: a model provider is authorized for evaluation
```

```text
AR-11 — Coverage floors (no fixed numeric target)
Authority: AI — delegated by --auto-design
Eligibility: implementation detail consistent with RD-02/RD-04
Objective: make completeness checkable without inventing quotas
Decision: no fixed rule count; the validator enforces floors: every coverage topic is Supported or
  Gap; every Supported topic cites ≥1 analyzed source and ≥1 rule; every rule cites ≥1 source;
  every pattern cites ≥1 rule
Evidence: the brief rejects "a source count reached" as completeness (section 4); RD-02 defines
  Supported/Gap per row
Rejected alternatives: a numeric rule quota (arbitrary, not evidence-driven)
Strongest counterargument: floors could still be satisfied shallowly
Confidence: Med — quality beyond the floor is reviewed manually
Hardening: in-context only
Policy version: 1
Root invocation ID: mp-fds-20260920-0059
Reopen triggers: review finds coverage too thin to be useful
```

```text
AR-12 — Test file placement and naming
Authority: AI — delegated by --auto-design
Eligibility: internal convention; zero product impact
Objective: separate specification tests (immutable oracle) from implementation tests
Decision: scripts/__tests__/<unit>.spec.test.ts and <unit>.impl.test.ts; fixture E2E specs under
  fixture/e2e/*.spec.ts run by Playwright; a11y assertions live in the E2E specs
Evidence: the coding standards require *.spec.test.* vs *.impl.test.* separation
Rejected alternatives: co-located files (harder to see the oracle set at a glance)
Strongest counterargument: co-location keeps tests next to code
Confidence: High
Hardening: in-context only
Policy version: 1
Root invocation ID: mp-fds-20260920-0059
Reopen triggers: the standards change the test layout
```

## Resolution notes

- **AR-13**: no complexity escalation. Everything planned (root tooling package, `tsx`, ESLint,
  `ajv`, Vitest, Vite, React, Playwright, axe, and the derived facts allowlist) maps to a surface the
  user already approved in the requirements complexity packet AR #2 (build, test, browser automation,
  accessibility, and JSON Schema validators/generator). No new layer, service, infrastructure, or
  general framework is introduced. Auto-design therefore selects the smallest implementation and no
  stop packet is required.
- **AR-14**: repository licensing and publication are reserved to the user. The plan neither creates a
  repository `LICENSE` nor publishes anything; the skill frontmatter `license` field is inherited
  verbatim from the owning requirement RD-06 and is not re-decided here.
- **AR-8**: the seed catalog was the only missing input; the user supplied the brief, now vendored at
  `requirements/_draft/fluentui-v9-skill-project-brief.md`. All other requirements inputs were already
  on disk.
- No `⏸ Deferred` rows. No reserved decision was resolved by the AI. Every delegated row above passed
  the auto-design eligibility boundary and carries complete provenance.
