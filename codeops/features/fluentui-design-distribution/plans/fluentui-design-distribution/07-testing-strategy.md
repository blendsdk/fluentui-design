# Testing Strategy: fluentui-design Distribution

> **Document**: 07-testing-strategy.md
> **Parent**: [Index](00-index.md)

## Testing Overview

### Coverage Goals

| Code type | Target |
| --------- | ------ |
| CLI and installer logic | 90% |
| Build/assemble/version/release tooling | 85% |
| Workflows and docs (asserted by content) | 80% |

- Test names state behavior: `should [expected behavior] when [condition]`.
- End-to-end browser tests are **N/A** for this feature: it adds no UI. The existing Playwright
  suite continues to cover the fixture app.

## 🚨 Specification Test Cases (MANDATORY — NON-NEGOTIABLE)

> Derived exclusively from RD-01 and its Ambiguity Register. Expectations define behavior before
> implementation. The immutable-oracle rule applies: if the implementation disagrees, the
> implementation is wrong.

### Packaging manifest

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|------------------|----------------------------|--------|
| ST-1 | Read `package.json` | `private` absent; `name` `fluentui-design`; `version` is plain semver (`0.1.0` initially, then the released version); `license` `MIT`; `engines.node` `>=22` | RD-01 AC1; AR #5,#10,#16 |
| ST-2 | Read `package.json#bin` | `bin["fluentui-design"] === "dist/bin.js"` | RD-01 AC1; AR #4 |
| ST-3 | Read `package.json#files` | exactly `["dist/","skills/fluentui-design/","README.md","LICENSE","CHANGELOG.md"]` | RD-01 AC1/AC11; AR #20 |
| ST-4 | Read `package.json#dependencies` / `devDependencies` | `dependencies` is empty; `devDependencies` contains `react`, `react-dom`, `@fluentui/react-components`, `@fluentui/react-icons` | RD-01 Tech Req; AR #2 |
| ST-5 | Read `package.json#publishConfig` | `access === "public"` and registry is `https://registry.npmjs.org/` | RD-01 Tech Req; AR #5 |
| ST-6 | Read `tsconfig.build.json` | exists; `outDir === "dist"`; `include` covers `src`; `noEmit` is not true | RD-01 Tech Req; AR #4 |
| ST-7 | Read `LICENSE` | file exists and its text contains `MIT License` | RD-01 Must Have |
| ST-8 | Read `.gitignore` | contains ignore entries for `/dist/` and `/skills/` | RD-01 Tech Req; AR #17 |

### Installer CLI

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|------------------|----------------------------|--------|
| ST-9 | `parseArgs(["install","--target","/x","--link","--dry-run"])` | command `install`; `targets` `["/x"]`; `link` and `dryRun` true | RD-01 AC3; AR #18 |
| ST-10 | `parseArgs(["status","--target"])` | returns an `error` mentioning `--target requires a directory argument` | RD-01 AC5; AR #18 |
| ST-11 | `detectClients` with only `~/.claude` present | includes `claude`; omits clients whose global and project dirs are absent | RD-01 Tech Req clients; AR #7 |
| ST-12 | `resolveTargets` with explicit targets | returns exactly those targets, ignoring `--project` | RD-01 Tech Req; AR #18 |
| ST-13 | `installSkill` into an empty temp dir with version `0.1.0` | returns `installed: true`; `dest` contains `SKILL.md` and `.fluentui-design-skill.json` whose `version` is `0.1.0` | RD-01 AC4; AR #15 |
| ST-14 | `installSkill` with `dryRun: true` | returns `dryRun: true`; target directory is not created | RD-01 AC3; AR #18 |
| ST-15 | `installSkill` over a `fluentui-design/` holding an unrelated file (no marker, no `SKILL.md`) | throws `refusing to replace unrelated directory`; the unrelated file is unchanged | RD-01 AC6; AR #18,#19 |
| ST-16 | `uninstallSkill` on a target with `fluentui-design/` and `other-skill/` present | removes `fluentui-design/`; leaves `other-skill/` in place | RD-01 AC7 |

### Version and release tooling

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|------------------|----------------------------|--------|
| ST-17 | `semverBump("1.2.3","major"|"minor"|"patch")` | `2.0.0` / `1.3.0` / `1.2.4` | RD-01 Tech Req; AR #13 |
| ST-18 | `parseCommit("chore: x")`, `parseCommit("chore(release): x")`, `parseCommit("Merge branch")` | first returns type `chore`; the release commit and merge commit return `null` | RD-01 Tech Req; AR #13 |
| ST-19 | `determineBump` on `feat` / `fix` / breaking `feat!` | `minor` / `patch` / `major` | RD-01 Tech Req; AR #13 |
| ST-20 | `buildChangelogEntry` with baseline `{packageVersion:"9.74.7", sourceCommit:"d595d79"}` | the entry contains the version, `9.74.7`, and `d595d79` in a Baseline table | RD-01 AC10; AR #13 |
| ST-21 | `check:version` with a lockfile version differing from `package.json` | exits 1 and names the drifted declaration | RD-01 AC9; AR #12 |

### Workflows and documentation

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|------------------|----------------------------|--------|
| ST-22 | Read `.github/workflows/ci.yml` | triggers on `main` and pull requests; sets Node 24; installs Chromium; runs `npm run verify` and `npm pack --dry-run` | RD-01 AC12; AR #8,#11 |
| ST-23 | Read `.github/workflows/release.yml` | `workflow_dispatch` with `version_type` and `dist_tag` inputs | RD-01 AC13 |
| ST-24 | Read `release.yml` validate job | rejects `latest` when the ref is not `main` | RD-01 AC13; AR #6 |
| ST-25 | Read `release.yml` permissions | `id-token: write` appears only within the release job | RD-01 AC13; AR #14 |
| ST-26 | Read `README.md` | contains an `## Install` section naming `npx -y fluentui-design skill install` | RD-01 Must Have (docs) |
| ST-27 | Run `npm pack --dry-run` | output lists only paths under `dist/`, `skills/fluentui-design/`, `README.md`, `LICENSE`, and `CHANGELOG.md`, plus the npm-mandatory `package.json`; none under `fixture/`, `sources/`, `rules/`, or `evaluation/` | RD-01 AC11; AR #20 |

> **⚠️ AUTHORING RULE:** expectations come from RD-01. If an expectation cannot be determined from
> the spec, it is an ambiguity for the register, not a guess.

## Test Categories

### Specification Tests (from ST-cases above)

| Test File | ST Cases Covered | Component |
| --------- | ---------------- | --------- |
| `scripts/__tests__/packaging.spec.test.ts` | ST-1..ST-8 | Packaging manifest |
| `scripts/__tests__/install-skill.spec.test.ts` | ST-9..ST-16 | Installer CLI |
| `scripts/__tests__/release.spec.test.ts` | ST-17..ST-21 | Version/release tooling |
| `scripts/__tests__/workflows.spec.test.ts` | ST-22..ST-26 | Workflows and docs |

### Implementation Tests (edge cases, internals)

| Test File | Description | Priority |
| --------- | ----------- | -------- |
| `scripts/__tests__/install-skill.impl.test.ts` | Backup restore on rename failure, leftover temp/backup cleanup, `--link` symlink, malformed marker treated as absent | High |
| `scripts/__tests__/release.impl.test.ts` | `mergeChangelog` ordering, empty commit set, unconventional message → patch, `--dry-run` writes nothing | Medium |
| `scripts/__tests__/assemble.impl.test.ts` | Assemble file count matches source; missing `SKILL.md` fails | Medium |

### Integration Tests

| Test | Components | Description |
| ---- | ---------- | ----------- |
| `verify:static` | version + generate + references gates | `check:version` runs in the static gate and passes on the clean tree |
| `npm pack --dry-run` (manual, ST-27) | manifest + assemble + files | Full publish payload is correct |

### End-to-End Tests

N/A — this feature adds no UI. The existing Playwright suite remains the E2E coverage for the
fixture application.

## Test Data

### Fixtures Needed

- Temporary target directories created with `fs.mkdtempSync(path.join(os.tmpdir(), …))`, removed in
  test teardown.
- A minimal fake skill source: a temp directory containing `SKILL.md`.
- A fake existing install: a temp `fluentui-design/` with a marker or with an unrelated file.

### Mock Requirements

None. Tests use the real filesystem in temporary directories and inject `home`, `cwd`, `isTTY`,
`version`, and `sourceDir` so they never touch the developer's real agent directories.

## Verification Checklist

- [ ] All specification test cases (ST-*) defined with concrete input/output pairs
- [ ] Every ST case traces to a requirement, spec doc, or AR entry
- [ ] Specification tests written BEFORE implementation
- [ ] Specification tests verified to FAIL before implementation (red phase)
- [ ] All specification tests pass after implementation (green phase)
- [ ] Implementation tests written for edge cases and internals
- [ ] All unit / integration tests pass
- [ ] No regressions in the existing suite
- [ ] `npm run verify` exits 0
