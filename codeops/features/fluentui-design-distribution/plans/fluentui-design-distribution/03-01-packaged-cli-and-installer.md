# Packaged CLI and Installer: fluentui-design Distribution

> **Document**: 03-01-packaged-cli-and-installer.md
> **Parent**: [Index](00-index.md)

## Overview

This component makes the package publishable and gives it a command that installs the skill into a
supported coding agent's skills directory. It is the user-facing half of the feature: the manifest
that defines the package, and the CLI plus installer that copy the skill atomically and record a
version marker.

## Architecture

### Current Architecture

The package is private, has no binary, and the skill is only installable by copying
`.agents/skills/fluentui-design/` by hand. `package.json:34-39` holds the fixture's UI libraries as
runtime dependencies.

### Proposed Changes

- Make the manifest publishable and dependency-free at runtime.
- Add `src/bin.ts` (dispatcher) and `src/skill/install-skill.ts` (installer), compiled to `dist/`.
- Add `skills/fluentui-design/` as the packaged payload, assembled by 03-02.

## Implementation Details

### Package manifest fields

| Field | Value | AR Ref |
| ----- | ----- | ------ |
| `name` | `fluentui-design` | #5 |
| `version` | `0.1.0` | #16 |
| `private` | removed | #2 |
| `license` | `MIT` | — |
| `engines.node` | `>=22` | #10 |
| `bin` | `{ "fluentui-design": "dist/bin.js" }` | #4 |
| `files` | `["dist/","skills/fluentui-design/","README.md","LICENSE","CHANGELOG.md"]` | #20 |
| `publishConfig` | `{ "access": "public", "registry": "https://registry.npmjs.org/" }` | #5 |
| `repository`,`bugs`,`homepage` | `blendsdk/fluentui-design` URLs | #6 |
| `dependencies` | `{}` | — |
| `devDependencies` | adds `react`, `react-dom`, `@fluentui/react-components`, `@fluentui/react-icons` | — |

New scripts: `build:cli` (`tsc -p tsconfig.build.json`), `assemble`, `check:version`, `prepack`
(`npm run clean && npm run build:cli && npm run assemble`), `prepublishOnly` (`npm run verify:static`),
`clean`.

### New Types/Interfaces

`src/skill/install-skill.ts` exports the following (ported from the sibling, constants renamed per
AR #15):

```ts
export const SKILL_DIR_NAME = "fluentui-design";
export const MARKER_FILE = ".fluentui-design-skill.json";
export const SOURCE_NAME = "fluentui-design";
export const TEMP_PREFIX = ".fluentui-design-skill.tmp-";
export const BACKUP_PREFIX = ".fluentui-design-skill.bak-";

export interface SkillMarker {
  version: string;
  source: string;
  installedAt: string;
}

export interface ClientDefinition {
  id: string;
  global: string[];
  project: string[];
}

export interface DetectedClient { id: string; globalDir: string; projectDir: string; }
export interface InstallOptions { sourceDir: string; targetDir: string; version: string; link?: boolean; dryRun?: boolean; }
export interface InstallResult { targetDir: string; dest: string; installed?: boolean; linked?: boolean; dryRun?: boolean; }
export interface UninstallResult { targetDir: string; dest: string; removed: boolean; dryRun: boolean; }
export interface InstallerOptions { targets: string[]; project: boolean; link: boolean; dryRun: boolean; all: boolean; }
export interface ParsedArgs { command: "install" | "status" | "uninstall" | "help"; options: InstallerOptions; error?: string; }
export interface InstallerIo { home?: string; cwd?: string; isTTY?: boolean; version?: string; sourceDir?: string; }
```

### New Functions/Methods

| Function | Responsibility | AR Ref |
| -------- | -------------- | ------ |
| `resolveSourceDir(moduleUrl, override?)` | Locate the packaged `skills/fluentui-design/` or the repo mirror | #3 |
| `detectClients({ home, cwd, exists })` | Return the four clients whose directories exist | #7 |
| `resolveTargets(options, detected)` | `--target` → `--project` → global precedence | #18 |
| `readMarker(dir)` / `writeMarker(dir, version)` | Read/write the marker, validating untrusted JSON | #15 |
| `installSkill(options)` | Atomic temp→rename with backup restore | #18 |
| `uninstallSkill(options)` | Remove only `<target>/fluentui-design` | #18 |
| `parseArgs(argv)` | Parse subcommand and flags | #18 |
| `main(argv, io?)` | CLI entry; dispatches install/status/uninstall | #18 |

The client table (AR #7):

| Client | Global | Project |
| ------ | ------ | ------- |
| opencode | `~/.config/opencode/skills` | `.opencode/skills` |
| claude | `~/.claude/skills` | `.claude/skills` |
| codex | `~/.codex/skills` | `.codex/skills` |
| agents | `~/.agents/skills` | `.agents/skills` |

### Integration Points

`src/bin.ts` imports `main` from `src/skill/install-skill.ts` and dispatches `fluentui-design skill
…`. The installer resolves its source from the packaged `skills/fluentui-design/`, falling back to
`.agents/skills/fluentui-design/` in a repository checkout, so the same code works in both places.

## Code Examples

```ts
const result = installSkill({
  sourceDir, targetDir: "/home/me/.config/opencode/skills",
  version: "0.1.0",
});
// result.dest === "/home/me/.config/opencode/skills/fluentui-design"
```

## Error Handling

| Error Case | Handling Strategy | AR Ref |
| ---------- | ----------------- | ------ |
| Destination exists but is neither a marker nor a `SKILL.md` | Throw `refusing to replace unrelated directory: <dest>`; exit 1 | #18, #19 |
| Source lacks `SKILL.md` | Throw `source is not a skill directory (missing SKILL.md)`; exit 1 | #18 |
| `--target` missing its value or unknown flag | Print `error: …` and exit 2 | #18 |
| No client detected and no `--target` | Print guidance, exit 1 | #7, #18 |
| Rename fails after backup | Remove temp, restore backup, rethrow | #18 |
| Marker JSON malformed | Treat as no marker (`readMarker` returns `undefined`) | #15, #19 |
| Marker version contains control/bidi characters | Strip before printing (`sanitizeForDisplay`) | #19 |

> **Traceability:** every strategy references its requirements AR entry (`../../requirements/00-ambiguity-register.md`).

## Testing Requirements

- Specification tests for `parseArgs`, `detectClients`, `resolveTargets`, `installSkill` (success,
  dry-run, refusal, marker), `uninstallSkill`, and `status` — see 07 ST-9..ST-16.
- Implementation tests for atomic backup/restore, leftover cleanup, symlink (`--link`), and marker
  validation — see 07.
