# Content Design: Form Input Evidence and Control-Choice Rules

> **Document**: 03-content-design.md
> **Parent**: [Index](00-index.md)

## Overview

The exact content to change: resolve `SRC-039`, add `FND-019`..`FND-023`, add `RULE-037`..`RULE-042`
under `decisionArea: forms`, update two coverage rows, and enrich `PAT-004`. Deterministic; the
executor writes these values verbatim.

## Source: SRC-039 (updated in place)

| Field | New value |
| ----- | --------- |
| title | `Form input components` |
| requestedUrl / resolvedUrl | `https://fluent2.microsoft.design/components/web/react` |
| category | `component-usage` |
| platform | `web-react` |
| tags | `input, textarea, select, dropdown, combobox, checkbox, radiogroup, switch, field, control-choice` |
| applicableVersion | `Fluent UI React v9` |
| retrievalDate | `2026-09-22` |
| status | `analyzed` |
| locators | anchor `.../core/input/usage`, `.../core/textarea/usage`, `.../core/select/usage`, `.../core/dropdown/usage`, `.../core/combobox/usage`, `.../core/checkbox/usage`, `.../core/radiogroup/usage`, `.../core/switch/usage`, `.../core/field/usage` |
| summary | The Fluent 2 usage pages for the v9 form controls: how the value's domain selects the control, that a Checkbox is submitted while a Switch applies immediately and supports an indeterminate parent, how Dropdown and Combobox options need a plain-text value and benefit from an inline popup, and how Input carries free text. The SpinButton control has no Fluent 2 usage page and is grounded in the v9 package source instead, and DatePicker, TimePicker, and Calendar are not exports of the pinned aggregate and are out of scope. |

`evidenceRefs`, `conflicts`, `linkedRuleIds` stay `[]`.

## Findings: FND-019..FND-023

| ID | Kind | Statement | Sources | informsRules | Confidence |
| -- | ---- | --------- | ------- | ------------ | ---------- |
| FND-019 | official-fluent-guidance | The value's domain selects the control: `Input`/`Textarea` for free text, `RadioGroup` for a small exclusive set, `Select` for a short fixed list, `Combobox`/`Dropdown` for a long or searchable list, `Checkbox` for a submitted boolean, `Switch` for an immediate on/off, and a numeric control for a bounded quantity. | `SRC-039 (anchor: .../core/input/usage, .../core/checkbox/usage, .../core/dropdown/usage)`, `SRC-013` | RULE-037, RULE-039 | High |
| FND-020 | official-fluent-guidance | A Checkbox does not take effect until submit and supports an indeterminate state for a parent that controls a partially selected group, while a Switch changes its setting immediately; choose by whether the change is committed later or applied at once. | `SRC-039 (anchor: .../core/checkbox/usage, .../core/switch/usage)` | RULE-038 | High |
| FND-021 | official-fluent-guidance | A Dropdown or Combobox option whose visible content is complex must also carry a plain-text value so the closed field and type-ahead matching read correctly. | `SRC-039 (anchor: .../core/dropdown/usage)` | RULE-040 | High |
| FND-022 | official-fluent-guidance | Rendering an option popup inline, immediately after its trigger in the DOM, improves screen-reader navigation where `aria-owns` is unsupported. | `SRC-039 (anchor: .../core/dropdown/usage)` | RULE-041 | Med — stated for Safari VoiceOver |
| FND-023 | versioned-implementation-fact | SpinButton steps a numeric value; `min`/`max` clamp and announce the bounds, `step` sets the increment and default precision, `stepPage` sets the Page Up/Down jump, and `displayValue` shows a formatted string while `value` stays numeric. | `SRC-027 (repo-path: packages/react-components/react-spinbutton)` | RULE-042 | High |

## Rules: RULE-037..RULE-042

All six use `decisionArea: forms` and `supersedes: []`. `componentMapping` uses only verified exports.

| Rule | Title | Class | Strength | Applies when | Instruction |
| ---- | ----- | ----- | -------- | ------------ | ----------- |
| RULE-037 | Choose the input control that matches the value domain | recommendation | should | A form collects a value whose allowed shape is known | Choose Input or Textarea for free-form text, RadioGroup for a small exclusive set, Select for a short fixed list, Combobox or Dropdown for a long or searchable list, Checkbox for a submitted boolean, Switch for an immediate on/off, and SpinButton for a bounded numeric quantity. |
| RULE-038 | Use Switch only for a setting that changes immediately | requirement | must | A form presents an on/off value | Use a Switch only when the change takes effect immediately, and use a Checkbox for a value submitted with the form; give a parent Checkbox an indeterminate state when it controls a partially selected group. |
| RULE-039 | Prefer a native Select for a short, fixed list | recommendation | should | A form offers a fixed set of options | Prefer a native Select for a short, fixed list of options, and choose Combobox or Dropdown when the list is long, must be searched or typed into, or needs custom option content. |
| RULE-040 | Give every complex option a plain-text value | requirement | must | A Dropdown or Combobox option has complex or composed content | Provide a plain-text value for every Dropdown or Combobox option whose visible content is complex or composed, so the closed field and type-ahead matching use the text. |
| RULE-041 | Render the option list inline for assistive navigation | recommendation | should | A Dropdown or Combobox renders an option popup | Prefer an inline option popup that follows the trigger in the DOM so assistive navigation reaches the list where aria-owns is unsupported. |
| RULE-042 | Make a bounded numeric input explicit | recommendation | should | A form collects a numeric value that has meaningful bounds or steps | Set the minimum and maximum on a bounded numeric input, choose a step that divides the range, set the larger page step as a multiple, and parse a formatted display value back to a number. |

Per-rule fields:

| Rule | exports | evidenceSourceIds | locators | derivedFromFindings | confidence | relatedRules |
| ---- | ------- | ----------------- | -------- | ------------------- | ---------- | ------------ |
| RULE-037 | Input, Textarea, RadioGroup, Select, Combobox, Dropdown, Checkbox, Switch, SpinButton | SRC-039, SRC-013 | core/input/usage, core/checkbox/usage, core/dropdown/usage | FND-019 | High | RULE-038, RULE-039 |
| RULE-038 | Switch, Checkbox, Field | SRC-039 | core/checkbox/usage, core/switch/usage | FND-020 | High | RULE-037 |
| RULE-039 | Select, Combobox, Dropdown, Option | SRC-039 | core/select/usage, core/dropdown/usage, core/combobox/usage | FND-019 | High | RULE-037, RULE-040 |
| RULE-040 | Dropdown, Combobox, Option | SRC-039 | core/dropdown/usage | FND-021 | High | RULE-039 |
| RULE-041 | Dropdown, Combobox | SRC-039 | core/dropdown/usage | FND-022 | Med | RULE-039, RULE-022 |
| RULE-042 | SpinButton, Input, Field | SRC-027, SRC-039 | packages/react-components/react-spinbutton | FND-023 | High | RULE-037, RULE-005 |

Each rule also records `decision`, `exceptions`, `notApplicableWhen`, a `rationale`, the four
consequence fields, `unresolved: ""`, a positive example, an anti-pattern, and a
`verificationMethod`.

## Coverage Rows

| Section | Row | Change |
| ------- | --- | ------ |
| Coverage Topics | "Forms, field choice, grouping, validation and submission" | sources add `SRC-039`; reviewed evidence adds control choice, immediacy, option text, inline popup, and numeric bounds; extracted rules add `RULE-037`..`RULE-042` |
| Required Patterns | "Create and edit form page with grouped fields and validation" | sources add `SRC-039`; extracted rules add `RULE-037`..`RULE-042` |

Summary counts stay `12` topics, `8` patterns, `0` gaps.

## Pattern: PAT-004-form-page.md

| Section | Edit |
| ------- | ---- |
| frontmatter `rules` | add `RULE-037`..`RULE-042` |
| frontmatter `components` | add `SpinButton` (the rest are already listed) |
| Component mapping | name the control-choice rule: pick the control by value domain before composing fields |
| Accessibility | name option text, inline popup, and the Switch/Checkbox immediacy distinction |
| Edge cases | note that a numeric value with no meaningful step stays a plain Input and that a parent checkbox uses the indeterminate state |
| Rules applied | list the full rule set |
