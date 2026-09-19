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
