# Current State: fluentui-design Distribution

> **Document**: 02-current-state.md
> **Parent**: [Index](00-index.md)

## Existing Implementation

### What Exists

The repository is a working TypeScript toolchain plus the completed skill. It has no packaging,
build-to-`dist`, CLI, version check, release tool, or CI. Key facts verified from the tree:

- `package.json:3` sets `"private": true`, `package.json:2` names the package `fluentui-design`,
  and `package.json:3` leaves the version at `0.0.0`; there is no `bin`, `files`, `license`, or
  `publishConfig` field, and `dependencies` holds the fixture's runtime libraries.
- `tsconfig.json:17` sets `"noEmit": true` and `tsconfig.json:19` includes only `scripts/**` and
  `*.config.ts`; there is no build config.
- The skill is authored at `skill/` and mirrored byte-for-byte to
  `.agents/skills/fluentui-design/` by `scripts/lib/skill.ts:407` (`buildMirrorArtifacts`), gated by
  `scripts/generate.ts:37` (`generate:check`).
- The drift gate's file walk skips only `node_modules` and `.git` (`scripts/lib/skill.ts:363`).
- `vite.config.ts:12` roots the fixture at `fixture/`, so `vite build` writes `fixture/dist` and
  does not collide with a root `dist/`.
- `facts/freshness.json:3` already pins `sourceCommit` `d595d79` and `packageVersion` `9.74.7`.
- `codeops/.codeops.yml` declares `integrationBranch: main`.
- There is no `LICENSE`, no `.github/`, and no git remote (`git remote -v` is empty).
- The sibling `fluentui-mcp` provides a working reference for every piece (see 03 docs).

### Relevant Files

| File | Purpose | Changes Needed |
| ---- | ------- | -------------- |
| `package.json` | Toolchain + package manifest | Remove `private`; add version/license/bin/files/publishConfig/repo; move UI deps to dev; add scripts |
| `tsconfig.json` | No-emit type check | Include `src/**` |
| `.gitignore` | Ignore rules | Add `/dist/` and `/skills/` |
| `scripts/lib/skill.ts` | Generator + drift gate | Skip `dist/` and `skills/` in the walk |
| `README.md` | Skill docs | Add an Install section |
| `MAINTENANCE.md` | Maintainer procedures | Add the release procedure |
| `LICENSE` | Missing | Add MIT text |
| `src/**` | Missing | Add `bin.ts` and `skill/install-skill.ts` |
| `scripts/assemble.ts` | Missing | Copy mirror → packaged dir |
| `scripts/check-version.mjs` | Missing | Version-parity gate |
| `scripts/release.mjs` | Missing | Version bump, changelog, tag, publish |
| `.github/workflows/*` | Missing | `ci.yml` and `release.yml` |

### Code Analysis

`package.json` is currently a private fixture project: shipping it would carry `react`,
`react-dom`, and `@fluentui/*` as runtime dependencies, which `npx fluentui-design` must not do.
Moving them to `devDependencies` keeps the published package dependency-free.

The mirror at `.agents/skills/fluentui-design/` is the installable tree by construction
(`scripts/lib/skill.ts:27` names it the installable mirror). Assembling the npm payload from it
means the published skill cannot drift from the committed one.

## Gaps Identified

### Gap 1: No publishable package

**Current Behavior:** `private: true`, version `0.0.0`, no `bin`/`files`/`license`.
**Required Behavior:** a public, versioned manifest with a CLI entry point and a payload whitelist.
**Fix Required:** 03-01.

### Gap 2: No build or CLI

**Current Behavior:** only `tsc --noEmit`; no executable.
**Required Behavior:** `tsc -p tsconfig.build.json` → `dist/`, invoked as `fluentui-design`.
**Fix Required:** 03-01, 03-02.

### Gap 3: No installer

**Current Behavior:** a user must copy the mirror by hand.
**Required Behavior:** `skill install|status|uninstall` with atomic writes and a marker.
**Fix Required:** 03-01.

### Gap 4: No version or release tooling

**Current Behavior:** version lives only in `package.json`; releases are undefined.
**Required Behavior:** a parity check and a conventional-commit release tool with baseline injection.
**Fix Required:** 03-02.

### Gap 5: No CI, release workflow, or remote

**Current Behavior:** no `.github/`, no remote.
**Required Behavior:** CI, a guarded release workflow, and the public repository.
**Fix Required:** 03-03.

### Gap 6: Drift gate would warn on built trees

**Current Behavior:** the walk visits `dist/` and `skills/`.
**Required Behavior:** those build outputs are skipped.
**Fix Required:** 03-02.

## Dependencies

### Internal Dependencies

- `scripts/lib/skill.ts` constants (`SKILL_DIR`, `SKILL_MIRROR_DIR`) define the mirror location.
- `facts/freshness.json` supplies the changelog baseline.
- `scripts/generate.ts` / `verify:static` are the gate the new pieces plug into.

### External Dependencies

- Node ≥22 built-ins only; the installer has no runtime dependency.
- GitHub Actions (`actions/checkout`, `actions/setup-node`, Playwright install) and npm trusted
  publishing for CI and release.

## Risks and Concerns

| Risk | Likelihood | Impact | Mitigation |
| ---- | ---------- | ------ | ---------- |
| Adding the UI deps to the tarball | Medium | High | Assert empty `dependencies` and the `files` whitelist in ST-4/ST-3 |
| Build output breaking `generate:check` | Medium | Low | Skip `dist/`/`skills/` (AR #17); assert in ST-8 |
| Release tool omitting the baseline | Medium | Medium | Assert the baseline table in ST-20 |
| Version drift between manifest and lockfile | Medium | Medium | `check:version` gate (ST-21) |
| First publish misconfigured for OIDC | Medium | Low | Document the manual first publish (AR #14) |
| Server-side-rendered nothing / no input surface | — | — | Installer safety is the exposure; covered by AR #19 and ST-14 |
