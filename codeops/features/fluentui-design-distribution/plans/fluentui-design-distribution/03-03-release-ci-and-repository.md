# Release, CI, and Repository: fluentui-design Distribution

> **Document**: 03-03-release-ci-and-repository.md
> **Parent**: [Index](00-index.md)

## Overview

This component automates verification and publishing, documents the install path for users and
maintainers, and publishes the repository itself. It ties the package to GitHub and npm so a release
is one reviewed action.

## Architecture

### Current Architecture

There is no `.github/`, no git remote, and the docs describe usage but not installation.

### Proposed Changes

- Add `.github/workflows/ci.yml` and `release.yml`.
- Add an Install section to `README.md` and a release procedure to `MAINTENANCE.md`.
- Add `LICENSE` (MIT).
- Create the public repository and push `main`.

## Implementation Details

### `ci.yml`

| Aspect | Value | AR Ref |
| ------ | ----- | ------ |
| Triggers | `push` to `main`, `pull_request` | — |
| Permissions | `contents: read` | — |
| Node | 24 | #11 |
| Steps | checkout → setup-node → `npm ci` → `npx playwright install --with-deps chromium` → `npm run verify` → `npm pack --dry-run` | #8 |

### `release.yml`

| Aspect | Value | AR Ref |
| ------ | ----- | ------ |
| Trigger | `workflow_dispatch` with `version_type` (`auto\|patch\|minor\|major`) and `dist_tag` (`latest\|next\|beta`) | #13 |
| Validate job | Reject `dist_tag=latest` when the ref is not `main` | #6 |
| Release job permissions | `contents: write`, `id-token: write` | #14 |
| Steps | checkout (full history/tags) → setup-node with registry → install npm ≥11 → `npm ci` → `npm run verify:static` → configure git → `node scripts/release.mjs release --type … --tag … --ci --git-push` | #9, #13, #14 |
| Publish auth | npm trusted publishing (OIDC); no long-lived token | #14 |

### Documentation

- `README.md`: add an `## Install` section with `npx -y fluentui-design skill install`, the options
  table, and the `status`/`uninstall` commands.
- `MAINTENANCE.md`: add a "Releasing the package" procedure covering the workflow dispatch, the
  conventional-commit version rule, the baseline table, and the one-time trusted-publisher setup for
  the first publish.

### Repository

Create `blendsdk/fluentui-design` public, set it as `origin`, and push `main`. The marker already
declares `integrationBranch: main` (`codeops/.codeops.yml`).

## Integration Points

- CI is the authoritative gate; the release workflow relies on it plus `verify:static`.
- The release tool (03-02) is the only publisher.
- `package.json` `repository`/`bugs`/`homepage` point at the new repository (AR #6).

## Error Handling

| Error Case | Handling Strategy | AR Ref |
| ---------- | ----------------- | ------ |
| Release dispatched off `main` with `latest` | Validate job fails with a clear message | #6 |
| npm publish fails | Release job exits non-zero; the commit/tag are not pushed | #14 |
| CI verify fails | Job fails on the offending gate; `npm pack --dry-run` does not run | #8 |

> **Traceability:** every strategy references its requirements AR entry (`../../requirements/00-ambiguity-register.md`).

## Testing Requirements

- Specification tests asserting workflow content and the README install section (ST-22..ST-26).
- Manual verification: `npm pack --dry-run` payload inspection (ST-27, execution-plan Phase 3).
