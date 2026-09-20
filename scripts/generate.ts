import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { runChecks } from "./lib/report.js";
import {
  applyGeneration,
  checkGeneration,
  createRealFileSystem,
  ENTRY_LINE_SOFT_MAX,
  parseSkillEntry,
  SKILL_ENTRY_PATH,
} from "./lib/skill.js";
import type { CheckOutcome, GateCheck } from "./lib/report.js";

/**
 * Regenerate the derived Markdown and the installable mirror.
 *
 * Without `--check` the generator writes every managed file and deletes stale
 * managed files. With `--check` it writes nothing and exits non-zero when the
 * committed output differs from freshly rendered output.
 *
 * @returns A process exit code: `0` when generation succeeds, otherwise `1`.
 */
async function main(): Promise<number> {
  const checkOnly = process.argv.includes("--check");
  const fs = createRealFileSystem();

  const entry = fs.readFile(SKILL_ENTRY_PATH);
  if (entry !== undefined) {
    const { lineCount } = parseSkillEntry(entry, SKILL_ENTRY_PATH);
    if (lineCount > ENTRY_LINE_SOFT_MAX) {
      console.warn(
        `WARN ${SKILL_ENTRY_PATH} is ${lineCount} lines; consider trimming toward ${ENTRY_LINE_SOFT_MAX}`,
      );
    }
  }

  if (checkOnly) {
    const checks: GateCheck[] = [
      {
        name: "generated files",
        run: (): CheckOutcome => {
          const problems = checkGeneration(fs);
          for (const path of problems.unmanagedMarked) {
            console.warn(`WARN marked file outside the managed set: ${path}`);
          }
          const errors = [
            ...problems.drifted.map((path) => `drifted: ${path}`),
            ...problems.stale.map((path) => `stale: ${path}`),
          ];
          return errors.length === 0
            ? { name: "generated files", ok: true }
            : { name: "generated files", ok: false, detail: errors.join("; ") };
        },
      },
    ];
    return runChecks(checks);
  }

  const problems = applyGeneration(
    fs,
    (path, content) => {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content, "utf8");
    },
    (path) => {
      rmSync(path);
    },
  );
  for (const path of problems.unmanagedMarked) {
    console.warn(`WARN marked file outside the managed set, left in place: ${path}`);
  }
  console.log(
    `Generated ${problems.drifted.length === 0 ? "all" : "files"}; removed ${problems.stale.length} stale file(s).`,
  );
  return 0;
}

process.exitCode = await main();
