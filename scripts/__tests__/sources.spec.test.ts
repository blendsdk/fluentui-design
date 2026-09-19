import { describe, expect, it } from "vitest";
import { validateSourcesData } from "../lib/sources.js";
import { isRecord, parseJson, parseJsonArray, withFields } from "./test-helpers.js";

const CATALOG_PATH = "sources/sources.json";

/** Return the first catalog entry as a plain object. */
function firstEntry(): Record<string, unknown> {
  const entries = parseJsonArray(CATALOG_PATH);
  const [first] = entries;
  if (!isRecord(first)) {
    throw new Error("the catalog must contain object entries");
  }
  return first;
}

describe("source catalog validation", () => {
  it("should accept the committed catalog when every entry is well formed", () => {
    expect(validateSourcesData(parseJson(CATALOG_PATH))).toEqual([]);
  });

  it("should reject a duplicated id when a second entry reuses it", () => {
    const entry = withFields(firstEntry(), { id: "SRC-001" });
    const errors = validateSourcesData([entry, { ...entry }]);
    expect(errors.join("\n")).toMatch(/duplicate/i);
  });

  it("should reject a blocked entry that has no access limitation", () => {
    const entry = withFields(firstEntry(), { status: "blocked", accessLimitation: null });
    const errors = validateSourcesData([entry]);
    expect(errors.join("\n")).toMatch(/limitation/i);
  });

  it("should reject an id that does not match the SRC-### pattern", () => {
    const entry = withFields(firstEntry(), { id: "SRC-1" });
    const errors = validateSourcesData([entry]);
    expect(errors.join("\n")).toMatch(/SRC-/);
  });

  it("should keep both the requested and the resolved URL for a redirected source", () => {
    const entries = parseJsonArray(CATALOG_PATH);
    const redirected = entries.find(
      (entry) => isRecord(entry) && entry["seedId"] === "I01",
    );
    if (!isRecord(redirected)) {
      throw new Error("expected a catalog entry with seedId I01");
    }
    expect(redirected["requestedUrl"]).not.toBe(redirected["resolvedUrl"]);
    expect(String(redirected["resolvedUrl"])).toMatch(/storybooks\.fluentui\.dev/);
  });
});
