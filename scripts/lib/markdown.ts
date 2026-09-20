/** The stable prefix every generated file starts with. */
export const GENERATED_MARKER_PREFIX = "<!-- GENERATED FILE — DO NOT EDIT";

/**
 * Build the marker line that identifies a generated file and its source.
 *
 * A generated file is reproducible from a named source; the marker lets the
 * generator recognize its own output later so it can refresh or remove it
 * without touching hand-authored content.
 *
 * @param sourcePath - Repository-relative path of the file the output is built from.
 * @returns The full HTML-comment marker line.
 */
export function generatedMarker(sourcePath: string): string {
  return `${GENERATED_MARKER_PREFIX}; source: ${sourcePath} -->`;
}

/**
 * Report whether text carries the generated-file marker.
 *
 * @param text - File contents to inspect.
 * @returns `true` when the text begins with the marker prefix.
 */
export function isGeneratedContent(text: string): boolean {
  return text.startsWith(GENERATED_MARKER_PREFIX);
}

/**
 * Escape a value so it can appear inside one Markdown table cell.
 *
 * Pipes would start a new column, and line breaks would end the row, so both are
 * neutralized.
 *
 * @param value - Raw cell text.
 * @returns A single-line string safe for a table cell.
 */
export function escapeTableCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}

/**
 * Render a GitHub-flavored Markdown table.
 *
 * Rows shorter or longer than the header are tolerated: each cell is escaped and
 * joined, so malformed input degrades to a wide or narrow row rather than
 * throwing.
 *
 * @param headers - Column titles, in display order.
 * @param rows - Table rows; each row is a list of cell values.
 * @returns The table as Markdown text (no trailing newline).
 *
 * @example
 * ```ts
 * renderTable(["Id", "Status"], [["SRC-001", "analyzed"]]);
 * // | Id | Status |
 * // | --- | --- |
 * // | SRC-001 | analyzed |
 * ```
 */
export function renderTable(
  headers: readonly string[],
  rows: readonly (readonly string[])[],
): string {
  const header = `| ${headers.map(escapeTableCell).join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map(escapeTableCell).join(" | ")} |`);
  return [header, divider, ...body].join("\n");
}

/**
 * Ensure text ends with exactly one trailing newline.
 *
 * @param text - Text to normalize.
 * @returns The text with a single trailing newline.
 */
export function ensureTrailingNewline(text: string): string {
  return text.endsWith("\n") ? text : `${text}\n`;
}

/**
 * Split a Markdown body into `##` sections keyed by their heading text.
 *
 * Only level-two headings start a section; text before the first one is ignored.
 * Later headings with the same text overwrite earlier ones, which keeps the
 * function total for malformed input.
 *
 * @param body - Markdown text to split.
 * @returns A mapping of heading text to the trimmed content beneath it.
 */
export function extractHeadingSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {};
  let current: string | undefined;
  let buffer: string[] = [];

  const flush = (): void => {
    if (current !== undefined) {
      sections[current] = buffer.join("\n").trim();
    }
  };

  for (const line of body.split(/\r?\n/)) {
    if (line.startsWith("## ")) {
      flush();
      current = line.slice(3).trim();
      buffer = [];
      continue;
    }
    if (current !== undefined) {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

/** A parsed Markdown table: the header cells and the data rows. */
export interface ParsedTable {
  headers: string[];
  rows: string[][];
}

/**
 * Split one Markdown table line into its cells.
 *
 * A backslash-escaped pipe (`\|`) is treated as a literal pipe inside a cell, so
 * escaped content does not create phantom columns.
 *
 * @param line - A line that starts with `|`.
 * @returns The trimmed cell values in order.
 */
export function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells: string[] = [];
  let current = "";

  for (let index = 0; index < trimmed.length; index += 1) {
    const char = trimmed.charAt(index);
    if (char === "\\" && trimmed.charAt(index + 1) === "|") {
      current += "|";
      index += 1;
      continue;
    }
    if (char === "|") {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

/** Report whether a parsed row is the table's `---` separator line. */
function isSeparatorRow(cells: readonly string[]): boolean {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

/**
 * Parse the first pipe table found in a block of lines.
 *
 * @param lines - Lines to search; the first line beginning with `|` starts the table.
 * @returns The headers and data rows, or `undefined` when no table is present.
 */
export function parseTable(lines: readonly string[]): ParsedTable | undefined {
  const tableLines = lines.filter((line) => line.trim().startsWith("|"));
  if (tableLines.length < 2) {
    return undefined;
  }
  const headerLine = tableLines[0] ?? "";
  const headers = splitTableRow(headerLine);
  const rows = tableLines
    .slice(1)
    .map(splitTableRow)
    .filter((cells) => !isSeparatorRow(cells));
  return { headers, rows };
}

/**
 * Parse a two-column `| Field | Value |` table into a record.
 *
 * Later rows win when a field name repeats, which keeps the function total.
 *
 * @param lines - Lines that include the field table.
 * @returns A mapping of field name to value (empty strings preserved).
 */
export function parseFieldTable(lines: readonly string[]): Record<string, string> {
  const record: Record<string, string> = {};
  const table = parseTable(lines);
  if (table === undefined) {
    return record;
  }
  for (const row of table.rows) {
    const key = row[0];
    if (key !== undefined && key.length > 0) {
      record[key] = row[1] ?? "";
    }
  }
  return record;
}
