// Test-only fixture helper: deletes a seeded BuyerProfile so an e2e test
// can exercise the "create" branch of the profile upsert. Run via `execSync`
// from e2e/buyer.spec.ts, not imported directly — Playwright's test-file
// transform can't load the generated Prisma client (ESM, uses import.meta),
// but a plain `tsx` child process (same as prisma's seed command) handles
// it fine.
import "dotenv/config"; // lib/db.ts reads process.env.DATABASE_URL directly;
// only Next.js and the Prisma CLI auto-load .env, a bare `tsx` run doesn't.
import { prisma } from "../lib/db";

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error("usage: tsx scripts/e2e-delete-buyer-profile.ts <userId>");
    process.exit(1);
  }
  await prisma.buyerProfile.deleteMany({ where: { userId } });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
