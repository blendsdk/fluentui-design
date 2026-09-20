import { describe, expect, it } from "vitest";
import { findSecretMatches } from "../lib/secrets.js";

/** Build a synthetic credential so this test file never contains the literal. */
function joined(...parts: string[]): string {
  return parts.join("");
}

describe("secret near misses", () => {
  it("should not flag words that merely start with a key prefix", () => {
    expect(findSecretMatches("the task-based and risk-free disk-usage report")).toEqual([]);
  });

  it("should not flag a short github prefix", () => {
    expect(findSecretMatches(`token=${joined("ghp_", "abc")}`)).toEqual([]);
  });

  it("should not flag a bare private-key header", () => {
    expect(findSecretMatches(joined("-----BEGIN ", "PRIVATE KEY", "-----"))).toEqual([]);
  });

  it("should flag a private key with a body", () => {
    const body = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQ";
    const text = `${joined("-----BEGIN ", "PRIVATE KEY", "-----")}\n${body}\n`;
    expect(findSecretMatches(text).map((match) => match.pattern)).toContain("private-key");
  });

  it("should not flag a base64 integrity hash", () => {
    const line = '"integrity": "sha512-abcdefghijklmnopqrstuvwxyz0123456789+/ABCDEF=="';
    expect(findSecretMatches(line)).toEqual([]);
  });
});

describe("secret detection", () => {
  it("should report the one-based line of a match", () => {
    const key = joined("AKIA", "0123456789ABCDEF");
    const matches = findSecretMatches(`clean line\nkey = ${key}\n`);
    expect(matches).toContainEqual({ pattern: "aws-access-key", line: 2 });
  });

  it("should flag a full github token", () => {
    const token = joined("ghp_", "a".repeat(36));
    expect(findSecretMatches(token).map((match) => match.pattern)).toContain("github-token");
  });

  it("should never echo the matched secret text", () => {
    const key = joined("AKIA", "0123456789ABCDEF");
    const matches = findSecretMatches(key);
    expect(JSON.stringify(matches)).not.toContain(key);
  });
});
