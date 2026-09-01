"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { buyerProfileFormDataToInput, upsertBuyerProfileSchema } from "@/lib/validations/buyer-profile";

export type UpsertBuyerProfileState =
  | { ok: true }
  | { ok: false; fieldErrors: Partial<Record<string, string[]>> }
  | null;

export async function upsertBuyerProfile(
  _prevState: UpsertBuyerProfileState,
  formData: FormData,
): Promise<UpsertBuyerProfileState> {
  const buyer = await requireUser({ role: "BUYER" });

  const parsed = upsertBuyerProfileSchema.safeParse(buyerProfileFormDataToInput(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  // upsert: this is the buyer's very first save just as much as their
  // hundredth — there's no separate "create profile" step in the product.
  await prisma.buyerProfile.upsert({
    where: { userId: buyer.id },
    create: { ...parsed.data, user: { connect: { id: buyer.id } } },
    update: parsed.data,
  });

  revalidatePath("/buyer/profile");
  return { ok: true };
}
