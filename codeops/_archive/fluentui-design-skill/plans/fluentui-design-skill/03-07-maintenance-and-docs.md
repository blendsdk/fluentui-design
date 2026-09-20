# Maintenance and Docs: fluentui-design-skill

> **Document**: 03-07-maintenance-and-docs.md
> **Parent**: [Index](00-index.md)
> **Implements**: RD-10

## Overview

This component keeps the skill trustworthy after v1 and closes the project honestly. It defines the
README, the maintenance/refresh procedure, the changelog with a history of replaced guidance, and the
completion report. Stable ids are never renumbered; superseded guidance is appended, not rewritten.

## Implementation Details

### Documents produced

| File | Content |
| ---- | ------- |
| `README.md` | Scope, usage/installation, version baseline, known limitations, division of labor with the sibling `fluentui` skill |
| `MAINTENANCE.md` | The refresh and re-pin procedure (below) |
| `CHANGELOG.md` | Skill versions, baseline package version, pinned facts commit, and a "Replaced guidance history" section |
| `COMPLETION-REPORT.md` | Completed / blocked / untested status per deliverable plus the highest-impact gaps |

### Refresh procedure (`MAINTENANCE.md`)

1. Re-fetch each `analyzed` source; update `retrievalDate`; compare `resolvedUrl` to detect redirects
   and note content changes.
2. Move sources to `blocked`/`obsolete` when they fail; list dependent rules needing review.
3. Re-pin deliberately: run `extract-facts` against the sibling schema, record the new commit and
   `sourceHash`, update the baseline table and `AGENTS.md`, and append a `CHANGELOG.md` entry.
4. Rerun `npm run verify` and the evaluation; update `evaluation/results.md`.
5. Append any replaced guidance to the changelog history with its rule id, reason, and successor.

### ID stability

`SRC-###`, `RULE-###`, and `PAT-###` are permanent. A superseded item keeps its id, the successor
lists that id in the successor's `supersedes` array, and the superseded item's text gains a
"Superseded by" sentence for the forward pointer; ids are never reused or renumbered (RD-10 AC 5).

### AGENTS.md update

The plan updates `AGENTS.md` to name `npm run verify` as the project command, record the pinned
facts commit `d595d79` and package `9.74.7`, and list generated directories
(`sources/sources.md`, `rules/rules.md`, `skill/references/index.md`,
`.agents/skills/fluentui-design/**`) so no agent hand-edits them.

### Completion report

Each RD deliverable is marked `completed`, `blocked` (with the external cause), or `untested` (with
the reason). The report names the highest-impact remaining gaps, for example inaccessible Figma
assets or the untested agent comparison.

## Error Handling

| Error Case | Handling Strategy | Ref |
| ---------- | ----------------- | --- |
| A source disappears or blocks access | Record as `blocked`/`obsolete`; mark dependent rules; note in the completion report | RD-10 |
| A fact changes under a new package version | Re-pin, update affected rules, append history; never rewrite ids | RD-10 |
| A deliverable cannot be produced | Mark `blocked` with the cause; do not claim it complete | RD-10 |

## Testing Requirements

- A test asserts `README.md` is human-readable and contains all four required parts.
- A test asserts every source in `blocked`/`obsolete` has a matching changelog or completion note.
- A test asserts no id appears with two different titles across the generated artifacts (no silent
  renumbering).
