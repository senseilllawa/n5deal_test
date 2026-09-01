import { z } from "zod";
import { blankToUndefined } from "@/lib/validations/form-data";

/** Suspend actions — a reason is mandatory so the moderation log (and a
 * moderated user's login-blocked message, see app/login/actions.ts) always
 * has something to show. */
export const requiredReasonSchema = z.object({
  reason: z.string("Reason is required").trim().min(5, "Give a brief reason (at least 5 characters)").max(1000),
});

/** Remove — a confirmation, not a fresh moderation call; reason is a nice-
 * to-have for the audit trail, not required to act. */
export const optionalReasonSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
});

export function reasonFormDataToInput(formData: FormData): Record<string, unknown> {
  return { reason: blankToUndefined(formData.get("reason")) };
}
