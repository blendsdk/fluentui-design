/**
 * Test-support probes for the fixture application.
 *
 * Two independent probes live here:
 *
 * 1. A module-execution marker. It is set the moment this module is evaluated.
 *    The example gate only type-checks fixture sources, so the marker must stay
 *    unset when the gate runs; a test asserts that to prove no fixture code was
 *    executed during verification.
 * 2. A save counter. The in-memory store increments it on every accepted save,
 *    which lets a browser test prove that a double submit results in one save.
 */

/** Global key set when this module is evaluated. */
export const EXAMPLE_EXECUTION_MARKER = "__fluentuiExampleExecuted";

/** Global key holding the number of accepted save calls. */
export const SAVE_CALL_MARKER = "__fluentuiFixtureSaveCalls";

/**
 * Mark that this module ran.
 *
 * The assignment is the observable side effect. It runs in the browser when the
 * application imports this module, and it must not run inside the offline gate.
 */
(globalThis as Record<string, unknown>)[EXAMPLE_EXECUTION_MARKER] = true;

/** Record one accepted save call. */
export function recordSaveCall(): void {
  const scope = globalThis as Record<string, unknown>;
  const current = scope[SAVE_CALL_MARKER];
  scope[SAVE_CALL_MARKER] = typeof current === "number" ? current + 1 : 1;
}

/** Read the number of accepted save calls recorded so far. */
export function readSaveCalls(): number {
  const value = (globalThis as Record<string, unknown>)[SAVE_CALL_MARKER];
  return typeof value === "number" ? value : 0;
}
