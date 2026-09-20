import { createHash } from "node:crypto";
import { isJsonObject } from "./json.js";

/** The pinned upstream facts a manifest is tied to. */
export interface PinnedFacts {
  /** The sibling API-fact commit the allowlist was built from. */
  sourceCommit: string;
  /** The exact `@fluentui/react-components` version. */
  packageVersion: string;
}

/** One generation input and its current text. */
export interface FreshnessInput {
  /** Repository-relative path of the input. */
  path: string;
  /** The input's full text. */
  text: string;
}

/**
 * The committed freshness manifest.
 *
 * It records the pinned facts and a hash of every generation input, so a change
 * to any input can be detected without re-reading the sibling repository. It
 * contains no timestamps, which keeps regeneration byte-stable.
 */
export interface FreshnessManifest {
  /** Manifest schema version. */
  schema: number;
  /** The pinned facts this manifest was built against. */
  pinned: PinnedFacts;
  /** Map of input path to `sha256:<hex>` digest. */
  inputs: Record<string, string>;
}

/** Repository-relative path of the committed manifest. */
export const FRESHNESS_JSON_PATH = "facts/freshness.json";

/**
 * Hash text with SHA-256.
 *
 * @param text - Text to hash.
 * @returns The digest prefixed with its algorithm, such as `sha256:<hex>`.
 */
export function sha256Text(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

/**
 * Build a manifest from the current inputs.
 *
 * Inputs are hashed in sorted path order so the result is independent of the
 * caller's ordering.
 *
 * @param inputs - Current generation inputs.
 * @param pinned - The pinned facts.
 * @returns The manifest for the current tree.
 */
export function buildFreshnessManifest(
  inputs: readonly FreshnessInput[],
  pinned: PinnedFacts,
): FreshnessManifest {
  const hashes: Record<string, string> = {};
  for (const input of [...inputs].sort((a, b) => a.path.localeCompare(b.path))) {
    hashes[input.path] = sha256Text(input.text);
  }
  return { schema: 1, pinned: { ...pinned }, inputs: hashes };
}

/**
 * Compare a committed manifest with a freshly computed one.
 *
 * @param recorded - The manifest read from disk.
 * @param computed - The manifest built from the current inputs.
 * @returns Human-readable differences; empty when the tree is fresh.
 */
export function diffFreshness(
  recorded: FreshnessManifest,
  computed: FreshnessManifest,
): string[] {
  const errors: string[] = [];

  if (recorded.pinned.sourceCommit !== computed.pinned.sourceCommit) {
    errors.push(
      `freshness pins source commit ${recorded.pinned.sourceCommit} but facts record ${computed.pinned.sourceCommit}`,
    );
  }
  if (recorded.pinned.packageVersion !== computed.pinned.packageVersion) {
    errors.push(
      `freshness pins package ${recorded.pinned.packageVersion} but facts record ${computed.pinned.packageVersion}`,
    );
  }

  for (const [path, hash] of Object.entries(computed.inputs)) {
    const previous = recorded.inputs[path];
    if (previous === undefined) {
      errors.push(`freshness is missing input ${path}`);
    } else if (previous !== hash) {
      errors.push(`freshness input changed: ${path}`);
    }
  }
  for (const path of Object.keys(recorded.inputs)) {
    if (!(path in computed.inputs)) {
      errors.push(`freshness lists an unknown input: ${path}`);
    }
  }

  return errors;
}

/**
 * Validate the shape of a parsed manifest.
 *
 * @param data - Value parsed from {@link FRESHNESS_JSON_PATH}.
 * @returns The typed manifest.
 * @throws Error when a required field is missing or mistyped.
 */
export function parseFreshnessManifest(data: unknown): FreshnessManifest {
  if (!isJsonObject(data)) {
    throw new Error(`${FRESHNESS_JSON_PATH} must contain a JSON object`);
  }
  if (typeof data["schema"] !== "number") {
    throw new Error(`${FRESHNESS_JSON_PATH} field "schema" must be a number`);
  }
  const pinned = data["pinned"];
  if (!isJsonObject(pinned)) {
    throw new Error(`${FRESHNESS_JSON_PATH} field "pinned" must be an object`);
  }
  const sourceCommit = pinned["sourceCommit"];
  const packageVersion = pinned["packageVersion"];
  if (typeof sourceCommit !== "string" || typeof packageVersion !== "string") {
    throw new Error(`${FRESHNESS_JSON_PATH} "pinned" must have string sourceCommit and packageVersion`);
  }
  const rawInputs = data["inputs"];
  if (!isJsonObject(rawInputs)) {
    throw new Error(`${FRESHNESS_JSON_PATH} field "inputs" must be an object`);
  }
  const inputs: Record<string, string> = {};
  for (const [path, hash] of Object.entries(rawInputs)) {
    if (typeof hash !== "string") {
      throw new Error(`${FRESHNESS_JSON_PATH} hash for "${path}" must be a string`);
    }
    inputs[path] = hash;
  }

  return {
    schema: data["schema"],
    pinned: { sourceCommit, packageVersion },
    inputs,
  };
}
