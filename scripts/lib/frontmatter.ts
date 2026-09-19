/** A frontmatter value: a single line of text or an inline list. */
export type FrontmatterValue = string | string[];

/** The parsed key/value pairs at the top of a Markdown document. */
export type Frontmatter = Record<string, FrontmatterValue>;

/** A document split into its frontmatter and its remaining body. */
export interface ParsedDocument {
  frontmatter: Frontmatter;
  body: string;
}

/** Strip one layer of matching single or double quotes from a value. */
function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/** Parse an inline `[a, b]` list; a plain value becomes a string. */
function parseValue(raw: string): FrontmatterValue {
  const value = raw.trim();
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (inner.length === 0) {
      return [];
    }
    return inner.split(",").map((part) => stripQuotes(part));
  }
  return stripQuotes(value);
}

/**
 * Split a Markdown document into YAML-style frontmatter and the body.
 *
 * The parser is intentionally small: it understands `key: value` and inline
 * `key: [a, b]` lists, which is all the pattern files use. A document without a
 * leading `---` fence has empty frontmatter and the whole text as its body.
 *
 * @param markdown - Full text of the document.
 * @returns The parsed frontmatter and body.
 */
export function parseFrontmatter(markdown: string): ParsedDocument {
  const lines = markdown.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") {
    return { frontmatter: {}, body: markdown };
  }
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (end === -1) {
    return { frontmatter: {}, body: markdown };
  }

  const frontmatter: Frontmatter = {};
  for (const line of lines.slice(1, end)) {
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    if (key.length > 0) {
      frontmatter[key] = parseValue(line.slice(separator + 1));
    }
  }

  return { frontmatter, body: lines.slice(end + 1).join("\n") };
}
