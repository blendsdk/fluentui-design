# Findings

> Synthesized findings for the skill, each classified by the kind of authority behind it. Derived
> recommendations are labeled as such and are never presented as official guidance.

## Findings

### FND-001 — Fluent 2 uses a two-layer token model

| Field | Value |
| --- | --- |
| id | FND-001 |
| statement | Fluent 2 separates context-agnostic global tokens holding raw values from alias tokens that give those values semantic meaning; product code should style with alias tokens so light, dark, high-contrast, and branded themes keep working. |
| kind | official-fluent-guidance |
| sources | SRC-005 (heading: Alias tokens) |
| versionScope | Fluent 2 |
| confidence | High — would change only if the token architecture is replaced |
| informsRules | RULE-017 |

### FND-002 — Layout is organized by proximity on a 4px ramp

| Field | Value |
| --- | --- |
| statement | Fluent 2 lays out space with a 4px-based spacing ramp and uses proximity to express grouping, with grid regions composed of columns, gutters, and margins rather than arbitrary pixel values. |
| kind | official-fluent-guidance |
| sources | SRC-004 (heading: Spacing and proximity) |
| versionScope | Fluent 2 |
| confidence | High — stable foundation guidance |
| informsRules | RULE-004 |

### FND-003 — Focus must be visible and not obscured

| Field | Value |
| --- | --- |
| statement | Keyboard focus must be visible and must not be entirely hidden by author content; this is a normative requirement at WCAG 2.2 SC 2.4.7 and, for the stronger form, SC 2.4.11. |
| kind | normative-accessibility-requirement |
| sources | SRC-035 (WCAG 2.2 SC 2.4.7 Focus Visible) and SRC-035 (WCAG 2.2 SC 2.4.11 Focus Not Obscured Minimum) |
| versionScope | WCAG 2.2 Level AA |
| confidence | High — normative success criteria |
| informsRules | RULE-020 |

### FND-004 — Content must reflow without loss at 400% zoom

| Field | Value |
| --- | --- |
| statement | Content must reflow to a 320 CSS pixel width without two-dimensional scrolling at 400% zoom, except for content that requires two-dimensional layout. |
| kind | normative-accessibility-requirement |
| sources | SRC-035 (WCAG 2.2 SC 1.4.10 Reflow) |
| versionScope | WCAG 2.2 Level AA |
| confidence | High — normative success criterion |
| informsRules | RULE-023 |

### FND-005 — The APG defines keyboard interfaces for composite widgets

| Field | Value |
| --- | --- |
| statement | The ARIA Authoring Practices Guide describes the expected keyboard interface for composite widgets such as grid, tabs, dialog, menu, and accordion; this is informative guidance that helps implement WCAG requirements but is not itself a standard. |
| kind | informative-accessibility-guidance |
| sources | SRC-037 (anchor: accordion/ and dialog-modal/) |
| versionScope | APG |
| confidence | Med — informative; verify against the released component behavior |
| informsRules | RULE-021, RULE-022 |

### FND-006 — The pinned package exports the composition surfaces the skill names

| Field | Value |
| --- | --- |
| statement | The pinned `@fluentui/react-components` 9.74.7 exports the composition surfaces the skill relies on, including FluentProvider, Dialog and Drawer parts, DataGrid parts, Table, Nav, Toolbar, Toast and Toaster, Field, message bar, card, breadcrumb, popover, tooltip, spinner, skeleton, progress bar, badge, accordion, tree, and the form controls. |
| kind | versioned-implementation-fact |
| sources | SRC-026 (repo-path: packages/react-components) and SRC-027 (repo-path: packages/react-components/react-components) |
| versionScope | @fluentui/react-components 9.74.7 |
| confidence | High — verified at 9.74.7 by dynamically importing the installed package and checking membership of 40 composition exports; result: none missing |
| informsRules | RULE-026, RULE-028 |

### FND-007 — Product templates are transferable patterns, not mandates

| Field | Value |
| --- | --- |
| statement | Microsoft Teams templates (dashboard, form, wizard, list, settings, and others) illustrate complete layouts, but Teams-specific hosting and navigation constraints do not automatically apply to standalone web applications. |
| kind | product-specific-pattern |
| sources | SRC-033 (heading: Dashboard and Form) |
| versionScope | Microsoft Teams platform |
| confidence | High — the overview states the product-scope caveat |
| informsRules | RULE-001 |

### FND-008 — One primary action per view, placed consistently

| Field | Value |
| --- | --- |
| statement | A view should offer a single primary action, with secondary and destructive actions using lower-emphasis button variants and positioned consistently across similar views. |
| kind | derived-recommendation |
| sources | SRC-019 (heading: Button Preview) and SRC-032 (heading: Teams app design principles) |
| versionScope | Project convention for Fluent UI React v9 |
| confidence | Med — inferred from button emphasis and design principles; would change with product-specific patterns |
| informsRules | RULE-003 |

### FND-009 — Do not hide task-required fields inside a collapsed accordion

| Field | Value |
| --- | --- |
| statement | Because accordion sections are collapsed by default, fields required for the current task, and the errors that belong to them, must not live only inside a collapsed section. |
| kind | derived-recommendation |
| sources | SRC-016 (heading: Behavior) and SRC-038 (anchor: /WAI/tutorials/forms/labels/) |
| versionScope | Project convention for Fluent UI React v9 |
| confidence | High — follows directly from disclosure and form-error guidance |
| informsRules | RULE-013 |

### FND-010 — Dialogs need a title and must return focus

| Field | Value |
| --- | --- |
| statement | A dialog requires a title, moves focus into the dialog when it opens, and returns focus to the trigger when it closes; dialogs should not be nested. |
| kind | official-fluent-guidance |
| sources | SRC-014 (heading: Accessibility) |
| versionScope | Fluent UI React v9 |
| confidence | High — stated component behavior |
| informsRules | RULE-009 |

### FND-011 — Local versus server-side grid operations is not fixed by the component

| Field | Value |
| --- | --- |
| statement | Whether a DataGrid sorts, filters, and paginates locally or against a server is an application responsibility; the component does not provide server-side data operations automatically. |
| kind | unresolved |
| sources | SRC-030 (anchor: categories/q-a) and SRC-027 (repo-path: packages/react-components/react-table) |
| versionScope | Fluent UI React v9 |
| confidence | Med — community discussion and package inspection agree, but no released API enforces either choice |
| informsRules | RULE-011 |

### FND-012 — Message bars and toasts carry different persistence

| Field | Value |
| --- | --- |
| statement | Message bars present persistent surface-level status that re-surfaces warnings and errors, while toasts are temporary, non-critical status grouped by intent; choosing the wrong one loses urgent context or leaves stale noise. |
| kind | official-fluent-guidance |
| sources | SRC-022 (heading: Types) and SRC-023 (heading: Behavior) |
| versionScope | Fluent UI React v9 |
| confidence | High — stated component behavior |
| informsRules | RULE-015 |

## Risky Simplifications Register

| Simplification | Verdict | Because | Sources |
| --- | --- | --- | --- |
| Every form belongs in a dialog | reject | Multi-section records and grouped validation need a page with persistent context; dialogs suit short focused tasks and must not host long forms. | SRC-014, SRC-013 |
| Every page needs cards | reject | Cards group the information and actions for a single object; decorative card grids add nesting without meaning and are explicitly discouraged as a default. | SRC-024, SRC-004 |
| A grid component automatically provides server-side data operations | reject | DataGrid and Table are presentation and interaction surfaces; sorting, filtering, and pagination against a remote dataset are application responsibilities. | SRC-027, SRC-030 |
| A primary button always belongs at a fixed viewport side | reject | Command placement follows the task and reading order; pinning a primary action to a fixed side is a product convention, not a Fluent rule. | SRC-019, SRC-004 |
| Disabled submit buttons are always the best validation approach | reject | Disabling submit hides the reason it is disabled; prefer enabled submission with accessible inline errors so users can discover and fix problems. | SRC-013, SRC-035 |
| A placeholder or tooltip can replace a persistent accessible label | reject | Placeholders vanish on input and are not reliable accessible names; a persistent label is required. | SRC-013, SRC-038 |
| Using Fluent components guarantees accessibility | reject | Fluent provides an accessible baseline, but composition, labels, focus management, and content still determine whether a screen is accessible. | SRC-011, SRC-035 |
| An observed screenshot establishes a universal spacing rule | reject | Screenshots show one state at one time; spacing comes from the documented 4px ramp and proximity, not from measuring a picture. | SRC-004 |
