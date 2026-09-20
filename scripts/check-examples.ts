import { checkExampleSnippets, checkProject, extractFencedCodeBlocks } from "./lib/examples.js";
import type { ExampleFailure, ExampleSnippet } from "./lib/examples.js";
import { isJsonObject, readJsonFileSync } from "./lib/json.js";
import { runChecks } from "./lib/report.js";
import { createRealFileSystem, SKILL_DIR } from "./lib/skill.js";
import { RULES_JSON_PATH } from "./lib/rules.js";
import type { CheckOutcome, GateCheck } from "./lib/report.js";

/** Rule fields that may carry a code sample. */
const EXAMPLE_FIELDS = ["positiveExample", "antiPattern"] as const;

/** The fixture project type-checked to prove its Fluent imports resolve. */
const FIXTURE_TSCONFIG = "fixture/tsconfig.json";

/**
 * Collect compilable snippets from the skill's Markdown and the rules catalog.
 *
 * Fenced blocks are gathered from every `.md` file under the skill and from the
 * example fields of every rule. Rule examples are prose more often than code, so
 * only their fenced blocks are compiled.
 *
 * @returns Snippets labelled with their origin.
 */
function collectSnippets(): ExampleSnippet[] {
  const snippets: ExampleSnippet[] = [];
  const fs = createRealFileSystem();

  for (const path of fs.listFiles(SKILL_DIR).filter((entry) => entry.endsWith(".md"))) {
    const markdown = fs.readFile(path);
    if (markdown === undefined) {
      continue;
    }
    for (const block of extractFencedCodeBlocks(markdown)) {
      snippets.push({ source: `${path}:${block.line}`, code: block.code, language: block.language });
    }
  }

  const rules = readJsonFileSync(RULES_JSON_PATH);
  if (Array.isArray(rules)) {
    for (const entry of rules) {
      if (!isJsonObject(entry)) {
        continue;
      }
      const id = typeof entry["id"] === "string" ? entry["id"] : "rule";
      for (const field of EXAMPLE_FIELDS) {
        const value = entry[field];
        if (typeof value !== "string") {
          continue;
        }
        for (const block of extractFencedCodeBlocks(value)) {
          snippets.push({
            source: `${RULES_JSON_PATH}#${id}.${field}`,
            code: block.code,
            language: block.language,
          });
        }
      }
    }
  }

  return snippets;
}

/** Format a failure as `<source> — <message>`, prefixed by its line within the snippet. */
function formatFailure(failure: ExampleFailure): string {
  return `${failure.source} (line ${failure.line}) — ${failure.message}`;
}

/**
 * Compile the skill's code examples against the pinned package types.
 *
 * Only `api` failures — a missing module, export, or member — make the gate
 * fail. `general` diagnostics are reported as notes, because examples are
 * fragments that may reference app-local identifiers. No snippet is executed.
 *
 * @returns A process exit code: `0` when no example names a missing symbol.
 */
async function main(): Promise<number> {
  const checks: GateCheck[] = [
    {
      name: "examples",
      run: (): CheckOutcome => {
        const failures = checkExampleSnippets(collectSnippets());
        const api = failures.filter((failure) => failure.kind === "api");
        if (api.length > 0) {
          return { name: "examples", ok: false, detail: api.map(formatFailure).join("; ") };
        }
        const general = failures.filter((failure) => failure.kind === "general");
        return general.length === 0
          ? { name: "examples", ok: true }
          : { name: "examples", ok: true, detail: `${general.length} general note(s)` };
      },
    },
    {
      name: "fixture typecheck",
      run: (): CheckOutcome => {
        const diagnostics = checkProject(FIXTURE_TSCONFIG);
        if (diagnostics.length === 0) {
          return { name: "fixture typecheck", ok: true };
        }
        const detail = diagnostics
          .slice(0, 10)
          .map((diagnostic) => `${diagnostic.file}:${diagnostic.line} — ${diagnostic.message}`)
          .join("; ");
        return { name: "fixture typecheck", ok: false, detail };
      },
    },
  ];

  return runChecks(checks);
}

process.exitCode = await main();
