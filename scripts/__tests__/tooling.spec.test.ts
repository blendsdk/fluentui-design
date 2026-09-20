import { describe, expect, it } from "vitest";
import { checkExampleSnippets } from "../lib/examples.js";
import { buildFreshnessManifest, diffFreshness } from "../lib/freshness.js";
import type { FreshnessManifest, PinnedFacts } from "../lib/freshness.js";
import { findSecretMatches } from "../lib/secrets.js";

const PINNED: PinnedFacts = { sourceCommit: "d595d79", packageVersion: "9.74.7" };

/** A synthetic AWS key split so the secret scan does not flag this test file. */
const AWS_ACCESS_KEY = ["AKIA", "0123456789ABCDEF"].join("");

describe("example gate (RD-07)", () => {
  it("should name an import the package does not export", () => {
    const failures = checkExampleSnippets([
      {
        source: "example.tsx",
        code: 'import { Bogus } from "@fluentui/react-components";\nexport const value = Bogus;\n',
      },
    ]);
    const api = failures.filter((failure) => failure.kind === "api");
    expect(api.length).toBeGreaterThan(0);
    expect(api.map((failure) => failure.message).join("\n")).toMatch(/Bogus/);
  });

  it("should not execute example code", () => {
    type SideEffect = typeof globalThis & { __opencodeExampleRan?: boolean };
    const scope = globalThis as SideEffect;
    delete scope.__opencodeExampleRan;

    checkExampleSnippets([
      {
        source: "side-effect.tsx",
        code: "(globalThis as unknown as { __opencodeExampleRan?: boolean }).__opencodeExampleRan = true;\nexport {};\n",
      },
    ]);

    expect(scope.__opencodeExampleRan).toBeUndefined();
  });
});

describe("secret scan (RD-07)", () => {
  it("should flag an AWS access key", () => {
    const matches = findSecretMatches(`aws_access_key_id = ${AWS_ACCESS_KEY}`);
    expect(matches.map((match) => match.pattern)).toContain("aws-access-key");
  });

  it("should not flag a lockfile integrity hash", () => {
    const line = '"integrity": "sha512-abcdefghijklmnopqrstuvwxyz0123456789+/ABCDEF=="';
    expect(findSecretMatches(line)).toEqual([]);
  });
});

describe("freshness manifest (RD-07)", () => {
  it("should report an input whose hash changed", () => {
    const before = buildFreshnessManifest([{ path: "sources/sources.json", text: "a" }], PINNED);
    const after = buildFreshnessManifest([{ path: "sources/sources.json", text: "b" }], PINNED);
    expect(diffFreshness(before, after).join("\n")).toMatch(/sources\/sources\.json/);
  });

  it("should produce a stable manifest across runs", () => {
    const entries = [
      { path: "sources/sources.json", text: "sources" },
      { path: "rules/rules.json", text: "rules" },
    ];
    const first: FreshnessManifest = buildFreshnessManifest(entries, PINNED);
    const second: FreshnessManifest = buildFreshnessManifest(entries, PINNED);
    expect(first).toEqual(second);
    expect(Object.keys(first.inputs)).toEqual(["rules/rules.json", "sources/sources.json"]);
    expect(first.inputs["sources/sources.json"]).toMatch(/^sha256:[0-9a-f]{64}$/);
  });
});
