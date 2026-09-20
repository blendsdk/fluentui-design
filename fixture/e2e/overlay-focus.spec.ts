import { expect, LIST_URL, test } from "./support";

/**
 * Overlay focus specification tests.
 *
 * The dialog and the drawer trap focus, close on Escape, and return focus to
 * the element that opened them.
 */
test.describe("overlay focus", () => {
  test("should close the dialog on Escape and return focus to its trigger", async ({ page }) => {
    await page.goto(LIST_URL);

    const trigger = page.getByRole("button", { name: "New customer" });
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("should close the drawer on Escape and return focus to its trigger", async ({ page }) => {
    await page.goto(LIST_URL);

    const trigger = page.getByRole("row", { name: /Alice Johnson/ }).getByRole("button", { name: "Edit" });
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
