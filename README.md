# Fluent UI Design Skill

An evidence-backed Agent Skill that helps a coding agent design, implement, and review coherent
standalone web applications with **Fluent UI React v9**. It focuses on *application composition*:
which surface to use, where it belongs, and how the parts work together — not on repeated component
API recall.

## Scope

The skill answers composition questions:

- Choosing a surface: a page, a drawer, a dialog, or an inline editor.
- Arranging navigation, page chrome, commands, and content regions.
- Deciding state ownership, the save model, and how submission reports back.
- Laying out forms, data grids, tabs, and multi-step task flows.
- Reviewing accessibility, responsive behavior, and visual coherence.

It does **not** restate component props, imports, or slots. Every rule and pattern is derived from a
reviewed set of sources and cites the evidence it came from.

## Division of labor with the sibling `fluentui` skill

This project is deliberately complementary to the API-focused `fluentui` skill produced by the
sibling `fluentui-mcp` repository.

| Skill | Owns | Use it for |
| --- | --- | --- |
| `fluentui-design` (this project) | Composition rules and patterns, with sourced design evidence | "Where should this go, and how should the parts work together?" |
| `fluentui` (sibling) | Pinned API facts: exact props, types, imports, slots | "What is the exact prop or import for this component?" |

The two skills are meant to be co-installed. `fluentui-design` links to `fluentui` for API facts
instead of copying them, so API drift cannot silently desynchronize the two.

## Install

Install the skill into the agent clients detected on your machine with one command:

```
npx -y fluentui-design skill install
```

The installer copies the bundled skill into each detected client's skill directory. Use the options
below to change what it targets:

| Option | Purpose |
| --- | --- |
| `--all` | Install into every detected client instead of asking. |
| `--target <dir>` | Install into a specific skill directory; repeat the flag for more than one. |
| `--project` | Prefer the current project's skill directory over the global one. |
| `--link` | Symlink the bundled skill instead of copying it. |
| `--dry-run` | Report what would change without writing anything. |

Inspect or remove an installation with the `status` and `uninstall` subcommands:

```
npx -y fluentui-design skill status
npx -y fluentui-design skill uninstall --target <dir>
```

## Usage

The skill is authored under [`skill/`](skill/SKILL.md) and mirrored byte-for-byte to
[`.agents/skills/fluentui-design/`](.agents/skills/fluentui-design/SKILL.md). Install it the way an
agent discovers skills:

1. Copy `.agents/skills/fluentui-design/` into your agent's skill directory, or point the agent at
   this repository's `.agents/skills/` folder.
2. Install the sibling `fluentui` skill from `fluentui-mcp` next to it.
3. Start from [`skill/SKILL.md`](skill/SKILL.md). It routes each task to the pattern or reference
   that resolves the decision.

The entry point lists the skill's triggers and non-triggers, and the generated
[reference index](skill/references/index.md) maps every decision to the patterns and rules that
resolve it.

## Version baseline

The bundled facts are pinned to one reviewed baseline. Update the table below deliberately (see
[MAINTENANCE.md](MAINTENANCE.md)); never edit generated output by hand.

| Item | Value |
| --- | --- |
| UI library | `@fluentui/react-components` **9.74.7** |
| React peer range | `>=16.14.0 <20.0.0` |
| API-fact source | `fluentui-mcp` enhanced schema pinned at commit **d595d79** |

If an application uses a different package version, the skill tells the agent to say so and
re-verify the rules it uses.

## Repository layout

| Path | Contents |
| --- | --- |
| `skill/` | The authored skill (`SKILL.md` + `references/`), mirrored to `.agents/skills/`. |
| `sources/`, `rules/`, `research/`, `facts/` | Source catalog, rules catalog, and analysis artifacts. |
| `scripts/` | Validators, generator, gates, and their tests. |
| `fixture/` | A Vite + React application that demonstrates one coherent composition, with Playwright + axe tests. |
| `evaluation/` | Fixed tasks, a rubric, and recorded deterministic evidence. |

## Commands

| Command | Purpose |
| --- | --- |
| `npm run verify` | Full check: typecheck, lint, unit tests, catalog and skill gates, then Playwright + axe. |
| `npm run verify:static` | The browser-free subset; fast inner loop. |
| `npm run test` | Unit tests under `scripts/__tests__/`. |
| `npm run test:e2e` | Playwright tests under `fixture/e2e/`. |

## Known limitations

- **No model-provider evaluation.** Agent-answer quality and the skill-versus-baseline comparison in
  [`evaluation/results.md`](evaluation/results.md) are marked `untested`. The recorded evidence is
  deterministic: committed artifacts, gates, and accessibility findings, not generated answers.
- **Design assets are not fully analyzed.** The official Figma kits and Teams UI templates
  (`SRC-045`) are recorded as a discovered expansion target; `SRC-002` covers only the public
  getting-started page. Rules therefore lean on published guidance and the component library, not on
  Figma files.
- **The dedicated v9 DataGrid usage page was not analyzed.** Grid rules lean on the accessibility
  practices guide (APG) and the pinned package source (`SRC-027`).
- **Automated accessibility output is findings, not conformance.** The fixture is scanned with axe
  and the results are reported as defects that were fixed; the project makes no WCAG conformance
  claim.

## Maintenance

[MAINTENANCE.md](MAINTENANCE.md) documents how to recheck sources, detect redirects and content
changes, re-pin the baseline, find the rules affected by a fact change, rerun the fixture, and retain
a history of replaced guidance. [CHANGELOG.md](CHANGELOG.md) records each skill version with its
baseline. [COMPLETION-REPORT.md](COMPLETION-REPORT.md) closes the initial build honestly.
