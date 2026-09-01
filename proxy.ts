import { NextResponse, type NextRequest } from "next/server";
import { getIronSession, nextProxyCookies } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";
import { ROLE_PATH_PREFIX } from "@/lib/roles";

// Named `proxy.ts`, not `middleware.ts` — Next.js 16 deprecated and renamed
// the file convention (same behavior, new name/export). See CLAUDE.md.
//
// Deliberately cheap: this only checks the sealed session cookie, no DB
// round trip. It's the fast, coarse gate for page navigations; the actual
// authorization boundary is `requireUser()` (lib/auth.ts), called again in
// every protected layout/page, which re-reads the user from the DB and so
// also catches a suspension that happened after the cookie was issued —
// something a cookie-only check here never could. Server Actions are a
// separate concern: Next.js does not guarantee this matcher covers them
// (see the note in CLAUDE.md's "Server Actions vs Route Handlers"), which
// is the other reason `requireUser()` has to be the real boundary, not this.

const PREFIX_TO_ROLE = Object.fromEntries(
  Object.entries(ROLE_PATH_PREFIX).map(([role, prefix]) => [prefix, role as SessionData["role"]]),
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, firstSegment] = pathname.split("/");
  const requiredRole = PREFIX_TO_ROLE[firstSegment];

  // Matcher already restricts invocation to /seller, /buyer, /manager, so
  // this is just defensive — see the file-conventions/proxy.md caveat about
  // proxy still running for excluded-looking internal routes.
  if (!requiredRole) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(nextProxyCookies(request, response), sessionOptions);

  const authorized = session.userId && session.role === requiredRole;
  if (!authorized) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", pathname + request.nextUrl.search);
    if (session.userId) {
      // Logged in, just not as the right role — vs. no session at all.
      loginUrl.searchParams.set("reason", "forbidden");
    }
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/seller/:path*", "/buyer/:path*", "/manager/:path*"],
};
