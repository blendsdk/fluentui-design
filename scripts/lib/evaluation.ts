import { readJsonFileSync } from "./json.js";
import { parseFieldTable, parseTable } from "./markdown.js";
import type { ParsedTable } from "./markdown.js";
import { loadPatternDocumentsSync } from "./patterns.js";
import { RULES_JSON_PATH } from "./rules.js";

/** Repository-relative directory that holds the evaluation documents. */
export const EVALUATION_DIR = "evaluation";
/** Repository-relative path of the task catalog. */
export const EVALUATION_TASKS_PATH = `${EVALUATION_DIR}/tasks.md`;
/** Repository-relative path of the scoring rubric. */
export const EVALUATION_RUBRIC_PATH = `${EVALUATION_DIR}/rubric.md`;
/** Repository-relative path of the recorded results. */
export const EVALUATION_RESULTS_PATH = `${EVALUATION_DIR}/results.md`;

/** Every value a task result may take. */
export const EVALUATION_RESULT_VALUES = ["pass", "partial", "fail", "untested"] as const;

/** One allowed result value. */
export type EvaluationResultValue = (typeof EVALUATION_RESULT_VALUES)[number];

/** A single evaluation task parsed from `evaluation/tasks.md`. */
export interface EvaluationTask {
  /** Task id, such as `EVAL-001`. */
  id: string;
  /** Task title taken from the heading. */
  title: string;
  /** The scenario slug this task covers. */
  scenario: string;
  /** Every `| Field | Value |` pair recorded for the task. */
  fields: Record<string, string>;
}

/** A rubric dimension with its written anchors. */
export interface RubricDimension {
  /** Dimension name, such as `API/version correctness`. */
  name: string;
  /** Anchor text for scores 0, 2, and 4. */
  anchors: Record<0 | 2 | 4, string>;
}

/** One recorded result from `evaluation/results.md`. */
export interface EvaluationResult {
  /** Id of the task this result belongs to. */
  taskId: string;
  /** Result title taken from the heading. */
  title: string;
  /** Recorded result value, validated later by {@link checkEvaluationCoverage}. */
  result: string;
  /** Evidence text; must name existing artifacts unless the result is untested. */
  evidence: string;
}

/** A heading and the lines that belong to it. */
interface HeadingBlock {
  id: string;
  title: string;
  lines: string[];
}

/**
 * Split a document into blocks introduced by `### <id> — <title>` headings.
 *
 * @param markdown - Document text to scan.
 * @returns One block per matching heading, in document order.
 */
function splitHeadingBlocks(markdown: string): HeadingBlock[] {
  const heading = /^###\s+(EVAL-\d+)\s+[—-]\s+(.+?)\s*$/;
  const blocks: HeadingBlock[] = [];
  let current: HeadingBlock | undefined;

  for (const line of markdown.split(/\r?\n/)) {
    const match = heading.exec(line);
    if (match !== null) {
      if (current !== undefined) {
        blocks.push(current);
      }
      current = { id: match[1] ?? "", title: match[2] ?? "", lines: [] };
      continue;
    }
    if (current !== undefined) {
      current.lines.push(line);
    }
  }
  if (current !== undefined) {
    blocks.push(current);
  }
  return blocks;
}

/**
 * Group the lines of a document into contiguous pipe-table blocks.
 *
 * @param markdown - Document text to scan.
 * @returns Each table's lines, separate from surrounding prose.
 */
function tableBlocks(markdown: string): string[][] {
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of markdown.split(/\r?\n/)) {
    if (line.trim().startsWith("|")) {
      current.push(line);
      continue;
    }
    if (current.length > 0) {
      blocks.push(current);
      current = [];
    }
  }
  if (current.length > 0) {
    blocks.push(current);
  }
  return blocks;
}

/**
 * Parse the task catalog into typed tasks.
 *
 * @param markdown - Contents of `evaluation/tasks.md`.
 * @returns The tasks in document order.
 */
export function parseEvaluationTasks(markdown: string): EvaluationTask[] {
  return splitHeadingBlocks(markdown).map((block) => {
    const fields = parseFieldTable(block.lines);
    return {
      id: block.id,
      title: block.title,
      scenario: fields["scenario"] ?? "",
      fields,
    };
  });
}

/**
 * Parse the derived evidence for every task from the results document.
 *
 * @param markdown - Contents of `evaluation/results.md`.
 * @returns The recorded results in document order.
 */
export function parseEvaluationResults(markdown: string): EvaluationResult[] {
  return splitHeadingBlocks(markdown).map((block) => {
    const fields = parseFieldTable(block.lines);
    return {
      taskId: block.id,
      title: block.title,
      result: (fields["result"] ?? "").trim(),
      evidence: fields["evidence"] ?? "",
    };
  });
}

/**
 * Parse a dimension table whose columns are the 0, 2, and 4 anchors.
 *
 * @param markdown - Contents of `evaluation/rubric.md`.
 * @returns The dimensions in table order, or an empty list when no such table exists.
 */
export function parseRubricDimensions(markdown: string): RubricDimension[] {
  for (const block of tableBlocks(markdown)) {
    const table = parseTable(block);
    if (table === undefined) {
      continue;
    }
    const index0 = table.headers.indexOf("0");
    const index2 = table.headers.indexOf("2");
    const index4 = table.headers.indexOf("4");
    if (index0 < 0 || index2 < 0 || index4 < 0) {
      continue;
    }
    return toDimensions(table, index0, index2, index4);
  }
  return [];
}

/** Turn a parsed anchor table into dimensions. */
function toDimensions(
  table: ParsedTable,
  index0: number,
  index2: number,
  index4: number,
): RubricDimension[] {
  const dimensions: RubricDimension[] = [];
  for (const row of table.rows) {
    const name = (row[0] ?? "").trim();
    if (name.length === 0) {
      continue;
    }
    dimensions.push({
      name,
      anchors: { 0: row[index0] ?? "", 2: row[index2] ?? "", 4: row[index4] ?? "" },
    });
  }
  return dimensions;
}

/**
 * Extract every `RULE-###` id mentioned in a block of text.
 *
 * @param text - Text to search.
 * @returns Unique ids in first-seen order.
 */
export function extractRuleIds(text: string): string[] {
  return uniqueMatches(text, /RULE-\d{3}/g);
}

/**
 * Extract every `PAT-###` id mentioned in a block of text.
 *
 * @param text - Text to search.
 * @returns Unique ids in first-seen order.
 */
export function extractPatternIds(text: string): string[] {
  return uniqueMatches(text, /PAT-\d{3}/g);
}

/** Return the unique matches of a global regular expression. */
function uniqueMatches(text: string, pattern: RegExp): string[] {
  const seen = new Set<string>();
  for (const match of text.matchAll(pattern)) {
    seen.add(match[0]);
  }
  return [...seen];
}

/** Catalog ids cited by the evaluation documents. */
export interface EvaluationCitations {
  /** Every `RULE-###` id mentioned in a task field or a result's evidence. */
  rules: string[];
  /** Every `PAT-###` id mentioned in a task field or a result's evidence. */
  patterns: string[];
}

/**
 * Collect every catalog id the evaluation documents cite.
 *
 * Ids are read from every task field, not just the `rules` field, and from each
 * result's evidence. A reproduction script can then check the whole set against
 * the catalogs, so an id mentioned only in prose is still verified.
 *
 * @param tasks - Tasks parsed from the task catalog.
 * @param results - Results parsed from the results document.
 * @returns The unique rule and pattern ids in first-seen order.
 */
export function collectEvaluationCitations(
  tasks: readonly EvaluationTask[],
  results: readonly EvaluationResult[],
): EvaluationCitations {
  const text = [
    ...tasks.flatMap((task) => Object.values(task.fields)),
    ...results.map((result) => result.evidence),
  ].join("\n");
  return { rules: extractRuleIds(text), patterns: extractPatternIds(text) };
}

/** Return the backticked tokens that look like repository paths. */
function extractArtifactPaths(text: string): string[] {
  const paths: string[] = [];
  for (const match of text.matchAll(/`([^`]+)`/g)) {
    const token = (match[1] ?? "").trim();
    if (token.includes("/") && !token.startsWith("http")) {
      paths.push(token);
    }
  }
  return paths;
}

/**
 * Check that every task has an honest result and that cited artifacts exist.
 *
 * A result of `untested` must give a reason instead of an artifact. Any other
 * result must cite at least one backticked path that the supplied lookup finds.
 * The lookup is injected so the check can run against a test filesystem.
 *
 * @param tasks - Tasks parsed from the task catalog.
 * @param results - Results parsed from the results document.
 * @param fileExists - Returns `true` when a cited path exists.
 * @returns Human-readable problems; empty when the results are complete.
 */
export function checkEvaluationCoverage(
  tasks: readonly EvaluationTask[],
  results: readonly EvaluationResult[],
  fileExists: (path: string) => boolean,
): string[] {
  const errors: string[] = [];
  const knownTasks = new Set(tasks.map((task) => task.id));
  const byTask = new Map(results.map((result) => [result.taskId, result]));

  for (const result of results) {
    if (!knownTasks.has(result.taskId)) {
      errors.push(`result ${result.taskId} has no matching task`);
    }
  }

  for (const task of tasks) {
    const result = byTask.get(task.id);
    if (result === undefined) {
      errors.push(`task ${task.id} has no result`);
      continue;
    }
    if (!(EVALUATION_RESULT_VALUES as readonly string[]).includes(result.result)) {
      errors.push(`task ${task.id} has invalid result "${result.result}"`);
      continue;
    }
    if (result.result === "untested") {
      if (result.evidence.trim().length === 0) {
        errors.push(`task ${task.id} is untested but gives no reason`);
      }
      continue;
    }
    const paths = extractArtifactPaths(result.evidence);
    if (paths.length === 0) {
      errors.push(`task ${task.id} cites no artifact`);
    }
    for (const path of paths) {
      if (!fileExists(path)) {
        errors.push(`task ${task.id} cites missing artifact ${path}`);
      }
    }
  }

  return errors;
}

/**
 * Collect the rule ids that exist in the committed rules catalog.
 *
 * @returns Every `RULE-###` id.
 */
export function loadKnownRuleIds(): Set<string> {
  const ids = new Set<string>();
  const catalog = readJsonFileSync(RULES_JSON_PATH);
  if (Array.isArray(catalog)) {
    for (const entry of catalog) {
      if (typeof entry === "object" && entry !== null && !Array.isArray(entry)) {
        const id = (entry as Record<string, unknown>)["id"];
        if (typeof id === "string") {
          ids.add(id);
        }
      }
    }
  }
  return ids;
}

/**
 * Collect the pattern ids that exist in the committed pattern documents.
 *
 * @returns Every `PAT-###` id.
 */
export function loadKnownPatternIds(): Set<string> {
  const ids = new Set<string>();
  for (const document of loadPatternDocumentsSync()) {
    if (document.frontmatter.id.length > 0) {
      ids.add(document.frontmatter.id);
    }
  }
  return ids;
}
