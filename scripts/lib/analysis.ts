import { parseFieldTable } from "./markdown.js";

/** The seven authority classes a finding may use. */
export const FINDING_KINDS = [
  "official-fluent-guidance",
  "versioned-implementation-fact",
  "normative-accessibility-requirement",
  "informative-accessibility-guidance",
  "product-specific-pattern",
  "derived-recommendation",
  "unresolved",
] as const;

/** One of the seven authority classes. */
export type FindingKind = (typeof FINDING_KINDS)[number];

/** A synthesized finding. `kind` is kept as a string so invalid input can be reported. */
export interface Finding {
  id: string;
  statement: string;
  kind: string;
  sources: string[];
  versionScope: string;
  confidence: string;
  informsRules: string[];
}

/** A recorded conflict between sources. */
export interface Conflict {
  id: string;
  issue: string;
  sources: string[];
  resolution: string;
  rationale: string;
  uncertainty: string;
  tested: string;
}

/** A section split out of a Markdown document by its `###` heading. */
interface DocumentedSection {
  id: string;
  lines: string[];
}

/** Split a document into sections keyed by a heading id pattern. */
function splitSections(markdown: string, headingPattern: RegExp): DocumentedSection[] {
  const lines = markdown.split(/\r?\n/);
  const sections: DocumentedSection[] = [];
  let current: DocumentedSection | undefined;

  for (const line of lines) {
    const match = headingPattern.exec(line);
    if (match !== null) {
      if (current !== undefined) {
        sections.push(current);
      }
      current = { id: match[1] ?? "", lines: [] };
      continue;
    }
    if (current !== undefined) {
      current.lines.push(line);
    }
  }
  if (current !== undefined) {
    sections.push(current);
  }
  return sections;
}

/** Split a `; ` or `, ` separated field into a list. */
function splitList(value: string): string[] {
  return value
    .split(/[;,]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/**
 * Parse `research/findings.md` into finding records.
 *
 * @param markdown - Full text of the findings document.
 * @returns The parsed findings in document order.
 */
export function parseFindings(markdown: string): Finding[] {
  return splitSections(markdown, /^###\s+(FND-\d{3})\b/).map((section) => {
    const fields = parseFieldTable(section.lines);
    return {
      id: fields["id"] ?? section.id,
      statement: fields["statement"] ?? "",
      kind: fields["kind"] ?? "",
      sources: splitList(fields["sources"] ?? ""),
      versionScope: fields["versionScope"] ?? "",
      confidence: fields["confidence"] ?? "",
      informsRules: splitList(fields["informsRules"] ?? ""),
    };
  });
}

/**
 * Parse `research/conflicts.md` into conflict records.
 *
 * @param markdown - Full text of the conflicts document.
 * @returns The parsed conflicts in document order.
 */
export function parseConflicts(markdown: string): Conflict[] {
  return splitSections(markdown, /^###\s+(CNF-\d{3})\b/).map((section) => {
    const fields = parseFieldTable(section.lines);
    return {
      id: fields["id"] ?? section.id,
      issue: fields["issue"] ?? "",
      sources: splitList(fields["sources"] ?? ""),
      resolution: fields["resolution"] ?? "",
      rationale: fields["rationale"] ?? "",
      uncertainty: fields["uncertainty"] ?? "",
      tested: fields["tested"] ?? "",
    };
  });
}

/**
 * Validate finding records.
 *
 * A finding must use one of the seven authority classes and cite at least one
 * source. A normative accessibility finding must cite a success criterion (for
 * example `SC 2.4.7`) or a named specification section, so it cannot borrow the
 * authority of a standard without pointing at it.
 *
 * @param findings - Findings parsed from the document.
 * @returns Human-readable errors; empty when every finding is valid.
 */
export function validateFindings(findings: readonly Finding[]): string[] {
  const errors: string[] = [];
  const validKinds = FINDING_KINDS.join(", ");
  const criterionPattern = /SC\s*\d+\.\d+\.\d+/i;
  const specificationPattern = /\bspec(?:ification)?\b|\bsection\b|§/i;

  for (const finding of findings) {
    if (!FINDING_KINDS.includes(finding.kind as FindingKind)) {
      errors.push(`finding ${finding.id} has unknown kind "${finding.kind}"; valid kinds: ${validKinds}`);
      continue;
    }
    if (finding.sources.length === 0) {
      errors.push(`finding ${finding.id} cites no source`);
    }
    if (finding.kind === "normative-accessibility-requirement") {
      const joined = finding.sources.join("; ");
      if (!criterionPattern.test(joined) && !specificationPattern.test(joined)) {
        errors.push(
          `finding ${finding.id} is a normative accessibility requirement but cites no success criterion or specification`,
        );
      }
    }
  }

  return errors;
}

/**
 * Validate conflict records.
 *
 * An `unresolved` conflict must state what remains uncertain; a resolved conflict
 * must carry a rationale so the resolution can be reviewed.
 *
 * @param conflicts - Conflicts parsed from the document.
 * @returns Human-readable errors; empty when every conflict is valid.
 */
export function validateConflicts(conflicts: readonly Conflict[]): string[] {
  const errors: string[] = [];

  for (const conflict of conflicts) {
    if (conflict.resolution.trim().length === 0) {
      errors.push(`conflict ${conflict.id} has no resolution`);
    }
    if (conflict.issue.trim().length === 0) {
      errors.push(`conflict ${conflict.id} has no stated issue`);
    }
    if (conflict.sources.length === 0) {
      errors.push(`conflict ${conflict.id} lists no sources`);
    }
    if (conflict.resolution === "unresolved" && conflict.uncertainty.trim().length === 0) {
      errors.push(`conflict ${conflict.id} is unresolved but states no uncertainty`);
    }
    if (conflict.resolution !== "unresolved" && conflict.rationale.trim().length === 0) {
      errors.push(`conflict ${conflict.id} has a resolution but no rationale`);
    }
  }

  return errors;
}
