# RD-10: Maintenance, Docs & Completion

> **Document**: RD-10-maintenance-docs.md
> **Status**: Draft
> **Created**: 2026-09-20
> **Project**: fluentui-design
> **Depends On**: RD-01..RD-09
> **CodeOps Artifact Schema**: 1

---

## Feature Overview

This requirement keeps the skill trustworthy over time and closes the project honestly. It defines
the README, the maintenance and refresh procedure, a changelog that retains a history of replaced
guidance, and a completion report that separates completed, blocked, and untested work. Stable IDs
are preserved across refreshes so downstream references do not break.

**Complexity**: S

---

## Functional Requirements

### Must Have
- [ ] `README.md` states scope, usage/installation, the version baseline, and known limitations.
- [ ] A maintenance guide documents: how to recheck sources, how to detect redirects and content changes, how to update package versions, how to identify affected rules when a fact changes, how to rerun examples, and how to retain a history of replaced guidance.
- [ ] Stable `SRC-###`, `RULE-###`, and `PAT-###` IDs are not rewritten on refresh; superseded content points to its replacement.
- [ ] A changelog records versions of the skill, the baseline package version, and the pinned facts commit.
- [ ] A completion report distinguishes completed, blocked, and untested work and names the highest-impact remaining gaps.
- [ ] The README references the sibling `fluentui` skill and explains the division of labor.

### Should Have
- [ ] A documented re-pin procedure for moving the FluentUI baseline and the facts commit forward.
- [ ] A "known limitations" section listing inaccessible sources (for example Figma) and untested comparisons.

### Won't Have (Out of Scope)
- Automated external change monitoring as a service; maintenance is a documented, runnable procedure.
- Rewriting historical guidance in place; history is appended and retained.

---

## Technical Requirements

### Refresh procedure (conceptual)

1. Re-fetch each source; record `retrievalDate` and whether the `resolvedUrl` or content changed.
2. Flag sources whose status becomes `blocked`/`obsolete`; mark dependent rules for review.
3. Re-pin the facts commit and package baseline deliberately; record it in the baseline table and changelog.
4. Rerun `verify` and the evaluation; update results.
5. Append replaced guidance to the history rather than editing it away.

### History retention

A `history/` (or changelog section) records each replaced guidance item with its rule ID, the reason,
and the superseding item, so a reader can see why guidance changed.

---

## Integration Points

### With RD-01..RD-09
- Maintenance reads the catalogs, rules, patterns, tooling, fixture, and evaluation as its inputs.

---

## Scope Decisions

| Decision | Options Considered | Chosen | Rationale | AR Ref |
|----------|-------------------|--------|-----------|--------|
| ID stability | regenerate IDs / preserve IDs | preserve stable IDs; supersede with links | Downstream references must not break | AR #9 |
| Guidance history | overwrite / append history | append history | The brief requires a history of replaced guidance | AR #1 |
| Completion reporting | single status / three-way | completed/blocked/untested + gaps | Honest closure | AR #1 |

---

## Security Considerations

- **Data sensitivity**: N/A — project documentation.
- **Input validation**: N/A.
- **Authentication & authorization**: N/A.
- **Injection risks**: N/A.
- **Encryption needs**: N/A.
- **Rate limiting**: N/A.
- **Infrastructure**: N/A.

---

## Acceptance Criteria

1. [ ] `README.md` contains scope, usage, version baseline, and limitations, and explains the division of labor with the sibling `fluentui` skill.
2. [ ] The maintenance guide covers all six required procedures (recheck sources, detect redirects/changes, update versions, identify affected rules, rerun examples, retain history).
3. [ ] The changelog records at least the initial skill version with the baseline package version and pinned facts commit.
4. [ ] The completion report marks each deliverable completed, blocked, or untested, and names the highest-impact remaining gaps.
5. [ ] No stable ID is renumbered on refresh; a superseded item links to its replacement.
6. [ ] The limitations section lists any inaccessible source and any untested comparison.
7. [ ] Security requirements verified (N/A items justified).
