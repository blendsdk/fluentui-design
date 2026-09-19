# Conflicts

> Recorded disagreements between sources. Each entry lists the involved sources with scope, the
> exact issue, a resolution or an explicit `unresolved`, the rationale, and what remains uncertain.
> A discrepancy that cannot be resolved is preserved rather than smoothed over.

## Conflicts

### CNF-001 — Which surface hosts an edit: dialog or drawer?

| Field | Value |
| --- | --- |
| id | CNF-001 |
| issue | Dialog guidance and drawer guidance both describe a focused edit surface, leaving unclear which to choose for a short edit. |
| sources | SRC-014 (Fluent UI React v9 dialog) and SRC-015 (Fluent UI React v9 drawer) |
| resolution | Use a drawer for a contextual two-to-three-step edit that keeps surrounding context, and a dialog for a short blocking task or a confirmation; confirm with a dialog before discarding edits. |
| rationale | Drawer guidance limits flows to two or three steps and treats the panel as a secondary surface; dialog guidance treats the dialog as a blocking focused task and forbids nesting. |
| uncertainty | The boundary at three or more steps is a judgment call, not a fixed rule. |
| tested | untested |

### CNF-002 — Grid sorting and filtering: local or server-side?

| Field | Value |
| --- | --- |
| id | CNF-002 |
| issue | It is unclear whether sorting, filtering, and pagination should run locally on the loaded data or against a server. |
| sources | SRC-030 (GitHub Discussions, v9) and SRC-027 (v9 react-table package source) |
| resolution | unresolved |
| rationale | The component supplies presentation and interaction, not data operations; the right choice depends on dataset size, ownership, and latency, none of which the sources settle. |
| uncertainty | No released API enforces either approach, and the community threads describe both; revisit when the fixture or a real dataset makes volume and ownership concrete. |
| tested | untested |

### CNF-003 — Fluent meets WCAG 2.1 AA, but the project targets 2.2 AA

| Field | Value |
| --- | --- |
| id | CNF-003 |
| issue | Fluent 2 accessibility guidance says its components meet or exceed WCAG 2.1 AA, while the project targets WCAG 2.2 AA. |
| sources | SRC-011 (Fluent 2 accessibility) and SRC-035 (WCAG 2.2) |
| resolution | Treat Fluent components as an accessible baseline, then verify the composition against WCAG 2.2 with automated checks plus manual keyboard and visual review; never claim conformance. |
| rationale | WCAG 2.2 adds criteria (for example focus not obscured and target size) that a 2.1 AA platform claim does not cover, and conformance is always a property of the full page, not of a component library. |
| uncertainty | Which new 2.2 criteria a given Fluent component already satisfies is not documented. |
| tested | untested |

### CNF-004 — Accordion defaults versus form error visibility

| Field | Value |
| --- | --- |
| id | CNF-004 |
| issue | Accordion guidance defaults items to collapsed, but form guidance requires errors and required fields to be discoverable. |
| sources | SRC-016 (Fluent UI React v9 accordion) and SRC-038 (WAI forms tutorial) |
| resolution | Keep task-required fields and their validation feedback outside collapsed sections; use accordions only for optional or advanced content. |
| rationale | Collapsed content is not announced or visible by default, so errors inside it can be missed; disclosure is for progressive detail, not for required input. |
| uncertainty | None material. |
| tested | Implementation claim verified — imported `@fluentui/react-components` 9.74.7 and confirmed that FluentProvider, Dialog and Drawer parts, DataGrid parts, Table, Nav, Toolbar, Toast and Toaster, Field, MessageBar, Card, Breadcrumb, Popover, Tooltip, Spinner, Skeleton, ProgressBar, Badge, Accordion, Tree, and the form controls are all exported. Method: dynamic `import` of the installed package plus a membership check; result: pass (no missing exports). |
