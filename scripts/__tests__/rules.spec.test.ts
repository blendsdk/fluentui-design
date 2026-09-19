import { describe, expect, it } from "vitest";
import { loadVerifiedExportsSync } from "../lib/facts.js";
import {
  lintRules,
  parseRules,
  RULES_JSON_PATH,
  validateRulesData,
} from "../lib/rules.js";
import type { RuleValidationContext } from "../lib/rules.js";
import { parseSources, SOURCES_JSON_PATH } from "../lib/sources.js";
import { isRecord, parseJson, parseJsonArray, withFields } from "./test-helpers.js";

/** Build the validation context from the committed sources and the pinned allowlist. */
function context(): RuleValidationContext {
  const sources = parseSources(parseJson(SOURCES_JSON_PATH));
  const fact = loadVerifiedExportsSync();
  return {
    knownSourceIds: sources.map((source) => source.id),
    allowedExports: fact.exports,
  };
}

/** Return the first committed rule as a plain object. */
function firstRule(): Record<string, unknown> {
  const [first] = parseJsonArray(RULES_JSON_PATH);
  if (!isRecord(first)) {
    throw new Error("the rules catalog must contain object entries");
  }
  return first;
}

/** Build a structurally valid rule object with selected fields overridden. */
function ruleWith(overrides: Record<string, unknown>): Record<string, unknown> {
  return withFields(firstRule(), overrides);
}

describe("rule catalog validation", () => {
  it("should accept the committed catalog when every rule is well formed", () => {
    expect(validateRulesData(parseJson(RULES_JSON_PATH), context())).toEqual([]);
  });

  it("should reject two rules that share an id", () => {
    const rule = firstRule();
    const errors = validateRulesData([rule, { ...rule }], context());
    expect(errors.join("\n")).toMatch(/duplicate/i);
  });

  it("should reject a rule citing a source that is absent from the catalog", () => {
    const errors = validateRulesData(
      [ruleWith({ evidenceSourceIds: ["SRC-999"] })],
      context(),
    );
    expect(errors.join("\n")).toMatch(/SRC-999/);
  });

  it("should reject a verified mapping whose export is not in the allowlist", () => {
    const errors = validateRulesData(
      [
        ruleWith({
          componentMapping: {
            kind: "verified",
            package: "@fluentui/react-components",
            version: "9.74.7",
            exports: ["Foo"],
          },
        }),
      ],
      context(),
    );
    expect(errors.join("\n")).toMatch(/Foo/);
  });

  it("should reject a rule whose instruction is empty", () => {
    const errors = validateRulesData([ruleWith({ instruction: "" })], context());
    expect(errors.join("\n")).toMatch(/instruction/i);
  });

  it("should flag a non-operational instruction with a banned phrase", () => {
    const entries = parseRules(
      [ruleWith({ instruction: "Make it intuitive." })],
      context(),
    );
    expect(lintRules(entries).join("\n")).toMatch(/intuitive/i);
  });

  it("should pass every committed rule through the actionability lint", () => {
    expect(lintRules(parseRules(parseJson(RULES_JSON_PATH), context()))).toEqual([]);
  });

  it("should mark at least one composition as application-owned", () => {
    const rules = parseRules(parseJson(RULES_JSON_PATH), context());
    expect(rules.some((rule) => rule.componentMapping.kind === "application-owned")).toBe(true);
  });
});
