import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Singleton so Next.js's dev-mode module reloading doesn't open a fresh
// connection pool on every edit. Same adapter (@prisma/adapter-pg, plain
// TCP) works unchanged against local Docker Postgres and Neon in
// production — see ARCHITECTURE.md "Persistence & driver adapter".
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  // Small on purpose: on Vercel, each serverless function instance gets its
  // own pg.Pool (default max 10), and those add up fast against Neon's
  // free-tier connection cap even though DATABASE_URL is already the
  // pooled (-pooler) endpoint. Most pages here only ever run 1-2 queries
  // concurrently (a Promise.all of two awaits), so 3 leaves headroom
  // without one instance hoarding connections.
  max: 3,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
