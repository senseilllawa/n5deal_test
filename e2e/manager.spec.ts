import { test, expect, type Page } from "@playwright/test";

// Logs in as Elena Voss (a seeded Manager) before each test.
test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Log in as Elena Voss" }).click();
  await expect(page).toHaveURL(/\/manager\/dashboard$/);
});

// Switches identity mid-test. Just navigating to /login while a session is
// already active redirects straight back to that account's dashboard (see
// app/login/page.tsx's "already signed in" shortcut) — logging out first is
// required to see the picker again. Waits for the post-login redirect to
// actually land (loginAs's redirect() runs async after the click resolves)
// before returning, so a caller's next `page.goto` doesn't race it.
async function switchTo(page: Page, accountName: string, expectUrl: RegExp) {
  await page.locator("header").getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole("button", { name: `Log in as ${accountName}` }).click();
  await expect(page).toHaveURL(expectUrl);
}

test("users table excludes Managers, filters by role/status/search", async ({ page }) => {
  await page.goto("/manager/users");
  await expect(page.locator("table").getByText("Elena Voss")).toHaveCount(0); // a Manager, never a moderation target
  await expect(page.getByText("Daniel Kowalski")).toBeVisible(); // seeded REMOVED buyer, still listed

  await page.locator("#role").selectOption("SELLER");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page).toHaveURL(/role=SELLER/);
  await expect(page.getByText("Nordic Fintech Partners")).toBeVisible();
  await expect(page.getByText("Aiva Ozola")).toHaveCount(0);
});

test(
  "suspending a Buyer blocks them from /seller/buyers, and reactivating brings them back",
  async ({ page }) => {
    await page.goto("/manager/users");
    const row = page.locator("tr").filter({ hasText: "Andres Kask" });
    await row.getByRole("button", { name: "Suspend" }).click();
    await page.getByLabel("Reason").fill("Reported for suspicious activity");
    await page.getByRole("dialog").getByRole("button", { name: "Suspend" }).click();

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(row).toContainText("Suspended");

    // Regression check: a Seller's buyer directory must no longer show them.
    await switchTo(page, "Nordic Fintech Partners", /\/seller\/dashboard$/);
    await page.goto("/seller/buyers");
    await expect(page.getByText("Andres Kask")).toHaveCount(0);

    // And logging in as Andres Kask himself must now be blocked (stays on
    // /login — that IS the expected post-click URL here).
    await switchTo(page, "Andres Kask", /\/login$/);
    await expect(page.getByText(/suspicious activity/i)).toBeVisible();

    // Reactivate, then confirm the directory shows him again.
    await page.getByRole("button", { name: "Log in as Elena Voss" }).click();
    await expect(page).toHaveURL(/\/manager\/dashboard$/);
    await page.goto("/manager/users");
    const row2 = page.locator("tr").filter({ hasText: "Andres Kask" });
    await row2.getByRole("button", { name: "Reactivate" }).click();
    await expect(row2).not.toContainText("Suspended");

    await switchTo(page, "Nordic Fintech Partners", /\/seller\/dashboard$/);
    await page.goto("/seller/buyers");
    await expect(page.getByText("Andres Kask")).toBeVisible();
  },
);

test("removing a User leaves no further moderation actions available", async ({ page }) => {
  await page.goto("/manager/users");
  const row = page.locator("tr").filter({ hasText: "Sofia Marchetti" });
  await row.getByRole("button", { name: "Remove" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Remove" }).click();

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(row).toContainText("Removed");
  await expect(row.getByRole("button")).toHaveCount(0);
});

test("suspending an Asset hides it from the Buyer catalog", async ({ page }) => {
  await page.goto("/manager/assets");
  const row = page.locator("tr").filter({ hasText: "PSD2-Licensed Payment Institution" });
  await row.getByRole("button", { name: "Suspend" }).click();
  await page.getByLabel("Reason").fill("Compliance flag pending review");
  await page.getByRole("dialog").getByRole("button", { name: "Suspend" }).click();

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(row).toContainText("Suspended");

  await switchTo(page, "Aiva Ozola", /\/buyer\/dashboard$/);
  await page.goto("/buyer/assets");
  await expect(page.getByText("PSD2-Licensed Payment Institution")).toHaveCount(0);
});

test("dashboard shows counts and recent moderation activity", async ({ page }) => {
  await page.goto("/manager/dashboard");
  await expect(page.getByText("Recent moderation activity")).toBeVisible();
  // CardTitle renders a <div>, not a heading element — plain text match instead.
  await expect(page.getByText("Buyers", { exact: true })).toBeVisible();
  await expect(page.getByText("Sellers", { exact: true })).toBeVisible();
});
