# Plan Ambiguity Register: fluentui-design-datagrid-coverage

> **Status**: ✅ GATE PASSED — all plan-local items resolved; requirements AR-1..AR-13 imported pre-resolved
> **CodeOps Artifact Schema**: 1

## Imported (pre-resolved)

AR-1..AR-13 from [../requirements/00-ambiguity-register.md](../requirements/00-ambiguity-register.md).

## Plan-Local Items

| # | Category | Ambiguity | Resolution | Authority |
|---|----------|-----------|------------|-----------|
| PL-1 | Evidence | Exact URL and locators for `SRC-046` | `requestedUrl`/`resolvedUrl` = `https://github.com/microsoft/fluentui/tree/master/packages/react-components/react-table`; locators `packages/react-components/react-table/stories/src/DataGrid` and `packages/react-components/react-table/library/src`. The Fluent 2 usage page is recorded as absent (404) in the summary | User |
| PL-2 | Rule wording | Exact instruction text for `RULE-031`..`RULE-036` | Defined verbatim in [03-content-design.md](03-content-design.md) | User |
| PL-3 | Pattern | Which `PAT-002` sections to edit | Frontmatter `rules`; Responsive behavior; Accessibility; Edge cases; Rules applied | User |
| PL-4 | Coverage | Exact row edits | The "Table and DataGrid…" topic row and the "Searchable and filterable list page…" pattern row add `SRC-046` and `RULE-031`..`RULE-036`; summary unchanged | User |
| PL-5 | Verification | What "verified" means here | `npm run validate:all`, `npm run lint:rules`, `npm run generate:check`, `npm run freshness -- --check`, and `npm run verify` all exit 0 | User |

> No item is open. Runtime discoveries use the zero-ambiguity loop.
