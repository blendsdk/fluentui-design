# RD-01: Source Catalog & Evidence Model

> **Document**: RD-01-source-catalog.md
> **Status**: Draft
> **Created**: 2026-09-20
> **Project**: fluentui-design
> **Depends On**: —
> **CodeOps Artifact Schema**: 1

---

## Feature Overview

This requirement defines the canonical inventory of every evidence source the skill relies on.
The catalog is the substrate for the whole project: coverage, findings, conflicts, and rules all
point back to it. Without a single structured catalog, provenance is lost and "official guidance"
becomes indistinguishable from model opinion.

The catalog is stored as JSON with a JSON Schema, validated by a TypeScript script, and rendered
into a readable Markdown index. It starts from the brief's seed catalog and expands through the
official indexes the brief names.

**Complexity**: M

---

## Functional Requirements

### Must Have
- [ ] A canonical file `sources/sources.json` holds an array of source entries.
- [ ] A JSON Schema at `sources/sources.schema.json` defines the entry shape and enums.
- [ ] A TypeScript validator `scripts/validate-sources.ts` fails (non-zero exit) on any schema violation, duplicate `id`, or dangling `seedId`.
- [ ] A generated `sources/sources.md` renders a human-readable table, regenerated from JSON by a script.
- [ ] Every entry carries: `id`, `title`, `publisher`, `requestedUrl`, `resolvedUrl`, `category`, `platform`, `productScope`, `tags`, `applicableVersion`, `publicationDate`, `retrievalDate`, `status`, `accessLimitation`, `exclusionReason`, `locators`, `summary`, `evidenceRefs`, `conflicts`, `linkedRuleIds`, `licenseNotes`, `seedId`.
- [ ] All entries from the brief's initial catalog (F01–F11, C01–C13, I01–I07, P01–P03, A01–A04) are imported with their seed IDs preserved.
- [ ] `status` is one of `discovered`, `retrieved`, `analyzed`, `blocked`, `obsolete`, `excluded`; `blocked` and `excluded` require a non-empty `accessLimitation` or `exclusionReason`.
- [ ] Expansion covers the mandatory catalog targets: form inputs, data/collections, navigation/surfaces, feedback/status, engineering, accessibility patterns, and visual assets.
- [ ] Retrieval records the resolved canonical URL when it differs from the requested URL (redirect detection).

### Should Have
- [ ] Each entry records whether it was re-retrieved and whether content changed since the prior retrieval.
- [ ] A per-entry `summary` is an original concise paraphrase, never a verbatim copy.

### Won't Have (Out of Scope)
- SQLite or any database — the brief forbids an external database service merely to catalog resources (AR #10).
- Automated full-site crawling beyond the official indexes — discovery stops when indexes and linked material are reviewed (brief section 4).
- Retaining screenshots or Figma files by default (AR #5).

---

## Technical Requirements

### Entry schema (conceptual)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Canonical `SRC-###`, unique (AR #9). |
| `seedId` | string \| null | yes | Brief seed ID alias (for example `F01`). |
| `title` | string | yes | Source title. |
| `publisher` | string | yes | Owning organization. |
| `requestedUrl` | string (uri) | yes | URL as known before fetch. |
| `resolvedUrl` | string (uri) | yes | Final canonical URL after redirects. |
| `category` | enum | yes | `discovery`, `foundation`, `component-discovery`, `component-usage`, `implementation`, `version-tracking`, `supplemental-evidence`, `product-pattern`, `content-design`, `accessibility-standard`, `accessibility-guidance`, `design-asset`. |
| `platform` | enum | yes | `web-react`, `fluent2-cross-platform`, `agnostic`, `figma`, `other`. |
| `productScope` | string | yes | Product applicability; empty string when platform-agnostic. |
| `tags` | string[] | yes | Component/topic tags, sorted. |
| `applicableVersion` | string \| null | yes | Version the evidence applies to, when version-bound. |
| `publicationDate` | string \| null | yes | ISO 8601 date if known. |
| `retrievalDate` | string | yes | ISO 8601 date of retrieval. |
| `status` | enum | yes | See Must Have. |
| `accessLimitation` | string \| null | yes | Required when status is `blocked`. |
| `exclusionReason` | string \| null | yes | Required when status is `excluded`. |
| `locators` | array | yes | Heading/anchor locators or repo path + commit. |
| `summary` | string | yes | Original concise summary. |
| `evidenceRefs` | string[] | yes | IDs of findings/conflicts that cite this source. |
| `conflicts` | string[] | yes | Conflict IDs involving this source. |
| `linkedRuleIds` | string[] | yes | `RULE-###` IDs grounded in this source. |
| `licenseNotes` | string | yes | Reuse note; `unknown` is allowed but must be explicit. |

### Status lifecycle

```
discovered → retrieved → analyzed
                    ↘ blocked
discovered → excluded
retrieved/analyzed → obsolete
```

### Validator behavior

The validator parses `sources.json`, validates against the schema, and asserts: unique IDs; every
`seedId` present exactly once; `blocked`/`excluded` reasons non-empty; `linkedRuleIds` match
`^RULE-\d{3}$`; `id` matches `^SRC-\d{3}$`; `resolvedUrl` and `requestedUrl` are valid URIs.

### Determinism

`summary` and all arrays are emitted in a stable order; `sources.md` is generated with sorted
entries so regeneration is byte-reproducible (AR #21).

---

## Integration Points

### With RD-02 (Coverage Matrix)
- The coverage matrix cites source IDs and marks topics with no adequate source as explicit gaps.

### With RD-04 (Rules Catalog)
- Each rule's evidence list references `SRC-###` IDs with precise locators.

### With RD-07 (Verification Tooling)
- The source validator is one of the catalog-integrity gates; the generator renders `sources.md`.

---

## Scope Decisions

| Decision | Options Considered | Chosen | Rationale | AR Ref |
|----------|-------------------|--------|-----------|--------|
| Storage format | JSON+Schema / YAML / SQLite | JSON + JSON Schema | Verifiable, diffable, no DB service | AR #10 |
| ID scheme | brief prefixes / new `SRC-###` | `SRC-###` with `seedId` alias | Stable across refreshes while preserving brief traceability | AR #9 |
| Evidence retention | summaries+links / excerpts / screenshots | summaries + links + locators | Respects source terms | AR #5 |
| Version pinning | sibling commit / re-scrape / latest | pin to sibling schema commit | Grounds facts without duplication | AR #8 |
| Facts reuse | live dependency / snapshot / duplicate | snapshot + cross-link | Keeps this project independent and non-duplicative | AR #12 |

---

## Security Considerations

- **Data sensitivity**: No PII or credentials. The catalog stores public documentation references only.
- **Input validation**: Fetched content is untrusted data; it is summarized, never executed. The validator rejects malformed entries.
- **Authentication & authorization**: N/A — public documentation only.
- **Injection risks**: Retrieved text is treated as data, not instructions (prompt-injection defense); no shell or HTML rendering of retrieved content.
- **Encryption needs**: N/A — no stored sensitive data.
- **Rate limiting**: Respect source terms and access controls; retrieval is manual and bounded.
- **Infrastructure**: N/A — no deployment.

---

## Acceptance Criteria

1. [ ] `scripts/validate-sources.ts` exits 0 on the committed catalog and non-zero when any schema violation, duplicate `id`, missing `seedId`, or empty `blocked`/`excluded` reason is introduced.
2. [ ] `sources/sources.json` contains an entry for every seed ID F01–F11, C01–C13, I01–I07, P01–P03, A01–A04, each with a unique `SRC-###` and its `seedId`.
3. [ ] Every entry whose `status` is `analyzed` has a non-empty `summary`, at least one `locators` item, and valid `requestedUrl`/`resolvedUrl`.
4. [ ] An entry with differing requested and resolved URLs records both (for example the documented redirect from `react.fluentui.dev` to the Storybook host).
5. [ ] Regenerating `sources/sources.md` twice produces byte-identical output.
6. [ ] No entry contains a verbatim multi-paragraph copy of source prose; `summary` is original.
7. [ ] Security requirements verified (untrusted-content handling; no secrets committed; license notes present on every entry).
