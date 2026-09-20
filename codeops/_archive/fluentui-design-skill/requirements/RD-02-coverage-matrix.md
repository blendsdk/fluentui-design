# RD-02: Coverage Matrix & Gap Tracking

> **Document**: RD-02-coverage-matrix.md
> **Status**: Draft
> **Created**: 2026-09-20
> **Project**: fluentui-design
> **Depends On**: RD-01
> **CodeOps Artifact Schema**: 1

---

## Feature Overview

This requirement makes completeness measurable. It defines a coverage matrix that spans every
in-scope topic, records which sources support each topic, and names remaining gaps explicitly.
Without it, "complete" degenerates into "we collected a lot of pages". The matrix is the evidence
that the skill's scope is actually covered or openly acknowledged as incomplete.

The matrix has one row per topic in the brief's coverage list (twelve topics) and one row per
required application pattern (eight patterns, referenced here and defined in RD-05).

**Complexity**: S

---

## Functional Requirements

### Must Have
- [ ] `research/coverage.md` contains one row for each of the twelve coverage topics: app shell/navigation/breadcrumbs/deep links; page headings/commands/content width/spacing/density; forms/field choice/grouping/validation/submission; dialogs/drawers/popovers/tooltips/inline editing; table/DataGrid/selection/sorting/filtering/bulk actions; tabs/accordions/disclosure/optional settings; feedback/empty/loading/errors/recovery; themes/typography/color/elevation/icons/motion; keyboard/focus/semantics/announcements; responsive/localization/long content/RTL; React composition/state ownership/tokens/styling; end-to-end task flows/preservation of user work.
- [ ] Each row records: `sources`, `reviewed evidence`, `extracted rules`, `unresolved questions`, `implementation examples`, and `evaluation cases`.
- [ ] Each row is either **Supported** (at least one `analyzed` source plus at least one rule) or **Gap** (explicit statement of what is missing and why it remains).
- [ ] The matrix also tracks the eight required patterns from the brief (AppShell, list/grid page, record detail, create/edit form, contextual drawer/dialog edit, settings, multi-step task, dashboard).
- [ ] Every rule in `rules/rules.json` maps to at least one coverage row; the map is checkable by a script.
- [ ] A summary header reports counts: topics supported, topics with gaps, patterns supported, patterns with gaps.

### Should Have
- [ ] Each gap row names the best available partial source and the specific missing decision.

### Won't Have (Out of Scope)
- Endless discovery — stop when the primary indexes and their relevant linked material are reviewed and remaining gaps are recorded (brief section 4).
- A second traceability database; the matrix is a document derived from the catalogs.

---

## Technical Requirements

### Matrix schema (conceptual)

| Column | Meaning |
|--------|---------|
| `topic` | Coverage topic name. |
| `sources` | `SRC-###` IDs reviewed for this topic. |
| `reviewedEvidence` | Short description of what was actually read. |
| `extractedRules` | `RULE-###` IDs produced. |
| `unresolvedQuestions` | Open questions, each with a named owner trigger. |
| `examples` | Fixture/evaluation example references. |
| `status` | `Supported` or `Gap`. |
| `gapNote` | Required when status is `Gap`. |

### Consistency checks

A validator asserts: every `RULE-###` in the catalog appears in exactly one or more coverage rows;
every `sources` ID exists in `sources.json`; every `Gap` row has a non-empty `gapNote`; the summary
counts equal the row statuses.

---

## Integration Points

### With RD-01 (Source Catalog)
- Coverage rows reference `SRC-###` IDs; a row may only cite sources whose status is `analyzed`.

### With RD-04 (Rules Catalog)
- Coverage is the completeness check on the rules catalog: any in-scope topic without a rule is a gap.

### With RD-09 (Evaluation)
- Coverage rows nominate the evaluation cases that exercise their topic.

---

## Scope Decisions

| Decision | Options Considered | Chosen | Rationale | AR Ref |
|----------|-------------------|--------|-----------|--------|
| Completeness test | source count / declared goal / every row supported or gap | every row supported or explicit gap | The brief rejects "enough sources" as proof of completeness | AR #1 |
| Storage | JSON / Markdown doc | Markdown, validated against catalogs | Human-readable audit artifact | AR #10 |
| Public-page guidance | full parity / concise note | concise guidance, no forced shell | The brief warns against forcing a dense shell onto content sites | AR #16 |

---

## Security Considerations

- **Data sensitivity**: N/A — coverage metadata only.
- **Input validation**: The consistency validator rejects unknown source IDs and unmapped rules.
- **Authentication & authorization**: N/A.
- **Injection risks**: N/A — no execution of coverage content.
- **Encryption needs**: N/A.
- **Rate limiting**: N/A.
- **Infrastructure**: N/A.
- This RD introduces no runtime surface; the consistency check is a direct test using the project's own scripts.

---

## Acceptance Criteria

1. [ ] `research/coverage.md` lists exactly the twelve brief topics plus the eight required patterns, each with a `Supported` or `Gap` status.
2. [ ] Every row with status `Supported` cites at least one source whose `status` in `sources.json` is `analyzed` and at least one `RULE-###`.
3. [ ] Every row with status `Gap` has a non-empty `gapNote` naming what is missing.
4. [ ] The consistency check fails when a `RULE-###` exists that no coverage row references, and fails when a coverage row cites an unknown `SRC-###`.
5. [ ] The header counts equal the number of `Supported`/`Gap` rows (topics and patterns counted separately).
6. [ ] Each unresolved question is recorded with a named revisit trigger; no silent "TBD".
7. [ ] Security requirements verified (N/A items justified; no new runtime surface introduced).
