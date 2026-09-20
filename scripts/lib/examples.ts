import { dirname, extname, join } from "node:path";
import ts from "typescript";

/** A code snippet that must resolve against the pinned Fluent UI package. */
export interface ExampleSnippet {
  /** Human-readable origin, such as `skill/SKILL.md:42`. */
  source: string;
  /** The snippet body, including its imports. */
  code: string;
  /**
   * The fenced-code language, such as `tsx`. When omitted, the language is
   * inferred from the file extension in {@link source}, falling back to `tsx`.
   */
  language?: string;
}

/** A problem found while type-checking an example. */
export interface ExampleFailure {
  /** Origin of the snippet, matching {@link ExampleSnippet.source}. */
  source: string;
  /** One-based line inside the snippet. */
  line: number;
  /** `api` failures block; `general` failures are notes only. */
  kind: "api" | "general";
  /** The compiler message. */
  message: string;
}

/** A fenced code block found in a Markdown document. */
export interface FencedBlock {
  /** The info string after the opening fence, such as `tsx`. */
  language: string;
  /** The block body, joined with LF and ending in a newline. */
  code: string;
  /** One-based line of the first code line within the containing document. */
  line: number;
}

/** Languages whose fenced blocks are treated as compilable examples. */
export const EXAMPLE_LANGUAGES = ["ts", "tsx", "js", "jsx"] as const;

/**
 * Compiler diagnostic codes that mean the example named something the pinned
 * package does not provide.
 *
 * These are the failures the gate blocks on: a missing module, a missing export,
 * a missing member, or a missing default export. Any other diagnostic is a
 * `general` note, because skill snippets are fragments that may intentionally
 * leave surrounding identifiers undefined.
 */
const API_DIAGNOSTIC_CODES = new Set([2305, 2307, 2339, 2614, 2724]);

/**
 * Classify a TypeScript diagnostic code for the example gate.
 *
 * @param code - The numeric diagnostic code from a `ts.Diagnostic`.
 * @returns `api` when the code indicates a missing package symbol, else `general`.
 */
export function classifyExampleDiagnostic(code: number): "api" | "general" {
  return API_DIAGNOSTIC_CODES.has(code) ? "api" : "general";
}

/**
 * Extract fenced code blocks in the example languages from Markdown.
 *
 * Only fences whose info string is exactly one of {@link EXAMPLE_LANGUAGES}
 * are returned, so prose and shell samples never reach the compiler.
 *
 * @param markdown - Document text to scan.
 * @returns The compilable blocks, in document order.
 */
export function extractFencedCodeBlocks(markdown: string): FencedBlock[] {
  const allowed = new Set<string>(EXAMPLE_LANGUAGES);
  const lines = markdown.split(/\r?\n/);
  const blocks: FencedBlock[] = [];
  let language: string | undefined;
  let startLine = 0;
  let buffer: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    if (language === undefined) {
      const match = /^```([A-Za-z]*)\s*$/.exec(line.trim());
      const info = match?.[1] ?? "";
      if (match !== null && allowed.has(info)) {
        language = info;
        startLine = index + 2;
        buffer = [];
      }
      continue;
    }
    if (line.trim() === "```") {
      blocks.push({ language, code: `${buffer.join("\n")}\n`, line: startLine });
      language = undefined;
      continue;
    }
    buffer.push(line);
  }

  return blocks;
}

/** Pick the TypeScript script kind for a virtual file name. */
function scriptKindFor(fileName: string): ts.ScriptKind {
  const extension = extname(fileName).toLowerCase();
  if (extension === ".tsx") {
    return ts.ScriptKind.TSX;
  }
  if (extension === ".jsx") {
    return ts.ScriptKind.JSX;
  }
  if (extension === ".js" || extension === ".mjs" || extension === ".cjs") {
    return ts.ScriptKind.JS;
  }
  return ts.ScriptKind.TS;
}

/** Report whether `value` is one of the compilable example languages. */
function isExampleLanguage(value: string | undefined): boolean {
  return value !== undefined && (EXAMPLE_LANGUAGES as readonly string[]).includes(value);
}

/**
 * Decide the virtual file extension for a snippet.
 *
 * The language wins when present. Otherwise the label is stripped of a trailing
 * `:<line>` or `#<field>` suffix and its extension is used when recognised; the
 * default `tsx` keeps a label like `rules.json#RULE-001` compilable.
 */
function resolveExtension(snippet: ExampleSnippet): string {
  if (isExampleLanguage(snippet.language)) {
    return `.${snippet.language}`;
  }
  const label = snippet.source.replace(/(:\d+)?(#.*)?$/, "");
  const extension = extname(label).toLowerCase();
  if (extension === ".ts" || extension === ".tsx" || extension === ".js" || extension === ".jsx") {
    return extension;
  }
  return ".tsx";
}

/** Turn a human-readable source label into a path-safe stem. */
function slugify(source: string): string {
  const slug = source.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "snippet";
}

/**
 * Type-check snippets against the installed `@fluentui/react-components` types.
 *
 * The snippets are held in memory and compiled with an in-memory compiler host;
 * they are never written to disk and never executed. Diagnostics raised inside a
 * snippet are returned, classified as `api` or `general`. Diagnostics from
 * library or configuration files are ignored.
 *
 * @param snippets - Snippets to check.
 * @param workingDirectory - Directory the virtual files are anchored to, so
 * module resolution can walk up to the repository's `node_modules`.
 * @returns Every diagnostic raised inside a snippet.
 *
 * @example
 * ```ts
 * const failures = checkExampleSnippets([
 *   { source: "example.tsx", code: 'import { Button } from "@fluentui/react-components";' },
 * ]);
 * ```
 */
export function checkExampleSnippets(
  snippets: readonly ExampleSnippet[],
  workingDirectory: string = process.cwd(),
): ExampleFailure[] {
  if (snippets.length === 0) {
    return [];
  }

  const virtualDirectory = join(workingDirectory, ".examples");
  const virtual = new Map<string, string>();
  const byPath = new Map<string, ExampleSnippet>();

  snippets.forEach((snippet, index) => {
    const extension = resolveExtension(snippet);
    const path = join(virtualDirectory, `${index}-${slugify(snippet.source)}${extension}`);
    virtual.set(path, snippet.code);
    byPath.set(path, snippet);
  });

  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    esModuleInterop: true,
    allowJs: true,
    checkJs: true,
    types: [],
  };

  const host = ts.createCompilerHost(compilerOptions);
  const defaultGetSourceFile = host.getSourceFile.bind(host);
  const defaultFileExists = host.fileExists.bind(host);
  const defaultReadFile = host.readFile.bind(host);

  host.getSourceFile = (
    fileName: string,
    languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions,
    onError?: (message: string) => void,
    shouldCreateNewSourceFile?: boolean,
  ): ts.SourceFile | undefined => {
    const text = virtual.get(fileName);
    if (text !== undefined) {
      return ts.createSourceFile(
        fileName,
        text,
        languageVersionOrOptions,
        true,
        scriptKindFor(fileName),
      );
    }
    return defaultGetSourceFile(fileName, languageVersionOrOptions, onError, shouldCreateNewSourceFile);
  };
  host.fileExists = (fileName: string): boolean => virtual.has(fileName) || defaultFileExists(fileName);
  host.readFile = (fileName: string): string | undefined =>
    virtual.get(fileName) ?? defaultReadFile(fileName);

  const program = ts.createProgram([...virtual.keys()], compilerOptions, host);
  const failures: ExampleFailure[] = [];

  for (const diagnostic of ts.getPreEmitDiagnostics(program)) {
    const fileName = diagnostic.file?.fileName;
    const start = diagnostic.start;
    const snippet = fileName === undefined ? undefined : byPath.get(fileName);
    if (diagnostic.file === undefined || start === undefined || snippet === undefined) {
      continue;
    }
    const position = diagnostic.file.getLineAndCharacterOfPosition(start);
    failures.push({
      source: snippet.source,
      line: position.line + 1,
      kind: classifyExampleDiagnostic(diagnostic.code),
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, " "),
    });
  }

  return failures;
}

/** A blocking type error found in a whole project. */
export interface ProjectDiagnostic {
  /** File the error belongs to. */
  file: string;
  /** One-based line of the error. */
  line: number;
  /** The compiler message. */
  message: string;
}

/**
 * Type-check a TypeScript project from its tsconfig.
 *
 * The project is compiled in memory and never executed, so importing this
 * function cannot trigger a module side effect. This is what proves the
 * fixture's type-checking gate is inert at runtime.
 *
 * @param tsconfigPath - Path to the project's `tsconfig.json`.
 * @returns Every error-severity diagnostic, with its file and line.
 */
export function checkProject(tsconfigPath: string): ProjectDiagnostic[] {
  const configFile = ts.readConfigFile(tsconfigPath, (path) => ts.sys.readFile(path));
  if (configFile.error !== undefined) {
    return [
      {
        file: tsconfigPath,
        line: 1,
        message: ts.flattenDiagnosticMessageText(configFile.error.messageText, " "),
      },
    ];
  }

  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, dirname(tsconfigPath));
  const program = ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });

  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
    .map((diagnostic) => {
      const file = diagnostic.file?.fileName ?? tsconfigPath;
      const line =
        diagnostic.file !== undefined && diagnostic.start !== undefined
          ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1
          : 1;
      return {
        file,
        line,
        message: ts.flattenDiagnosticMessageText(diagnostic.messageText, " "),
      };
    });
}
