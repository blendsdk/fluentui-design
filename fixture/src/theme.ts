import { webDarkTheme, webLightTheme } from "@fluentui/react-components";

/** The theme names the fixture understands. */
export type ThemeName = "light" | "dark";

/** The text directions the fixture understands. */
export type Direction = "ltr" | "rtl";

/**
 * Resolve a theme name to a Fluent theme object.
 *
 * @param name - The requested theme name.
 * @returns The matching supported theme.
 */
export function resolveTheme(name: ThemeName) {
  return name === "dark" ? webDarkTheme : webLightTheme;
}

/** The concrete theme object type, inferred to avoid importing a library type. */
export type AppTheme = ReturnType<typeof resolveTheme>;
