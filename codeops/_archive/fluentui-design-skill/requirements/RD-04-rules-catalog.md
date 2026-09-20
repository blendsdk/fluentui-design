# RD-04: Operational Rules Catalog

> **Document**: RD-04-rules-catalog.md
> **Status**: Draft
> **Created**: 2026-09-20
> **Project**: fluentui-design
> **Depends On**: RD-03
> **CodeOps Artifact Schema**: 1

---

## Feature Overview

This requirement defines the project's core intellectual output: a catalog of **operational rules**
that state conditions and a decision. A useful rule says "when X, do Y, because Z, and here is how
to tell it worked". It is the difference between guidance an agent can act on and advice such as
"make it intuitive".

Each rule is stored as structured JSON with a stable ID, a strength, applicability conditions, a
component mapping, layout/accessibility/state consequences, evidence locators, and a positive
example, anti-pattern, and verification method. Application compositions (AppShell, PageHeader,
FilterBar, and the like) are marked **application-owned** unless a matching v9 export is verified;
an invented component is never presented as a library API.

**Complexity**: L

---

## Functional Requirements

### Must Have
- [ ] `rules/rules.json` stores all rules; `rules/rules.schema.json` defines their shape.
- [ ] `scripts/validate-rules.ts` fails on schema violations, duplicate IDs, and references to sources that do not exist.
- [ ] Each rule carries a stable `id` matching `^RULE-\d{3}$`, a `title`, and a `decision` (the problem it resolves).
- [ ] Each rule carries a `classification` (`requirement` | `recommendation` | `convention` | `observation`) and a `strength` reflecting `must`/`should`/`may`.
- [ ] Each rule carries `appliesWhen`, `exceptions`, and `notApplicableWhen`.
- [ ] Each rule carries `instruction`, `rationale`, and `componentMapping` (verified exports from the pinned schema, or explicitly `application-owned`).
- [ ] Each rule carries `layoutConsequences`, `responsiveConsequences`, and `accessibilityImplications`.
- [ ] Each rule carries `evidenceSourceIds` (existing `SRC-###`) with `locators`, plus `confidence` and `unresolved`.
- [ ] Each rule carries `positiveExample`, `antiPattern`, and `verificationMethod`.
- [ ] No rule states a universal dimension, breakpoint, or field count as a mandate; a concrete default must be labeled a **configurable project convention** with the conditions under which it changes.
- [ ] No rule uses a nonexistent v9 export; application compositions are marked application-owned.

### Should Have
- [ ] Rules cross-reference related rules and the findings/rules they supersede.
- [ ] A generated `rules/rules.md` renders a readable index grouped by decision area.

### Won't Have (Out of Scope)
- Copying component API documentation; rules link to the sibling `fluentui` references instead (AR #12).
- Non-operational advice with no decision ("be consistent", "use good UX").

---

## Technical Requirements

### Rule record (conceptual)

| Field | Meaning |
|-------|---------|
| `id` | Stable `RULE-###`. |
| `title` | Short rule name. |
| `decision` | The decision/problem the rule resolves. |
| `classification` | Requirement / recommendation / convention / observation. |
| `strength` | `must` / `should` / `may`. |
| `appliesWhen` / `exceptions` / `notApplicableWhen` | Applicability boundary. |
| `instruction` | The actionable directive. |
| `rationale` | Why, concisely. |
| `componentMapping` | Verified `@fluentui/react-components` exports, or `application-owned`. |
| `layoutConsequences` / `responsiveConsequences` | What this means for structure and viewport changes. |
| `accessibilityImplications` | Semantics, keyboard, focus, announcements, contrast, motion. |
| `stateImplications` | State ownership and transitions affected. |
| `evidenceSourceIds` + `locators` | Provenance. |
| `derivedFromFindings` | `FND-###` IDs. |
| `confidence` / `unresolved` | Confidence with invalidation trigger. |
| `positiveExample` / `antiPattern` / `verificationMethod` | Teaching and testability. |

### Validator behavior

Asserts: unique `RULE-###`; every `evidenceSourceIds` entry exists in `sources.json`; `classification`
and `strength` are enum-valid; `componentMapping` names either a `verified` flag with a package/version
or `application-owned`; `instruction` is non-empty and contains an imperative; each rule has at least
one of `positiveExample` or `antiPattern` plus a `verificationMethod`.

### Actionability heuristic

A lint pass flags rules whose `instruction` is shorter than a threshold or matches a banned phrase
list ("intuitive", "user-friendly", "best practice" without specifics) for manual review.

---

## Integration Points

### With RD-03 (Findings & Conflicts)
- Every rule traces to at least one finding or source; unresolved findings may produce a rule marked with an open question.

### With RD-05 (Application Patterns)
- Patterns compose rules; a pattern lists the rule IDs it applies.

### With RD-06 (Skill Package)
- The skill's references render rules by decision area; rules are the skill's backbone.

### With RD-07 (Verification Tooling)
- The rules validator is a catalog-integrity gate.

---

## Scope Decisions

| Decision | Options Considered | Chosen | Rationale | AR Ref |
|----------|-------------------|--------|-----------|--------|
| Rule strength vocabulary | free text / enum | `must`/`should`/`may` with classification | Testable and consistent | AR #1 |
| Component mapping | prose / verified exports | verified exports or `application-owned` | Prevents invented APIs presented as library APIs | AR #12 |
| Concrete defaults | mandate values / configurable convention | configurable project convention with conditions | The brief forbids invented universal dimensions | AR #1 |
| Rule IDs | slugs / `RULE-###` | `RULE-###` | Stable across refresh | AR #9 |

---

## Security Considerations

- **Data sensitivity**: N/A — guidance data only.
- **Input validation**: The validator rejects malformed rules and dangling evidence.
- **Authentication & authorization**: N/A.
- **Injection risks**: Rules never include executable code that runs at validation time; example code is rendered as text.
- **Encryption needs**: N/A.
- **Rate limiting**: N/A.
- **Infrastructure**: N/A.

---

## Acceptance Criteria

1. [ ] `scripts/validate-rules.ts` exits 0 on the committed catalog and non-zero when any rule has a duplicate `id`, an unknown `evidenceSourceIds` entry, an invalid `classification`/`strength`, or a `componentMapping` with neither a `verified` export nor `application-owned`.
2. [ ] Every rule contains non-empty `appliesWhen`, `instruction`, `rationale`, `positiveExample` or `antiPattern`, and `verificationMethod`.
3. [ ] At least one rule is marked `application-owned` for a composition with no verified v9 export (for example an app shell), and no rule names a component that does not exist in the pinned schema.
4. [ ] No rule mandates a fixed breakpoint, pixel dimension, or field count; any concrete default is labeled a configurable project convention and states when it changes.
5. [ ] The actionability lint flags a deliberately non-operational draft rule and passes the real catalog.
6. [ ] Every rule's `classification` is one of the four enum values and its `strength` is one of `must`/`should`/`may`.
7. [ ] Security requirements verified (N/A items justified; example code is not executed during validation).
