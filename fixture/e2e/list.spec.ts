import { expect, LIST_URL, test, url } from "./support";

/**
 * List-page specification tests.
 *
 * These derive from the fixture requirements: the list supports filtering,
 * selection, and a contextual action, and renders loading, empty, no-results,
 * error, and ready states distinctly.
 */
test.describe("customer list", () => {
  test("should show only customers matching a search term", async ({ page }) => {
    await page.goto(LIST_URL);

    await page.getByRole("searchbox", { name: "Search customers" }).fill("al");

    await expect(page.getByText("Showing 5 of 24 customers")).toBeVisible();
    await expect(page.getByText("Alice Johnson")).toBeVisible();
    await expect(page.getByText("Barbara Chen")).toBeHidden();
  });

  test("should show the no-results state when a search matches nothing", async ({ page }) => {
    await page.goto(LIST_URL);

    await page.getByRole("searchbox", { name: "Search customers" }).fill("zzzz");

    await expect(page.getByText("No customers match your filters")).toBeVisible();
    await expect(page.getByText("No customers yet")).toBeHidden();
  });

  test("should enable the contextual action only while rows are selected", async ({ page }) => {
    await page.goto(LIST_URL);

    const action = page.getByRole("button", { name: "Edit selected" });
    await expect(action).toBeDisabled();

    await page.getByRole("row", { name: /Alice Johnson/ }).getByRole("checkbox").check();

    await expect(action).toBeEnabled();
    await expect(page.getByText("1 selected")).toBeVisible();
  });

  test("should clear filters and return to the ready state", async ({ page }) => {
    await page.goto(LIST_URL);

    await page.getByRole("searchbox", { name: "Search customers" }).fill("zzzz");
    await page.getByRole("button", { name: "Clear filters" }).click();

    await expect(page.getByText("Showing 24 of 24 customers")).toBeVisible();
  });

  test("should show a loading state while data resolves", async ({ page }) => {
    await page.goto(url({ state: "loading" }));

    await expect(page.getByLabel("Loading customers")).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(0);
  });

  test("should show an empty state with a primary action", async ({ page }) => {
    await page.goto(url({ state: "empty" }));

    await expect(page.getByText("No customers yet")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add customer" })).toBeVisible();
  });

  test("should show a failure state with a working retry", async ({ page }) => {
    await page.goto(url({ state: "error" }));

    await expect(page.getByText("We couldn't load customers.")).toBeVisible();

    await page.getByRole("button", { name: "Retry" }).click();

    await expect(page.getByText("Showing 24 of 24 customers")).toBeVisible();
  });

  test("should show the saved record after creating from the empty state", async ({ page }) => {
    await page.goto(url({ state: "empty" }));

    await page.getByRole("button", { name: "Add customer" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill("First Customer");
    await page.getByRole("textbox", { name: "Email" }).fill("first.customer@example.com");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Showing 1 of 1 customers")).toBeVisible();
    await expect(page.getByRole("gridcell", { name: "First Customer", exact: true })).toBeVisible();
  });

  test("should disable the empty-state action for a read-only viewer", async ({ page }) => {
    await page.goto("/?state=empty&readonly=1");

    await expect(page.getByRole("button", { name: "Add customer" })).toBeDisabled();
  });

  test("should keep the failure state when filters are cleared", async ({ page }) => {
    await page.goto(url({ state: "error" }));

    await page.getByRole("button", { name: "Clear filters" }).click();

    await expect(page.getByText("We couldn't load customers.")).toBeVisible();
  });

  test("should open the documented no-results state and leave it by clearing filters", async ({
    page,
  }) => {
    await page.goto("/?state=no-results");

    await expect(page.getByText("No customers match your filters")).toBeVisible();

    await page.getByRole("button", { name: "Clear all filters" }).click();

    await expect(page.getByText("Showing 24 of 24 customers")).toBeVisible();
  });
});
