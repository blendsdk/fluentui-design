# Ambiguity Register: fluentui-design-distribution plan

> **Status**: ✅ GATE PASSED — all plan-local items resolved; requirements AR-1..AR-20 imported pre-resolved
> **Last Updated**: 2026-09-21 11:32

The requirements-stage register (`../requirements/00-ambiguity-register.md`, AR-1..AR-20) is the
owning record for distribution, naming, security, and scope decisions. It is imported here as
pre-resolved context and is not re-confirmed. Only plan-local decisions are listed below.

| # | Category | Ambiguity / Gap | Options Presented | User Decision | Status |
|---|----------|-----------------|-------------------|---------------|--------|
| 1 | Behavioral | Which command fills every Verify line? | `npm run verify` / other | User: `npm run verify` (per `AGENTS.md:29`) | ✅ Resolved |
| 2 | Naming | File and directory names the plan creates | approve set / adjust | User: approved the naming set (`src/bin.ts`, `src/skill/install-skill.ts`, `tsconfig.build.json`, `scripts/assemble.ts`, `scripts/check-version.mjs`, `scripts/release.mjs`, the `scripts/__tests__/*.spec.test.ts` / `.impl.test.ts` files, `.github/workflows/ci.yml`, `.github/workflows/release.yml`) | ✅ Resolved |
| 3 | Scope | Is repo creation an executable task? | executable final task / documented manual step | User: executable final task | ✅ Resolved |
| 4 | Technical | How are installer tests isolated from the real machine? | temp directories under `os.tmpdir()` / mocked fs | Convention: real objects over mocks; use temp directories and inject `home`/`cwd` (see 07 ST-9..ST-16) | ✅ Resolved |
| 5 | Technical | Where does the plan-local register cite requirements decisions? | import AR-1..20 / restate | Import and cite; this file does not restate them | ✅ Resolved |

### Resolution Notes

**PL-4:** The installer accepts injectable `home`, `cwd`, `isTTY`, `version`, and `sourceDir`, so
tests run against temporary directories without touching the real machine.

### Requirements imports

- AR-2 (full parity) governs the whole mechanism.
- AR-3 (mirror source), AR-4 (CLI location), AR-7 (clients), AR-15 (names) govern component 03-01.
- AR-12 (version scan), AR-13 (baseline), AR-16 (version), AR-17 (drift skip) govern 03-02.
- AR-6 (repo), AR-8/#9 (CI/prepublish), AR-10/#11 (Node), AR-20 (tarball) govern 03-03.
- AR-18 (installer semantics) and AR-19 (installer security) govern 03-01 error handling.
