import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "fixture/dist/**",
      "playwright-report/**",
      "test-results/**",
      "coverage/**",
      ".agents/**",
    ],
  },
  ...tseslint.configs.recommended,
);
