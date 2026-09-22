# Plan Ambiguity Register: fluentui-design-form-inputs-coverage

> **Status**: ✅ GATE PASSED — all plan-local items resolved; requirements AR-1..AR-11 imported pre-resolved
> **CodeOps Artifact Schema**: 1

## Imported (pre-resolved)

AR-1..AR-11 from [../requirements/00-ambiguity-register.md](../requirements/00-ambiguity-register.md).

## Plan-Local Items

| # | Category | Ambiguity | Resolution | Authority |
|---|----------|-----------|------------|-----------|
| PL-1 | Evidence | Exact locators for `SRC-039` | The eight `https://fluent2.microsoft.design/components/web/react/core/<name>/usage` pages (input, textarea, select, dropdown, combobox, checkbox, radiogroup, switch) plus the Field page; `requestedUrl` is the React component overview | User |
| PL-2 | Rule wording | Exact text for `RULE-037`..`RULE-042` | Defined verbatim in [03-content-design.md](03-content-design.md) | User |
| PL-3 | Pattern | Which `PAT-004` sections to edit | Frontmatter `rules`/`components`; Component mapping; Accessibility; Edge cases; Rules applied | User |
| PL-4 | Coverage | Exact row edits | The forms topic row and the form-page pattern row add `SRC-039` and `RULE-037`..`RULE-042`; summary unchanged | User |
| PL-5 | Verification | What "verified" means | `npm run validate:all`, `npm run lint:rules`, `npm run generate:check`, `npm run freshness -- --check`, `npm run verify` all exit 0 | User |

> No item is open. Runtime discoveries use the zero-ambiguity loop.
