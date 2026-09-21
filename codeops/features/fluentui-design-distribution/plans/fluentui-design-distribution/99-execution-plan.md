# Execution Plan: fluentui-design Distribution

> **Document**: 99-execution-plan.md
> **Parent**: [Index](00-index.md)
> **Last Updated**: 2026-09-21 13:09
> **Progress**: 25/36 tasks (69%)
> **CodeOps Artifact Schema**: 1

## Overview

Add the npm packaging layer: a publishable manifest, a compiled installer CLI, an assemble step, a
version-parity check, a conventional-commit release tool with baseline injection, GitHub Actions
workflows, documentation, and the public repository. The skill content is untouched.

**🚨 Update this document after EACH completed task!**

---

## Implementation Phases

| Phase | Title | Tasks |
| ----- | ----- | ----- |
| 1 | Packaging foundation | 16 |
| 2 | Version integrity and release tooling | 9 |
| 3 | CI, release workflow, and docs | 9 |
| 4 | Repository creation and push | 2 |

**Total: 36 tasks across 4 phases**

> **⚠️ EXECUTION RULE — APPLIES TO EVERY AGENT EXECUTING THIS PLAN:**
>
> The task checkboxes below are the **single source of truth** for progress. Every task line appears
> exactly once. The executing agent MUST:
>
> 1. **On implementation:** mark the task `[~]` with a timestamp — `- [~] 1.1.1 … ⏳ (implemented: YYYY-MM-DD HH:MM)`
> 2. **On verify pass:** promote it to `[x]` — `- [x] 1.1.1 … ✅ (completed: YYYY-MM-DD HH:MM)`
> 3. **Update the Progress header** and Last Updated after EVERY task — never batch. Only `[x]` counts.
> 4. **Resume** by scanning top-to-bottom: the first `[~]` then the first `[ ]`.
> 5. **On blocker:** mark `[!]` and append `Blocked: <short reason>` on the same line.
>
> Timestamps come from `date '+%Y-%m-%d %H:%M'` — never invented.

---

## Phase 1: Packaging Foundation

> **Phase baseline tree**: ae81b309274d20641496b7860c89fdb4a4b2cf80
> **Expected modification set**: `package.json`, `package-lock.json`, `LICENSE`, `.gitignore`,
> `tsconfig.json`, `tsconfig.build.json`, `src/bin.ts`, `src/skill/install-skill.ts`,
> `scripts/assemble.ts`, `scripts/lib/skill.ts`, `scripts/check-facts.ts`, `scripts/extract-facts.ts`,
> `scripts/__tests__/{packaging,install-skill}.spec.test.ts`,
> `scripts/__tests__/{install-skill,assemble}.impl.test.ts`, this plan document.
> Mechanical corrections: `check-facts.ts`/`extract-facts.ts` now read the declared UI-library
> version from either dependency section (the planned move to `devDependencies`); the ST-6 spec
> test reads `compilerOptions.outDir` rather than a non-existent top-level key.
> **Scope mode**: strict
> **Lenses**: quality profile active (strict) — informational; activation stays profile-driven.

### Step 1.1: Specification Tests (red phase)

**Reference**: [03-01](03-01-packaged-cli-and-installer.md) §Manifest/§Installer · [07](07-testing-strategy.md) ST-1..ST-16 · AR #2,#3,#4,#7,#15,#18
**Objective**: Encode the manifest and installer contracts as failing tests before any implementation.

- [x] 1.1.1 [spec-author] Write `scripts/__tests__/packaging.spec.test.ts` for ST-1..ST-8 ✅ (completed: 2026-09-21 11:58)
- [x] 1.1.2 [spec-author] Write `scripts/__tests__/install-skill.spec.test.ts` for ST-9..ST-16 ✅ (completed: 2026-09-21 11:58)
- [x] 1.1.3 Run the two spec files and confirm the red phase — they fail because the manifest fields, `src/`, and `tsconfig.build.json` do not exist yet ✅ (completed: 2026-09-21 11:58)

### Step 1.2: Implementation

**Reference**: [03-01](03-01-packaged-cli-and-installer.md) §Implementation Details
**Objective**: Make the package publishable and implement the installer and assemble step.

- [x] 1.2.1 Update `package.json`: remove `private`; set `version` `0.1.0`, `license` `MIT`, `engines.node` `>=22`; add `bin`, `files`, `publishConfig`, `repository`/`bugs`/`homepage`, keywords; move `react`/`react-dom`/`@fluentui/react-components`/`@fluentui/react-icons` to `devDependencies`; add `build:cli`, `assemble`, `check:version`, `clean`, `prepack`, `prepublishOnly` scripts — `package.json` ✅ (completed: 2026-09-21 12:04)
- [x] 1.2.2 Add the MIT license — `LICENSE` ✅ (completed: 2026-09-21 12:04)
- [x] 1.2.3 Add ignore entries — `.gitignore` (`/dist/`, `/skills/`) ✅ (completed: 2026-09-21 12:04)
- [x] 1.2.4 Add the build config and include `src` in the checking config — `tsconfig.build.json`, `tsconfig.json` ✅ (completed: 2026-09-21 12:04)
- [x] 1.2.5 Implement the CLI dispatcher — `src/bin.ts` ✅ (completed: 2026-09-21 12:04)
- [x] 1.2.6 Implement the installer with renamed constants — `src/skill/install-skill.ts` ✅ (completed: 2026-09-21 12:04)
- [x] 1.2.7 Implement the assemble step — `scripts/assemble.ts` ✅ (completed: 2026-09-21 12:04)
- [x] 1.2.8 Skip `dist/` and `skills/` in the drift walk — `scripts/lib/skill.ts` ✅ (completed: 2026-09-21 12:04)

### Step 1.3: Green Phase and Implementation Tests

**Reference**: [07](07-testing-strategy.md) §Implementation Tests · AR #17,#18
**Objective**: Confirm the spec tests pass, cover internals, and verify the build smoke path.

- [x] 1.3.1 Run the packaging and installer spec tests and confirm the green phase ✅ (completed: 2026-09-21 12:04)
- [x] 1.3.2 Add implementation tests for backup restore, leftover cleanup, symlink, and malformed marker — `scripts/__tests__/install-skill.impl.test.ts` ✅ (completed: 2026-09-21 12:04)
- [x] 1.3.3 Add implementation tests for assemble file count and the missing-`SKILL.md` failure — `scripts/__tests__/assemble.impl.test.ts` ✅ (completed: 2026-09-21 12:04)
- [x] 1.3.4 Build and smoke-test the binary: `npm run build:cli`, `npm run assemble`, then `node dist/bin.js --help` and a `--dry-run` install ✅ (completed: 2026-09-21 12:04)
- [x] 1.3.5 Run `npm run verify` and confirm it passes ✅ (completed: 2026-09-21 12:04)

**Deliverables**:
- Manifest is publishable and dependency-free at runtime
- Installer and assemble implemented and tested
- All verification passing

**Verify**: `npm run verify`

---

## Phase 2: Version Integrity and Release Tooling

> **Phase baseline tree**: fefb8ade3989f2e72c4f127bb7fcf14ff8b3b6d4
> **Expected modification set**: `scripts/check-version.mjs`, `scripts/release.mjs`,
> `scripts/__tests__/release.spec.test.ts`, `scripts/__tests__/release.impl.test.ts`,
> `package.json`, `package-lock.json`, `CHANGELOG.md`, this plan document.
> Mechanical corrections: `.d.mts` type declarations for the `.mjs` tools so the type-checked
> `.ts` tests can import them; no runtime code.
> **Scope mode**: strict

### Step 2.1: Specification Tests (red phase)

**Reference**: [03-02](03-02-build-assemble-and-integrity.md) §Version/§Release · [07](07-testing-strategy.md) ST-17..ST-21 · AR #12,#13
**Objective**: Encode the version and release contracts as failing tests.

- [x] 2.1.1 [spec-author] Write `scripts/__tests__/release.spec.test.ts` for ST-17..ST-21 ✅ (completed: 2026-09-21 12:58)
- [x] 2.1.2 Confirm the red phase — the file fails because `scripts/release.mjs` and `scripts/check-version.mjs` do not exist ✅ (completed: 2026-09-21 12:58)

### Step 2.2: Implementation

**Reference**: [03-02](03-02-build-assemble-and-integrity.md) §Implementation Details
**Objective**: Implement the version-parity gate and the release tool with baseline injection.

- [x] 2.2.1 Implement the version-parity check scanning `src/` and `scripts/` — `scripts/check-version.mjs` ✅ (completed: 2026-09-21 12:58)
- [x] 2.2.2 Implement the release tool with baseline injection from `facts/freshness.json` — `scripts/release.mjs` ✅ (completed: 2026-09-21 12:58)
- [x] 2.2.3 Add `check:version` to `verify:static` — `package.json` ✅ (completed: 2026-09-21 12:58)

### Step 2.3: Green Phase and Implementation Tests

**Reference**: [07](07-testing-strategy.md) §Implementation Tests
**Objective**: Confirm green, cover tooling edges, and verify the gate.

- [x] 2.3.1 Run the release spec tests and confirm the green phase ✅ (completed: 2026-09-21 12:58)
- [x] 2.3.2 Add implementation tests for changelog merge ordering, empty commit set, unconventional messages, and dry-run — `scripts/__tests__/release.impl.test.ts` ✅ (completed: 2026-09-21 12:58)
- [x] 2.3.3 Run `npm run check:version` and confirm it passes on the clean tree ✅ (completed: 2026-09-21 12:58)
- [x] 2.3.4 Run `npm run verify` and confirm it passes ✅ (completed: 2026-09-21 12:58)

**Deliverables**:
- Version parity enforced in the static gate
- Release tool produces a changelog section with the pinned baseline
- All verification passing

**Verify**: `npm run verify`

---

## Phase 3: CI, Release Workflow, and Documentation

> **Phase baseline tree**: _(recorded by the exec-plan skill)_

### Step 3.1: Specification Tests (red phase)

**Reference**: [03-03](03-03-release-ci-and-repository.md) §Implementation Details · [07](07-testing-strategy.md) ST-22..ST-26 · AR #6,#8,#11,#14
**Objective**: Encode the workflow and documentation contracts as failing tests.

- [ ] 3.1.1 [spec-author] Write `scripts/__tests__/workflows.spec.test.ts` for ST-22..ST-26
- [ ] 3.1.2 Confirm the red phase — the file fails because `.github/workflows/` and the README Install section do not exist

### Step 3.2: Implementation

**Reference**: [03-03](03-03-release-ci-and-repository.md) §Implementation Details
**Objective**: Add the workflows and user/maintainer documentation.

- [ ] 3.2.1 Add the CI workflow — `.github/workflows/ci.yml`
- [ ] 3.2.2 Add the guarded release workflow — `.github/workflows/release.yml`
- [ ] 3.2.3 Add the Install section — `README.md`
- [ ] 3.2.4 Add the release procedure — `MAINTENANCE.md`

### Step 3.3: Green Phase and Verification

**Reference**: [07](07-testing-strategy.md) ST-22..ST-27
**Objective**: Confirm green and verify the publish payload.

- [ ] 3.3.1 Run the workflow spec tests and confirm the green phase
- [ ] 3.3.2 Run `npm pack --dry-run` and confirm the payload matches ST-27
- [ ] 3.3.3 Run `npm run verify` and confirm it passes

**Deliverables**:
- CI and release workflows present and asserted
- Install and release docs present
- Publish payload verified

**Verify**: `npm run verify`

---

## Phase 4: Repository Creation and Push

> **Phase baseline tree**: _(recorded by the exec-plan skill)_

### Step 4.1: Publish the repository

**Reference**: [03-03](03-03-release-ci-and-repository.md) §Repository · AR #6, PL #3
**Objective**: Create the public repository and push `main`.

- [ ] 4.1.1 Create the public GitHub repository `blendsdk/fluentui-design`, set it as `origin`, and push `main` using the git-commit skill in push mode
- [ ] 4.1.2 Verify the remote: `git remote -v` lists `origin` and the `main` branch exists on the remote

**Deliverables**:
- Repository exists and `main` is pushed

**Verify**: remote inspection (`git remote -v`; `git ls-remote origin main`)

---

## Review Evidence

### Phase 1 (quality profile: strict; base lenses + security audit)

| Batch | Findings | Ruling | Outcome |
| ----- | -------- | ------ | ------- |
| Initial review | RV-1301 🟠 (`--all`/`isTTY` dead, no TTY selection), RV-1302 🟠 (no backup-restore test) | Fix both | Fixed and verified |
| Initial review | RV-1303, RV-1304, RV-1305, RV-1306, SA-1305 (🟡) | Fix cheap ones | Fixed and verified |
| Initial review | RV-1307, SA-1301–1304 (🟡) | Report-only | Recorded, no action |
| Re-review (fix diff) | RV-1401 🟠 (`main` rejection on Ctrl+D unhandled by `bin.ts`) | Fix, plus RV-1402/RV-1403 coverage | Fixed and verified |
| Re-review (fix diff) | RV-1301, RV-1302, RV-1303, RV-1304, RV-1305, RV-1306, SA-1305 | — | Fixes verified |

Security audit raised no 🔴/🟠 findings. Re-review is the single allowed pass; no third pass was run.

### Phase 2 (quality profile: strict; base lenses + security audit)

| Batch | Findings | Ruling | Outcome |
| ----- | -------- | ------ | ------- |
| Initial review | RV-2301 🔴 (validate `--tag` after mutation), RV-2302 🟠 (`--dry-run` ran the npm lifecycle) | Fix both | Fixed and verified |
| Initial review | SA-2301, SA-2302, SA-2303 (🟡) | Fix | Fixed and verified |
| Initial review | RV-2303, RV-2304, RV-2305, RV-2306, RV-2307, RV-2308, RV-2309, RV-2310 (🟡) | Fix | Fixed and verified |
| Re-review (fix diff) | RV-2401+ | — | No findings; all 13 fixes verified |

Security audit raised no 🔴/🟠 findings. Observation O-1 (exit-code doc mismatch) reconciled by
correcting the `03-02` error table to exit 2. Re-review is the single allowed pass.

---

## Dependencies

```
Phase 1 (packaging + installer)
    ↓
Phase 2 (version + release)
    ↓
Phase 3 (CI + docs)
    ↓
Phase 4 (repository push)
```

---

## Success Criteria

**Feature is complete when:**

1. ✅ All phases completed
2. ✅ `npm run verify` passes
3. ✅ No warnings/errors
4. ✅ No dead code
5. ✅ Security hardened — installer refuses unrelated directories; no runtime credentials; OIDC publishing
6. ✅ Documentation updated (README Install, MAINTENANCE release)
7. ✅ Code reviewed (via the exec-plan review gate)
8. ✅ `blendsdk/fluentui-design` exists with `main` pushed
