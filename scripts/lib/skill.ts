import { readFileSync, readdirSync } from "node:fs";
import type { Dirent } from "node:fs";
import { posix } from "node:path";
import { loadVerifiedExportsSync } from "./facts.js";
import { parseFrontmatter } from "./frontmatter.js";
import { readJsonFileSync } from "./json.js";
import { extractHeadingSections, generatedMarker, isGeneratedContent, renderTable } from "./markdown.js";
import { loadPatternDocumentsSync, PATTERNS_DIR } from "./patterns.js";
import { parseRules, RULES_JSON_PATH } from "./rules.js";
import { parseSources, SOURCES_JSON_PATH, renderSourcesMarkdown } from "./sources.js";
import type { DecisionArea, RuleEntry } from "./rules.js";
import type { PatternDocument } from "./patterns.js";

/** Directory that holds the authored skill package. */
export const SKILL_DIR = "skill";
/** Repository-relative path of the skill entry point. */
export const SKILL_ENTRY_PATH = "skill/SKILL.md";
/** Repository-relative path of the generated decision routing index. */
export const SKILL_REFERENCE_INDEX_PATH = "skill/references/index.md";
/** Repository-relative path of the generated rule reference index. */
export const SKILL_RULES_INDEX_PATH = "skill/references/rules/index.md";
/** Repository-relative path of the generated source catalog Markdown. */
export const SOURCES_MD_PATH = "sources/sources.md";
/** Repository-relative path of the generated rules catalog Markdown. */
export const RULES_MD_PATH = "rules/rules.md";
/** Repository-relative path of the generated installable mirror. */
export const SKILL_MIRROR_DIR = ".agents/skills/fluentui-design";

/** The skill name; it must equal the containing directory name. */
export const SKILL_NAME = "fluentui-design";

/**
 * The nine sections every skill entry point must contain, in order.
 *
 * These headings are the package's public contract: the reference gate fails
 * when one is missing, because each answers a required question (when to
 * trigger, what to inspect, which reference to load, and so on).
 */
export const REQUIRED_SKILL_SECTIONS = [
  "Triggers and non-triggers",
  "Reconnaissance",
  "Task classification",
  "Design-before-code checklist",
  "Surface decision workflow",
  "Implementation constraints",
  "Accessibility and visual review",
  "Tradeoff explanation",
  "Evidence fallback",
] as const;

/** Fewest lines the entry point may have before it is considered too thin. */
export const ENTRY_LINE_MIN = 150;
/** Line count above which the entry point warns that it is getting large. */
export const ENTRY_LINE_SOFT_MAX = 320;
/** Line count above which the entry point is rejected as too large. */
export const ENTRY_LINE_HARD_MAX = 400;
/** Shortest description that can still state what the skill does and when. */
export const MIN_SKILL_DESCRIPTION_LENGTH = 80;

/** The order decision areas are grouped in inside the generated rule index. */
export const RULES_DECISION_AREAS: readonly DecisionArea[] = [
  "app-shell",
  "page-chrome",
  "composition",
  "task-flows",
  "forms",
  "data-grid",
  "overlays",
  "disclosure",
  "feedback",
  "responsive",
  "accessibility",
  "theming",
];

/** Skill-name prefixes accepted in cross-skill reference links. */
export const KNOWN_SKILL_PREFIXES = ["fluentui", "fluentui-design"] as const;

/** The parsed frontmatter of the skill entry point. */
export interface SkillFrontmatter {
  name: string;
  description: string;
  license: string;
}

/** The skill entry point, split for validation and routing. */
export interface SkillEntry {
  /** Repository-relative path of the entry point. */
  path: string;
  frontmatter: SkillFrontmatter;
  /** `##` heading text mapped to the section body beneath it. */
  sections: Record<string, string>;
  /** Number of lines in the document (no trailing-newline inflation). */
  lineCount: number;
  body: string;
}

/** Count the lines of a document, ignoring one trailing newline. */
function countLines(markdown: string): number {
  const normalized = markdown.replace(/\r\n/g, "\n").replace(/\n$/, "");
  return normalized.split("\n").length;
}

/**
 * Parse the skill entry point into frontmatter and `##` sections.
 *
 * @param markdown - Full text of the entry point.
 * @param path - Repository-relative path used for reporting.
 * @returns The parsed entry point.
 */
export function parseSkillEntry(markdown: string, path: string = SKILL_ENTRY_PATH): SkillEntry {
  const { frontmatter, body } = parseFrontmatter(markdown);
  const asString = (value: string | string[] | undefined): string =>
    typeof value === "string" ? value : "";
  return {
    path,
    frontmatter: {
      name: asString(frontmatter["name"]),
      description: asString(frontmatter["description"]),
      license: asString(frontmatter["license"]),
    },
    sections: extractHeadingSections(body),
    lineCount: countLines(markdown),
    body,
  };
}

/**
 * Validate the skill entry point against its packaging contract.
 *
 * Checks that the frontmatter name matches the containing directory, that the
 * description is informative enough to distinguish the skill, that every
 * required section is present with content, and that the length stays within
 * the hard budget.
 *
 * @param entry - Parsed entry point.
 * @param directoryName - Name of the directory that contains the entry point.
 * @returns Human-readable errors; empty when the entry point is valid.
 */
export function validateSkillEntry(entry: SkillEntry, directoryName: string): string[] {
  const errors: string[] = [];
  const { name, description } = entry.frontmatter;

  if (name !== directoryName) {
    errors.push(`skill entry name "${name}" must equal the directory name "${directoryName}"`);
  }
  if (description.length < MIN_SKILL_DESCRIPTION_LENGTH) {
    errors.push(
      `skill entry description must be at least ${MIN_SKILL_DESCRIPTION_LENGTH} characters`,
    );
  }
  if (!/\bfluentui\b/i.test(description)) {
    errors.push("skill entry description must name the fluentui skill it complements");
  }
  if (entry.lineCount < ENTRY_LINE_MIN) {
    errors.push(`skill entry is ${entry.lineCount} lines; expected at least ${ENTRY_LINE_MIN}`);
  }
  if (entry.lineCount > ENTRY_LINE_HARD_MAX) {
    errors.push(
      `skill entry is ${entry.lineCount} lines; expected at most ${ENTRY_LINE_HARD_MAX}`,
    );
  }
  for (const section of REQUIRED_SKILL_SECTIONS) {
    const content = entry.sections[section];
    if (content === undefined || content.length === 0) {
      errors.push(`skill entry is missing required section "${section}"`);
    }
  }
  return errors;
}

/**
 * Validate the entry point loaded from disk.
 *
 * @param directoryName - Name of the directory that contains `SKILL.md`.
 * @returns Human-readable errors; empty when the committed entry point is valid.
 * @throws Error when the entry point cannot be read.
 */
export function validateSkillFile(directoryName: string = SKILL_NAME): string[] {
  return validateSkillEntry(
    parseSkillEntry(readFileSync(SKILL_ENTRY_PATH, "utf8"), SKILL_ENTRY_PATH),
    directoryName,
  );
}

/** One row of the generated decision index, joined with its pattern links. */
function decisionRows(documents: readonly PatternDocument[], rules: readonly RuleEntry[]): string[][] {
  const knownRules = new Set(rules.map((rule) => rule.id));
  const byDecision = new Map<string, { patterns: string[]; rules: Set<string> }>();
  for (const document of documents) {
    for (const decision of document.frontmatter.decisions) {
      const bucket = byDecision.get(decision) ?? { patterns: [], rules: new Set<string>() };
      bucket.patterns.push(document.frontmatter.id);
      for (const rule of document.frontmatter.rules) {
        if (knownRules.has(rule)) {
          bucket.rules.add(rule);
        }
      }
      byDecision.set(decision, bucket);
    }
  }
  return [...byDecision.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([decision, bucket]) => [
      `\`${decision}\``,
      bucket.patterns.sort((a, b) => a.localeCompare(b)).join(", ") || "—",
      [...bucket.rules].sort((a, b) => a.localeCompare(b)).join(", ") || "—",
    ]);
}

/**
 * Render the generated decision routing index.
 *
 * The index answers "which reference do I open for this decision?" by pairing
 * every decision key with the patterns that resolve it and the rules those
 * patterns apply.
 *
 * @param documents - Parsed pattern documents.
 * @param rules - Typed rules catalog.
 * @returns Generated Markdown for `skill/references/index.md`.
 */
export function renderDecisionIndex(
  documents: readonly PatternDocument[],
  rules: readonly RuleEntry[],
): string {
  const decisions = renderTable(
    ["Decision", "Patterns", "Rules"],
    decisionRows(documents, rules),
  );
  const patternRows = [...documents]
    .sort((a, b) => a.frontmatter.id.localeCompare(b.frontmatter.id))
    .map((document) => [
      `[${document.frontmatter.id}](${posix.relative(posix.dirname(SKILL_REFERENCE_INDEX_PATH), PATTERNS_DIR)}/${posix.basename(document.path)})`,
      document.frontmatter.title,
      document.frontmatter.decisions.join(", ") || "—",
    ]);
  const patterns = renderTable(["Pattern", "Title", "Decisions"], patternRows);
  return `${generatedMarker(`${PATTERNS_DIR} + ${RULES_JSON_PATH}`)}

# Reference Index

This index is generated. Route by the decision you face, then open the pattern.
For exact component props and imports, use the sibling \`fluentui\` skill
(for example [Button](fluentui:references/components/button.md)).

## Decisions

${decisions}

## Application patterns

${patterns}
`;
}

/**
 * Render the generated rule index grouped by decision area.
 *
 * @param rules - Typed rules catalog.
 * @returns Generated Markdown for `skill/references/rules/index.md`.
 */
export function renderRulesIndex(rules: readonly RuleEntry[]): string {
  const sections = RULES_DECISION_AREAS.map((area) => {
    const inArea = rules
      .filter((rule) => rule.decisionArea === area)
      .sort((a, b) => a.id.localeCompare(b.id));
    if (inArea.length === 0) {
      return undefined;
    }
    const rows = inArea.map((rule) => [rule.id, rule.strength, rule.instruction]);
    return `## ${area}\n\n${renderTable(["Rule", "Strength", "Instruction"], rows)}`;
  }).filter((section): section is string => section !== undefined);

  return `${generatedMarker(RULES_JSON_PATH)}

# Rule Index

Rules grouped by decision area. Each rule is operational: it states what to do,
when it applies, and where its evidence comes from. Full provenance lives in
\`rules/rules.json\`.

${sections.join("\n\n")}
`;
}

/**
 * Render the full rules catalog as Markdown.
 *
 * @param rules - Typed rules catalog.
 * @returns Generated Markdown for `rules/rules.md`.
 */
export function renderRulesMarkdown(rules: readonly RuleEntry[]): string {
  const rows = [...rules]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((rule) => [
      rule.id,
      rule.title,
      rule.decisionArea,
      rule.strength,
      rule.classification,
      rule.instruction,
    ]);
  const table = renderTable(
    ["ID", "Title", "Area", "Strength", "Class", "Instruction"],
    rows,
  );
  return `${generatedMarker(RULES_JSON_PATH)}

# Rules Catalog

${table}
`;
}

/** A file the generator owns: its path and the exact bytes it should contain. */
export interface GeneratedArtifact {
  /** Repository-relative path. */
  path: string;
  /** Exact file content, including the generated marker where applicable. */
  content: string;
}

/** The filesystem surface the generator needs, so drift checks are testable. */
export interface SkillFileSystem {
  /** Read a UTF-8 file, or return `undefined` when it does not exist. */
  readFile(path: string): string | undefined;
  /** List every file below a directory, recursively, as repository-relative paths. */
  listFiles(dir: string): string[];
}

/**
 * Render every generated file that is not part of the installable mirror.
 *
 * @returns The generated catalog and index artifacts, in a stable order.
 */
export function buildGeneratedArtifacts(): GeneratedArtifact[] {
  const sources = parseSources(readJsonFileSync(SOURCES_JSON_PATH));
  const fact = loadVerifiedExportsSync();
  const rules = parseRules(readJsonFileSync(RULES_JSON_PATH), {
    knownSourceIds: sources.map((source) => source.id),
    allowedExports: fact.exports,
  });
  const documents = loadPatternDocumentsSync();
  return [
    { path: SOURCES_MD_PATH, content: renderSourcesMarkdown(sources) },
    { path: RULES_MD_PATH, content: renderRulesMarkdown(rules) },
    { path: SKILL_REFERENCE_INDEX_PATH, content: renderDecisionIndex(documents, rules) },
    { path: SKILL_RULES_INDEX_PATH, content: renderRulesIndex(rules) },
  ];
}

/** List every file under a directory using the real filesystem. */
function listFilesSync(dir: string): string[] {
  const found: string[] = [];
  const walk = (current: string): void => {
    let entries: Dirent[];
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const isDependencyDir = entry.name === "node_modules" || entry.name === ".git";
        const isBuildOutputDir =
          current === "." && (entry.name === "dist" || entry.name === "skills");
        if (isDependencyDir || isBuildOutputDir) {
          continue;
        }
      }
      const child = current === "." ? entry.name : `${current}/${entry.name}`;
      if (entry.isDirectory()) {
        walk(child);
      } else if (entry.isFile()) {
        found.push(child);
      }
    }
  };
  walk(dir);
  return found.sort((a, b) => a.localeCompare(b));
}

/**
 * Build the filesystem adapter backed by the real repository.
 *
 * @returns A filesystem where a missing file reads as `undefined` and a missing
 * directory lists as empty, so gates report drift instead of throwing.
 */
export function createRealFileSystem(): SkillFileSystem {
  return {
    readFile(path: string): string | undefined {
      try {
        return readFileSync(path, "utf8");
      } catch {
        return undefined;
      }
    },
    listFiles: listFilesSync,
  };
}

/**
 * Build the installable mirror of `skill/`.
 *
 * Every authored and generated file under `skill/` is copied byte-for-byte to
 * `.agents/skills/fluentui-design/`, so the package can be loaded with no build
 * step. Generated index files use their freshly rendered content.
 *
 * @param generated - Generated artifacts whose content overrides the on-disk copy.
 * @returns The mirror artifacts.
 */
export function buildMirrorArtifacts(
  generated: readonly GeneratedArtifact[],
): GeneratedArtifact[] {
  const generatedByPath = new Map(generated.map((artifact) => [artifact.path, artifact.content]));
  return listFilesSync(SKILL_DIR).map((path) => ({
    path: `${SKILL_MIRROR_DIR}/${path.slice(SKILL_DIR.length + 1)}`,
    content: generatedByPath.get(path) ?? readFileSync(path, "utf8"),
  }));
}

/**
 * Compute every artifact the generator is responsible for.
 *
 * @returns Generated files plus the byte-identical mirror of `skill/`.
 */
export function expectedArtifacts(): GeneratedArtifact[] {
  const generated = buildGeneratedArtifacts();
  return [...generated, ...buildMirrorArtifacts(generated)];
}

/** The differences the drift gate found between disk and generated output. */
export interface GenerationProblems {
  /** Generated files whose committed content differs from freshly rendered output. */
  drifted: string[];
  /** Managed paths absent from generated output: stale generated files or extra mirror files. */
  stale: string[];
  /** Marked files outside the managed set; reported but never deleted. */
  unmanagedMarked: string[];
}

/**
 * Report whether a path is inside the generator's managed set.
 *
 * Only files in this set may be removed when they go stale. A marked file
 * elsewhere is a mistake to surface, not content to delete.
 *
 * @param path - Repository-relative path.
 * @returns `true` when the path is managed by the generator.
 */
export function isManagedGeneratedPath(path: string): boolean {
  if (path === SKILL_MIRROR_DIR || path.startsWith(`${SKILL_MIRROR_DIR}/`)) {
    return true;
  }
  return [SOURCES_MD_PATH, RULES_MD_PATH, SKILL_REFERENCE_INDEX_PATH, SKILL_RULES_INDEX_PATH].includes(
    path,
  );
}

/** The root the stale and out-of-set marker scan walks, excluding dependencies. */
const STALE_SCAN_ROOT = ".";

/**
 * Compare the filesystem against freshly generated output.
 *
 * @param fs - Filesystem to inspect; tests pass an overlay for controlled input.
 * @returns Drifted, stale, and out-of-set marked files.
 */
export function checkGeneration(fs: SkillFileSystem): GenerationProblems {
  const expected = expectedArtifacts();
  const expectedByPath = new Map(expected.map((artifact) => [artifact.path, artifact.content]));

  const drifted = expected
    .filter((artifact) => fs.readFile(artifact.path) !== artifact.content)
    .map((artifact) => artifact.path)
    .sort((a, b) => a.localeCompare(b));

  const stale: string[] = [];
  const unmanagedMarked: string[] = [];
  const seen = new Set<string>();
  for (const path of fs.listFiles(STALE_SCAN_ROOT)) {
    if (seen.has(path) || expectedByPath.has(path)) {
      continue;
    }
    seen.add(path);
    // The mirror is a clean copy: a file under it that is not expected output is
    // stale, whether or not it carries the marker.
    if (path === SKILL_MIRROR_DIR || path.startsWith(`${SKILL_MIRROR_DIR}/`)) {
      stale.push(path);
      continue;
    }
    const content = fs.readFile(path);
    if (content === undefined || !isGeneratedContent(content)) {
      continue;
    }
    if (isManagedGeneratedPath(path)) {
      stale.push(path);
    } else {
      unmanagedMarked.push(path);
    }
  }

  return {
    drifted,
    stale: stale.sort((a, b) => a.localeCompare(b)),
    unmanagedMarked: unmanagedMarked.sort((a, b) => a.localeCompare(b)),
  };
}

/**
 * Regenerate the managed files and remove stale ones.
 *
 * The mirror and the four generated documents are written with freshly rendered
 * content; stale managed files are deleted. Marked files outside the managed set
 * are reported but left alone.
 *
 * @param fs - Filesystem to inspect for stale files.
 * @param write - Sink that writes one generated file.
 * @param remove - Sink that deletes one stale file.
 * @returns The problems observed before regeneration.
 */
export function applyGeneration(
  fs: SkillFileSystem,
  write: (path: string, content: string) => void,
  remove: (path: string) => void,
): GenerationProblems {
  const problems = checkGeneration(fs);
  for (const path of problems.stale) {
    remove(path);
  }
  for (const artifact of expectedArtifacts()) {
    write(artifact.path, artifact.content);
  }
  return problems;
}

/** Facts the reference gate needs to resolve ids and links. */
export interface ReferenceContext {
  /** Every catalog id that may be referenced, across all id kinds. */
  knownIds: ReadonlySet<string>;
  /** Report whether a repository-relative path exists. */
  fileExists: (path: string) => boolean;
}

/** A catalog id found in skill prose, such as `RULE-004` or `PAT-002`. */
const CATALOG_ID_PATTERN = /\b(SRC|RULE|PAT|FND|CNF)-\d{3}\b/g;
/** A Markdown inline link, capturing its target. */
const MARKDOWN_LINK_PATTERN = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

/**
 * Resolve a reference target to a repository path.
 *
 * @param documentPath - Repository-relative path of the document holding the link.
 * @param target - The link target, without any fragment.
 * @returns The resolved path, or `undefined` when it escapes the repository.
 */
function resolveRelative(documentPath: string, target: string): string | undefined {
  const resolved = posix.normalize(posix.join(posix.dirname(documentPath), target));
  return resolved.startsWith("..") ? undefined : resolved;
}

/**
 * Check the catalog ids and links in one Markdown document.
 *
 * Catalog ids (`SRC`, `RULE`, `PAT`, `FND`, `CNF`) must resolve. Internal links
 * must point at a file that exists. Cross-skill links of the form
 * `skill-name:references/...` are external and are validated only by their
 * known skill-name prefix and link shape, never for local existence.
 *
 * @param documentPath - Repository-relative path of the document.
 * @param markdown - Full text of the document.
 * @param context - Known ids and a file-existence check.
 * @returns Human-readable errors; empty when every reference resolves.
 */
export function checkReferences(
  documentPath: string,
  markdown: string,
  context: ReferenceContext,
): string[] {
  const errors: string[] = [];

  for (const match of markdown.matchAll(CATALOG_ID_PATTERN)) {
    const id = match[0];
    if (!context.knownIds.has(id)) {
      errors.push(`${documentPath} references unknown id ${id}`);
    }
  }

  for (const match of markdown.matchAll(MARKDOWN_LINK_PATTERN)) {
    const target = (match[1] ?? "").trim();
    if (target.length === 0 || target.startsWith("#")) {
      continue;
    }
    if (/^(https?:|mailto:)/.test(target)) {
      continue;
    }

    const crossSkill = /^([a-z][a-z0-9-]*):(.+)$/.exec(target);
    if (crossSkill !== null) {
      const [, prefix = "", rest = ""] = crossSkill;
      if (!(KNOWN_SKILL_PREFIXES as readonly string[]).includes(prefix)) {
        errors.push(`${documentPath} references unknown skill "${prefix}" in link ${target}`);
      } else if (rest.length === 0 || rest.includes("..")) {
        errors.push(`${documentPath} has an invalid cross-skill link ${target}`);
      }
      continue;
    }

    const withoutFragment = target.split("#")[0] ?? "";
    if (withoutFragment.length === 0) {
      continue;
    }
    const resolved = resolveRelative(documentPath, withoutFragment);
    if (resolved === undefined || !context.fileExists(resolved)) {
      errors.push(`${documentPath} links to a missing file ${target}`);
    }
  }

  return errors;
}
