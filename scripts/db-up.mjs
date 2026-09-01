// Cross-platform (Windows/macOS/Linux) helper for `npm run db:up` — plain
// shell one-liners with `||`/`2>/dev/null` behave differently across
// cmd.exe/PowerShell/bash, so this just uses Node's child_process instead.
import { spawnSync } from "node:child_process";

const NAME = "n5deal-pg";

function docker(args) {
  return spawnSync("docker", args, { encoding: "utf8" });
}

const start = docker(["start", NAME]);
if (start.status === 0) {
  console.log(`Started existing container "${NAME}".`);
  process.exit(0);
}

console.log(`No existing "${NAME}" container — creating one...`);
const run = docker([
  "run",
  "-d",
  "--name",
  NAME,
  "-e",
  "POSTGRES_USER=n5deal",
  "-e",
  "POSTGRES_PASSWORD=n5deal",
  "-e",
  "POSTGRES_DB=n5deal",
  "-p",
  "55432:5432",
  "postgres:16-alpine",
]);

if (run.status !== 0) {
  console.error(run.stderr || run.stdout);
  process.exit(run.status ?? 1);
}
console.log(`Created and started "${NAME}" on port 55432.`);
