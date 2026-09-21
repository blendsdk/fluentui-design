# Content Design: DataGrid Evidence and Grid Rules

> **Document**: 03-content-design.md
> **Parent**: [Index](00-index.md)

## Overview

This is the exact content to add or refresh: one source, five findings, six rules, two coverage
rows, and the `PAT-002` enrichment. It is deterministic; the executor writes these values verbatim.

## Source: SRC-046

| Field | Value |
| ----- | ----- |
| id | `SRC-046` |
| seedId | `null` |
| title | `DataGrid usage and API (v9 docs and package source)` |
| publisher | `Microsoft` |
| requestedUrl | `https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-table` |
| resolvedUrl | `https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-table` |
| category | `component-usage` |
| platform | `web-react` |
| tags | `datagrid, table, sorting, selection, focus, column-resizing, virtualization` |
| applicableVersion | `Fluent UI React v9` |
| publicationDate | `null` |
| retrievalDate | `2026-09-21` |
| status | `analyzed` |
| accessLimitation | `null` |
| exclusionReason | `null` |
| locators | repo-path `packages/react-components/react-table`; repo-path `packages/react-components/react-table/stories/src/DataGrid`; repo-path `packages/react-components/react-table/library/src` |
| summary | The v9 DataGrid documentation and source: declarative column definitions in which sorting requires a `compare` function; controlled or uncontrolled sort and selection state; a composite focus model with a per-cell `focusMode`; preview column resizing with sizing options; selection cells that need accessible names; and virtualization through a community extension that requires a memoized row renderer. No first-party Fluent 2 usage page exists for DataGrid or Table (both return 404), so this source is the authoritative evidence. |
| evidenceRefs | `[]` |
| conflicts | `[]` |
| linkedRuleIds | `[]` |
| licenseNotes | `MIT (Microsoft fluentui repository); summaries only` |

`SRC-040` stays `discovered`.

## Findings: FND-013..FND-017

### FND-013 — Sorting requires a compare function

| Field | Value |
| --- | --- |
| kind | versioned-implementation-fact |
| sources | `SRC-046 (locator: packages/react-components/react-table/stories/src/DataGrid, Sort)`, `SRC-027 (repo-path: packages/react-components/react-table)` |
| versionScope | `@fluentui/react-components 9.74.7` |
| confidence | High — stated in the v9 DataGrid docs and visible in the package source |
| informsRules | `RULE-031` |
| statement | A DataGrid column sorts only when its column definition supplies a `compare` function; enabling `sortable` alone does not make a column orderable, and a column without `compare` remains unsortable. |

### FND-014 — Composite focus and explicit cell focus modes

| Field | Value |
| --- | --- |
| kind | versioned-implementation-fact |
| sources | `SRC-046 (locator: packages/react-components/react-table/stories/src/DataGrid, FocusableElementsInCells and CompositeNavigation)`, `SRC-037 (APG grid pattern)` |
| versionScope | `Fluent UI React v9` |
| confidence | High — documented component behavior |
| informsRules | `RULE-032`, `RULE-033`, `RULE-036` |
| statement | DataGrid uses a composite focus model with one tab stop and roving arrow keys, so a cell containing focusable controls must declare `focusMode` `group` for several controls or `none` for exactly one; a sortable header cell renders its label inside a sort button and therefore must not contain nested focusable controls. |

### FND-015 — Column resizing is a preview capability with overflow consequences

| Field | Value |
| --- | --- |
| kind | versioned-implementation-fact |
| sources | `SRC-046 (locator: packages/react-components/react-table/stories/src/DataGrid, ColumnResizing)`, `SRC-035 (WCAG 2.2 SC 1.4.10 Reflow)` |
| versionScope | `Fluent UI React v9` |
| confidence | Med — the capability is explicitly documented as preview |
| informsRules | `RULE-034` |
| statement | Column resizing is a preview capability driven by `resizableColumns` and `columnSizingOptions`; with auto-fit disabled, columns may grow past the viewport, so resizing needs a container that scrolls horizontally rather than the page. |

### FND-016 — Virtualization is an extension that requires a stable renderer

| Field | Value |
| --- | --- |
| kind | versioned-implementation-fact |
| sources | `SRC-046 (locator: packages/react-components/react-table/stories/src/DataGrid, Virtualization)`, `SRC-027 (repo-path: packages/react-components/react-table)` |
| versionScope | `Fluent UI React v9` |
| confidence | Med — extension guidance, not a core-API guarantee |
| informsRules | `RULE-035` |
| statement | DataGrid does not virtualize on its own; virtualization comes from a community extension that builds components from the row renderer, so the renderer must be memoized with a stable row key, and virtualization is adopted only after measuring a performance need. |

### FND-017 — Sort changes are not reliably announced

| Field | Value |
| --- | --- |
| kind | unresolved |
| sources | `SRC-046 (locator: packages/react-components/react-table/stories/src/DataGrid, Sort)` |
| versionScope | `Fluent UI React v9` |
| confidence | Med — documented known issue; behavior may change in a later release |
| informsRules | `RULE-031` |
| statement | The library does not reliably announce a sort-state change to assistive technology after a sortable header is invoked, even though the interaction follows the sortable-table pattern. |

## Rules: RULE-031..RULE-036

All six share `decisionArea: data-grid` and `supersedes: []`. `componentMapping` uses only exports
present in `facts/verified-exports.json`.

| Rule | Title | Classification | Strength | Applies when | Instruction |
| ---- | ----- | -------------- | -------- | ------------ | ----------- |
| RULE-031 | Give every sortable column a compare function | requirement | must | A grid column is presented as sortable | Add a `compare` function to every column definition whose header is meant to sort; a column without `compare` stays unsortable even when the grid enables sorting. |
| RULE-032 | Set a cell focus mode when the cell contains interactive controls | requirement | must | A grid cell or header cell contains focusable controls | Set `focusMode` `group` on a cell with several focusable elements so Enter enters the cell and Escape returns to it, and set `focusMode` `none` on a cell with exactly one focusable element so that control receives focus directly. |
| RULE-033 | Do not nest focusable controls inside a sortable header cell | requirement | must | A sortable header cell is designed to host extra controls | Keep a sortable header cell free of nested focusable controls; move header actions into a context menu or into the body cells instead. |
| RULE-034 | Treat column resizing as a preview capability with an explicit overflow container | recommendation | should | The design lets users resize columns or show columns wider than the viewport | Enable `resizableColumns` only inside a container that allows horizontal overflow, provide the column sizing options, and keep keyboard resizing available; do not let resizing push the page into two-dimensional scrolling. |
| RULE-035 | Memoize the row render function before virtualizing a grid | requirement | must | The data surface is virtualized to keep large collections responsive | Keep the row render function stable with `useCallback` and a stable row key before enabling virtualization, and virtualize only after measuring a performance need. |
| RULE-036 | Give selection controls a descriptive accessible name | requirement | must | The grid supports row selection with selection cells | Provide an `aria-label` through the selection cell for both the header select-all control and each row control, naming the action and, for the header, the selection scope. |

Per-rule fields:

| Rule | componentMapping.exports | evidenceSourceIds | derivedFromFindings | confidence | positiveExample / antiPattern |
| ---- | ------------------------ | ----------------- | ------------------- | ---------- | ---------------------------- |
| RULE-031 | DataGrid, DataGridHeaderCell, createTableColumn, useTableSort | SRC-046, SRC-027, SRC-037 | FND-013, FND-017 | High | Name and date columns supply `compare` / `sortable` set while a column has no `compare` |
| RULE-032 | DataGrid, DataGridCell, DataGridHeaderCell | SRC-046, SRC-027 | FND-014 | High | Edit button plus menu cell uses `group`; single-link cell uses `none` / buttons in cells with no focus mode |
| RULE-033 | DataGridHeaderCell, DataGridHeader, Menu, MenuTrigger, MenuList, MenuItem, Button | SRC-046 | FND-014 | High | Sortable header is a plain button; actions live in a menu / a filter button nested in a sortable header |
| RULE-034 | DataGrid, DataGridHeaderCell, TableResizeHandle | SRC-046, SRC-035 | FND-015, FND-004 | Med | Many-column grid scrolls in its region and resizes the last column / resizing enabled with auto-fit on a full-width grid |
| RULE-035 | DataGrid, DataGridRow, DataGridCell | SRC-046, SRC-027 | FND-016 | High | 10,000-row log uses a memoized renderer and stable id key / inline arrow passed as the row renderer |
| RULE-036 | DataGridSelectionCell, Checkbox, TableSelectionCell | SRC-046, SRC-035 | FND-014 | High | Header labelled "Select all rows on this page", rows "Select row <name>" / naked checkboxes with no names |

Each rule also records: `decision`, `exceptions`, `notApplicableWhen`, a `rationale`, the
consequence fields (`layoutConsequences`, `responsiveConsequences`, `accessibilityImplications`,
`stateImplications`), `locators`, `unresolved` (empty except none), a `verificationMethod`, and
`relatedRules` chaining to `RULE-010`/`RULE-011`/`RULE-012`, `RULE-020`, and `RULE-012` as noted in
the content above.

## Refresh of RULE-010..RULE-012

Metadata only; instruction and rationale text is unchanged.

| Rule | Change |
| ---- | ------ |
| RULE-010 | `unresolved` → `""`; `confidence.level` → `High`; add `SRC-046` to `evidenceSourceIds`; add the DataGrid docs locator; extend `derivedFromFindings` with `FND-013`, `FND-014` |
| RULE-011 | add `SRC-046` to `evidenceSourceIds` and the DataGrid virtualization locator; `derivedFromFindings` gains `FND-016` |
| RULE-012 | add `SRC-046` to `evidenceSourceIds` and the DataGrid selection locator; `derivedFromFindings` gains `FND-014` |

## Coverage Rows

| Section | Row | Change |
| ------- | --- | ------ |
| Coverage Topics | "Table and DataGrid, selection, sorting, filtering and bulk actions" | sources add `SRC-046`; reviewed evidence adds the analyzed DataGrid sort/focus/resize/selection/virtualization behavior and drops the "not analyzed" sentence; extracted rules add `RULE-031`..`RULE-036`; gap note stays empty |
| Required Patterns | "Searchable and filterable list page with DataGrid or Table" | sources add `SRC-046`; extracted rules add `RULE-031`, `RULE-032`, `RULE-034`, `RULE-035`, `RULE-036` |

Summary counts stay `12` topics, `8` patterns, `0` gaps.

## Pattern: PAT-002-list-page.md

| Section | Edit |
| ------- | ---- |
| frontmatter `rules` | `[RULE-010, RULE-011, RULE-012, RULE-016, RULE-031, RULE-032, RULE-033, RULE-034, RULE-035, RULE-036]` |
| frontmatter `components` | add `DataGridHeader`, `TableResizeHandle` (already lists the other DataGrid parts) |
| Responsive behavior | state that resizable columns keep the grid in a horizontally scrollable region and never the page, and that virtualization is adopted only after measuring a need |
| Accessibility | state the composite focus model and the per-cell `focusMode` rule for interactive cells, the ban on nested focusables in a sortable header, and the selection-cell `aria-label` requirement |
| Edge cases | state that a sortable column without `compare` does nothing, and that sort changes may need a polite status announcement because the library does not reliably announce them |
| Rules applied | list `RULE-010`..`RULE-012`, `RULE-016`, `RULE-031`..`RULE-036` |

## Documentation

| File | Edit |
| ---- | ---- |
| `README.md` | Remove the "The dedicated v9 DataGrid usage page was not analyzed" limitation |
| `COMPLETION-REPORT.md` | Resolve "Highest-impact remaining gaps" #3 (the DataGrid item); renumber the remaining items |
