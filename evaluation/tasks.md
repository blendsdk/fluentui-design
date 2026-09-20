# Evaluation Tasks

> **Document**: tasks.md
> **Parent**: [README](README.md)
> **Implements**: RD-09

These twelve tasks give an agent a concrete composition problem and state what a good answer must
decide. They are the fixed inputs for scoring; the recorded results live in
[results.md](results.md) and the scoring instrument in [rubric.md](rubric.md).

Each task carries the fields below. `rules` lists the catalog rules whose decisions the answer must
respect, and `scenario` names the coverage scenario so the set can be checked for completeness.

| Field | Meaning |
| --- | --- |
| scenario | Stable scenario slug from the requirement. |
| input | The prompt or scenario given to the agent. |
| expectedDecisionProperties | What a good answer must decide. |
| rules | Relevant `RULE-###` ids. |
| acceptableAlternatives | Other outcomes that are still correct. |
| failureConditions | What makes an answer wrong. |
| scoring | How points are awarded for this task. |

## Tasks

### EVAL-001 — Customer management list and editor

| Field | Value |
| --- | --- |
| scenario | customer-list-and-editor |
| input | Build a customer management screen: a searchable, filterable list of customers and an editor for one customer. |
| expectedDecisionProperties | Place global navigation, page heading, and commands in named regions; use a data grid with labeled selection and a per-row edit action; route the edit to a panel whose scope matches the task; surface loading, empty, no-results, and error states; keep work when a save fails. Follow PAT-002. |
| rules | RULE-010, RULE-011, RULE-012, RULE-016 |
| acceptableAlternatives | A full-page editor instead of a side panel for a large record; a table instead of a data grid when virtualization is unneeded. |
| failureConditions | Selection checkboxes without names; an empty state with no route to create a record; a failed save that discards the draft; filters that cannot be cleared. |
| scoring | 4 points when every decision property is met; subtract 1 per missing region, state, or recovery path; 0 when the save path loses data. |

### EVAL-002 — Short rename versus complex multi-section record

| Field | Value |
| --- | --- |
| scenario | short-rename-vs-complex-record |
| input | Add a way to rename a record, and separately a way to edit a record with several sections of fields. Decide the surface for each. |
| expectedDecisionProperties | Choose a lightweight surface for the short rename and a roomier surface for the multi-section record; state the trigger that ends each surface; confirm before discarding a dirty draft; keep the two surfaces consistent. Follow PAT-003 and PAT-005. |
| rules | RULE-008, RULE-009 |
| acceptableAlternatives | A focused dialog for the short rename; a full page for the multi-section record. |
| failureConditions | A multi-step wizard crammed into a drawer; no confirmation on losing edits; the same task done two different ways on one screen. |
| scoring | 4 points for a matched surface pair with explicit close and dirty-draft behavior; 2 when one surface is mismatched; 0 when edits are silently lost. |

### EVAL-003 — Essential fields or errors hidden in accordions

| Field | Value |
| --- | --- |
| scenario | fields-or-errors-hidden-in-accordions |
| input | A form hides optional sections in accordions, but users miss required fields and validation errors that are collapsed inside them. |
| expectedDecisionProperties | Keep task-required inputs and their errors visible; use disclosure only for genuinely optional content; on submit failure, open or announce the collapsed section that holds the error and move focus to the first invalid field; keep the summary error text in the live region. Follow PAT-006. |
| rules | RULE-013, RULE-014 |
| acceptableAlternatives | Tabs instead of accordions when sections are peers; a flat form with an explicit advanced region. |
| failureConditions | A required field inside a collapsed section; a submit error with no location; focus left at the bottom of the form. |
| scoring | 4 points when no required content is collapsed and every error is reachable; 2 when errors are reachable but not announced; 0 when a required field stays hidden. |

### EVAL-004 — Wide grid adapted to a narrow viewport

| Field | Value |
| --- | --- |
| scenario | wide-grid-to-narrow-viewport |
| input | A wide data grid overflows on a narrow screen. Make it usable at a phone width. |
| expectedDecisionProperties | Keep the primary column and the row action reachable; move secondary columns behind an explicit disclosure or an expandable row; preserve keyboard access and column meaning; avoid horizontal scrolling for the primary task; test at a documented narrow width. Follow PAT-002. |
| rules | RULE-023, RULE-024, RULE-025 |
| acceptableAlternatives | A card list under a breakpoint; a stacked definition list per row. |
| failureConditions | Content clipped with no way to reach it; column headers lost; a layout that only works at one width. |
| scoring | 4 points when the primary task works at a narrow width with all content reachable; 2 when some columns are reachable only by scrolling; 0 when the row action is unreachable. |

### EVAL-005 — Competing primary actions and ambiguous save or cancel

| Field | Value |
| --- | --- |
| scenario | competing-primary-actions |
| input | A screen shows several prominent buttons and users cannot tell which one saves or how to leave without saving. |
| expectedDecisionProperties | Name one primary action per region; keep destructive or secondary actions visually quieter; use clear commit and dismiss labels that state their effect; place commands where their scope is obvious; confirm only when work would be lost. Follow PAT-004. |
| rules | RULE-004, RULE-006, RULE-029 |
| acceptableAlternatives | Cancel at the start of the command bar; save and close as separate commands when both are honest. |
| failureConditions | Two equally weighted primary buttons; a button labeled only with an icon; a dismiss action that saves silently. |
| scoring | 4 points when each region has one clear primary action and labels state the outcome; 2 when labels are clear but hierarchy is flat; 0 when the save path is ambiguous. |

### EVAL-006 — v8 APIs introduced into a v9 project

| Field | Value |
| --- | --- |
| scenario | v8-apis-in-v9-project |
| input | A file imports components from an older Fluent UI package next to v9 code. Find and fix the mix. |
| expectedDecisionProperties | Name the v9 exports that replace the old imports; keep every replacement inside the verified export set; remove version-specific styling that the v9 theme provides; do not rename v9 props to old names. Follow PAT-001. |
| rules | RULE-026, RULE-027, RULE-028 |
| acceptableAlternatives | A compatibility shim only when the v9 export set truly lacks the component, with the gap named. |
| failureConditions | An import that does not exist in the pinned v9 package; a guessed component name; two component systems rendered on one screen. |
| scoring | 4 points when every replacement exists in the pinned export set; 0 when any invented export remains. |

### EVAL-007 — Dialog open and close with return focus

| Field | Value |
| --- | --- |
| scenario | dialog-focus-and-return |
| input | Add a confirmation dialog and make its keyboard behavior correct. |
| expectedDecisionProperties | Move focus into the dialog when it opens; trap focus while it is open; close on Escape; return focus to the element that opened it; give the dialog a name and a described body; keep the background inert. Follow PAT-005. |
| rules | RULE-008, RULE-020, RULE-021 |
| acceptableAlternatives | A drawer or popover when modality is not required, keeping the same focus contract. |
| failureConditions | Focus left behind the overlay; focus not returned to the trigger; Escape that closes without honoring the pending choice. |
| scoring | 4 points when open, trap, Escape, and return focus all work; 2 when return focus is missing; 0 when focus escapes the overlay. |

### EVAL-008 — Sorting the visible page versus a remote dataset

| Field | Value |
| --- | --- |
| scenario | visible-page-vs-remote-sorting |
| input | A grid is sorted on one page of a remote dataset. Make sorting correct for the whole dataset. |
| expectedDecisionProperties | Decide where sorting happens and say so; when the dataset is remote, send the sort to the server and keep the header state in sync; when data is local, sort the full collection and show the active column and direction; keep selection and scroll position sensible after sorting. Follow PAT-002. |
| rules | RULE-010, RULE-011 |
| acceptableAlternatives | Disable a sort on a column the server cannot order, with the reason shown. |
| failureConditions | Sorting only the current page while claiming a dataset sort; a header arrow that disagrees with the rows; a sort that loses the current selection. |
| scoring | 4 points when the sort location matches the data source and the header state is truthful; 2 when the header state is unclear; 0 when the displayed order contradicts the indicator. |

### EVAL-009 — Settings page with optional advanced options

| Field | Value |
| --- | --- |
| scenario | settings-with-advanced-options |
| input | Design a settings page where most options are simple and a few are advanced. |
| expectedDecisionProperties | Group options by task; keep common options plain and put advanced options behind disclosure or a separate tab; make the current value visible before it is changed; state what each setting affects; keep save behavior obvious. Follow PAT-006. |
| rules | RULE-013, RULE-014 |
| acceptableAlternatives | An advanced tab instead of a collapsed section when the content is large. |
| failureConditions | An advanced option that hides a value the user must know; a save that applies unrelated settings silently; settings with no effect statement. |
| scoring | 4 points when grouping, disclosure, and effect statements are all present; 2 when disclosure exists but effects are unstated; 0 when advanced options hide required choices. |

### EVAL-010 — Long translations and RTL layout

| Field | Value |
| --- | --- |
| scenario | long-translations-and-rtl |
| input | The interface must work with long translated labels and a right-to-left reading direction. |
| expectedDecisionProperties | Use logical spacing and alignment properties so the layout mirrors; let labels wrap or truncate with a full value available; avoid fixed widths that break under translation; keep icons and directional controls oriented for the reading direction; verify with a long-label case and a mirrored direction. Follow PAT-004. |
| rules | RULE-024, RULE-025 |
| acceptableAlternatives | A wider container under a breakpoint; a stacked label above its field. |
| failureConditions | Left or right physical spacing that does not mirror; text clipped with no full value; a control that points the wrong way in the mirrored direction. |
| scoring | 4 points when the mirrored direction and the long-label case both hold; 2 when only one holds; 0 when text is lost. |

### EVAL-011 — Light, dark, and forced-colors review

| Field | Value |
| --- | --- |
| scenario | light-dark-and-forced-colors |
| input | Review a screen in light and dark themes and under forced colors. |
| expectedDecisionProperties | Use design tokens instead of fixed colors so both themes resolve; keep text and essential boundaries above the contrast floor; keep focus indication visible in both themes and under forced colors; do not rely on color alone to carry meaning. Follow PAT-001. |
| rules | RULE-017, RULE-018, RULE-019 |
| acceptableAlternatives | A theme-specific token override when the shared token is wrong, recorded with the reason. |
| failureConditions | A hardcoded hex color; a state carried only by hue; a focus ring that disappears in forced colors. |
| scoring | 4 points when tokens, contrast, and focus hold in all three modes; 2 when one mode fails; 0 when meaning depends on color alone. |

### EVAL-012 — Reject an unsupported rule or a nonexistent component

| Field | Value |
| --- | --- |
| scenario | reject-unsupported-rule-or-component |
| input | A request claims an official rule requires a component that does not exist in Fluent UI React v9. Respond. |
| expectedDecisionProperties | State that the component is not in the pinned v9 export set; offer the nearest verified composition; separate verified library behavior from application convention; ask for evidence before following an unsupported rule; never invent an export. Follow PAT-001. |
| rules | RULE-026, RULE-027 |
| acceptableAlternatives | Name an official v9 component that covers the intent, or mark the gap as unsupported and stop. |
| failureConditions | An invented export name; a claim of official rule text that cannot be cited; silently following an unsupported instruction. |
| scoring | 4 points when the rejection is explicit and cites the verified export set; 0 when a nonexistent component is used. |
