import "dotenv/config";
import { prisma } from "@/lib/db";
import { managers, sellers, buyers } from "@/lib/demo-data/users";
import { buyerProfiles } from "@/lib/demo-data/buyer-profiles";
import { assets } from "@/lib/demo-data/assets";
import { contactRequests } from "@/lib/demo-data/contact-requests";

async function main() {
  // Wipe in FK-dependency order so this script is safe to re-run.
  // AuditLog.actorId -> User is RESTRICT (see schema.prisma), so any
  // moderation actions performed against a previous seed (e.g. by e2e
  // tests) must go before User, same as everything else here.
  await prisma.auditLog.deleteMany();
  await prisma.contactRequest.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.user.deleteMany();

  for (const user of [...managers, ...sellers, ...buyers]) {
    await prisma.user.create({ data: user });
  }
  for (const profile of buyerProfiles) {
    await prisma.buyerProfile.create({ data: profile });
  }
  for (const asset of assets) {
    await prisma.asset.create({ data: asset });
  }
  for (const contact of contactRequests) {
    await prisma.contactRequest.create({ data: contact });
  }

  console.log(
    `Seeded ${managers.length} managers, ${sellers.length} sellers, ${buyers.length} buyers, ` +
      `${buyerProfiles.length} buyer profiles, ${assets.length} assets, ${contactRequests.length} contact requests.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
