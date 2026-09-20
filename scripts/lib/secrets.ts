/** One credential pattern the secret scan looks for. */
export interface SecretPattern {
  /** Stable report label, such as `aws-access-key`. */
  name: string;
  /** The pattern to match within a single line. */
  pattern: RegExp;
}

/** A credential shape found in scanned text. */
export interface SecretMatch {
  /** The {@link SecretPattern.name} that matched. */
  pattern: string;
  /** One-based line number of the match. */
  line: number;
}

/**
 * High-confidence credential shapes.
 *
 * The patterns intentionally target full credentials, not bare headers: a
 * documentation line that names `-----BEGIN PRIVATE KEY-----` must not be
 * reported, but a real key body must. The scan never echoes the matched text so
 * a secret is never copied into a log.
 */
export const SECRET_PATTERNS: readonly SecretPattern[] = [
  {
    name: "private-key",
    pattern: /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----[ \t]*\r?\n[A-Za-z0-9+/=]{32,}/,
  },
  { name: "aws-access-key", pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "github-token", pattern: /\bghp_[A-Za-z0-9]{36}\b/ },
  { name: "github-fine-grained-token", pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { name: "openai-key", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { name: "slack-token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { name: "google-api-key", pattern: /\bAIza[0-9A-Za-z_-]{35}\b/ },
];

/**
 * Find credential shapes in a block of text.
 *
 * Each pattern is matched against the whole text so multi-line shapes such as a
 * private key are detected, then the match offset is converted to a one-based
 * line number for the report.
 *
 * @param text - Text to scan.
 * @returns One entry per match, ordered by line then pattern name.
 */
export function findSecretMatches(text: string): SecretMatch[] {
  const matches: SecretMatch[] = [];

  for (const { name, pattern } of SECRET_PATTERNS) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    const global = new RegExp(pattern.source, flags);
    let match = global.exec(text);
    while (match !== null) {
      matches.push({ pattern: name, line: lineAt(text, match.index) });
      if (global.lastIndex === match.index) {
        global.lastIndex += 1;
      }
      match = global.exec(text);
    }
  }

  return matches.sort((a, b) => a.line - b.line || a.pattern.localeCompare(b.pattern));
}

/** Count the one-based line containing a character offset. */
function lineAt(text: string, offset: number): number {
  let line = 1;
  for (let index = 0; index < offset && index < text.length; index += 1) {
    if (text.charAt(index) === "\n") {
      line += 1;
    }
  }
  return line;
}
