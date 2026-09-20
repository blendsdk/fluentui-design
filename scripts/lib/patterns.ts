import { readdirSync, readFileSync } from "node:fs";
import { parseFrontmatter } from "./frontmatter.js";
import { extractHeadingSections } from "./markdown.js";

/**
 * The seventeen cross-cutting decisions every pattern set must resolve.
 *
 * These are the stable keys the decision index routes on, so an agent can find
 * guidance by the decision it faces rather than by a component name.
 */
export const PATTERN_DECISIONS = [
  "command-scope",
  "navigation-model",
  "edit-surface",
  "form-layout",
  "field-annotation",
  "submit-feedback",
  "save-model",
  "data-surface",
  "data-processing-location",
  "selection-scope",
  "row-activation",
  "data-resilience",
  "virtualization",
  "modal-behavior",
  "progressive-disclosure",
  "feedback-channel",
  "permission-state",
] as const;

/** One of the seventeen decision keys. */
export type PatternDecision = (typeof PATTERN_DECISIONS)[number];

/** The `##` sections every pattern document must contain, in template order. */
export const REQUIRED_PATTERN_SECTIONS = [
  "User task",
  "When to use / when not",
  "Region order",
  "Component mapping",
  "Interaction flow",
  "State ownership",
  "Responsive behavior",
  "Accessibility",
  "Edge cases",
  "Rules applied",
  "Derived decisions",
  "Tests",
] as const;

/** Machine-readable pattern frontmatter. */
export interface PatternFrontmatter {
  id: string;
  title: string;
  decisions: string[];
  rules: string[];
  components: string[];
  derived: string[];
}

/** A parsed pattern document. */
export interface PatternDocument {
  /** Pattern id from the file name and frontmatter, such as `PAT-001`. */
  id: string;
  /** Repository-relative path of the document. */
  path: string;
  frontmatter: PatternFrontmatter;
  body: string;
  /** `##` heading text mapped to the section body beneath it. */
  sections: Record<string, string>;
}

/** Facts a pattern validator needs from outside the pattern set. */
export interface PatternValidationContext {
  /** Every rule id that exists in the rules catalog. */
  knownRuleIds: readonly string[];
  /** Every export name allowed by the pinned allowlist. */
  allowedExports: readonly string[];
}

/** Directory holding the pattern documents. */
export const PATTERNS_DIR = "skill/references/patterns";

/** The frontmatter keys every pattern must declare. */
const REQUIRED_FRONTMATTER_KEYS = [
  "id",
  "title",
  "decisions",
  "rules",
  "components",
  "derived",
] as const;

/** Read a frontmatter value as a string, defaulting to an empty string. */
function asString(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

/** Read a frontmatter value as a string list, defaulting to an empty list. */
function asList(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  return typeof value === "string" && value.length > 0 ? [value] : [];
}

/**
 * Parse a pattern document into frontmatter and `##` sections.
 *
 * @param path - Repository-relative path used for reporting and id derivation.
 * @param markdown - Full text of the document.
 * @returns The parsed pattern document.
 */
export function parsePatternDocument(path: string, markdown: string): PatternDocument {
  const { frontmatter, body } = parseFrontmatter(markdown);
  const fileNameId = /(PAT-\d{3})/.exec(path)?.[1];
  const id = asString(frontmatter["id"]) || fileNameId || "";
  return {
    id,
    path,
    frontmatter: {
      id,
      title: asString(frontmatter["title"]),
      decisions: asList(frontmatter["decisions"]),
      rules: asList(frontmatter["rules"]),
      components: asList(frontmatter["components"]),
      derived: asList(frontmatter["derived"]),
    },
    body,
    sections: extractHeadingSections(body),
  };
}

/**
 * Load every pattern document from a directory.
 *
 * @param dir - Directory to read; defaults to {@link PATTERNS_DIR}.
 * @returns The parsed documents, sorted by path.
 * @throws Error when the directory cannot be read.
 */
export function loadPatternDocumentsSync(dir: string = PATTERNS_DIR): PatternDocument[] {
  return readdirSync(dir)
    .filter((name) => /^PAT-\d{3}-.*\.md$/.test(name))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const path = `${dir}/${name}`;
      return parsePatternDocument(path, readFileSync(path, "utf8"));
    });
}

/**
 * List the required sections a document is missing.
 *
 * @param document - A parsed pattern document.
 * @returns Missing section headings; empty when the template is complete.
 */
export function missingPatternSections(document: PatternDocument): string[] {
  return REQUIRED_PATTERN_SECTIONS.filter((section) => {
    const content = document.sections[section];
    return content === undefined || content.length === 0;
  });
}

/**
 * Validate a set of pattern documents.
 *
 * A pattern must use a `PAT-###` id, declare every required frontmatter key,
 * contain every template section with non-empty content, map only to verified
 * exports, cite existing rules, and use only vocabulary decision keys.
 *
 * @param documents - Documents to validate.
 * @param context - Known rule ids and the allowed export allowlist.
 * @returns Human-readable errors; empty when every pattern is valid.
 */
export function validatePatternDocuments(
  documents: readonly PatternDocument[],
  context: PatternValidationContext,
): string[] {
  const errors: string[] = [];
  const knownRules = new Set(context.knownRuleIds);
  const allowedExports = new Set(context.allowedExports);
  const validDecisions = PATTERN_DECISIONS.join(", ");

  for (const document of documents) {
    if (!/^PAT-\d{3}$/.test(document.frontmatter.id)) {
      errors.push(`pattern ${document.path} has invalid id "${document.frontmatter.id}"`);
    }
    for (const key of REQUIRED_FRONTMATTER_KEYS) {
      if (key !== "derived" && document.frontmatter[key].length === 0) {
        errors.push(`pattern ${document.frontmatter.id} is missing frontmatter "${key}"`);
      }
    }
    for (const section of missingPatternSections(document)) {
      errors.push(`pattern ${document.frontmatter.id} is missing section "${section}"`);
    }
    for (const decision of document.frontmatter.decisions) {
      if (!PATTERN_DECISIONS.includes(decision as PatternDecision)) {
        errors.push(
          `pattern ${document.frontmatter.id} uses unknown decision "${decision}"; valid decisions: ${validDecisions}`,
        );
      }
    }
    for (const rule of document.frontmatter.rules) {
      if (!knownRules.has(rule)) {
        errors.push(`pattern ${document.frontmatter.id} cites unknown rule ${rule}`);
      }
    }
    for (const name of document.frontmatter.components) {
      if (!allowedExports.has(name)) {
        errors.push(`pattern ${document.frontmatter.id} maps to unknown export "${name}"`);
      }
    }
  }

  return errors;
}

/** One row of the generated decision index. */
export interface DecisionIndexRow {
  decision: PatternDecision;
  patterns: string[];
  rules: string[];
}

/**
 * Build the decision index from the pattern frontmatter.
 *
 * @param documents - Parsed pattern documents.
 * @returns One row per decision, in vocabulary order.
 */
export function buildDecisionIndex(
  documents: readonly PatternDocument[],
): DecisionIndexRow[] {
  return PATTERN_DECISIONS.map((decision) => {
    const matching = documents.filter((document) =>
      document.frontmatter.decisions.includes(decision),
    );
    const rules = new Set<string>();
    for (const document of matching) {
      for (const rule of document.frontmatter.rules) {
        rules.add(rule);
      }
    }
    return {
      decision,
      patterns: matching.map((document) => document.frontmatter.id),
      rules: [...rules].sort((a, b) => a.localeCompare(b)),
    };
  });
}

/**
 * Check that every decision resolves to at least one pattern.
 *
 * @param rows - Rows from {@link buildDecisionIndex}.
 * @returns Human-readable errors; empty when every decision is covered.
 */
export function checkDecisionIndex(rows: readonly DecisionIndexRow[]): string[] {
  return rows
    .filter((row) => row.patterns.length === 0)
    .map((row) => `decision "${row.decision}" is not resolved by any pattern`);
}
