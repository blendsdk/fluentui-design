# Changelog

All notable changes to the `fluentui-design` skill are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the skill uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Each release records three things: the skill version, the baseline
`@fluentui/react-components` package version, and the pinned `fluentui-mcp` facts commit. See
[MAINTENANCE.md](MAINTENANCE.md) for the re-pin procedure.

## [0.2.0] - 2026-09-21

### Baseline

| Item | Value |
| --- | --- |
| `@fluentui/react-components` | 9.74.7 |
| `fluentui-mcp` facts commit | d595d79 |

### Fixes

- datagrid: correct the finding kinds and rule provenance

### Documentation

- plan: correct the datagrid coverage progress count
- plan: add the datagrid coverage requirements and plan

### Features

- datagrid: enrich the list pattern and regenerate the skill
- datagrid: add API-grounded grid rules and refresh coverage
- datagrid: add the DataGrid evidence source and findings

## [0.1.2] - 2026-09-21

### Baseline

| Item | Value |
| --- | --- |
| `@fluentui/react-components` | 9.74.7 |
| `fluentui-mcp` facts commit | d595d79 |

### Documentation

- plan: record the validated automated release

## [0.1.1] - 2026-09-21

### Baseline

| Item | Value |
| --- | --- |
| `@fluentui/react-components` | 9.74.7 |
| `fluentui-mcp` facts commit | d595d79 |

### Fixes

- packaging: assert a semver version instead of a fixed one
- test: bind the Playwright preview server to IPv4

### CI

- release: reindex the release workflow

## [0.1.0] - 2026-09-20

### Baseline

| Item | Value |
| --- | --- |
| `@fluentui/react-components` | 9.74.7 |
| React peer range | `>=16.14.0 <20.0.0` |
| `fluentui-mcp` facts commit | d595d79 |

### Added

- Sourced evidence pipeline: a 45-entry source catalog (`SRC-001`..`SRC-045`), an analyzed coverage
  matrix, and a findings/conflicts record.
- Rules catalog with 30 stable rules (`RULE-001`..`RULE-030`), each traced to its evidence.
- Eight application patterns (`PAT-001`..`PAT-008`) with decision routes and a generated reference
  index.
- The `fluentui-design` skill package (`SKILL.md` plus `references/`), mirrored byte-for-byte to
  `.agents/skills/fluentui-design/`.
- Verification tooling: example snippets are type-checked but never executed, secrets are scanned,
  freshness is pinned, and generated output is drift-checked.
- A runnable Vite + React fixture application with Playwright and axe coverage of the list, editor,
  overlays, states, theming, and narrow viewports.
- An evaluation set: 12 fixed tasks, a 7-dimension rubric, and deterministic recorded results, with
  a reproduction gate (`npm run check:evaluation`).

### Replaced guidance history

No guidance has been replaced in the initial release, so this section is empty. It exists now so
that later replacements are appended here rather than edited into history.

When guidance is superseded, add one entry per replaced item in this shape:

```
- RULE-0XX: <what changed>. Reason: <why>. Superseded by: RULE-0YY.
```

The replaced rule keeps its id, and the successor lists it in the successor's `supersedes` array.
The old rule's text also gains a "Superseded by `RULE-0YY`" sentence, so the forward pointer is
visible. Ids are never reused or renumbered. See [MAINTENANCE.md](MAINTENANCE.md) section 6.
