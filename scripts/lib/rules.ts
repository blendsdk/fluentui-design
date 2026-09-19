import { readJsonFileSync } from "./json.js";
import { createSchemaValidator } from "./schema.js";
import type { SchemaValidator } from "./schema.js";

/**
 * A verified `@fluentui/react-components` mapping.
 *
 * Every listed export was confirmed to exist in the pinned package version, so
 * the rule is safe to present as library API.
 */
export interface VerifiedMapping {
  kind: "verified";
  /** The package the exports come from. */
  package: string;
  /** The exact version the exports were verified against. */
  version: string;
  /** The verified export names used by this rule. */
  exports: string[];
}

/**
 * A composition the application owns rather than the component library.
 *
 * Used for patterns such as an app shell or a page header that are assembled
 * from library parts but are not themselves v9 exports.
 */
export interface ApplicationOwnedMapping {
  kind: "application-owned";
  /** Explains why no single verified export matches the composition. */
  note: string;
}

/** How a rule maps onto real components: verified exports or an owned composition. */
export type ComponentMapping = VerifiedMapping | ApplicationOwnedMapping;

/** How strongly a rule is expected to be followed. */
export type RuleStrength = "must" | "should" | "may";

/** The nature of a rule's authority. */
export type RuleClassification =
  | "requirement"
  | "recommendation"
  | "convention"
  | "observation";

/** The decision area a rule belongs to; used to group the generated index. */
export type DecisionArea =
  | "app-shell"
  | "page-chrome"
  | "forms"
  | "overlays"
  | "data-grid"
  | "disclosure"
  | "feedback"
  | "theming"
  | "accessibility"
  | "responsive"
  | "composition"
  | "task-flows";

/** Confidence in a rule with the condition that would invalidate it. */
export interface RuleConfidence {
  level: "High" | "Med" | "Low";
  wouldChangeIf: string;
}

/** One operational rule in the catalog. */
export interface RuleEntry {
  id: string;
  title: string;
  decision: string;
  decisionArea: DecisionArea;
  classification: RuleClassification;
  strength: RuleStrength;
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
  evidenceSourceIds: string[];
  locators: string[];
  derivedFromFindings: string[];
  confidence: RuleConfidence;
  unresolved: string;
  positiveExample: string;
  antiPattern: string;
  verificationMethod: string;
  relatedRules: string[];
  supersedes: string[];
}

/** Facts a rule validator needs from outside the rules catalog. */
export interface RuleValidationContext {
  /** Every source id that exists in the canonical source catalog. */
  knownSourceIds: readonly string[];
  /** Every export name allowed by the pinned allowlist. */
  allowedExports: readonly string[];
}

/** Repository-relative path of the canonical rules catalog. */
export const RULES_JSON_PATH = "rules/rules.json";
/** Repository-relative path of the rules JSON Schema. */
export const RULES_SCHEMA_PATH = "rules/rules.schema.json";

/** Instructions shorter than this many characters are flagged by the lint. */
export const MIN_INSTRUCTION_LENGTH = 40;

/**
 * Phrases that make an instruction non-operational.
 *
 * An instruction containing one of these says how something should feel without
 * saying what to do, so it is flagged for manual review.
 */
export const BANNED_INSTRUCTION_PHRASES = [
  "intuitive",
  "user-friendly",
  "best practice",
  "clean",
  "nice",
  "modern",
] as const;

/**
 * Verbs that can start an actionable instruction.
 *
 * The list keeps instructions in the imperative mood ("Place the primary
 * action..."), which is what makes them directly executable.
 */
export const IMPERATIVE_VERBS = new Set([
  "allow", "announce", "assign", "attach", "avoid", "bind", "choose", "close",
  "collapse", "compose", "confirm", "debounce", "decide", "defer", "derive",
  "disable", "document", "ensure", "expose", "express", "focus", "give", "group",
  "guard", "handle", "hide", "honor", "keep", "label", "lay", "let", "limit",
  "make", "mark", "mirror", "move", "open", "order", "own", "place", "prefer",
  "preserve", "prioritize", "provide", "put", "read", "record", "reference",
  "render", "require", "reserve", "respect", "restore", "return", "reuse",
  "route", "separate", "set", "show", "size", "split", "state", "store", "style",
  "suppress", "surface", "tie", "track", "treat", "truncate", "use", "validate",
  "virtualize", "wrap",
]);

let cachedValidator: SchemaValidator<RuleEntry[]> | undefined;

/**
 * Build (once) the schema validator for the rules catalog.
 *
 * @returns A validator that narrows unknown data to a `RuleEntry[]`.
 */
function getValidator(): SchemaValidator<RuleEntry[]> {
  if (cachedValidator === undefined) {
    const schema = readJsonFileSync(RULES_SCHEMA_PATH);
    if (typeof schema !== "object" || schema === null || Array.isArray(schema)) {
      throw new Error(`${RULES_SCHEMA_PATH} must contain a JSON object`);
    }
    cachedValidator = createSchemaValidator<RuleEntry[]>(schema, { name: "rules" });
  }
  return cachedValidator;
}

/** Return the first word of an instruction, lowercased and stripped of punctuation. */
function firstWord(instruction: string): string {
  const [word = ""] = instruction.trim().split(/\s+/);
  return word.toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * Check the cross-entry and cross-catalog rules a JSON Schema cannot express.
 *
 * @param rules - Rules already proven to match the schema.
 * @param context - Known source ids and the allowed export allowlist.
 * @returns Human-readable errors; empty when every rule is consistent.
 */
function checkRuleIntegrity(
  rules: readonly RuleEntry[],
  context: RuleValidationContext,
): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const knownSources = new Set(context.knownSourceIds);
  const allowedExports = new Set(context.allowedExports);

  for (const rule of rules) {
    if (seenIds.has(rule.id)) {
      errors.push(`duplicate rule id "${rule.id}"`);
    } else {
      seenIds.add(rule.id);
    }

    for (const id of rule.evidenceSourceIds) {
      if (!knownSources.has(id)) {
        errors.push(`rule ${rule.id} cites unknown source ${id}`);
      }
    }

    if (rule.componentMapping.kind === "verified") {
      for (const name of rule.componentMapping.exports) {
        if (!allowedExports.has(name)) {
          errors.push(`rule ${rule.id} maps to unknown export "${name}"`);
        }
      }
    }

    if (firstWord(rule.instruction).length === 0 || !IMPERATIVE_VERBS.has(firstWord(rule.instruction))) {
      errors.push(`rule ${rule.id} instruction must start with an imperative verb`);
    }

    if (rule.positiveExample.trim().length === 0 && rule.antiPattern.trim().length === 0) {
      errors.push(`rule ${rule.id} needs a positiveExample or an antiPattern`);
    }
  }

  return errors;
}

/**
 * Validate raw rules-catalog data against the schema and the integrity rules.
 *
 * @param data - Parsed JSON from `rules/rules.json`.
 * @param context - Known source ids and the allowed export allowlist.
 * @returns Human-readable errors; empty when the catalog is valid.
 *
 * @example
 * ```ts
 * const errors = validateRulesData(readJsonFileSync("rules/rules.json"), {
 *   knownSourceIds: ["SRC-001"],
 *   allowedExports: ["Button"],
 * });
 * ```
 */
export function validateRulesData(data: unknown, context: RuleValidationContext): string[] {
  const result = getValidator().validate(data);
  if (!result.ok) {
    return result.errors;
  }
  return checkRuleIntegrity(result.value, context);
}

/**
 * Parse the rules catalog into typed entries, throwing when it is invalid.
 *
 * @param data - Parsed JSON from the catalog.
 * @param context - Known source ids and the allowed export allowlist.
 * @returns The typed rules, sorted by id.
 * @throws Error listing the validation problems when the data is invalid.
 */
export function parseRules(data: unknown, context: RuleValidationContext): RuleEntry[] {
  const result = getValidator().validate(data);
  if (!result.ok) {
    throw new Error(`Invalid rules catalog:\n${result.errors.join("\n")}`);
  }
  const integrity = checkRuleIntegrity(result.value, context);
  if (integrity.length > 0) {
    throw new Error(`Invalid rules catalog:\n${integrity.join("\n")}`);
  }
  return [...result.value].sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Read and parse the committed rules catalog from disk.
 *
 * @param context - Known source ids and the allowed export allowlist.
 * @returns The typed rules, sorted by id.
 * @throws Error when the file is missing or invalid.
 */
export function loadRulesFileSync(context: RuleValidationContext): RuleEntry[] {
  return parseRules(readJsonFileSync(RULES_JSON_PATH), context);
}

/**
 * Flag instructions that are too short or contain a banned phrase.
 *
 * This is a warning list, not a hard failure: a warning asks a human to make an
 * instruction more actionable, while an empty instruction is already rejected by
 * {@link validateRulesData}.
 *
 * @param rules - Rules to inspect.
 * @returns Human-readable warnings; empty when every instruction is actionable.
 */
export function lintRules(rules: readonly RuleEntry[]): string[] {
  const warnings: string[] = [];
  for (const rule of rules) {
    const instruction = rule.instruction.trim();
    if (instruction.length < MIN_INSTRUCTION_LENGTH) {
      warnings.push(
        `rule ${rule.id} instruction is shorter than ${MIN_INSTRUCTION_LENGTH} characters`,
      );
    }
    const lowered = instruction.toLowerCase();
    for (const phrase of BANNED_INSTRUCTION_PHRASES) {
      if (lowered.includes(phrase)) {
        warnings.push(`rule ${rule.id} instruction contains the banned phrase "${phrase}"`);
      }
    }
  }
  return warnings;
}
