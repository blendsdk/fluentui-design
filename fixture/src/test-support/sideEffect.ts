/**
 * Test-support probes for the fixture application.
 *
 * Two independent probes live here:
 *
 * 1. A module-execution marker. It is set the moment this module is evaluated.
 *    The example gate only type-checks fixture sources, so the marker must stay
 *    unset when the gate runs; the tooling test suite reads the global to prove
 *    that no fixture code was executed during verification.
 * 2. A save counter. The in-memory store increments it on every save attempt,
 *    which lets a browser test prove that a double submit results in one call.
 */

/** Global key set when this module is evaluated. */
export const EXAMPLE_EXECUTION_MARKER = "__fluentuiExampleExecuted";

/** Global key holding the number of save attempts. */
export const SAVE_CALL_MARKER = "__fluentuiFixtureSaveCalls";

/**
 * Mark that this module ran.
 *
 * The assignment is the observable side effect. It runs in the browser when the
 * application imports this module, and it must not run inside the offline gate.
 */
(globalThis as Record<string, unknown>)[EXAMPLE_EXECUTION_MARKER] = true;

/** Record one save attempt, including a later rejection. */
export function recordSaveCall(): void {
  const scope = globalThis as Record<string, unknown>;
  const current = scope[SAVE_CALL_MARKER];
  scope[SAVE_CALL_MARKER] = typeof current === "number" ? current + 1 : 1;
}
