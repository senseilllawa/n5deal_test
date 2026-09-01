"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { optionalReasonSchema, reasonFormDataToInput, requiredReasonSchema } from "@/lib/validations/moderation";
import type { AuditAction } from "@/lib/generated/prisma/enums";

export type ModerationState =
  | { ok: true }
  | { ok: false; fieldErrors: Partial<Record<string, string[]>>; formError?: string }
  | null;

/**
 * `/seller/buyers`, `/buyer/assets`, etc. all call `requireUser()` — which
 * reads `cookies()` — so those pages are already fully dynamic (no route
 * caching to invalidate: see Next's cookies() docs, "Using it... opts a
 * route into dynamic rendering"). A Manager's action here takes effect on
 * those pages' very next request with no revalidatePath needed there; the
 * revalidatePath calls below are only for re-rendering *this* action's own
 * page immediately, the standard useActionState pattern.
 */
async function logAction(
  actorId: string,
  action: AuditAction,
  targetType: "USER" | "ASSET",
  targetId: string,
  reason?: string,
): Promise<void> {
  await prisma.auditLog.create({ data: { actorId, action, targetType, targetId, reason } });
}

export async function suspendUser(
  userId: string,
  _prevState: ModerationState,
  formData: FormData,
): Promise<ModerationState> {
  const manager = await requireUser({ role: "MANAGER" });

  const parsed = requiredReasonSchema.safeParse(reasonFormDataToInput(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.role === "MANAGER") {
    return { ok: false, fieldErrors: {}, formError: "This user can't be moderated." };
  }
  if (target.status !== "ACTIVE") {
    return { ok: false, fieldErrors: {}, formError: "Already suspended or removed." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status: "SUSPENDED", statusReason: parsed.data.reason },
  });
  await logAction(manager.id, "SUSPEND_USER", "USER", userId, parsed.data.reason);

  revalidatePath("/manager/users");
  return { ok: true };
}

/** No dialog/reason on the UI side — reactivating is low-stakes and
 * reversible (suspending again is one click away), same as
 * toggleContactRead's plain-button precedent. */
export async function reactivateUser(userId: string): Promise<void> {
  const manager = await requireUser({ role: "MANAGER" });

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.status !== "SUSPENDED") return;

  await prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE", statusReason: null } });
  await logAction(manager.id, "REACTIVATE_USER", "USER", userId);

  revalidatePath("/manager/users");
}

export async function removeUser(
  userId: string,
  _prevState: ModerationState,
  formData: FormData,
): Promise<ModerationState> {
  const manager = await requireUser({ role: "MANAGER" });

  const parsed = optionalReasonSchema.safeParse(reasonFormDataToInput(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.role === "MANAGER") {
    return { ok: false, fieldErrors: {}, formError: "This user can't be moderated." };
  }
  if (target.status === "REMOVED") {
    return { ok: false, fieldErrors: {}, formError: "Already removed." };
  }

  // Soft-delete only — see ARCHITECTURE.md "Data model": ContactRequest and
  // Asset rows are never touched here, only this User row's status.
  await prisma.user.update({
    where: { id: userId },
    data: { status: "REMOVED", statusReason: parsed.data.reason ?? null },
  });
  await logAction(manager.id, "REMOVE_USER", "USER", userId, parsed.data.reason);

  revalidatePath("/manager/users");
  return { ok: true };
}

export async function suspendAsset(
  assetId: string,
  _prevState: ModerationState,
  formData: FormData,
): Promise<ModerationState> {
  const manager = await requireUser({ role: "MANAGER" });

  const parsed = requiredReasonSchema.safeParse(reasonFormDataToInput(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) {
    return { ok: false, fieldErrors: {}, formError: "Asset not found." };
  }
  if (asset.status !== "ACTIVE") {
    return { ok: false, fieldErrors: {}, formError: "Only an ACTIVE asset can be suspended." };
  }

  await prisma.asset.update({ where: { id: assetId }, data: { status: "SUSPENDED" } });
  await logAction(manager.id, "SUSPEND_ASSET", "ASSET", assetId, parsed.data.reason);

  revalidatePath("/manager/assets");
  return { ok: true };
}

/** No dialog/reason — same reasoning as reactivateUser. */
export async function restoreAsset(assetId: string): Promise<void> {
  const manager = await requireUser({ role: "MANAGER" });

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset || asset.status !== "SUSPENDED") return;

  await prisma.asset.update({ where: { id: assetId }, data: { status: "ACTIVE" } });
  await logAction(manager.id, "RESTORE_ASSET", "ASSET", assetId);

  revalidatePath("/manager/assets");
}
