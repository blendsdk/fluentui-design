# RD-05: Application Patterns

> **Document**: RD-05-application-patterns.md
> **Status**: Draft
> **Created**: 2026-09-20
> **Project**: fluentui-design
> **Depends On**: RD-04
> **CodeOps Artifact Schema**: 1

---

## Feature Overview

Rules say what to do; patterns show where things go together. This requirement defines the eight
required application patterns as decision-oriented references. Each pattern answers a user task and
documents suitability, alternatives, region order, component mapping, interaction flow, state
ownership, responsive behavior, accessibility, edge cases, the rules it applies, any derived
decisions, and the tests that exercise it.

Patterns are **application-owned compositions** unless a matching v9 export is verified; for
example, AppShell, PageHeader, FilterBar, and RecordEditor are project patterns, not library
components. The patterns must not assume Fluent owns routing, validation, fetching, authorization,
or persistence.

**Complexity**: L

---

## Functional Requirements

### Must Have
- [ ] The skill contains references for eight patterns: (1) application shell with global navigation, page heading, and commands; (2) searchable/filterable list page with DataGrid or Table; (3) record detail page with summary and related information; (4) create/edit form page with grouped fields and validation; (5) short contextual edit in a drawer or focused dialog; (6) settings page with optional advanced sections; (7) multi-step task with review, back navigation, and preserved state; (8) dashboard whose content reflects actual tasks and data.
- [ ] Each pattern documents: user task, suitability, alternatives, region order, component mapping, interaction flow, state ownership, responsive behavior, accessibility, edge cases, source-backed rules, derived decisions, and tests.
- [ ] Every `componentMapping` uses verified v9 exports or is explicitly labeled an application-owned composition.
- [ ] Each pattern states the application responsibilities it does **not** own (routing, validation, fetching, authorization, persistence).
- [ ] Patterns explicitly address these decisions: page-level vs. record-level vs. selection-level commands; persistent navigation vs. menus vs. tabs; main page vs. inline edit vs. drawer vs. dialog; single-column vs. justified multi-column forms; label/helper/error placement and validation timing; server errors, pending submission, and duplicate-submission prevention; save/cancel/autosave/dirty state and unsaved-change handling; DataGrid vs. Table semantics and keyboard expectations; local vs. server-side sorting/filtering/pagination; selection persistence and explicit "all rows" vs. "all matching results"; row activation vs. selection and nested action controls; column prioritization, overflow, long content, and empty/search-empty/error states; virtualization tradeoffs (focus, accessible row info, performance); modal focus, dismissal, return focus, and portal/layer behavior; accordions containing validation errors or dependent information; toast vs. persistent inline feedback vs. MessageBar; permissions and read-only states without hiding necessary explanation.

### Should Have
- [ ] Each pattern links the rules it applies by `RULE-###` and any derived decision it introduces.
- [ ] A short "when not to use" note for each pattern.

### Won't Have (Out of Scope)
- A runnable app per pattern; the fixture app (RD-08) exercises representative patterns.
- Presenting a pattern as a library API (brief section 6).

---

## Technical Requirements

### Pattern document template

| Section | Content |
|---------|---------|
| User task | What the user is trying to accomplish. |
| When to use / when not | Suitability and alternatives. |
| Region order | Ordered regions of the surface. |
| Component mapping | Verified exports or application-owned composition. |
| Interaction flow | Step-by-step interaction. |
| State ownership | Where state lives and its transitions. |
| Responsive behavior | Viewport adaptations and breakpoints as conventions. |
| Accessibility | Landmarks, headings, focus, keyboard, announcements, contrast, motion. |
| Edge cases | Loading, empty, search-empty, error, long content, permissions. |
| Rules applied | `RULE-###` list. |
| Derived decisions | Any project-synthesized choice, visibly labeled. |
| Tests | Evaluation or fixture cases. |

### Cross-cutting decision index

A compact table mapping each decision above to the pattern(s) that resolve it, so an agent can route
by decision rather than by component name.

---

## Integration Points

### With RD-04 (Rules Catalog)
- Patterns apply rules; a pattern must not contradict a `must` rule without an explicit documented exception.

### With RD-06 (Skill Package)
- Pattern references are loaded on demand from the skill entry point's routing table.

### With RD-08 (Fixture App)
- The fixture implements representative patterns and is the runtime proof for them.

### With RD-09 (Evaluation)
- Evaluation tasks target the patterns and their decision points.

---

## Scope Decisions

| Decision | Options Considered | Chosen | Rationale | AR Ref |
|----------|-------------------|--------|-----------|--------|
| Pattern ownership | present as library API / application-owned | application-owned unless a v9 export is verified | Prevents invented APIs | AR #12 |
| Organization | alphabetical / decision-oriented | decision-oriented with a decision index | Matches how design questions arrive | AR #16 |
| Navigation ownership | assume Fluent owns routing | application owns routing; pattern shows the seam | The brief warns Fluent does not own routing | AR #4 |

---

## Security Considerations

- **Data sensitivity**: N/A — pattern guidance only.
- **Input validation**: Patterns that show forms must state that server-side validation is mandatory and client-side validation is advisory.
- **Authentication & authorization**: Read-only and permission states must be presented without leaking whether hidden data exists; patterns document this.
- **Injection risks**: Guidance must not recommend unsanitized HTML injection or `dangerouslySetInnerHTML`.
- **Encryption needs**: N/A for the patterns themselves; guidance must not imply plaintext transport is acceptable.
- **Rate limiting**: Guidance for repeated async actions (search, retry) notes debouncing and duplicate-submission prevention.
- **Infrastructure**: N/A.

---

## Acceptance Criteria

1. [ ] Eight pattern references exist, one per required pattern, each containing every section of the pattern template.
2. [ ] Every `componentMapping` entry is either a verified v9 export from the pinned schema or explicitly labeled `application-owned`.
3. [ ] No pattern claims Fluent provides routing, validation, fetching, authorization, or persistence; each names those as application responsibilities.
4. [ ] The decision index resolves each of the seventeen listed decisions to at least one pattern.
5. [ ] No pattern contradicts a `must` rule; any exception is documented with reasoning.
6. [ ] Each pattern names the evaluation or fixture cases that exercise it.
7. [ ] Security requirements verified (server-side validation stated for forms; no unsafe HTML injection recommended).
