"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { resolveReturnTo } from "@/lib/roles";

export type LoginActionState = { error: string } | null;

/**
 * Bound to a specific demo account's id (and the page's `returnTo`) by each
 * login-card form — see login-card.tsx. Re-checks status server-side even
 * though the UI already shows a status pill on blocked accounts: rendering
 * a disabled-looking card is not a security boundary, the request could
 * still be sent directly (see Next's Server Actions security guidance).
 */
export async function loginAs(
  userId: string,
  returnTo: string | null,
  _prevState: LoginActionState,
  _formData: FormData,
): Promise<LoginActionState> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return { error: "This demo account no longer exists." };
  }

  if (user.status !== "ACTIVE") {
    const verb = user.status === "SUSPENDED" ? "suspended" : "removed";
    return {
      error: user.statusReason
        ? `This account has been ${verb}: ${user.statusReason}`
        : `This account has been ${verb}.`,
    };
  }

  const session = await getSession();
  session.userId = user.id;
  session.role = user.role;
  await session.save();

  redirect(resolveReturnTo(returnTo, user.role));
}
