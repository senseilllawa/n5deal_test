import type { Role } from "@/lib/generated/prisma/enums";

/**
 * Single source of truth for role <-> URL-prefix mapping, shared by
 * proxy.ts (the enforcement point) and lib/auth.ts / app/login (which need
 * to compute a role's home route). DB-free, like lib/session.ts.
 */
export const ROLE_PATH_PREFIX: Record<Role, string> = {
  BUYER: "buyer",
  SELLER: "seller",
  MANAGER: "manager",
};

export function roleHomePath(role: Role): string {
  return `/${ROLE_PATH_PREFIX[role]}/dashboard`;
}

/**
 * Only honor a `returnTo` that's a same-origin relative path under the
 * given role's own area — otherwise a crafted `?returnTo=` could bounce a
 * Buyer's login into `/manager/...` (role confusion) or off-site entirely
 * (`//evil.com`, `https://evil.com` — neither starts with `/seller`, so
 * both are rejected here same as any other mismatch). Falls back to the
 * role's own dashboard.
 */
export function resolveReturnTo(returnTo: string | null, role: Role): string {
  const base = `/${ROLE_PATH_PREFIX[role]}`;
  if (returnTo && (returnTo === base || returnTo.startsWith(`${base}/`))) {
    return returnTo;
  }
  return roleHomePath(role);
}
