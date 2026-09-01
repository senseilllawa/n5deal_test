"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ROLE_PATH_PREFIX } from "@/lib/roles";
import { contactFormDataToInput, sendContactRequestSchema } from "@/lib/validations/contact";
import type { Role } from "@/lib/generated/prisma/enums";

export type SendContactState =
  | { ok: true }
  | { ok: false; fieldErrors: Partial<Record<string, string[]>>; formError?: string }
  | null;

const OPPOSITE_ROLE: Record<"BUYER" | "SELLER", "BUYER" | "SELLER"> = {
  BUYER: "SELLER",
  SELLER: "BUYER",
};

/**
 * Shared by both directions of outreach — Seller contacting a Buyer
 * (app/(portal)/seller/buyers) and Buyer contacting a Seller
 * (app/(portal)/buyer/assets/[id]) — since ContactRequest is symmetric by
 * design (see its doc comment in schema.prisma): only *who's* from/to and
 * what an attached asset is allowed to be differ, both handled below by
 * branching on the caller's own role rather than duplicating the action.
 *
 * Bound to a specific counterpart's id by whichever dialog calls it.
 * `fromUserId` is always the signed-in user, never taken from the client.
 */
export async function sendContactRequest(
  toUserId: string,
  _prevState: SendContactState,
  formData: FormData,
): Promise<SendContactState> {
  const me = await requireUser();
  if (me.role !== "BUYER" && me.role !== "SELLER") {
    return { ok: false, fieldErrors: {}, formError: "Not allowed." };
  }

  const parsed = sendContactRequestSchema.safeParse(contactFormDataToInput(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const expectedCounterpartRole: Role = OPPOSITE_ROLE[me.role];
  const counterpart = await prisma.user.findUnique({ where: { id: toUserId } });
  if (!counterpart || counterpart.role !== expectedCounterpartRole || counterpart.status !== "ACTIVE") {
    return {
      ok: false,
      fieldErrors: {},
      formError: `This ${expectedCounterpartRole === "BUYER" ? "buyer" : "seller"} is no longer available.`,
    };
  }

  // An attached asset means something different depending on direction:
  // a Seller attaches one of their *own* listings (prospecting a Buyer); a
  // Buyer attaches the *Seller's* listing they're actually asking about —
  // which must belong to this specific counterpart and still be ACTIVE
  // (matches the visibility rule buyers browse under). Either way, never
  // trust the id alone — a crafted request could name anyone's asset.
  if (parsed.data.assetId) {
    const asset = await prisma.asset.findFirst({
      where:
        me.role === "SELLER"
          ? { id: parsed.data.assetId, sellerId: me.id }
          : { id: parsed.data.assetId, sellerId: toUserId, status: "ACTIVE" },
      select: { id: true },
    });
    if (!asset) {
      return { ok: false, fieldErrors: {}, formError: "That asset couldn't be attached." };
    }
  }

  await prisma.contactRequest.create({
    data: {
      from: { connect: { id: me.id } },
      to: { connect: { id: counterpart.id } },
      message: parsed.data.message,
      ...(parsed.data.assetId && { asset: { connect: { id: parsed.data.assetId } } }),
    },
  });

  revalidatePath(`/${ROLE_PATH_PREFIX[me.role]}/inbox`);
  return { ok: true };
}

/**
 * The `toUserId: me.id` in the where-clause IS the ownership check — an
 * updateMany that matches zero rows (someone else's contact id) silently
 * does nothing, which is the right behavior for a toggle with no error UI.
 * No role branching needed: toggling "read" on your own inbox item works
 * identically for a Buyer or a Seller.
 */
export async function toggleContactRead(contactId: string, nextIsRead: boolean): Promise<void> {
  const me = await requireUser();

  await prisma.contactRequest.updateMany({
    where: { id: contactId, toUserId: me.id },
    data: { isRead: nextIsRead },
  });

  revalidatePath(`/${ROLE_PATH_PREFIX[me.role]}/inbox`);
}
