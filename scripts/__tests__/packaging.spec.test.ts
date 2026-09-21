import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isRecord, parseJson } from "./test-helpers.js";

/**
 * The exact list of paths the published package must ship.
 *
 * The order matters: it is the contract the distribution packaging must satisfy.
 */
const EXPECTED_FILES = [
  "dist/",
  "skills/fluentui-design/",
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
];

/**
 * Read a JSON file and narrow it to a plain object.
 *
 * @param relativePath - Repository-relative path to the JSON file.
 * @returns The parsed JSON object.
 * @throws Error when the file does not contain a JSON object.
 */
function readJsonObject(relativePath: string): Record<string, unknown> {
  const value = parseJson(relativePath);
  if (!isRecord(value)) {
    throw new Error(`${relativePath} must contain a JSON object`);
  }
  return value;
}

/** Read the repository package manifest. */
function readManifest(): Record<string, unknown> {
  return readJsonObject("package.json");
}

/**
 * Report whether a tsconfig `include` array covers the `src` directory.
 *
 * @param include - The value of the `include` field.
 * @returns `true` when at least one entry points at `src`.
 */
function coversSourceDirectory(include: unknown): boolean {
  if (!Array.isArray(include)) {
    return false;
  }
  return include.some(
    (entry) =>
      typeof entry === "string" &&
      (entry === "src" || entry.startsWith("src/") || entry.startsWith("src\\")),
  );
}

describe("package distribution contract", () => {
  it("should mark the package publishable with the expected identity", () => {
    const manifest = readManifest();
    expect(manifest.private).toBeUndefined();
    expect(manifest.name).toBe("fluentui-design");
    expect(manifest.version).toBe("0.1.0");
    expect(manifest.license).toBe("MIT");
    if (!isRecord(manifest.engines)) {
      throw new Error("package.json#engines must be an object");
    }
    expect(manifest.engines.node).toBe(">=22");
  });

  it("should expose the fluentui-design executable under bin", () => {
    const manifest = readManifest();
    if (!isRecord(manifest.bin)) {
      throw new Error("package.json#bin must be an object");
    }
    expect(manifest.bin["fluentui-design"]).toBe("dist/bin.js");
  });

  it("should ship exactly the five declared files in order", () => {
    const manifest = readManifest();
    expect(manifest.files).toEqual(EXPECTED_FILES);
  });

  it("should have no runtime dependencies and the four dev peers", () => {
    const manifest = readManifest();
    expect(manifest.dependencies).toEqual({});
    if (!isRecord(manifest.devDependencies)) {
      throw new Error("package.json#devDependencies must be an object");
    }
    expect(Object.keys(manifest.devDependencies)).toEqual(
      expect.arrayContaining([
        "react",
        "react-dom",
        "@fluentui/react-components",
        "@fluentui/react-icons",
      ]),
    );
  });

  it("should publish with public access", () => {
    const manifest = readManifest();
    if (!isRecord(manifest.publishConfig)) {
      throw new Error("package.json#publishConfig must be an object");
    }
    expect(manifest.publishConfig.access).toBe("public");
    expect(manifest.publishConfig.registry).toBe("https://registry.npmjs.org/");
  });

  it("should emit to dist and include src", () => {
    expect(existsSync("tsconfig.build.json")).toBe(true);
    const config = readJsonObject("tsconfig.build.json");
    if (!isRecord(config.compilerOptions)) {
      throw new Error("tsconfig.build.json#compilerOptions must be an object");
    }
    expect(config.compilerOptions.outDir).toBe("dist");
    expect(coversSourceDirectory(config.include)).toBe(true);
    expect(config.compilerOptions.noEmit).not.toBe(true);
  });

  it("should contain the MIT License text", () => {
    expect(existsSync("LICENSE")).toBe(true);
    expect(readFileSync("LICENSE", "utf8")).toContain("MIT License");
  });

  it("should ignore the built dist and skills output", () => {
    expect(existsSync(".gitignore")).toBe(true);
    const lines = readFileSync(".gitignore", "utf8").split(/\r?\n/);
    expect(lines).toContain("/dist/");
    expect(lines).toContain("/skills/");
  });
});
