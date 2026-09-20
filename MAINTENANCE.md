# Maintenance and Re-Pin Guide

The bundled rules and patterns are pinned to one reviewed baseline. This guide explains how to keep
them trustworthy: how to recheck sources, how to spot redirects and content changes, how to move the
package baseline, how to find the rules a changed fact affects, how to rerun the examples, and how
to keep a history of replaced guidance.

The golden rule: **never hand-edit a generated file.** Generated files start with a
`<!-- GENERATED FILE — DO NOT EDIT` marker. Regenerate them with `npm run generate`; the drift gate
(`npm run generate:check`) fails the build if a generated file diverges.

## 1. Recheck the sources

Start from [`sources/sources.json`](sources/sources.json). Each entry records a `requestedUrl`, a
`resolvedUrl`, a `retrievalDate`, a `status`, and the locators that were read.

1. Re-fetch every source whose `status` is `analyzed` or `retrieved`.
2. Update its `retrievalDate` and keep the locators accurate.
3. Validate the catalog:

   ```
   npm run validate:sources
   ```

4. Regenerate the human-readable catalog and confirm no drift:

   ```
   npm run generate
   npm run generate:check
   ```

## 2. Detect redirects and content changes

While re-fetching:

- If `resolvedUrl` differs from `requestedUrl`, the page moved. Record the new `resolvedUrl` and
  note the redirect in the affected rules' evidence.
- If a section named by a locator disappeared, the guidance may have changed. Open the rule that
  cited it and re-read the evidence before trusting it.
- If a source can no longer be reached, set its `status` to `blocked` (temporarily unavailable) or
  `obsolete` (replaced or withdrawn), add an `accessLimitation` or `exclusionReason`, and list every
  rule that depends on it. Move affected rules to `[!]` state in your notes and mark them for review.
- Re-run `npm run validate:sources` and `npm run lint:rules` after any status change.

## 3. Update the package baseline

A new baseline is a deliberate act, not a side effect of installing a newer package.

1. Install the new `@fluentui/react-components` version and note its exact number.
2. Regenerate the API-fact allowlist from the sibling `fluentui-mcp` enhanced schema:

   ```
   npm run extract-facts
   npm run check:facts
   ```

3. Record the new facts commit and package version. Update the baseline table in
   [`README.md`](README.md), the baseline in [`skill/SKILL.md`](skill/SKILL.md), and the pinned
   values in `AGENTS.md` **together**, so no reader sees a mismatch.
4. Append a `CHANGELOG.md` entry naming the old and new package version and the old and new facts
   commit.

## 4. Identify the rules a fact change affects

When a component fact changes, find the rules that depend on it instead of updating rules by
guesswork.

1. Search `rules/rules.json` for the changed export, component, or token name.
2. For each match, re-read the rule's evidence in `research/coverage.md` and confirm the rule still
   holds under the new baseline.
3. If a rule no longer holds, **do not edit it away.** Keep the old rule's `RULE-###` id and text,
   write the successor as a new rule, and list the old id in the **successor's** `supersedes` array
   (the field means "this rule replaces the listed older rules"). Add a plain "Superseded by
   `RULE-0YY`" sentence to the old rule so a reader following it sees the forward pointer, and append
   an entry to the "Replaced guidance history" section of [`CHANGELOG.md`](CHANGELOG.md) with the
   reason and the successor.
4. Validate and regenerate:

   ```
   npm run validate:all
   npm run lint:rules
   npm run generate
   npm run generate:check
   ```

## 5. Rerun the examples and the evaluation

The `fixture/` application and the `evaluation/` evidence must both reflect the current baseline.

1. Build and test the fixture with Playwright and axe:

   ```
   npm run test:e2e
   ```

2. Run the deterministic evaluation gate and update [`evaluation/results.md`](evaluation/results.md)
   with the new evidence:

   ```
   npm run check:evaluation
   ```

3. Run the full gate before publishing the change:

   ```
   npm run verify
   ```

## 6. Retain a history of replaced guidance

History is appended, never rewritten.

- Stable ids (`SRC-###`, `RULE-###`, `PAT-###`) are permanent. A superseded item keeps its id and is
  listed in its successor's `supersedes` array; its text also gains a "Superseded by `RULE-0YY`"
  sentence. An id is never reused or renumbered.
- Each replacement is recorded in the `CHANGELOG.md` "Replaced guidance history" section with the
  rule id, the reason for the change, and the successor.
- A rewritten sentence is a new version of the rule, not a silent edit: note it so a reader can see
  why the guidance changed.

## Related documentation

- [README.md](README.md) — scope, usage, and baseline.
- [CHANGELOG.md](CHANGELOG.md) — versions and replaced-guidance history.
- [COMPLETION-REPORT.md](COMPLETION-REPORT.md) — completed, blocked, and untested work.
