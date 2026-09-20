import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, LIST_URL, readSaveCount, test } from "./support";

/**
 * Editor specification tests.
 *
 * The editor reports a client error for a required field, simulates a server
 * error on a duplicate email, prevents duplicate submission while pending, and
 * confirms before discarding unsaved changes.
 */
test.describe("customer editor", () => {
  test("should report a client error and not save when the name is empty", async ({ page }) => {
    await page.goto(LIST_URL);

    await page.getByRole("button", { name: "New customer" }).click();
    await page.getByRole("textbox", { name: "Email" }).fill("new.person@example.com");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Name is required")).toBeVisible();
    expect(await readSaveCount(page)).toBe(0);
  });

  test("should report a server error without internal detail for a duplicate email", async ({
    page,
  }) => {
    await page.goto(LIST_URL);

    await page.getByRole("button", { name: "New customer" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill("Duplicate Person");
    await page.getByRole("textbox", { name: "Email" }).fill("alberto.ruiz@example.com");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("A customer with this email already exists.")).toBeVisible();
    await expect(page.getByText(/at .*\.tsx?:\d+/)).toBeHidden();
  });

  test("should save exactly once when submit is clicked twice while pending", async ({ page }) => {
    await page.goto(LIST_URL);

    await page.getByRole("button", { name: "New customer" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill("Pending Person");
    await page.getByRole("textbox", { name: "Email" }).fill("pending.person@example.com");

    await page.evaluate(() => {
      const save = Array.from(document.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === "Save",
      );
      save?.click();
      save?.click();
    });

    await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();
    await expect
      .poll(async () => readSaveCount(page), { timeout: 5_000 })
      .toBe(1);
  });

  test("should keep a dirty draft on cancel and discard it on confirm", async ({ page }) => {
    await page.goto(LIST_URL);

    await page.getByRole("row", { name: /Alice Johnson/ }).getByRole("button", { name: "Edit" }).click();
    const name = page.getByRole("textbox", { name: "Name" });
    await name.fill("Alice Johnson-Edited");

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Discard changes?")).toBeVisible();
    await page.getByRole("button", { name: "Keep editing" }).click();
    await expect(page.getByText("Discard changes?")).toBeHidden();
    await expect(name).toHaveValue("Alice Johnson-Edited");

    await page.getByRole("button", { name: "Cancel" }).click();
    await page.getByRole("button", { name: "Discard" }).click();

    await expect(page.getByRole("textbox", { name: "Name" })).toBeHidden();
    await expect(page.getByRole("gridcell", { name: "Alice Johnson", exact: true })).toBeVisible();
  });

  test("should render a submitted payload as text and never as HTML", async ({ page }) => {
    await page.goto(LIST_URL);

    const payload = '<img src=x onerror="window.__xss=1">';
    await page.getByRole("button", { name: "New customer" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill(payload);
    await page.getByRole("textbox", { name: "Email" }).fill("xss.probe@example.com");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Customer saved.")).toBeVisible();
    await expect(page.getByText(payload)).toBeVisible();
    const injected = await page.evaluate(() => (globalThis as Record<string, unknown>)["__xss"]);
    expect(injected).toBeUndefined();
  });

  test("should not use dangerouslySetInnerHTML anywhere in the fixture source", () => {
    const files = readdirSync("fixture/src", { recursive: true, encoding: "utf8" }).filter((file) =>
      /\.tsx?$/.test(file),
    );
    const offenders = files.filter((file) =>
      readFileSync(join("fixture/src", file), "utf8").includes("dangerouslySetInnerHTML"),
    );
    expect(offenders).toEqual([]);
  });
});
