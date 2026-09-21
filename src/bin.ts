#!/usr/bin/env node
/**
 * The `fluentui-design` command-line entry point.
 *
 * Only one command group is exposed today: `fluentui-design skill …`, which
 * installs, inspects, and removes the Fluent UI design Agent Skill. The
 * dispatcher keeps the top-level surface small so future command groups can be
 * added without changing the skill installer.
 *
 * @module bin
 */

import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { main as runSkillCommand } from "./skill/install-skill.js";

/** Prints the top-level help text. */
function printUsage(): void {
  console.log(`The Fluent UI design Agent Skill command-line tool.

Usage:
  fluentui-design skill install [options]     Install or update the skill
  fluentui-design skill status [options]      Show the installed version
  fluentui-design skill uninstall [options]   Remove the installed skill
  fluentui-design --help                      Show this help

Run 'fluentui-design skill --help' for the installer options.`);
}

/**
 * Runs the dispatcher for a full argument list.
 *
 * @param argv - Arguments after the `fluentui-design` program name.
 * @returns Process exit code.
 */
export function main(argv: string[]): number {
  const [command, ...rest] = argv;

  if (command === undefined || command === "-h" || command === "--help") {
    printUsage();
    return 0;
  }

  if (command === "skill") {
    return runSkillCommand(rest);
  }

  console.error(`error: unknown command '${command}'`);
  printUsage();
  return 2;
}

/**
 * True when this module is the process entry point, resolving symlinks so the
 * guard also works through npm's `.bin` shims.
 *
 * @returns True when this file is the entry point.
 */
function isEntryPoint(): boolean {
  if (!process.argv[1]) {
    return false;
  }

  try {
    return fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

if (isEntryPoint()) {
  process.exitCode = main(process.argv.slice(2));
}
