import { describe, expect, it } from "vitest";
import { parseFieldTable, parseTable, splitTableRow } from "../lib/markdown.js";

describe("markdown table parsing", () => {
  it("should split a row on pipes and trim each cell", () => {
    expect(splitTableRow("| a | b | c |")).toEqual(["a", "b", "c"]);
  });

  it("should treat an escaped pipe as literal text inside a cell", () => {
    expect(splitTableRow("| a \\| b | c |")).toEqual(["a | b", "c"]);
  });

  it("should ignore the separator row and keep the data rows", () => {
    const table = parseTable(["| H1 | H2 |", "| --- | --- |", "| a | b |"]);
    expect(table).toEqual({ headers: ["H1", "H2"], rows: [["a", "b"]] });
  });

  it("should parse a table whose lines end with CRLF", () => {
    const table = parseTable(["| H1 | H2 |\r", "| --- | --- |\r", "| a | b |\r"]);
    expect(table?.rows).toEqual([["a", "b"]]);
  });

  it("should preserve an extra column when a row has more cells than the header", () => {
    const table = parseTable(["| H1 | H2 |", "| --- | --- |", "| a | b | c |"]);
    expect(table?.rows).toEqual([["a", "b", "c"]]);
  });

  it("should treat a field row with no value cell as an empty string", () => {
    const fields = parseFieldTable(["| Field | Value |", "| --- | --- |", "| id |", "| kind | x |"]);
    expect(fields).toEqual({ id: "", kind: "x" });
  });

  it("should return undefined when no table is present", () => {
    expect(parseTable(["no table here"])).toBeUndefined();
  });

  it("should still read fields from a table whose header starts with a BOM", () => {
    const fields = parseFieldTable(["\uFEFF| Field | Value |", "| --- | --- |", "| id | x |"]);
    expect(fields).toEqual({ id: "x" });
  });

  it("should keep a short row that has fewer cells than the header", () => {
    const table = parseTable(["| H1 | H2 |", "| --- | --- |", "| a |"]);
    expect(table?.rows).toEqual([["a"]]);
  });
});
