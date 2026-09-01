import { test, expect } from "@playwright/test";

// Exercises the demo-login flow end-to-end against seed data (see
// lib/demo-data/users.ts): Nordic Fintech Partners (ACTIVE seller),
// Vilnius Fintech Exits (SUSPENDED seller), Aiva Ozola (ACTIVE buyer).

test("unauthenticated access to a role area redirects to /login with returnTo", async ({ page }) => {
  await page.goto("/seller/dashboard");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fseller%2Fdashboard$/);
});

test("logging in as an active seller reaches the seller dashboard, header shows identity, logout returns to /login", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Log in as Nordic Fintech Partners" }).click();

  await expect(page).toHaveURL(/\/seller\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Welcome back, Nordic Fintech Partners" })).toBeVisible();

  const header = page.locator("header");
  await expect(header.getByText("Nordic Fintech Partners")).toBeVisible();
  await expect(header.getByText("Seller", { exact: true })).toBeVisible();

  await header.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);

  // The session cookie is really gone, not just a client-side redirect.
  await page.goto("/seller/dashboard");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fseller%2Fdashboard$/);
});

test("logging in as a suspended seller is blocked with the moderation reason, not redirected", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Log in as Vilnius Fintech Exits" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText(/this account has been suspended/i)).toBeVisible();
  await expect(page.getByText(/undisclosed liabilities/i)).toBeVisible();
});

test("a logged-in buyer hitting the manager area is bounced back to /login with reason=forbidden", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Log in as Aiva Ozola" }).click();
  await expect(page).toHaveURL(/\/buyer\/dashboard$/);

  await page.goto("/manager/dashboard");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fmanager%2Fdashboard&reason=forbidden$/);
  await expect(page.getByText(/signed out/i)).toBeVisible();
});
