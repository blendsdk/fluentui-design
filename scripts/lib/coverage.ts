import { parseTable } from "./markdown.js";
import type { ParsedTable } from "./markdown.js";

/** The two valid coverage statuses. */
export type CoverageStatus = "Supported" | "Gap";

/** One row of the coverage matrix. */
export interface CoverageRow {
  topic: string;
  sources: string[];
  reviewedEvidence: string;
  extractedRules: string[];
  unresolvedQuestions: string[];
  examples: string[];
  /** Kept as a plain string so an invalid value can be reported rather than coerced. */
  status: string;
  gapNote: string;
}

/** Declared coverage counts from the document's summary table. */
export interface CoverageSummary {
  topicsSupported: number;
  topicsGap: number;
  patternsSupported: number;
  patternsGap: number;
}

/** A parsed coverage document: topic rows, pattern rows, and the counts it claims. */
export interface CoverageDocument {
  topics: CoverageRow[];
  patterns: CoverageRow[];
  summary: CoverageSummary;
}

/** A minimal view of a source needed to check the coverage floors. */
export interface CoverageSourceRef {
  id: string;
  status: string;
}

/** A minimal view of a rule needed to check rule mapping. */
export interface CoverageRuleRef {
  id: string;
}

/** Split a delimited cell into a de-duplicated, order-preserving list. */
function splitList(value: string): string[] {
  const seen = new Set<string>();
  const items: string[] = [];
  for (const part of value.split(/[;,]/)) {
    const item = part.trim();
    if (item.length > 0 && !seen.has(item)) {
      seen.add(item);
      items.push(item);
    }
  }
  return items;
}

/** Return the lines of the section whose `## ` heading matches. */
function sectionLines(markdown: string, heading: string): string[] {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex(
    (line) => line.trim().toLowerCase() === `## ${heading}`.toLowerCase(),
  );
  if (start === -1) {
    return [];
  }
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith("## "));
  return end === -1 ? rest : rest.slice(0, end);
}

/** Read a cell by index, defaulting to an empty string. */
function cell(cells: readonly string[], index: number): string {
  return cells[index] ?? "";
}

/** Convert one parsed table row into a coverage row. */
function toRow(cells: readonly string[]): CoverageRow {
  return {
    topic: cell(cells, 0),
    sources: splitList(cell(cells, 1)),
    reviewedEvidence: cell(cells, 2),
    extractedRules: splitList(cell(cells, 3)),
    unresolvedQuestions: splitList(cell(cells, 4)),
    examples: splitList(cell(cells, 5)),
    status: cell(cells, 6),
    gapNote: cell(cells, 7),
  };
}

/** Map the summary table rows into a typed summary. */
function toSummary(table: ParsedTable | undefined): CoverageSummary {
  const summary: CoverageSummary = {
    topicsSupported: 0,
    topicsGap: 0,
    patternsSupported: 0,
    patternsGap: 0,
  };
  if (table === undefined) {
    return summary;
  }
  const keys: Record<string, keyof CoverageSummary> = {
    "topics supported": "topicsSupported",
    "topics with gaps": "topicsGap",
    "patterns supported": "patternsSupported",
    "patterns with gaps": "patternsGap",
  };
  for (const row of table.rows) {
    const key = keys[cell(row, 0).toLowerCase()];
    if (key !== undefined) {
      summary[key] = Number.parseInt(cell(row, 1), 10) || 0;
    }
  }
  return summary;
}

/**
 * Parse `research/coverage.md` into topic rows, pattern rows, and declared counts.
 *
 * @param markdown - Full text of the coverage document.
 * @returns The two row groups plus the summary counts.
 */
export function parseCoverage(markdown: string): CoverageDocument {
  const topics = parseTable(sectionLines(markdown, "Coverage Topics"));
  const patterns = parseTable(sectionLines(markdown, "Required Patterns"));
  return {
    topics: (topics?.rows ?? []).map(toRow),
    patterns: (patterns?.rows ?? []).map(toRow),
    summary: toSummary(parseTable(sectionLines(markdown, "Summary"))),
  };
}

/**
 * Check the coverage floors and cross-references.
 *
 * Rules: a `Supported` row must cite at least one `analyzed` source and at least
 * one rule; a `Gap` row must carry a gap note; every row's status must be exactly
 * `Supported` or `Gap`; every cited source must exist; every cited rule must exist
 * in the known rule set (this check is skipped while the rules catalog is empty so
 * the evidence pipeline can be validated before the catalog is authored); and every
 * known rule must be mapped by at least one row.
 *
 * @param rows - Parsed coverage rows (topic and pattern rows together).
 * @param sources - Known sources (id and status).
 * @param rules - Known rules (id).
 * @returns Human-readable errors; empty when the matrix is consistent.
 */
export function checkCoverage(
  rows: readonly CoverageRow[],
  sources: readonly CoverageSourceRef[],
  rules: readonly CoverageRuleRef[],
): string[] {
  const errors: string[] = [];
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const ruleIds = new Set(rules.map((rule) => rule.id));
  const referencedRules = new Set<string>();

  for (const row of rows) {
    if (row.status === "Gap") {
      if (row.gapNote.trim().length === 0) {
        errors.push(`coverage row "${row.topic}" is a Gap but its gapNote is empty`);
      }
    } else if (row.status === "Supported") {
      const hasAnalyzed = row.sources.some((id) => sourceById.get(id)?.status === "analyzed");
      if (!hasAnalyzed) {
        const cited = row.sources.length > 0 ? row.sources.join(", ") : "no source";
        errors.push(`coverage row "${row.topic}" is Supported but cites no analyzed source (${cited})`);
      }
      if (row.extractedRules.length === 0) {
        errors.push(`coverage row "${row.topic}" is Supported but cites no extracted rule`);
      }
    } else {
      errors.push(
        `coverage row "${row.topic}" has invalid status "${row.status}" (expected Supported or Gap)`,
      );
    }

    for (const id of row.sources) {
      if (!sourceById.has(id)) {
        errors.push(`coverage row "${row.topic}" cites unknown source ${id}`);
      }
    }
    for (const id of row.extractedRules) {
      if (ruleIds.size > 0 && !ruleIds.has(id)) {
        errors.push(`coverage row "${row.topic}" cites unknown rule ${id}`);
      }
      referencedRules.add(id);
    }
  }

  for (const rule of rules) {
    if (!referencedRules.has(rule.id)) {
      errors.push(`rule ${rule.id} is not referenced by any coverage row`);
    }
  }

  return errors;
}

/**
 * Compare the declared coverage counts with the actual rows.
 *
 * @param document - A parsed coverage document.
 * @returns Human-readable errors; empty when the counts agree.
 */
export function checkCoverageSummary(document: CoverageDocument): string[] {
  const count = (rows: readonly CoverageRow[], status: CoverageStatus): number =>
    rows.filter((row) => row.status === status).length;
  const expected: CoverageSummary = {
    topicsSupported: count(document.topics, "Supported"),
    topicsGap: count(document.topics, "Gap"),
    patternsSupported: count(document.patterns, "Supported"),
    patternsGap: count(document.patterns, "Gap"),
  };
  const errors: string[] = [];
  const labels: Record<keyof CoverageSummary, string> = {
    topicsSupported: "Topics supported",
    topicsGap: "Topics with gaps",
    patternsSupported: "Patterns supported",
    patternsGap: "Patterns with gaps",
  };
  (Object.keys(expected) as (keyof CoverageSummary)[]).forEach((key) => {
    if (document.summary[key] !== expected[key]) {
      errors.push(
        `coverage summary "${labels[key]}" says ${document.summary[key]} but the rows contain ${expected[key]}`,
      );
    }
  });
  return errors;
}
