import { findSecretMatches } from "./lib/secrets.js";
import { runChecks } from "./lib/report.js";
import { createRealFileSystem } from "./lib/skill.js";
import type { CheckOutcome, GateCheck } from "./lib/report.js";

/** File extensions treated as scannable text. */
const TEXT_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".markdown",
  ".yml",
  ".yaml",
  ".html",
  ".css",
  ".txt",
  ".sh",
  ".toml",
] as const;

/** Exact files skipped because they carry unrelated content. */
const EXCLUDED_FILES = new Set(["package-lock.json"]);

/**
 * Directories skipped by the scan.
 *
 * `.agents/` is a byte-identical mirror of `skill/`, so scanning it would only
 * duplicate findings. `codeops/` holds planning documents that intentionally
 * quote credential shapes as examples; they are not shipped content.
 */
const EXCLUDED_PREFIXES = [".agents/", "codeops/"];

/** Report whether a path should be scanned. */
function isScannable(path: string): boolean {
  if (EXCLUDED_FILES.has(path) || EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return false;
  }
  return TEXT_EXTENSIONS.some((extension) => path.endsWith(extension));
}

/**
 * Reject committed content that contains credential shapes.
 *
 * @returns A process exit code: `0` when no credential is found, otherwise `1`.
 */
async function main(): Promise<number> {
  const checks: GateCheck[] = [
    {
      name: "secrets",
      run: (): CheckOutcome => {
        const fs = createRealFileSystem();
        const findings: string[] = [];

        for (const path of fs.listFiles(".")) {
          if (!isScannable(path)) {
            continue;
          }
          const text = fs.readFile(path);
          if (text === undefined) {
            continue;
          }
          for (const match of findSecretMatches(text)) {
            findings.push(`${path}:${match.line} — ${match.pattern}`);
          }
        }

        return findings.length === 0
          ? { name: "secrets", ok: true }
          : { name: "secrets", ok: false, detail: findings.join("; ") };
      },
    },
  ];

  return runChecks(checks);
}

process.exitCode = await main();
