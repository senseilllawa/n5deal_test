"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assetFormDataToInput, createAssetSchema } from "@/lib/validations/asset";

export type CreateAssetState = { ok: false; fieldErrors: Partial<Record<string, string[]>> } | null;

export async function createAsset(_prevState: CreateAssetState, formData: FormData): Promise<CreateAssetState> {
  const seller = await requireUser({ role: "SELLER" });

  const parsed = createAssetSchema.safeParse(assetFormDataToInput(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await prisma.asset.create({
    data: {
      ...parsed.data,
      seller: { connect: { id: seller.id } },
    },
  });

  revalidatePath("/seller/assets");
  redirect("/seller/assets");
}
