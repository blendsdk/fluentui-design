import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { extractHeadingSections, splitTableRow } from "../lib/markdown.js";
import { loadPatternDocumentsSync } from "../lib/patterns.js";
import { parseSources, SOURCES_JSON_PATH } from "../lib/sources.js";

/**
 * Paths to the closing documents the project must ship.
 *
 * The skill tells a reader to start from `README.md`; the maintenance guide and
 * changelog keep it current; the completion report closes the initial build.
 */
const README_PATH = "README.md";
const MAINTENANCE_PATH = "MAINTENANCE.md";
const CHANGELOG_PATH = "CHANGELOG.md";
const COMPLETION_REPORT_PATH = "COMPLETION-REPORT.md";
const RULES_JSON_PATH = "rules/rules.json";
const RULE_INDEX_PATH = "skill/references/rules/index.md";

/**
 * The package and facts-pin baseline the reader must be able to find.
 *
 * Both are pinned as literals so this test stays an independent oracle: a wrong
 * baseline fails the test instead of silently following the implementation.
 */
const BASELINE_PACKAGE_VERSION = "9.74.7";
const BASELINE_FACTS_COMMIT = "d595d79";

/**
 * A phrase that must appear in a maintenance-guide heading.
 *
 * These six headings cover the six procedures the requirement lists.
 */
const REQUIRED_MAINTENANCE_HEADINGS = [
  "recheck the sources",
  "redirects and content changes",
  "package baseline",
  "rules a fact change affects",
  "examples and the evaluation",
  "history of replaced guidance",
] as const;

/**
 * A generated table whose first cell is a catalog id and a later cell is its title.
 *
 * `firstCellIsLink` handles the reference index, where the id is a Markdown link
 * rather than plain text.
 */
interface GeneratedTitleTable {
  /** Repository-relative path to the generated document. */
  path: string;
  /** Zero-based index of the cell that holds the title. */
  titleColumn: number;
  /** Whether the first cell wraps the id in a Markdown link. */
  firstCellIsLink?: boolean;
}

/** The generated tables that repeat a catalog id together with its title. */
const GENERATED_TITLE_TABLES: readonly GeneratedTitleTable[] = [
  { path: "sources/sources.md", titleColumn: 2 },
  { path: "rules/rules.md", titleColumn: 1 },
  { path: "skill/references/index.md", titleColumn: 1, firstCellIsLink: true },
];

/** A rule entry as stored in the rules catalog. */
interface CatalogRule {
  id: string;
  title: string;
}

/** Read a committed document as UTF-8. */
function read(path: string): string {
  return readFileSync(path, "utf8");
}

/**
 * Extract an id from the first cell of a generated table row.
 *
 * @param cell - The trimmed first cell.
 * @param asLink - Whether the id is expected inside a Markdown link.
 * @returns The id, or `undefined` when the cell is not an id cell.
 */
function firstCellId(cell: string, asLink: boolean): string | undefined {
  const pattern = asLink ? /^\[((?:SRC|RULE|PAT)-\d{3})\]\(/ : /^((?:SRC|RULE|PAT)-\d{3})$/;
  return pattern.exec(cell)?.[1];
}

/**
 * Read the title each catalog id is given in its JSON source of truth.
 *
 * Rule titles come from `rules/rules.json`, source titles from
 * `sources/sources.json`, and pattern titles from each pattern's frontmatter. This
 * is the value the generated tables must agree with.
 *
 * @returns A map of every catalog id to its canonical title.
 */
function catalogTitles(): Map<string, string> {
  const titles = new Map<string, string>();
  for (const rule of JSON.parse(read(RULES_JSON_PATH)) as CatalogRule[]) {
    titles.set(rule.id, rule.title);
  }
  const sources = parseSources(JSON.parse(read(SOURCES_JSON_PATH)) as unknown);
  for (const source of sources) {
    titles.set(source.id, source.title);
  }
  for (const pattern of loadPatternDocumentsSync()) {
    titles.set(pattern.frontmatter.id, pattern.frontmatter.title);
  }
  return titles;
}

/**
 * Collect the titles each catalog id is given across the generated tables.
 *
 * @returns A map of id to the set of distinct titles found for it.
 */
function generatedTitles(): Map<string, Set<string>> {
  const titles = new Map<string, Set<string>>();
  for (const table of GENERATED_TITLE_TABLES) {
    for (const line of read(table.path).split(/\r?\n/)) {
      if (!line.trim().startsWith("|")) {
        continue;
      }
      const cells = splitTableRow(line);
      const id = firstCellId(cells[0] ?? "", table.firstCellIsLink === true);
      const title = (cells[table.titleColumn] ?? "").trim();
      if (id === undefined || title.length === 0) {
        continue;
      }
      const seen = titles.get(id) ?? new Set<string>();
      seen.add(title);
      titles.set(id, seen);
    }
  }
  return titles;
}

describe("README", () => {
  it("should state its scope in a Scope section", () => {
    expect(extractHeadingSections(read(README_PATH))["Scope"]).toBeTruthy();
  });

  it("should explain usage or installation in a Usage section", () => {
    expect(extractHeadingSections(read(README_PATH))["Usage"]).toBeTruthy();
  });

  it("should record the pinned baseline in a Version baseline section", () => {
    const baseline = extractHeadingSections(read(README_PATH))["Version baseline"];
    expect(baseline).toBeTruthy();
    expect(baseline).toContain(BASELINE_PACKAGE_VERSION);
    expect(baseline).toContain(BASELINE_FACTS_COMMIT);
  });

  it("should name its known limitations", () => {
    expect(extractHeadingSections(read(README_PATH))["Known limitations"]).toBeTruthy();
  });

  it("should explain the division of labor with the sibling skill", () => {
    const sections = extractHeadingSections(read(README_PATH));
    const heading = Object.keys(sections).find((key) =>
      key.toLowerCase().includes("division of labor"),
    );
    expect(heading, "no division-of-labor section").toBeTruthy();
    expect(sections[heading ?? ""]).toMatch(/fluentui/);
  });
});

describe("maintenance guide", () => {
  it("should cover all six maintenance procedures", () => {
    const headings = Object.keys(extractHeadingSections(read(MAINTENANCE_PATH))).map((key) =>
      key.toLowerCase(),
    );
    for (const phrase of REQUIRED_MAINTENANCE_HEADINGS) {
      expect(headings.some((heading) => heading.includes(phrase)), `missing ${phrase}`).toBe(true);
    }
  });
});

describe("changelog", () => {
  it("should record the baseline package version and pinned facts commit", () => {
    const changelog = read(CHANGELOG_PATH);
    expect(changelog).toContain(BASELINE_PACKAGE_VERSION);
    expect(changelog).toContain(BASELINE_FACTS_COMMIT);
  });

  it("should keep a replaced-guidance history section", () => {
    expect(read(CHANGELOG_PATH)).toMatch(/^#{2,3} Replaced guidance history\s*$/m);
  });
});

describe("completion report", () => {
  it("should mark every blocked or obsolete source", () => {
    const report = read(COMPLETION_REPORT_PATH);
    const sources = parseSources(JSON.parse(read(SOURCES_JSON_PATH)) as unknown);
    for (const source of sources) {
      if (source.status === "blocked" || source.status === "obsolete") {
        expect(report, `${source.id} is ${source.status}`).toContain(source.id);
      }
    }
  });

  it("should separate completed, blocked, and untested deliverables", () => {
    const report = read(COMPLETION_REPORT_PATH);
    expect(report).toMatch(/\bcompleted\b/i);
    expect(report).toMatch(/\bblocked\b/i);
    expect(report).toMatch(/\buntested\b/i);
  });
});

describe("catalog id stability", () => {
  it("should give every id a single title across the generated artifacts", () => {
    const titles = generatedTitles();
    expect(titles.size).toBeGreaterThan(0);
    for (const [id, distinctTitles] of titles) {
      expect(distinctTitles.size, `${id} has several titles`).toBe(1);
    }
  });

  it("should match each generated title to its catalog source of truth", () => {
    const catalog = catalogTitles();
    const generated = generatedTitles();
    for (const [id, title] of catalog) {
      const found = generated.get(id);
      expect(found, `${id} is missing from the generated tables`).toBeTruthy();
      expect(found?.has(title), `${id} title "${[...(found ?? [])].join(", ")}"`).toBe(true);
    }
  });

  it("should list every rule id in the generated rule index", () => {
    const index = read(RULE_INDEX_PATH);
    for (const rule of JSON.parse(read(RULES_JSON_PATH)) as CatalogRule[]) {
      expect(index, `${rule.id} missing from the rule index`).toContain(rule.id);
    }
  });
});
