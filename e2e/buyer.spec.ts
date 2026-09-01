import { test, expect } from "@playwright/test";
import { execSync } from "node:child_process";

// Playwright compiles test files to CJS and can't load the generated Prisma
// client (ESM, uses import.meta) if imported directly here — shell out to a
// plain tsx child process instead (same approach as e2e/global-setup.ts).
function deleteBuyerProfile(userId: string) {
  execSync(`npx tsx scripts/e2e-delete-buyer-profile.ts ${userId}`, { stdio: "inherit" });
}

// Logs in as Aiva Ozola (ACTIVE buyer, has a seeded BuyerProfile — see
// lib/demo-data/buyer-profiles.ts) before each test.
test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Log in as Aiva Ozola" }).click();
  await expect(page).toHaveURL(/\/buyer\/dashboard$/);
});

test("profile form pre-fills from the existing BuyerProfile and updates it (upsert path)", async ({ page }) => {
  await page.goto("/buyer/profile");

  await expect(page.getByLabel("Headline (optional)")).toHaveValue(
    "Search fund targeting licensed EMIs in the Baltics",
  );
  await expect(page.getByRole("checkbox", { name: "Fintech" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Crypto" })).not.toBeChecked();

  await page.getByLabel("Headline (optional)").fill("Updated headline for e2e");
  await page.getByRole("checkbox", { name: "Crypto" }).check();
  await page.getByRole("button", { name: "Save profile" }).click();

  await expect(page.getByText("Saved.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Headline (optional)")).toHaveValue("Updated headline for e2e");
  await expect(page.getByRole("checkbox", { name: "Crypto" })).toBeChecked();

  // Revert — seller.spec.ts's buyer-directory test asserts Aiva does NOT
  // have Crypto in her sectors, and the full suite runs files concurrently
  // with no re-seed between them; leaving this checked would flip that
  // assertion depending on run order/timing.
  await page.getByRole("checkbox", { name: "Crypto" }).uncheck();
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
});

test("profile form creates a BuyerProfile on first save when none exists yet", async ({ page }) => {
  // A different buyer than the "update" test above, deliberately — both
  // tests can run concurrently (fullyParallel), and using the same row
  // (e.g. deleting Aiva's profile out from under the other test) races.
  deleteBuyerProfile("usr_byr_ostrowski");

  await page.locator("header").getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole("button", { name: "Log in as Ben Ostrowski" }).click();
  await expect(page).toHaveURL(/\/buyer\/dashboard$/);

  await page.goto("/buyer/profile");
  await expect(page.getByLabel("Headline (optional)")).toHaveValue("");

  await page.getByLabel("Headline (optional)").fill("Brand new profile");
  await page.getByRole("checkbox", { name: "Lending" }).check();
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();

  // Verified through the UI, not by reaching around it into the DB.
  await page.reload();
  await expect(page.getByLabel("Headline (optional)")).toHaveValue("Brand new profile");
  await expect(page.getByRole("checkbox", { name: "Lending" })).toBeChecked();
});

test("asset catalog hides non-ACTIVE assets and assets from suspended sellers", async ({ page }) => {
  await page.goto("/buyer/assets");

  // ast_ee_vasp_nordic is PENDING — must not appear.
  await expect(page.getByText("Ready-Made Crypto VASP Entity")).toHaveCount(0);
  // ast_lt_pi_baltic is SOLD — must not appear.
  await expect(page.getByText("SEPA-Connected Payment Institution")).toHaveCount(0);
  // ast_mt_vasp_malta is SUSPENDED — must not appear.
  await expect(page.getByText("Malta VASP with Active Exchange Operations")).toHaveCount(0);
  // ast_lt_fullsale_vilnius is ACTIVE, but its seller (Vilnius Fintech
  // Exits) is SUSPENDED — the asset must still be hidden entirely.
  await expect(page.getByText("Lithuanian Fintech Startup")).toHaveCount(0);

  // A genuinely visible ACTIVE asset from an ACTIVE seller.
  await expect(page.getByText("Estonian EMI License Holding Company")).toBeVisible();
});

test("asset detail page hides the seller's identity and sending a contact shows up in the inbox", async ({
  page,
}) => {
  await page.goto("/buyer/assets");
  const card = page.locator('[data-slot="card"]').filter({ hasText: "Estonian EMI License Holding Company" });
  await card.getByRole("link", { name: "View" }).click();

  await expect(page).toHaveURL(/\/buyer\/assets\/ast_ee_emi_nordic$/);
  await expect(page.getByText("Nordic Fintech Partners")).toHaveCount(0);
  await expect(page.getByText("Listed by a Seller")).toBeVisible();

  await page.getByRole("button", { name: "Contact Seller" }).click();
  await page.getByLabel("Message").fill("Interested — can you share more financials?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.goto("/buyer/inbox");
  const sentItem = page.locator("li").filter({ hasText: "Interested — can you share more financials?" });
  await expect(sentItem).toContainText("Nordic Fintech Partners");
  await expect(sentItem).toContainText("Re: Estonian EMI License Holding Company");
});

test("catalog and detail page show a lib/matching.ts score against the signed-in Buyer's own profile", async ({
  page,
}) => {
  // Aiva Ozola: sectors [Fintech, Payments], jurisdictions [EE, LT], budget
  // [150k, 300k] (see lib/demo-data/buyer-profiles.ts). The Estonian EMI
  // listing is Fintech/EE/€185k — a full match on all three axes -> 100.
  await page.goto("/buyer/assets");
  const fullMatchCard = page
    .locator('[data-slot="card"]')
    .filter({ hasText: "Estonian EMI License Holding Company" });
  await expect(fullMatchCard.getByText("Match 100%")).toBeVisible();

  // The Polish investment firm is Wealth Management/PL (neither sector nor
  // jurisdiction match) at €320k, €20k over her €300k max — close enough
  // for the smooth budget falloff to still give partial credit, landing at
  // 15 (not 0): distance 20k over a 75k window -> 20*(1-20000/75000) ≈ 15.
  const partialMatchCard = page
    .locator('[data-slot="card"]')
    .filter({ hasText: "Polish Investment Firm (MiFID-Scoped)" });
  await expect(partialMatchCard.getByText("Match 15%")).toBeVisible();

  await fullMatchCard.getByRole("link", { name: "View" }).click();
  await expect(page).toHaveURL(/\/buyer\/assets\/ast_ee_emi_nordic$/);
  await expect(page.getByText("Match 100%")).toBeVisible();
});
