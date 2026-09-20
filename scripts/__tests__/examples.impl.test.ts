import { describe, expect, it } from "vitest";
import { checkExampleSnippets, classifyExampleDiagnostic, extractFencedCodeBlocks } from "../lib/examples.js";

describe("diagnostic classification", () => {
  it("should classify a missing export as an api failure", () => {
    expect(classifyExampleDiagnostic(2305)).toBe("api");
    expect(classifyExampleDiagnostic(2724)).toBe("api");
  });

  it("should classify a missing module as an api failure", () => {
    expect(classifyExampleDiagnostic(2307)).toBe("api");
  });

  it("should classify a missing member as an api failure", () => {
    expect(classifyExampleDiagnostic(2339)).toBe("api");
  });

  it("should classify a type mismatch as a general note", () => {
    expect(classifyExampleDiagnostic(2322)).toBe("general");
  });

  it("should classify an undefined fragment identifier as a general note", () => {
    expect(classifyExampleDiagnostic(2304)).toBe("general");
  });
});

describe("fenced block extraction", () => {
  it("should extract typescript and tsx blocks in document order", () => {
    const markdown = [
      "# Doc",
      "```tsx",
      "export const a = 1;",
      "```",
      "text",
      "```ts",
      "export const b = 2;",
      "```",
    ].join("\n");
    const blocks = extractFencedCodeBlocks(markdown);
    expect(blocks.map((block) => block.language)).toEqual(["tsx", "ts"]);
    expect(blocks[0]?.code).toBe("export const a = 1;\n");
    expect(blocks[0]?.line).toBe(3);
  });

  it("should ignore fences that are not example languages", () => {
    const markdown = ["```bash", "echo hi", "```", "```json", "{}", "```"].join("\n");
    expect(extractFencedCodeBlocks(markdown)).toEqual([]);
  });

  it("should ignore an unterminated fence", () => {
    expect(extractFencedCodeBlocks("```ts\nconst a = 1;\n")).toEqual([]);
  });
});

describe("example checking", () => {
  it("should report no api failure for a valid package import", () => {
    const failures = checkExampleSnippets([
      {
        source: "valid.tsx",
        code: 'import { Button } from "@fluentui/react-components";\nexport const view = <Button>Save</Button>;\n',
      },
    ]);
    expect(failures.filter((failure) => failure.kind === "api")).toEqual([]);
  });

  it("should report a member the component does not have", () => {
    const failures = checkExampleSnippets([
      {
        source: "member.tsx",
        code: 'import { Button } from "@fluentui/react-components";\nexport const value = Button.notARealMember;\n',
      },
    ]);
    expect(failures.some((failure) => failure.kind === "api")).toBe(true);
  });

  it("should report an unresolvable module", () => {
    const failures = checkExampleSnippets([
      { source: "module.ts", code: 'import { thing } from "definitely-not-installed";\nexport const v = thing;\n' },
    ]);
    expect(failures.some((failure) => failure.kind === "api")).toBe(true);
  });

  it("should return nothing for an empty snippet list", () => {
    expect(checkExampleSnippets([])).toEqual([]);
  });
});
