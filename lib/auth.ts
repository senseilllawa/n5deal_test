import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Role, User } from "@/lib/generated/prisma/client";
import { getSession } from "@/lib/session";

export { getSession } from "@/lib/session";
export type { SessionData } from "@/lib/session";

/**
 * `cache()` memoizes this per request (React's server-side request cache),
 * so calling `requireUser()` in a (portal) layout AND again in the page it
 * wraps costs one DB round trip, not two.
 */
const findUserById = cache((id: string) => prisma.user.findUnique({ where: { id } }));

/**
 * Session + a fresh DB read, so a status change (a Manager suspending or
 * removing someone) since the cookie was issued is caught on the very next
 * request rather than only at next login. Returns null if there's no
 * session or the user no longer exists. Read-only — never mutates the
 * cookie, so it's safe to call from Server Components.
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session.userId) return null;
  return findUserById(session.userId);
}

/**
 * Server Component guard. Redirects to /login when there's no session, the
 * user is no longer ACTIVE, or `opts.role` is given and doesn't match —
 * the last two cases carry `?reason=forbidden` so the login page can
 * explain why it bounced them there.
 *
 * Read-only by design: a Server Component can't set cookies (Next.js
 * throws if you try), so this never attempts to destroy a stale session —
 * it just keeps redirecting on every request until the cookie is
 * overwritten by a fresh login or expires. proxy.ts is the first line of
 * defense for the routes it covers; this is the backstop that also runs
 * for Server Actions, which proxy's matcher does not reliably cover (see
 * CLAUDE.md).
 */
export async function requireUser(opts?: { role?: Role }): Promise<User> {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }

  const user = await findUserById(session.userId);
  if (!user || user.status !== "ACTIVE") {
    redirect("/login?reason=forbidden");
  }
  if (opts?.role && user.role !== opts.role) {
    redirect("/login?reason=forbidden");
  }

  return user;
}
