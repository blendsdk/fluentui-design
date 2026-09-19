# RD-06: Skill Package & Entry Point

> **Document**: RD-06-skill-package.md
> **Status**: Draft
> **Created**: 2026-09-20
> **Project**: fluentui-design
> **Depends On**: RD-04, RD-05
> **CodeOps Artifact Schema**: 1

---

## Feature Overview

This requirement defines the installable artifact: an Agent Skill package with a concise `SKILL.md`
entry point and focused references loaded on demand. The entry point is the routing brain; the
references hold the rules and patterns. An agent must be able to design normal work from the bundled
references without re-browsing the source collection, and must know when to re-verify.

The skill is separate from, and cross-linked to, the API-focused `fluentui` skill.

**Complexity**: M

---

## Functional Requirements

### Must Have
- [ ] The skill lives at `skill/` and mirrors to `.agents/skills/fluentui-design/`; its directory name matches the frontmatter `name`.
- [ ] `SKILL.md` has YAML frontmatter with `name` and `description`, and a bounded body of roughly 200–300 lines.
- [ ] `SKILL.md` specifies: trigger and non-trigger conditions; repository/version reconnaissance; task classification and reference selection; a design-before-code checklist; a component-and-surface decision workflow; implementation constraints; accessibility and visual review steps; how to explain material tradeoffs; and what to do when evidence is missing, outdated, or contradictory.
- [ ] References are organized by decisions and application patterns, not only alphabetically by component.
- [ ] The package includes a compact decision index, rule provenance, example links, a review checklist, and maintenance instructions.
- [ ] The skill is usable offline from bundled references; it does not require network access for normal design work.
- [ ] The skill cross-references the sibling `fluentui` skill for exact component props and imports, and does not duplicate API documentation.
- [ ] The description states both what the skill does and when to use it, distinguishing it from the API skill.

### Should Have
- [ ] A compatibility note naming the FluentUI baseline version and the pinned facts commit.
- [ ] A short "when to re-browse and re-verify" section tied to version changes and disputed rules.

### Won't Have (Out of Scope)
- Embedding the entire research corpus in `SKILL.md` (brief section 8).
- A runtime server or MCP proxy (AR #4).
- Installing to a user's global skills directory without an explicit request (AR #4).

---

## Technical Requirements

### Package layout

```
skill/
  SKILL.md
  references/
    index.md                 # generated decision + topic routing
    rules/                   # rule references grouped by decision area
    patterns/                # the eight application patterns
    checklists/              # design-before-code, accessibility, visual review
    maintenance/             # refresh and re-pin instructions
  assets/                    # optional small templates
```

### Entry-point contract

`SKILL.md` frontmatter:

```yaml
---
name: fluentui-design
description: <what it does + when to use it, distinguishing it from the API skill>
license: MIT
---
```

The body must contain the routing table mapping a task to a reference, the decision workflow, and
the fallback behavior for missing/outdated/contradictory evidence.

### Generation boundary

The reference index and any links are generated (RD-07); pattern and rule prose is authored. No
hand-edit of generated files (RD-07 enforces drift).

---

## Integration Points

### With RD-04/RD-05 (Rules and Patterns)
- References render rules and patterns; the routing table points to them by decision.

### With RD-07 (Verification Tooling)
- The generator emits the index; the drift gate guards it; the example gate checks skill code blocks.

### With the sibling `fluentui` skill
- Cross-links point to its component references; the compatibility note names the pinned version.

---

## Scope Decisions

| Decision | Options Considered | Chosen | Rationale | AR Ref |
|----------|-------------------|--------|-----------|--------|
| Entry-point size | embed corpus / bounded entry + on-demand refs | ~200–300 lines + references | Keeps context cost low and routing sharp | AR #15 |
| Facts handling | duplicate API docs / cross-link | cross-link sibling skill | Avoids drift and duplication | AR #12 |
| Install location | build in repo only / also install globally | build in repo; copy to `.agents/skills/`; global install on request | Keeps the repo self-contained without surprising the user | AR #4 |
| Reference organization | alphabetical by component / by decision and pattern | by decision and pattern | Matches how design questions arrive | AR #16 |

---

## Security Considerations

- **Data sensitivity**: N/A — documentation package.
- **Input validation**: The package must not instruct bypassing validation; it teaches server-side validation.
- **Authentication & authorization**: N/A.
- **Injection risks**: The package must not include executable install scripts that fetch remote code, and must not recommend unsafe HTML injection.
- **Encryption needs**: N/A.
- **Rate limiting**: N/A.
- **Infrastructure**: N/A.
- Generated content is scanned for secrets before release (RD-07).

---

## Acceptance Criteria

1. [ ] `skill/SKILL.md` exists with valid frontmatter whose `name` equals the containing directory name and a `description` that states what it does and when to use it.
2. [ ] `SKILL.md` body is between 150 and 320 lines and contains all nine required sections (triggers/non-triggers, reconnaissance, task classification, design-before-code checklist, surface decision workflow, implementation constraints, accessibility/visual review, tradeoff explanation, evidence fallback).
3. [ ] `skill/references/index.md` routes by decision and pattern, and every referenced file exists.
4. [ ] The skill contains no copied API documentation; component facts are cross-links to the sibling `fluentui` skill.
5. [ ] The package loads and routes a design task without network access.
6. [ ] `.agents/skills/fluentui-design/` mirrors `skill/` byte-for-byte after generation.
7. [ ] Security requirements verified (no remote-code install instructions; no unsafe injection guidance; secret scan clean).
