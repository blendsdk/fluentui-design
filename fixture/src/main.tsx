import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import type { DataStatus } from "./state/useCustomers";
import type { Direction, ThemeName } from "./theme";

/**
 * Entry point for the fixture application.
 *
 * The query string drives every testable runtime state so tests never depend on
 * timing: `state`, `theme`, `dir`, `open`, and `readonly`. All values are
 * validated before use.
 */
const DATA_STATUSES: readonly DataStatus[] = ["loading", "empty", "noResults", "error", "ready"];

/** Narrow an arbitrary query value to a known data status. */
function isDataStatus(value: string | null): value is DataStatus {
  return DATA_STATUSES.some((status) => status === value);
}

/** Map the documented query tokens to the internal status names. */
function toDataStatus(value: string | null): DataStatus {
  if (value === "no-results") {
    return "noResults";
  }
  return isDataStatus(value) ? value : "ready";
}

/** Read the requested theme, defaulting to light. */
function toTheme(value: string | null): ThemeName {
  return value === "dark" ? "dark" : "light";
}

/** Read the requested text direction, defaulting to left-to-right. */
function toDirection(value: string | null): Direction {
  return value === "rtl" ? "rtl" : "ltr";
}

/** Read the optional editor shortcut. */
function toOpenEditor(value: string | null): "new" | "edit" | undefined {
  return value === "new" || value === "edit" ? value : undefined;
}

const params = new URLSearchParams(window.location.search);
const stateParam = params.get("state");
const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("The #root element is missing from index.html.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App
      initialState={toDataStatus(stateParam)}
      themeName={toTheme(params.get("theme"))}
      direction={toDirection(params.get("dir"))}
      openEditor={toOpenEditor(params.get("open"))}
      canEdit={params.get("readonly") !== "1"}
    />
  </StrictMode>,
);
