# RD-01: DataGrid Evidence and Grid Rules

> **Document**: RD-01-datagrid-coverage.md
> **Status**: Draft
> **Created**: 2026-09-21
> **Project**: fluentui-design
> **Depends On**: —
> **CodeOps Artifact Schema**: 1

---

## Feature Overview

The skill already tells an agent to reach for DataGrid, but the rule that makes that choice
(`RULE-010`) records an open gap: *"The dedicated v9 DataGrid usage page was not analyzed, so grid
rules lean on the APG grid pattern and package source."* There is no first-party Fluent 2 usage page
for DataGrid or Table — both return 404 — so the authoritative evidence is the v9 package
documentation and source.

This requirement closes that gap with API-grounded, design-level guidance: the DataGrid sorting,
focus, column-resizing, selection, and virtualization behaviors that an agent needs when composing a
data surface, backed by a newly analyzed source and a small set of additive rules.

It is a content change only. No application code, package surface, or pinned baseline changes.

---

## Functional Requirements

### Must Have

- [ ] **New evidence source.** A new source `SRC-046` records the v9 DataGrid documentation and
      package source (`packages/react-components/react-table/stories/src/DataGrid` and the Storybook
      DataGrid docs) with `status: analyzed`, accurate locators, and a summary (AR #3).
- [ ] **New findings.** Findings `FND-013`..`FND-017` record the DataGrid facts below, each with a
      valid `kind`, at least one cited source, and the rules it informs (AR #6):
      - sorting requires a `compare` function on the column definition;
      - the grid uses a composite focus model and cells containing controls need `focusMode`
        `group` or `none`;
      - a sortable header cell must not contain nested focusable controls;
      - column resizing is a preview capability that can force horizontal overflow;
      - virtualization is a community extension that requires a stable, memoized row renderer;
      - the library does not reliably announce sort changes to assistive technology (unresolved).
- [ ] **New rules.** Rules `RULE-031`..`RULE-036` are added under `decisionArea: data-grid` with
      actionable instructions, evidence, component mappings, and verification methods (AR #5).
- [ ] **Existing rules refreshed.** `RULE-010`..`RULE-012` clear their `unresolved` note where the
      new evidence settles it and reflect the new source and confidence; their instruction and
      rationale text is unchanged (AR #2).
- [ ] **Coverage consistency.** The grid topic row and the DataGrid/Table pattern row cite `SRC-046`
      and the new rules; every new rule is mapped by at least one coverage row; the summary stays
      `12` topics, `8` patterns, `0` gaps (AR #7).
- [ ] **Pattern enrichment.** `PAT-002-list-page.md` reflects the new rules in its frontmatter and
      its responsive, accessibility, and edge-case sections (AR #4).
- [ ] **Documentation honesty.** The README "Known limitations" and the COMPLETION-REPORT
      "Highest-impact remaining gaps" no longer list the DataGrid usage page as unanalyzed (AR #8).

### Should Have

- [ ] `SRC-040` remains recorded as a `discovered` expansion target, because it still spans Tree and
      List guidance that this requirement does not analyze (AR #9).

### Won't Have (Out of Scope)

- **New patterns or decision keys** — the pattern set stays at 8 and the decision index at 17
  (AR #4).
- **Other expansion targets** (`SRC-039`, `SRC-041`..`SRC-045`) — they stay discovered (AR #1).
- **Evaluation tasks** — no new EVAL task is added (AR #10).
- **Baseline re-pin** — the pinned `@fluentui/react-components` version and facts commit are
  unchanged (AR #11).
- **Code or test changes** — the change is content only (AR #12).

---

## Technical Requirements

### Source catalog

`SRC-046` follows `sources/sources.schema.json` and the shape of the existing component sources
(`SRC-013`..`SRC-024`): `category: component-usage`, `platform: web-react`, a `retrievalDate`, one
or more `locators`, a summary, and MIT/Microsoft license notes. It must pass `npm run validate:sources`.

### Findings and rules

- Findings follow the `research/findings.md` field set (`id`, `statement`, `kind`, `sources`,
  `versionScope`, `confidence`, `informsRules`) and a valid `FINDING_KINDS` value.
- Each new rule follows the `rules/rules.schema.json` shape used by `RULE-010`: `title`, `decision`,
  `decisionArea: data-grid`, `classification`, `strength`, applicability fields, `instruction`,
  `rationale`, a `verified` `componentMapping` limited to exports in `facts/verified-exports.json`,
  consequence fields, `evidenceSourceIds`, `locators`, `derivedFromFindings`, `confidence`,
  `unresolved`, examples, `verificationMethod`, `relatedRules`, and `supersedes: []`.
- New rules must pass `npm run validate:rules` and `npm run lint:rules`.

### Coverage

`research/coverage.md` uses the existing table shape. A `Supported` row cites at least one
`analyzed` source and at least one known rule; every known rule is mapped by at least one row.

### Generated output and freshness

`npm run generate` rewrites `sources/sources.md`, `rules/rules.md`, the reference indexes, and the
`.agents/skills/fluentui-design/` mirror. `npm run freshness` rewrites the input hashes in
`facts/freshness.json`. Both must be committed; `npm run generate:check` and `npm run verify` must
pass.

---

## Integration Points

- **With the API skill (`fluentui-mcp`).** The DataGrid API facts live in the complementary
  `fluentui` skill; this requirement consumes them as design-level rules and does not restate the
  API surface.
- **With the fixture.** The fixture list page already renders a `DataGrid` and is covered by
  keyboard and axe tests, so the new rules describe an already-exercised surface.
- **With the release tool.** The change ships through `release.yml`; no release-tooling change is
  required.

---

## Security Considerations

N/A — this is documentation and catalog data. It adds no executable code, no input handling, and no
dependency. Sources are summarized and linked, never copied, and license notes are recorded.

---

## Acceptance Criteria

1. [ ] `npm run validate:sources` exits 0 with `SRC-046` present as `analyzed`.
2. [ ] `SRC-046`'s `resolvedUrl` and locators resolve to the v9 DataGrid docs/source, and its
       summary names the analyzed DataGrid behaviors.
3. [ ] `FND-013`..`FND-017` exist with valid kinds, cited sources, and `informsRules` that resolve.
4. [ ] `RULE-031`..`RULE-036` exist under `decisionArea: data-grid` and every mapped export is a
       verified export of the pinned package.
5. [ ] `RULE-010`'s `unresolved` note about the unanalyzed usage page is cleared and its evidence
       cites `SRC-046`; its instruction text is unchanged.
6. [ ] `npm run validate:all` and `npm run lint:rules` exit 0.
7. [ ] The coverage grid topic and DataGrid/Table pattern rows cite `SRC-046` and the new rules, and
       `npm run validate:sources` reports the coverage check passing.
8. [ ] `PAT-002-list-page.md` frontmatter lists the new rules and its sections mention the sort,
       focus, resize, selection, and virtualization guidance.
9. [ ] README and COMPLETION-REPORT no longer state that the DataGrid usage page is unanalyzed.
10. [ ] `npm run generate` produces no drift (`npm run generate:check` exits 0) and
        `npm run freshness -- --check` exits 0.
11. [ ] `npm run verify` exits 0.
12. [ ] The feature ships as a minor release published from `main`.
