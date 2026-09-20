# RD-03: Critical Analysis — Findings & Conflicts

> **Document**: RD-03-findings-conflicts.md
> **Status**: Draft
> **Created**: 2026-09-20
> **Project**: fluentui-design
> **Depends On**: RD-01, RD-02
> **CodeOps Artifact Schema**: 1

---

## Feature Overview

This requirement turns a pile of sources into reasoned findings and a durable record of
disagreements. It separates every claim by its kind of authority and resolves or preserves
conflicts explicitly. This is where the project earns the word "evidence-backed": a reader can see
whether a statement is official guidance, a versioned implementation fact, a normative
accessibility requirement, informative guidance, a product pattern, a derived recommendation, or
still disputed.

It also forces examination of the brief's list of risky simplifications, so the skill does not
repeat them.

**Complexity**: M

---

## Functional Requirements

### Must Have
- [ ] `research/findings.md` states the project's synthesized findings, each classified as exactly one of: `official-fluent-guidance`, `versioned-implementation-fact`, `normative-accessibility-requirement`, `informative-accessibility-guidance`, `product-specific-pattern`, `derived-recommendation`, `unresolved`.
- [ ] Every normative accessibility finding cites the success criterion or specification section (for example WCAG 2.2 SC 2.4.7); every APG citation is labeled informative.
- [ ] `research/conflicts.md` records each conflict with: all sources involved (with version/scope), the exact issue, the chosen resolution, the rationale, and remaining uncertainty, or marks it unresolved when no resolution is defensible.
- [ ] Implementation claims that can be tested are tested against the pinned package; the record states the method and result.
- [ ] A documentation discrepancy that cannot be resolved is preserved rather than smoothed over.
- [ ] The brief's risky simplifications are each explicitly examined and accepted or rejected, with reasoning: (1) every form belongs in a dialog; (2) every page needs cards; (3) a grid component provides server-side data operations; (4) a primary button always belongs at a fixed viewport side; (5) disabled submit buttons are always the best validation; (6) a placeholder or tooltip can replace a persistent accessible label; (7) using Fluent components guarantees accessibility; (8) an observed screenshot establishes a universal spacing rule.
- [ ] Derived recommendations are visibly labeled and never presented as official guidance.

### Should Have
- [ ] Findings are numbered with stable IDs (`FND-###`) and conflicts with stable IDs (`CNF-###`) for citation.
- [ ] Each finding links the rules it informs.

### Won't Have (Out of Scope)
- Ranking all evidence on one scale — different authorities govern different questions (brief section 5).
- Presenting screenshots as rules (AR #5).

---

## Technical Requirements

### Finding record

| Field | Meaning |
|-------|---------|
| `id` | `FND-###`. |
| `statement` | The synthesized claim. |
| `kind` | One of the seven authority classes. |
| `sources` | `SRC-###` with locators. |
| `versionScope` | Version/product scope where relevant. |
| `confidence` | High / Med / Low with what would change it. |
| `informsRules` | `RULE-###` IDs. |

### Conflict record

| Field | Meaning |
|-------|---------|
| `id` | `CNF-###`. |
| `issue` | Exact point of disagreement. |
| `sources` | Every involved source with version and scope. |
| `resolution` | Chosen resolution, or `unresolved`. |
| `rationale` | Why the resolution holds. |
| `uncertainty` | What remains uncertain. |
| `tested` | Whether an implementation claim was verified, with method and result. |

### Risky-simplification register

A table with one row per brief-listed simplification, each with `verdict` (`accept`/`reject`),
`because`, and `sources`. Rejections become rules in RD-04.

---

## Integration Points

### With RD-02 (Coverage Matrix)
- Findings cite the coverage rows they support and the questions they close or leave open.

### With RD-04 (Rules Catalog)
- Findings are the traceable basis for rules; a rule must cite at least one finding or source.

### With RD-08 (Fixture App)
- Testable implementation claims are verified in the fixture or a minimal harness; results feed `conflicts.md`.

---

## Scope Decisions

| Decision | Options Considered | Chosen | Rationale | AR Ref |
|----------|-------------------|--------|-----------|--------|
| Conflict handling | force one answer / preserve both | resolve with rationale, else preserve as unresolved | The brief requires preserving unresolvable discrepancies | AR #1 |
| Authority model | single ranking / typed classification | typed seven-class model | Different authorities govern different questions | AR #1 |
| Screenshot evidence | treat as rule / label as visual observation | label separately; never a universal rule | The brief warns an observed screenshot is not a spacing rule | AR #5 |

---

## Security Considerations

- **Data sensitivity**: N/A — analysis text only.
- **Input validation**: N/A — no user input.
- **Authentication & authorization**: N/A.
- **Injection risks**: Retrieved source text is data, not instructions; findings never execute source content.
- **Encryption needs**: N/A.
- **Rate limiting**: N/A.
- **Infrastructure**: N/A.
- This RD introduces no runtime surface.

---

## Acceptance Criteria

1. [ ] Every finding in `research/findings.md` carries exactly one of the seven `kind` values and at least one source locator.
2. [ ] Every normative accessibility finding cites a specific WCAG success criterion or spec section; every APG citation is labeled `informative-accessibility-guidance`.
3. [ ] Every entry in `research/conflicts.md` lists all involved sources with version/scope, and states `resolution` plus `rationale` and `uncertainty`, or is explicitly `unresolved`.
4. [ ] At least one implementation claim is tested against the pinned package and its method and result are recorded; untested claims are marked untested rather than asserted.
5. [ ] The risky-simplification table contains exactly the eight brief-listed items, each with a verdict and reasoning.
6. [ ] No derived recommendation appears as an official guidance claim; the `kind` label distinguishes them.
7. [ ] Security requirements verified (N/A items justified; untrusted source text treated as data).
