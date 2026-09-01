import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import type { Role } from "@/lib/generated/prisma/enums";

/**
 * Deliberately DB-free (unlike lib/auth.ts) so it's safe to import from
 * proxy.ts without pulling the @prisma/adapter-pg / pg driver into it.
 */
export interface SessionData {
  userId: string;
  role: Role;
}

const secret = process.env.SESSION_SECRET;
if (!secret || secret.length < 32) {
  throw new Error(
    "SESSION_SECRET is missing or shorter than 32 characters — set it in .env (see the SESSION_SECRET comment there).",
  );
}

export const sessionOptions: SessionOptions = {
  cookieName: "n5deal_session",
  password: secret,
  ttl: 60 * 60 * 24 * 7, // 7 days
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

/**
 * For Server Components, Server Actions, and Route Handlers — `await
 * cookies()` from `next/headers` satisfies iron-session's CookieStore shape
 * directly. Only Server Actions/Route Handlers can actually call
 * `.save()`/`.destroy()` on the result (Next.js forbids mutating cookies
 * during a Server Component render); reading `.userId`/`.role` is fine
 * everywhere.
 */
export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
