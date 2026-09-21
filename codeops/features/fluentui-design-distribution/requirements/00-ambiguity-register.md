# Ambiguity Register: fluentui-design distribution & installation

> **Status**: ✅ GATE PASSED — all 20 items resolved
> **Last Updated**: 2026-09-21 11:32

| # | Category | Ambiguity / Gap | Options Presented | User Decision | Status |
|---|----------|-----------------|-------------------|---------------|--------|
| 1 | Scope | Is this a feature with an RD, or a standalone plan? | Feature + RD first / standalone plan | User: create an RD first | ✅ Resolved |
| 2 | Technical | Which distribution mechanism? | A1 full parity / A2 lightweight / A3 git-only | User: A1 full parity — compiled CLI, npm publish | ✅ Resolved |
| 3 | Technical | Which tree is the npm tarball assembled from? | `.agents` mirror / `skill/` tree | User: the `.agents/skills/fluentui-design` mirror | ✅ Resolved |
| 4 | Naming | Where does the installer CLI source live? | `src/` compiled to `dist/` / `scripts/cli/` | User: `src/` compiled to `dist/` | ✅ Resolved |
| 5 | Technical | What npm package name? | unscoped `fluentui-design` / scoped `@blendsdk/...` | User: unscoped `fluentui-design` | ✅ Resolved |
| 6 | Scope | GitHub repository and branch? | public / private | User: public `blendsdk/fluentui-design`, push `main` | ✅ Resolved |
| 7 | Integration | Which agent skill directories does the installer detect? | same four clients / `.agents` only | User: the same four (opencode, claude, codex, agents) | ✅ Resolved |
| 8 | Behavioral | How deep does GitHub Actions CI go? | full `verify` / `verify:static` only | User: full `verify` (Playwright + axe) | ✅ Resolved |
| 9 | Behavioral | What does `prepublishOnly` run? | `verify:static` / full `verify` | User: `verify:static` | ✅ Resolved |
| 10 | Technical | Published package `engines.node`? | `>=20` / `>=22` | User: `>=22` | ✅ Resolved |
| 11 | Technical | CI Node version? | Node 22 / Node 24 | User: Node 24 | ✅ Resolved |
| 12 | Technical | Which directories does `check:version` scan? | `src` + `scripts` / also `skill` | User: `src` + `scripts` | ✅ Resolved |
| 13 | Data | Where does the release tool read the changelog baseline? | `facts/freshness.json` / `package.json` pin | User: `facts/freshness.json` | ✅ Resolved |
| 14 | Scope | How far does execution go operationally? | repo + push, publish documented / include first publish | User: repo + push now; first publish documented as manual | ✅ Resolved |
| 15 | Naming | Names for the installed skill dir, marker, and temp/backup prefixes | parity names / alternatives | User accepted recommendation: `fluentui-design/`, `.fluentui-design-skill.json`, `.fluentui-design-skill.tmp-*` / `.bak-*` | ✅ Resolved |
| 16 | Data | Published package version | `0.1.0` / other | User accepted recommendation: `0.1.0` | ✅ Resolved |
| 17 | Technical | Does `generate:check` skip the built `dist/` and `skills/`? | extend walk skip / accept non-fatal warnings | User accepted recommendation: extend the walk skip | ✅ Resolved |
| 18 | Behavioral | Installer write semantics (atomic, marker, refuse unrelated dir, `--link`, `--dry-run`) | parity semantics / reduced set | User accepted recommendation: full parity semantics | ✅ Resolved |
| 19 | Security | Installer threat surface (target path containment, marker display sanitization, no secrets) | parity hardening / minimal | User accepted recommendation: full parity hardening | ✅ Resolved |
| 20 | Scope | Does the npm tarball include `CHANGELOG.md`? | include / exclude | User accepted recommendation: include `CHANGELOG.md` | ✅ Resolved |

### Resolution Notes

**AR-1..AR-14:** Resolved by the user directly in the make-plan Phase 1.1 and make-requirements discovery rounds.

**AR-15..AR-20:** Derived from A1 parity with the sibling `fluentui-mcp`; the user accepted each recommendation.

**Security & compliance review (all RDs):**

- **Data sensitivity:** the CLI handles no end-user data; inputs are CLI arguments and a marker file read back from disk (untrusted).
- **Input validation:** `--target` paths are resolved and joined with the fixed skill directory name; the installer refuses to replace a directory that is not a skill.
- **Auth/authz:** none exposed; the installer runs with the invoking user's filesystem rights.
- **Injection:** no shell or SQL; the marker version string is sanitized before display.
- **Encryption:** N/A — no secrets or PII stored.
- **Rate limiting:** N/A — local CLI.
- **Infrastructure:** CI uses GitHub Actions; npm publishing uses OIDC trusted publishing (no long-lived token).
