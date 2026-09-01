import { execSync } from "node:child_process";

// Reseeds before the suite runs so `npm run test:e2e` is deterministic
// regardless of state left over from a previous run or manual testing —
// several tests here create data (a new asset, a new contact request) and
// there's no per-test DB isolation against a real Postgres instance.
export default function globalSetup() {
  execSync("npx prisma db seed", { stdio: "inherit" });
}
