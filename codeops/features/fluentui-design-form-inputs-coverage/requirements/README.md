# fluentui-design — Form Input Coverage Requirements

> **Feature**: fluentui-design-form-inputs-coverage — form input evidence and control-choice rules
> **Status**: Requirements
> **Created**: 2026-09-22
> **Architecture**: Content-only change to the evidence pipeline (sources → findings → rules → coverage → patterns)
> **CodeOps Artifact Schema**: 1

---

## Overview

The skill covers labels, validation timing, and form layout, but not which input control to use for
a given value. `SRC-039` records that gap. This feature analyzes the v9 form-control usage pages and
adds a small set of additive `forms` rules. It is a content change: no code, no dependency, no
pattern or decision-key change, and no baseline re-pin.

## Minimum-Sufficient Baseline

**Original goal:** Give an agent evidence-backed guidance for choosing among the v9 form controls.

**Smallest viable design:** Mark `SRC-039` analyzed with the usage-page locators, add five findings
and six additive `forms` rules, update the coverage rows and `PAT-004`, and regenerate. Keep the
pattern set at 8 and the decision index at 17.

**Excluded support machinery:** no new pattern, decision key, rule area, dependency, evaluation
task, docs, or code. Date/time controls and a SpinButton usage page are explicitly excluded.

**Approved complexity:** none requested; additive content inside the existing pipeline.

## Domain Glossary

| Term | Definition |
|------|-----------|
| Source (`SRC-###`) | A catalogued, citable reference with a status and locators. |
| Finding (`FND-###`) | A synthesized statement extracted from sources, classified by authority. |
| Rule (`RULE-###`) | Actionable guidance derived from findings and mapped to verified exports. |
| Decision area | The stable key (`forms`) a rule and pattern resolve. |

## Document Index

| # | Document | Description | Depends On |
|---|----------|-------------|------------|
| **AR** | [Ambiguity Register](00-ambiguity-register.md) | Zero-Ambiguity Gate decisions | — |
| **RD-01** | [RD-01 Form Input Coverage](RD-01-form-inputs-coverage.md) | The complete requirement | — |

## Dependency Graph

```
RD-01 (form input evidence and control-choice rules)
```

## Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Cover set | Eight usage-page controls plus Field | SpinButton has no page; date/time are not exports (AR #1–3) |
| Source handling | Resolve SRC-039 | It is the recorded discovery target (AR #4) |
| Structure | No new pattern or decision key | Keeps the 8/17 oracles and avoids a complexity stop (AR #7) |
| Shipping | Minor release from `main` | New guidance (AR #11) |

## How to Use These Documents

1. Pick the requirement document (RD-01).
2. Run the make-plan skill to produce the implementation plan.
3. Run the exec-plan skill to implement it.
