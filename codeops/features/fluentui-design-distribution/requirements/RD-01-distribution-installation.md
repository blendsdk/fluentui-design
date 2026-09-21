# RD-01: npm Distribution, Installation, and Release

> **Document**: RD-01-distribution-installation.md
> **Status**: Draft
> **Created**: 2026-09-21
> **Project**: fluentui-design
> **Depends On**: —
> **CodeOps Artifact Schema**: 1

---

## Feature Overview

The `fluentui-design` skill is complete and committed, but it can only be used by copying
`.agents/skills/fluentui-design/` by hand. This requirement makes the skill installable with one
command and publishable to the public npm registry, mirroring the sibling `fluentui-skill` package
in `fluentui-mcp`.

A single npm package named `fluentui-design` ships a command-line installer (`fluentui-design
skill install`) that copies the packaged skill into the skill directory of a supported coding
agent (OpenCode, Claude Code, Codex, or the shared `.agents/skills` convention). The package also
gains a release tool and GitHub Actions workflows so that a version bump, changelog entry, tag, and
npm publish happen through one reviewed path. This turns a repository-only artifact into a
installable product without changing the skill content itself.

---

## Functional Requirements

### Must Have

- [ ] **Package identity.** The published package declares `name: fluentui-design`, is not
      `private`, declares `license: MIT`, and declares `engines.node: ">=22"` (AR #10).
- [ ] **CLI binary.** `package.json` exposes the binary `fluentui-design` → `dist/bin.js`, built
      from TypeScript under `src/` (AR #4).
- [ ] **Install command.** `fluentui-design skill install` copies the packaged skill into one or
      more agent skill directories: `opencode`, `claude`, `codex`, and `agents` (AR #7).
- [ ] **Status command.** `fluentui-design skill status` reports the installed version per target.
- [ ] **Uninstall command.** `fluentui-design skill uninstall` removes only the installed skill
      directory and leaves every sibling skill untouched.
- [ ] **Atomic install.** An install writes into a temporary sibling directory and renames it over
      the destination, keeping a backup that is restored if the rename fails (AR #18).
- [ ] **Version marker.** Each install writes `.fluentui-design-skill.json` containing the package
      `version`, `source`, and an ISO-8601 `installedAt` timestamp (AR #15).
- [ ] **Replace guard.** The installer refuses to replace a destination directory that contains
      neither a marker nor a `SKILL.md` and exits non-zero with a clear message (AR #18, #19).
- [ ] **Selection options.** `--all`, `--target <dir>` (repeatable), `--project`, `--link`, and
      `--dry-run` are supported; interactive selection happens only on a TTY (AR #18).
- [ ] **Packaging.** `npm run assemble` copies the committed mirror
      `.agents/skills/fluentui-design/` into `skills/fluentui-design/`, which is git-ignored and
      produced by `prepack` (AR #3).
- [ ] **Publish payload.** The npm tarball contains exactly `dist/`, `skills/fluentui-design/`,
      `README.md`, `LICENSE`, and `CHANGELOG.md`; it contains no fixture, `sources/`, `rules/`, or
      `evaluation/` content (AR #20).
- [ ] **Zero runtime dependencies.** React, React DOM, and `@fluentui/*` are development
      dependencies; the published package installs no runtime dependencies.
- [ ] **Version integrity.** `npm run check:version` fails when `package.json`,
      `package-lock.json`, and `package-lock.json#packages[""]` disagree, when the version is not
      plain semver, or when the version literal is hardcoded under `src/` or `scripts/` (AR #12).
- [ ] **Release tool.** `scripts/release.mjs` derives the next version from conventional commits,
      writes `package.json` and `package-lock.json`, prepends a `CHANGELOG.md` section, commits,
      tags `vX.Y.Z`, and publishes with a chosen npm dist-tag.
- [ ] **Changelog baseline.** Each generated changelog section records the package version, the
      pinned `@fluentui/react-components` version, and the pinned facts commit, read from
      `facts/freshness.json` (AR #13).
- [ ] **CI workflow.** On push to `main` and on pull requests, GitHub Actions runs on Node 24,
      installs Chromium, runs `npm run verify`, and runs `npm pack --dry-run` (AR #8, #11).
- [ ] **Release workflow.** A manually dispatched workflow validates the branch (the `latest`
      dist-tag is allowed only from `main`), runs `npm run verify:static`, and invokes the release
      tool, publishing through npm trusted publishing (OIDC) (AR #6, #9).
- [ ] **Repository.** The repository is published as the public GitHub repository
      `blendsdk/fluentui-design`, `origin` is set, and `main` is pushed (AR #6).
- [ ] **License file.** A `LICENSE` file with the MIT text is added at the repository root.
- [ ] **Documentation.** `README.md` gains an Install section describing
      `npx -y fluentui-design skill install` and the options; `MAINTENANCE.md` documents the release
      and re-pin procedure.

### Should Have

- [ ] The installer's `status` output names each target directory so a user can see where the
      skill is installed.

### Won't Have (Out of Scope)

- **The first npm publish** — it requires npm credentials and is performed manually once; the
  workflow and trusted-publisher configuration are documented (AR #14).
- **Shipping the fixture or research artifacts** — the tarball ships only the skill and CLI (AR #20).
- **Any change to skill content, sources, rules, patterns, or the fixture** — this RD changes
  packaging only.

---

## Technical Requirements

### Package manifest

`package.json` is the single source of the package version. Required shape changes (AR #2, #5, #10, #16, #20):

| Field | Value |
| --- | --- |
| `name` | `fluentui-design` |
| `version` | `0.1.0` |
| `private` | removed |
| `license` | `MIT` |
| `engines.node` | `>=22` |
| `bin` | `{ "fluentui-design": "dist/bin.js" }` |
| `files` | `["dist/", "skills/fluentui-design/", "README.md", "LICENSE", "CHANGELOG.md"]` |
| `publishConfig` | `{ "access": "public", "registry": "https://registry.npmjs.org/" }` |
| `repository` / `bugs` / `homepage` | the `blendsdk/fluentui-design` URLs |

`dependencies` become empty; `react`, `react-dom`, `@fluentui/react-components`, and
`@fluentui/react-icons` move to `devDependencies`.

### CLI and installer

The installer is a direct port of `fluentui-mcp`'s `src/skill/install-skill.ts`, with renamed
constants (AR #15):

| Constant | Value |
| --- | --- |
| skill directory name | `fluentui-design` |
| marker file | `.fluentui-design-skill.json` |
| marker `source` | `fluentui-design` |
| temp prefix | `.fluentui-design-skill.tmp-` |
| backup prefix | `.fluentui-design-skill.bak-` |

The client table is the four directories the sibling uses (global \| project):

| Client | Global | Project |
| --- | --- | --- |
| opencode | `~/.config/opencode/skills` | `.opencode/skills` |
| claude | `~/.claude/skills` | `.claude/skills` |
| codex | `~/.codex/skills` | `.codex/skills` |
| agents | `~/.agents/skills` | `.agents/skills` |

Target resolution order: explicit `--target` directories, then `--project` directories, otherwise
every detected client's global directory. A client is detected when its global directory, the
global directory's parent, or its project directory exists.

### Build and assemble

- `tsconfig.build.json` compiles `src/**` to `dist/` as ESM with declarations; the root
  `tsconfig.json` stays `noEmit` for checking.
- `scripts/assemble.ts` copies `.agents/skills/fluentui-design/` to `skills/fluentui-design/`,
  fails when the source lacks `SKILL.md`, and reports the copied file count.
- `.gitignore` ignores `/dist/` and `/skills/`.
- The drift gate's file walk skips `dist/` and `skills/` so a built tree produces no warnings
  (AR #17).

### Version integrity and release

- `scripts/check-version.mjs` reads the three version declarations, rejects non-semver, and scans
  `src/` and `scripts/` for a hardcoded version literal, exempting `CHANGELOG.md`, `package.json`,
  and `package-lock.json`.
- `scripts/release.mjs` supports `version`, `publish`, and `release` subcommands, derives the bump
  from conventional commits since the last tag, and, unlike the sibling, injects the Baseline table
  into each new changelog section from `facts/freshness.json` (AR #13).

### CI and release workflows

- `ci.yml`: `push` to `main` and `pull_request`; Node 24; `npm ci`; `npx playwright install
  --with-deps chromium`; `npm run verify`; `npm pack --dry-run`.
- `release.yml`: `workflow_dispatch` with `version_type` (`auto|patch|minor|major`) and `dist_tag`
  (`latest|next|beta`); a validate job blocks `latest` outside `main`; the release job uses
  `permissions: contents: write, id-token: write` and runs the release tool with `--ci --git-push`.

### Repository

Create `blendsdk/fluentui-design` as a public repository, set `origin`, and push `main`. The
existing `codeops/.codeops.yml` already declares `integrationBranch: main`.

---

## Integration Points

### With the skill package

The packaged skill is the committed mirror `.agents/skills/fluentui-design/`, which the generator
keeps byte-identical to `skill/` (AR #3). This RD consumes that mirror and never edits it.

### With `facts/freshness.json`

The release tool reads `pinned.packageVersion` and `pinned.sourceCommit` to write each release's
Baseline table (AR #13).

### With the existing verify command

`npm run verify` (static gates plus Playwright/axe) is the project's authoritative check and is
reused by CI and by the plan's Verify lines (AR #8).

---

## Scope Decisions

| Decision | Options Considered | Chosen | Rationale | AR Ref |
|----------|-------------------|--------|-----------|--------|
| Distribution mechanism | full parity, lightweight no-build, git-only | Full parity | The sibling mechanism is proven and keeps one install command | AR #2 |
| Packaged skill source | `.agents` mirror, `skill/` | `.agents` mirror | The codebase names it the installable mirror; matches the sibling | AR #3 |
| CLI source location | `src/`, `scripts/cli/` | `src/` → `dist/` | Matches the sibling and keeps TS type-checked | AR #4 |
| Package name | unscoped, scoped | unscoped `fluentui-design` | Available on npm; simplest install command | AR #5 |
| Repo visibility | public, private | public | Enables provenance, issues, and homepage | AR #6 |
| Installer clients | four clients, `.agents` only | four clients | Matches the sibling and covers common agents | AR #7 |
| CI depth | full verify, static only | full verify | The repo's authoritative gate includes browser tests | AR #8 |
| `prepublishOnly` | verify:static, full verify | verify:static | Keeps publishing fast and browser-free | AR #9 |
| Node engine | `>=20`, `>=22` | `>=22` | Matches the repository toolchain | AR #10 |
| CI Node | 22, 24 | 24 | Current LTS in CI | AR #11 |
| Version scan dirs | `src`+`scripts`, also `skill` | `src`+`scripts` | The skill contains no package version | AR #12 |
| Baseline source | freshness.json, package.json | freshness.json | Single pinned source of truth | AR #13 |
| Tarball contents | include/exclude CHANGELOG | include | npm shows the changelog | AR #20 |

> **Traceability:** Every scope decision references the Ambiguity Register entry (AR #) that resolved it. See `00-ambiguity-register.md`.

---

## Security Considerations

- **Data sensitivity:** the CLI handles no end-user data; inputs are CLI arguments and a marker
  file read back from disk (untrusted). Marked N/A for PII.
- **Input validation:** `--target` values are resolved to absolute paths and joined with the fixed
  skill directory name; the destination must be absent, carry a marker, or contain `SKILL.md`, or
  the install is refused.
- **Authentication & authorization:** none exposed; the installer uses the invoking user's
  filesystem rights.
- **Injection risks:** no shell, SQL, or `eval`; the marker version is sanitized to strip control
  and bidi characters before display.
- **Encryption needs:** N/A — no secrets, tokens, or PII are stored.
- **Rate limiting:** N/A — local CLI.
- **Infrastructure:** CI runs on GitHub-hosted runners with `permissions: contents: read` for CI
  and least-privilege `contents: write` + `id-token: write` only in the release job; npm publishing
  uses OIDC trusted publishing with no long-lived token.

---

## Acceptance Criteria

1. [ ] `package.json` has no `private` field, `name` `fluentui-design`, `version` `0.1.0`,
       `license` `MIT`, `engines.node` `>=22`, `bin` mapping `fluentui-design` to `dist/bin.js`,
       and a `files` list exactly `["dist/","skills/fluentui-design/","README.md","LICENSE","CHANGELOG.md"]`; `dependencies` is empty.
2. [ ] `npm run build:cli` produces `dist/bin.js`; `node dist/bin.js --help` exits 0 and prints the
       three `skill` subcommands.
3. [ ] `node dist/bin.js skill install --target <tmp> --dry-run` prints `would install` and creates
       no files under `<tmp>`.
4. [ ] A real install into an empty `<tmp>` creates `<tmp>/fluentui-design/SKILL.md` and
       `<tmp>/fluentui-design/.fluentui-design-skill.json` whose `version` equals the package
       version.
5. [ ] `node dist/bin.js skill status --target <tmp>` exits 0 and prints the installed version;
       on an empty directory it exits 1 and prints `not installed`.
6. [ ] Installing over a directory `<tmp>/fluentui-design` that contains an unrelated file (no
       marker, no `SKILL.md`) exits 1 and prints `refusing to replace unrelated directory`; the
       unrelated file is unchanged.
7. [ ] `node dist/bin.js skill uninstall --target <tmp>` removes `<tmp>/fluentui-design` and leaves
       a sibling skill directory `<tmp>/other-skill/` untouched.
8. [ ] `npm run assemble` copies every file from `.agents/skills/fluentui-design/` into
       `skills/fluentui-design/` and reports the file count; a missing source `SKILL.md` fails.
9. [ ] `npm run check:version` exits 0 when versions agree, and exits 1 with a version-drift
       message when `package-lock.json` disagrees with `package.json`.
10. [ ] Generating a changelog entry from a `feat:` commit prepends a section that contains the
        package version, the `facts/freshness.json` `pinned.packageVersion` value (`9.74.7`), and
        the `pinned.sourceCommit` value (`d595d79`).
11. [ ] `npm pack --dry-run` lists only paths under `dist/`, `skills/fluentui-design/`,
        `README.md`, `LICENSE`, and `CHANGELOG.md`, and lists no file under `fixture/`, `sources/`,
        `rules/`, or `evaluation/`.
12. [ ] `.github/workflows/ci.yml` runs on Node 24, installs Chromium, and runs `npm run verify`
        and `npm pack --dry-run`.
13. [ ] `.github/workflows/release.yml` is `workflow_dispatch`-only with `version_type` and
        `dist_tag` inputs, rejects `dist_tag=latest` outside `main`, and grants `id-token: write`
        only to the release job.
14. [ ] `npm run verify` exits 0 with the new packaging tests included.
15. [ ] The public GitHub repository `blendsdk/fluentui-design` exists, `git remote -v` lists it as
        `origin`, and the `main` branch is present on the remote.
16. [ ] Security requirements verified: install refuses unrelated directories (AC 6) and no secret
        or runtime credential is required by the package.
