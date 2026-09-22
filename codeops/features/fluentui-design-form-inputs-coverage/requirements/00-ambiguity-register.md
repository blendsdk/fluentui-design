# Ambiguity Register: fluentui-design-form-inputs-coverage

> **Status**: ✅ GATE PASSED — all items resolved
> **CodeOps Artifact Schema**: 1

| # | Category | Ambiguity | Resolution | Authority |
|---|----------|-----------|------------|-----------|
| AR-1 | Scope | How much of SRC-039 to cover | Cover the eight controls with Fluent 2 usage pages (Input, Textarea, Select, Dropdown, Combobox, Checkbox, RadioGroup, Switch) plus Field; exclude date/time controls and treat SpinButton as package-source-only | User |
| AR-2 | Missing pages | SpinButton has no Fluent 2 usage page (the URL returns a not-found page) | Ground the SpinButton rule in the v9 package source (`SRC-027`) and record the absence in the SRC-039 summary | User |
| AR-3 | Non-exports | The pinned aggregate does not export `DatePicker`, `TimePicker`, or `Calendar` | Exclude date/time controls from the rule set and note it in the source summary | User |
| AR-4 | Source handling | Resolve SRC-039 or add a new source | Mark `SRC-039` `analyzed`, retitle it "Form input components", and update its locators and summary | User |
| AR-5 | Rule set | Which rules to add | `RULE-037` control choice by value domain; `RULE-038` Switch only for immediate effect; `RULE-039` Select versus Dropdown/Combobox by list size and search; `RULE-040` plain-text value for complex options; `RULE-041` inline popup for assistive navigation; `RULE-042` explicit bounds and stepping for numeric input | User |
| AR-6 | Findings | Record the evidence | `FND-019`..`FND-023` under the official-guidance and implementation-fact kinds | User |
| AR-7 | Structure | New pattern or decision key | Neither; enrich `PAT-004` and the existing `forms` decision area | User |
| AR-8 | Docs | README/COMPLETION changes | None required; the form gap was not listed as a top limitation | User |
| AR-9 | Coverage | Keep the matrix reviewable | Update the forms topic and the form-page pattern rows; summary stays 12 topics / 8 patterns / 0 gaps | User |
| AR-10 | Verification | What verifies the change | The catalog gates plus `npm run verify`; no code or new tests | User |
| AR-11 | Release | How it ships | Minor bump via the release workflow, `latest` | User |

> **Traceability:** each resolution is reflected in [RD-01](RD-01-form-inputs-coverage.md) and the plan documents.
