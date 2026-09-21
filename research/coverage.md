# Coverage Matrix

> Human-readable completeness evidence for the skill. Every rule in the rules catalog maps to at
> least one row below, and every cited source resolves in the source catalog.

## Summary

| Metric | Count |
| --- | --- |
| Topics supported | 12 |
| Topics with gaps | 0 |
| Patterns supported | 8 |
| Patterns with gaps | 0 |

## Coverage Topics

| Topic | Sources | Reviewed evidence | Extracted rules | Unresolved questions | Examples | Status | Gap note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| App shell, navigation hierarchy, breadcrumbs and deep links | SRC-018, SRC-012, SRC-011 | Nav guidance on one-level nesting and overlay behavior at narrow widths; accessibility structure and focus order. | RULE-001, RULE-002 | | fixture: shell and nav | Supported | |
| Page headings, command areas, content width, spacing and density | SRC-004, SRC-007, SRC-021 | Layout proximity and 4px spacing ramp; type ramp; toolbar action grouping and overflow. | RULE-003, RULE-004 | | fixture: page header and toolbar | Supported | |
| Forms, field choice, grouping, validation and submission | SRC-013, SRC-038, SRC-035 | Field labeling and validation behavior; WAI form labeling and validation guidance; WCAG error identification. | RULE-005, RULE-006, RULE-007 | | fixture: record editor | Supported | |
| Dialogs, drawers, popovers, tooltips and inline editing | SRC-014, SRC-015, SRC-017 | Dialog modality and focus rules; drawer scope and confirm-on-loss; menu versus input controls. | RULE-008, RULE-009 | | fixture: drawer and dialog | Supported | |
| Table and DataGrid, selection, sorting, filtering and bulk actions | SRC-046, SRC-027, SRC-037, SRC-012 | v9 DataGrid docs and source for the compare requirement that makes a column sortable, composite focus and per-cell focusMode, preview column resizing with overflow, selection naming, and extension virtualization; APG grid and table keyboard patterns; component index. | RULE-010, RULE-011, RULE-012, RULE-031, RULE-032, RULE-033, RULE-034, RULE-035, RULE-036 | | fixture: list and grid | Supported | |
| Tabs, accordions, disclosure and optional settings | SRC-016, SRC-020, SRC-037 | Accordion disclosure rules and the prohibition on hiding task-required content; tablist content switching; APG accordion and tabs patterns. | RULE-013, RULE-014 | | fixture: settings | Supported | |
| Feedback, empty states, loading, errors and recovery | SRC-022, SRC-023, SRC-012 | Message bar persistence and urgency levels; toast timing and intent; component index for spinner and skeleton. | RULE-015, RULE-016 | | fixture: empty and error states | Supported | |
| Themes, typography, color, elevation, icons and motion | SRC-005, SRC-006, SRC-007, SRC-008, SRC-009, SRC-010 | Global and alias token model; palette and contrast; type ramp; icon naming and licensing; elevation ramp; motion principles and reduced-motion duties. | RULE-017, RULE-018, RULE-019 | | fixture: light and dark themes | Supported | |
| Keyboard interaction, focus, semantics and announcements | SRC-011, SRC-035, SRC-036, SRC-038 | Fluent focus and semantic guidance; WCAG focus visible and name/role/value criteria; APG keyboard interfaces; WAI form grouping. | RULE-020, RULE-021, RULE-022 | | fixture: overlay focus and axe | Supported | |
| Responsive behavior, localization, long content and RTL | SRC-004, SRC-011, SRC-035 | Responsive techniques and breakpoints; reflow and zoom expectations; WCAG reflow and orientation. | RULE-023, RULE-024, RULE-025 | Whether the fixture needs a full RTL pass beyond logical properties — revisit: when a localization requirement is authorized. | fixture: narrow and wide viewports | Supported | |
| React composition, state ownership, tokens and styling | SRC-003, SRC-031, SRC-026, SRC-027 | FluentProvider setup and Griffel styling; Griffel CSS-in-JS model; monorepo and package layout. | RULE-026, RULE-027, RULE-028 | | fixture: provider and styling | Supported | |
| End-to-end task flows and preservation of user work | SRC-015, SRC-013, SRC-035 | Drawer unsaved-change handling; field validation and recovery; WCAG error suggestion and prevention. | RULE-029, RULE-030 | Whether autosave is ever appropriate for the record editor — revisit: if a persistence backend is authorized. | fixture: editor dirty state | Supported | |

## Required Patterns

| Pattern | Sources | Reviewed evidence | Extracted rules | Unresolved questions | Examples | Status | Gap note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Application shell with global navigation, page heading and commands | SRC-018, SRC-004, SRC-033 | Nav hierarchy and responsive behavior; layout regions and spacing; Teams shell-style templates. | RULE-001, RULE-002, RULE-003 | | evaluation: task 1 | Supported | |
| Searchable and filterable list page with DataGrid or Table | SRC-046, SRC-027, SRC-037, SRC-012 | Grid keyboard model; DataGrid sorting, focus, resizing, selection, and virtualization; package source layout; component index for empty and loading states. | RULE-010, RULE-011, RULE-012, RULE-016, RULE-031, RULE-032, RULE-034, RULE-035, RULE-036 | | evaluation: task 1 | Supported | |
| Record detail page with summary and related information | SRC-004, SRC-012 | Layout regions and hierarchy; component index for cards and tabs. | RULE-003, RULE-029 | | evaluation: task 3 | Supported | |
| Create and edit form page with grouped fields and validation | SRC-013, SRC-038, SRC-035 | Field composition; WAI labeling grouping and validation; WCAG error identification and suggestion. | RULE-005, RULE-006, RULE-007, RULE-029, RULE-030 | | evaluation: task 1 and task 5 | Supported | |
| Short contextual edit in a drawer or focused dialog | SRC-014, SRC-015 | Dialog modality focus rules; drawer step limit and confirm-on-loss. | RULE-008, RULE-009 | | evaluation: task 2 | Supported | |
| Settings page with optional advanced sections | SRC-016, SRC-020 | Accordion disclosure rules; tab content switching and overflow. | RULE-013, RULE-014 | | evaluation: task 9 | Supported | |
| Multi-step task with review, back navigation and preserved state | SRC-033, SRC-015 | Teams wizard template; drawer unsaved-change handling. | RULE-029, RULE-030 | | evaluation: task 11 | Supported | |
| Dashboard whose content reflects actual tasks and data | SRC-033, SRC-022, SRC-024 | Teams dashboard template; message bars for status; card grouping. | RULE-003, RULE-015, RULE-016 | | evaluation: task 8 | Supported | |
