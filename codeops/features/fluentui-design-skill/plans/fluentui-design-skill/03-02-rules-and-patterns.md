# Rules and Patterns: fluentui-design-skill

> **Document**: 03-02-rules-and-patterns.md
> **Parent**: [Index](00-index.md)
> **Implements**: RD-04, RD-05

## Overview

This component owns the project's intellectual output: the operational rules catalog (RD-04) and the
eight application patterns (RD-05). Rules are structured JSON so they can be validated and cited;
patterns are authored Markdown with light frontmatter so the generator can build the decision index.
The distinguishing design choice is that every rule carries a **verified** component mapping or is
explicitly `application-owned`, so no invented component is ever presented as a library API.

## Architecture

### Proposed Changes

```
rules/rules.json          ← canonical rules (validated)
rules/rules.schema.json
rules/rules.md            ← generated, grouped by decision area
facts/verified-exports.json ← allowed export/subcomponent names (plan AR #5)

skill/references/patterns/PAT-001-*.md … PAT-008-*.md
  frontmatter: id, title, decisions[], rules[]
skill/references/index.md ← generated decision index (Phase 4)
```

### Data flow

`research/findings.md` → rule authors → `rules.json` → `validate-rules.ts` + `check-facts.ts`
component-mapping check → `generate.ts` emits `rules.md` and the pattern index.

## Implementation Details

### New Types/Interfaces

```ts
/** A verified library export, or an application-owned composition (RD-04). */
export type ComponentMapping =
  | { kind: 'verified'; package: string; version: string; exports: string[] }
  | { kind: 'application-owned'; note: string };

/** One operational rule (RD-04). */
export interface RuleEntry {
  id: string;                 // ^RULE-\d{3}$
  title: string;
  decision: string;
  decisionArea: DecisionArea; // e.g. 'navigation' | 'forms' | 'data-grid' | ...
  classification: 'requirement' | 'recommendation' | 'convention' | 'observation';
  strength: 'must' | 'should' | 'may';
  appliesWhen: string;
  exceptions: string;
  notApplicableWhen: string;
  instruction: string;
  rationale: string;
  componentMapping: ComponentMapping;
  layoutConsequences: string;
  responsiveConsequences: string;
  accessibilityImplications: string;
  stateImplications: string;
  evidenceSourceIds: string[];      // SRC-###, must exist
  locators: string[];
  derivedFromFindings: string[];    // FND-###
  confidence: { level: 'High' | 'Med' | 'Low'; wouldChangeIf: string };
  unresolved: string;
  positiveExample: string;
  antiPattern: string;
  verificationMethod: string;
  relatedRules: string[];           // RULE-###
  supersedes: string[];             // RULE-###
}
```

Pattern frontmatter:

```yaml
---
id: PAT-003
title: Record detail page
decisions: [main-page-vs-drawer-vs-dialog, permissions-read-only]
rules: [RULE-012, RULE-031]
derived: [application-owned composition; no matching v9 export]
---
```

### Validator behavior (`scripts/validate-rules.ts`)

1. Schema-validate `rules.json` (unique ids, enum membership, required strings).
2. Assert every `evidenceSourceIds` entry exists in `sources.json`.
3. Assert `componentMapping.kind === 'verified'` implies every export exists in
   `facts/verified-exports.json` for the pinned package/version; otherwise report the unknown export.
4. Assert each rule has a non-empty `instruction` containing an imperative verb, and at least one of
   `positiveExample`/`antiPattern` plus `verificationMethod`.

### Actionability lint (`scripts/lint-rules.ts`)

Flags a rule for manual review when `instruction` is shorter than 40 characters or contains a banned
phrase from a fixed list (`intuitive`, `user-friendly`, `best practice`, `clean`, `nice`,
`modern`). The lint is a warning list, not a hard failure, except when `instruction` is empty. It must
flag a deliberately non-operational draft and pass the real catalog (RD-04 AC 5).

### Pattern documents

Each `PAT-###` file contains every section of the RD-05 template (user task, when to use/not, region
order, component mapping, interaction flow, state ownership, responsive behavior, accessibility, edge
cases, rules applied, derived decisions, tests). Component mapping obeys the same verified-or-
application-owned rule as rules. `decisions[]` values come from a fixed vocabulary of the seventeen
decisions listed in RD-05; the generator errors on an unknown decision key.

### Decision index

`skill/references/index.md` is generated from `rules.json` and the pattern frontmatter: one row per
decision, listing the patterns and rules that resolve it. This is the routing table an agent reads to
find guidance by decision instead of by component name.

## Error Handling

| Error Case | Handling Strategy | Ref |
| ---------- | ----------------- | --- |
| Rule cites an unknown `SRC-###` | Validator error naming the rule and id; exit 1 | RD-04 |
| `componentMapping` names an export not in the allowlist | Validator error; exit 1 | plan AR #5 |
| Pattern frontmatter missing a required key | Reference gate error; exit 1 | RD-05 |
| Pattern `decisions[]` uses an unknown key | Generator error listing valid keys; exit 1 | RD-05 |
| Pattern contradicts a `must` rule without exception | Manual review finding; documented in the pattern | RD-05 |

## Testing Requirements

- Specification tests for rule validation (duplicate id, dangling source, invalid enum, bad mapping)
  and for the actionability lint (`ST-12`..`ST-16`).
- Implementation tests for frontmatter parsing and decision-index generation.
- A test asserts the shipped catalog contains ≥1 `application-owned` rule and no export outside the allowlist.
