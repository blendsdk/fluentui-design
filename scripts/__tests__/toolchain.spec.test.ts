import { describe, expect, it, vi } from "vitest";
import { runChecks } from "../lib/report.js";
import type { CheckOutcome, CheckReporter, GateCheck } from "../lib/report.js";

const { spawnMock } = vi.hoisted(() => ({
  spawnMock: vi.fn((): never => {
    throw new Error("the gate runner must never spawn a subprocess");
  }),
}));

vi.mock("node:child_process", () => ({
  spawn: spawnMock,
  exec: spawnMock,
  execFile: spawnMock,
  execSync: spawnMock,
}));

/** A reporter that discards messages so test output stays clean. */
function silentReporter(): CheckReporter {
  return { info: () => undefined, error: () => undefined };
}

/** Build a check that always reports the given outcome. */
function check(name: string, ok: boolean): GateCheck {
  return { name, run: (): CheckOutcome => ({ name, ok }) };
}

describe("gate runner", () => {
  it("should return zero when every check passes", async () => {
    const exitCode = await runChecks([check("alpha", true), check("beta", true)], silentReporter());
    expect(exitCode).toBe(0);
  });

  it("should return non-zero when any check fails", async () => {
    const exitCode = await runChecks([check("alpha", true), check("beta", false)], silentReporter());
    expect(exitCode).toBe(1);
  });

  it("should treat a thrown error as a failed check", async () => {
    const throwing: GateCheck = {
      name: "boom",
      run: () => {
        throw new Error("unexpected");
      },
    };
    await expect(runChecks([throwing], silentReporter())).resolves.toBe(1);
  });

  it("should run every check even after an earlier failure", async () => {
    const ran: string[] = [];
    const tracer = (name: string, ok: boolean): GateCheck => ({
      name,
      run: (): CheckOutcome => {
        ran.push(name);
        return { name, ok };
      },
    });
    await runChecks([tracer("first", false), tracer("second", true)], silentReporter());
    expect(ran).toEqual(["first", "second"]);
  });

  it("should never spawn a subprocess", async () => {
    await runChecks([check("alpha", false)], silentReporter());
    expect(spawnMock).not.toHaveBeenCalled();
  });
});
