# Skill Package: fluentui-design-skill

> **Document**: 03-03-skill-package.md
> **Parent**: [Index](00-index.md)
> **Implements**: RD-06

## Overview

This component is the installable artifact: a concise `SKILL.md` entry point plus references loaded on
demand. The entry point is a router, not a knowledge dump — it classifies the task, selects
references, and states the fallback when evidence is missing. The package is mirrored byte-for-byte
into `.agents/skills/fluentui-design/` so an agent can load it without any build step.

## Architecture

### Proposed Changes

```
skill/
  SKILL.md                         # authored, ~200–300 lines
  references/
    index.md                       # GENERATED decision routing index
    rules/index.md                 # GENERATED rule catalog grouped by decision area
    foundation/
      composition-and-state.md     # authored
      styling-and-tokens.md        # authored
      accessibility.md             # authored
      responsive-and-localization.md # authored
    patterns/PAT-001..008-*.md     # authored (RD-05)
    checklists/
      design-before-code.md        # authored
      accessibility-review.md      # authored
      visual-review.md             # authored
    maintenance/refresh-and-repin.md # authored (RD-10)
.agents/skills/fluentui-design/**  # GENERATED mirror of skill/
```

### Generation boundary

`references/index.md` and `references/rules/index.md` are generated; every other file is authored.
The generator ([03-04](03-04-verification-tooling.md)) rewrites the mirror from `skill/`. No generated
file is hand-edited; the drift gate enforces this (plan AR #7).

## Implementation Details

### Entry-point frontmatter

```yaml
---
name: fluentui-design
description: Design, implement, and review coherent Fluent UI React v9 web applications. Use when composing pages, choosing surfaces (page vs drawer vs dialog), arranging navigation, commands, forms, DataGrid/Table, tabs, feedback, and states for business/admin apps. Cross-links the API-focused `fluentui` skill for exact props and imports; does not duplicate API docs.
license: MIT
---
```

`name` equals the containing directory name (`fluentui-design`). The `description` states both what
the skill does and when to use it, and distinguishes it from the API skill (RD-06 AC 1).

### Entry-point body sections (all nine required)

| Section | Content |
| ------- | ------- |
| Triggers / non-triggers | When to invoke (composition, surface, state, a11y review) and when not (pure API/prop lookup → sibling skill) |
| Reconnaissance | Check the project's installed Fluent version, React version, theming, and existing patterns before designing |
| Task classification & reference selection | Map the request to decision areas and load only the needed references via `references/index.md` |
| Design-before-code checklist | Short, ordered checks before writing components |
| Component-and-surface decision workflow | Which surface, which regions, which state ownership |
| Implementation constraints | Verified exports, semantic HTML, tokens, no brittle DOM overrides |
| Accessibility and visual review | Keyboard, focus, announcements, contrast, motion, reflow, themes |
| Tradeoff explanation | How to state material tradeoffs and their evidence |
| Evidence fallback | What to do when evidence is missing, outdated, or contradictory |

Plus a compatibility note (baseline `@fluentui/react-components` 9.74.7; pinned facts commit
`d595d79`) and a "when to re-browse and re-verify" subsection (RD-06 Should Have).

### Cross-linking the sibling skill

The entry point and `references/index.md` point to the sibling `fluentui` skill for exact component
props and imports using an explicit cross-skill link convention — `<skill>:references/<path>`, for
example `fluentui:references/components/button.md`. The reference gate
([03-04](03-04-verification-tooling.md)) treats any `<skill>:…` link as external and validates only
the known skill-name prefix and link shape; it does not require the target to exist in this
repository. No component API tables are copied into this package (RD-06 AC 4, plan AR #12).

The entry point states the co-install contract and the fallback: the sibling `fluentui` skill must be
installed alongside this one; if it is unavailable, the agent says so and answers from the bundled
rules and patterns rather than inventing props.

### Mirror step

`scripts/generate.ts` performs a clean copy: delete `.agents/skills/fluentui-design/`, then copy
`skill/` recursively, preserving LF endings. The drift gate regenerates and compares (RD-06 AC 6).

## Error Handling

| Error Case | Handling Strategy | Ref |
| ---------- | ----------------- | --- |
| Frontmatter `name` ≠ directory name | Reference/generation gate error; exit 1 | RD-06 |
| `references/index.md` links to a missing file | Reference gate error naming the link; exit 1 | RD-07 |
| Mirror differs from `skill/` | Drift gate error; exit 1 | RD-06 |
| Entry point exceeds the line budget | Warning at >320 lines; error at >400 | RD-06 |

## Testing Requirements

- Specification tests for frontmatter validity, the nine sections, mirror equality, generation determinism, reference resolution, and cross-skill link handling (`ST-21`..`ST-29`).
- A test asserts the entry point is 200–300 lines (soft) and the routing index resolves every link.
- A test asserts no file under `skill/` imports or fetches remote code.
