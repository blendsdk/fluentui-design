/** The result of running one gate check. */
export interface CheckOutcome {
  /** Human-readable check name shown in the report. */
  name: string;
  /** `true` when the check passed. */
  ok: boolean;
  /** Optional short explanation, usually the failure reason. */
  detail?: string;
}

/**
 * One independently runnable verification check.
 *
 * A check may be synchronous or asynchronous. Throwing is allowed and is treated
 * as a failure by {@link runChecks}, so a check may simply throw on bad input.
 */
export interface GateCheck {
  /** Name shown for this check in the report. */
  name: string;
  /** Run the check and report its outcome. */
  run(): CheckOutcome | Promise<CheckOutcome>;
}

/** The minimal logging surface the runner needs. `console` satisfies it. */
export interface CheckReporter {
  /** Report a passing check. */
  info(message: string): void;
  /** Report a failing check. */
  error(message: string): void;
}

/**
 * Run a list of gate checks in order and return a process exit code.
 *
 * Every check runs even after an earlier failure so one invocation reports all
 * problems. A check that throws is converted into a failed outcome rather than
 * aborting the run. The function returns `0` only when every check passed and
 * `1` otherwise; it never starts a subprocess, so callers can safely invoke it
 * from inside a test runner.
 *
 * @param checks - Checks to run, in display order.
 * @param reporter - Sink for pass/fail lines; defaults to the console.
 * @returns `0` when all checks pass, otherwise `1`.
 *
 * @example
 * ```ts
 * const exitCode = await runChecks([
 *   { name: "catalog", run: () => ({ name: "catalog", ok: true }) },
 * ]);
 * process.exitCode = exitCode;
 * ```
 */
export async function runChecks(
  checks: readonly GateCheck[],
  reporter: CheckReporter = console,
): Promise<number> {
  let failed = 0;

  for (const check of checks) {
    let outcome: CheckOutcome;
    try {
      outcome = await check.run();
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      outcome = { name: check.name, ok: false, detail };
    }

    const suffix = outcome.detail !== undefined ? ` — ${outcome.detail}` : "";
    if (outcome.ok) {
      reporter.info(`PASS ${outcome.name}${suffix}`);
    } else {
      failed += 1;
      reporter.error(`FAIL ${outcome.name}${suffix}`);
    }
  }

  return failed === 0 ? 0 : 1;
}
