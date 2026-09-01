import type { Prisma } from "@/lib/generated/prisma/client";
import { toSingle, type RawSearchParams } from "@/lib/search-params";

export interface UserFilters {
  role?: "BUYER" | "SELLER";
  status?: "ACTIVE" | "SUSPENDED" | "REMOVED";
  q: string;
}

export function parseUserFilters(searchParams: RawSearchParams): UserFilters {
  const role = toSingle(searchParams.role);
  const status = toSingle(searchParams.status);
  return {
    role: role === "BUYER" || role === "SELLER" ? role : undefined,
    status: status === "ACTIVE" || status === "SUSPENDED" || status === "REMOVED" ? status : undefined,
    q: toSingle(searchParams.q) ?? "",
  };
}

/** Managers are never a moderation target — always excluded here, filter
 * or not (see this page's own doc comment). */
export function buildUserWhere(filters: UserFilters): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {
    role: filters.role ?? { in: ["BUYER", "SELLER"] },
  };
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { email: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  return where;
}
