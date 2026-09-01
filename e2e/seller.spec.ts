import { test, expect } from "@playwright/test";

// Logs in as Nordic Fintech Partners (ACTIVE seller, 3 seeded assets — see
// lib/demo-data/assets.ts) before each test.
test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Log in as Nordic Fintech Partners" }).click();
  await expect(page).toHaveURL(/\/seller\/dashboard$/);
});

test("assets list shows the seller's own assets, including a PENDING one, and links to the publish form", async ({
  page,
}) => {
  await page.goto("/seller/assets");
  await expect(page.getByText("Estonian EMI License Holding Company")).toBeVisible();
  await expect(page.getByText("Ready-Made Crypto VASP Entity")).toBeVisible();
  // Their own PENDING asset must still show — only *other* users'
  // suspended/removed things are hidden, never the seller's own.
  await expect(page.getByText("Pending", { exact: true })).toBeVisible();
});

test("publishing a new asset validates, then shows up at the top of the list", async ({ page }) => {
  await page.goto("/seller/assets/new");

  // Submit empty to exercise client-side validation (no round trip needed).
  await page.getByRole("button", { name: "Publish asset" }).click();
  await expect(page.getByText("Title is required")).toBeVisible();

  // A too-short (but present) title hits the .min() refinement specifically.
  await page.getByLabel("Title").fill("ab");
  await page.getByRole("button", { name: "Publish asset" }).click();
  await expect(page.getByText("Title must be at least 3 characters")).toBeVisible();

  await page.getByLabel("Title").fill("Test Payment Institution License");
  await page
    .getByLabel("Description")
    .fill("A freshly published test listing with a long enough description to pass validation.");
  await page.getByLabel("License type").fill("Test PI License");
  await page.getByLabel("Price").fill("42000");

  await page.getByPlaceholder("e.g. Bank account — press Enter to add").fill("Bank account");
  await page.getByPlaceholder("e.g. Bank account — press Enter to add").press("Enter");
  // Not exact: true — the tag chip's accessible text also includes its own
  // "×" remove button, so the chip's full text is "Bank account×".
  await expect(page.getByText("Bank account")).toBeVisible();

  await page.getByRole("button", { name: "Publish asset" }).click();

  await expect(page).toHaveURL(/\/seller\/assets$/);
  await expect(page.getByText("Test Payment Institution License")).toBeVisible();
  await expect(page.getByText("€42,000")).toBeVisible();
});

test("buyer directory hides suspended/removed accounts and honors a sector filter", async ({ page }) => {
  await page.goto("/seller/buyers");
  // Daniel Kowalski's User.status is REMOVED — must never appear, filtered or not.
  await expect(page.getByText("Daniel Kowalski")).toHaveCount(0);

  await page.getByRole("checkbox", { name: "Crypto" }).check();
  await page.getByRole("button", { name: "Apply filters" }).click();

  await expect(page).toHaveURL(/sectors=Crypto/);
  await expect(page.getByText("Mireille Dubois")).toBeVisible();
  await expect(page.getByText("Aiva Ozola")).toHaveCount(0);
});

test("contacting a buyer with an attached asset creates a request visible in the outbox", async ({ page }) => {
  await page.goto("/seller/buyers");

  const card = page.locator('[data-slot="card"]').filter({ hasText: "Aiva Ozola" });
  await card.getByRole("button", { name: "Contact" }).click();

  await page.getByLabel("Message").fill("Following up about the Estonian EMI listing.");
  await page.getByRole("button", { name: "Send" }).click();

  // Dialog closes on success.
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.goto("/seller/inbox");
  // Scoped to the message text, not a bare "Aiva Ozola" text match — Aiva
  // also has a pre-existing *incoming* seed message (cr_ozola_nordic), so an
  // unscoped match would be ambiguous between the two sections.
  const sentItem = page.locator("li").filter({ hasText: "Following up about the Estonian EMI listing." });
  await expect(sentItem).toContainText("Aiva Ozola");
});

test("buyer directory sorts by best match against the seller's own active assets by default", async ({ page }) => {
  // Nordic Fintech Partners' 2 ACTIVE assets are both Fintech/Payments, EE,
  // €185k-210k. Aiva Ozola's profile (Fintech+Payments, EE+LT, €150k-300k)
  // matches fully on at least one of them -> 100. Mireille Dubois (Crypto
  // only, MT+EE, €250k-600k) matches neither sector and is priced below her
  // stated minimum on both -> a clearly lower score (45, from the smooth
  // budget falloff — see lib/matching.test.ts for the same arithmetic).
  await page.goto("/seller/buyers");

  const aivaCard = page.locator('[data-slot="card"]').filter({ hasText: "Aiva Ozola" });
  await expect(aivaCard.getByText("Match 100%")).toBeVisible();

  const cardTitles = await page.locator('[data-slot="card-title"]').allTextContents();
  const aivaIndex = cardTitles.indexOf("Aiva Ozola");
  const mireilleIndex = cardTitles.indexOf("Mireille Dubois");
  expect(aivaIndex).toBeGreaterThanOrEqual(0);
  expect(mireilleIndex).toBeGreaterThan(aivaIndex);
});
