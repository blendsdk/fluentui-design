import AxeBuilder from "@axe-core/playwright";
import { expect, test, url } from "./support";

/**
 * Accessibility specification tests.
 *
 * axe-core must report zero critical or serious violations on the list and
 * editor pages, in light and dark themes, at a desktop and a narrow viewport.
 */
const THEMES = ["light", "dark"] as const;
const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "narrow", width: 375, height: 812 },
] as const;
const PAGES = [
  { name: "list", open: undefined },
  { name: "editor", open: "new" },
] as const;

for (const theme of THEMES) {
  for (const viewport of VIEWPORTS) {
    for (const surface of PAGES) {
      test(`should have no critical or serious violations on the ${surface.name} page (${theme}, ${viewport.name})`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(url({ theme, open: surface.open }));

        const results = await new AxeBuilder({ page })
          .exclude("[data-tabster-dummy]")
          .analyze();
        const blocking = results.violations.filter(
          (violation) => violation.impact === "critical" || violation.impact === "serious",
        );

        expect(
          blocking,
          JSON.stringify(
            blocking.map((violation) => ({
              id: violation.id,
              impact: violation.impact,
              nodes: violation.nodes.length,
            })),
            null,
            2,
          ),
        ).toEqual([]);
      });
    }
  }
}
