# Ambiguity Register: fluentui-design-datagrid-coverage

> **Status**: ✅ GATE PASSED — all items resolved
> **CodeOps Artifact Schema**: 1

| # | Category | Ambiguity | Resolution | Authority |
|---|----------|-----------|------------|-----------|
| AR-1 | Scope | How much of the discovered catalog to close | DataGrid/Table only; the other expansion targets (SRC-039, SRC-041..045) stay discovered | User |
| AR-2 | Rule handling | Refine or supersede RULE-010..012 | Add additive rules; refresh only metadata fields on the existing rules; no supersede and no replaced-guidance history | User |
| AR-3 | Evidence source | No first-party Fluent 2 DataGrid usage page exists (`.../core/datagrid/usage` returns 404) | Cite the v9 package docs/source (`packages/react-components/react-table/stories/src/DataGrid`) and the Storybook docs as a new analyzed source | User |
| AR-4 | Structure | Whether to add a pattern or a decision key | No new pattern and no new decision key; enrich PAT-002 and the existing grid rules | User |
| AR-5 | Rule set | Which new rules to add | RULE-031 sortable columns need `compare`; RULE-032 cell `focusMode` for interactive cells; RULE-033 no nested focusables in a sortable header cell; RULE-034 resizable columns are preview and need overflow; RULE-035 memoize the row renderer before virtualizing; RULE-036 selection cells need `aria-label` | User |
| AR-6 | Findings | How to record the evidence | New `versioned-implementation-fact` findings FND-013..FND-016 and one `unresolved` finding FND-017 (sort announcement) | User |
| AR-7 | Coverage | Keep the matrix reviewable | Update the grid topic and the PAT-002 rows; summary counts stay 12 topics / 8 patterns / 0 gaps | User |
| AR-8 | Docs | Retire the stated gap | Remove the DataGrid limitation from README and resolve gap #3 in COMPLETION-REPORT | User |
| AR-9 | Source status | Whether SRC-040 becomes analyzed | Keep SRC-040 `discovered` (it still spans Tree and List); add SRC-046 for the DataGrid evidence | User |
| AR-10 | Evaluation | Whether to add an evaluation task | Out of scope; no EVAL task is added | User |
| AR-11 | Freshness | Effect on the pinned baseline | Regenerate `facts/freshness.json` input hashes; the pinned `d595d79` / `9.74.7` baseline is unchanged | User |
| AR-12 | Verification | How the change is verified | Catalog gates plus `npm run verify`; no code changes and no new tests are required | User |
| AR-13 | Release | How the change ships | Minor version bump via the existing release workflow (new guidance), `latest` dist-tag | User |

> **Traceability:** each resolution is reflected in [RD-01](RD-01-datagrid-coverage.md) and the plan documents.
