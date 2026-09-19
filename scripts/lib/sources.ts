import { readJsonFileSync } from "./json.js";
import { generatedMarker, renderTable } from "./markdown.js";
import { createSchemaValidator } from "./schema.js";
import type { SchemaValidator } from "./schema.js";

/** The lifecycle states a catalog entry may hold. */
export type SourceStatus =
  | "discovered"
  | "retrieved"
  | "analyzed"
  | "blocked"
  | "obsolete"
  | "excluded";

/** The kind of resource a catalog entry describes. */
export type SourceCategory =
  | "discovery"
  | "foundation"
  | "component-discovery"
  | "component-usage"
  | "implementation"
  | "version-tracking"
  | "supplemental-evidence"
  | "product-pattern"
  | "content-design"
  | "accessibility-standard"
  | "accessibility-guidance"
  | "design-asset";

/** The platform a resource targets. */
export type SourcePlatform = "web-react" | "fluent2-cross-platform" | "agnostic" | "figma" | "other";

/** A precise pointer into a source, such as a heading or a repository path. */
export interface SourceLocator {
  kind: "heading" | "anchor" | "repo-path" | "commit" | "spec" | "section";
  value: string;
}

/** One reviewed evidence source in the canonical catalog. */
export interface SourceEntry {
  id: string;
  seedId: string | null;
  title: string;
  publisher: string;
  requestedUrl: string;
  resolvedUrl: string;
  category: SourceCategory;
  platform: SourcePlatform;
  productScope: string;
  tags: string[];
  applicableVersion: string | null;
  publicationDate: string | null;
  retrievalDate: string;
  status: SourceStatus;
  accessLimitation: string | null;
  exclusionReason: string | null;
  locators: SourceLocator[];
  summary: string;
  evidenceRefs: string[];
  conflicts: string[];
  linkedRuleIds: string[];
  licenseNotes: string;
}

/** Repository-relative path of the canonical catalog. */
export const SOURCES_JSON_PATH = "sources/sources.json";
/** Repository-relative path of the catalog's JSON Schema. */
export const SOURCES_SCHEMA_PATH = "sources/sources.schema.json";

let cachedValidator: SchemaValidator<SourceEntry[]> | undefined;

/**
 * Build (once) the schema validator for the source catalog.
 *
 * The schema is read from disk and compiled lazily so importing this module has
 * no filesystem cost until validation is actually requested. The read is
 * synchronous because validators are used from synchronous call sites.
 *
 * @returns A validator that narrows unknown data to a `SourceEntry[]`.
 */
function getValidator(): SchemaValidator<SourceEntry[]> {
  if (cachedValidator === undefined) {
    const schema = readJsonFileSync(SOURCES_SCHEMA_PATH);
    if (typeof schema !== "object" || schema === null || Array.isArray(schema)) {
      throw new Error(`${SOURCES_SCHEMA_PATH} must contain a JSON object`);
    }
    cachedValidator = createSchemaValidator<SourceEntry[]>(schema, { name: "sources" });
  }
  return cachedValidator;
}

/**
 * Check the catalog's cross-entry integrity rules that a JSON Schema cannot express.
 *
 * @param entries - Entries already proven to match the schema.
 * @returns Human-readable integrity errors; empty when the catalog is consistent.
 */
function checkSourceIntegrity(entries: readonly SourceEntry[]): string[] {
  const errors: string[] = [];
  const seenIds = new Map<string, number>();
  const seenSeeds = new Map<string, number>();

  entries.forEach((entry, index) => {
    const previousId = seenIds.get(entry.id);
    if (previousId !== undefined) {
      errors.push(`duplicate id "${entry.id}" at entries ${previousId} and ${index}`);
    } else {
      seenIds.set(entry.id, index);
    }

    if (entry.seedId !== null) {
      const previousSeed = seenSeeds.get(entry.seedId);
      if (previousSeed !== undefined) {
        errors.push(`duplicate seedId "${entry.seedId}" at entries ${previousSeed} and ${index}`);
      } else {
        seenSeeds.set(entry.seedId, index);
      }
    }
  });

  return errors;
}

/**
 * Validate raw source-catalog data against the schema and the integrity rules.
 *
 * @param data - Parsed JSON from `sources/sources.json`.
 * @returns Human-readable errors; empty when the catalog is valid.
 *
 * @example
 * ```ts
 * const errors = validateSourcesData(readJsonFileSync("sources/sources.json"));
 * if (errors.length > 0) {
 *   console.error(errors.join("\n"));
 * }
 * ```
 */
export function validateSourcesData(data: unknown): string[] {
  const validator = getValidator();
  const result = validator.validate(data);
  if (!result.ok) {
    return result.errors;
  }
  return checkSourceIntegrity(result.value);
}

/**
 * Validate the catalog stored at {@link SOURCES_JSON_PATH}.
 *
 * @returns Human-readable errors; empty when the file is valid.
 */
export function validateSourcesFile(): string[] {
  return validateSourcesData(readJsonFileSync(SOURCES_JSON_PATH));
}

/**
 * Parse the catalog into typed entries, throwing when it is invalid.
 *
 * @param data - Parsed JSON from the catalog.
 * @returns The typed entries, sorted by id.
 * @throws Error listing the validation problems when the data is invalid.
 */
export function parseSources(data: unknown): SourceEntry[] {
  const validator = getValidator();
  const result = validator.validate(data);
  if (!result.ok) {
    throw new Error(`Invalid source catalog:\n${result.errors.join("\n")}`);
  }
  const integrity = checkSourceIntegrity(result.value);
  if (integrity.length > 0) {
    throw new Error(`Invalid source catalog:\n${integrity.join("\n")}`);
  }
  return [...result.value].sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Render the human-readable source catalog as Markdown.
 *
 * @param entries - Typed catalog entries.
 * @returns A generated marker followed by a table sorted by id.
 */
export function renderSourcesMarkdown(entries: readonly SourceEntry[]): string {
  const rows = [...entries]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((entry) => [
      entry.id,
      entry.seedId ?? "—",
      entry.title,
      entry.publisher,
      entry.status,
      entry.category,
      entry.resolvedUrl,
    ]);
  const table = renderTable(
    ["ID", "Seed", "Title", "Publisher", "Status", "Category", "Resolved URL"],
    rows,
  );
  return `${generatedMarker(SOURCES_JSON_PATH)}\n\n# Source Catalog\n\n${table}\n`;
}
