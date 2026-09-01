import { z } from "zod";
import { blankToUndefined } from "@/lib/validations/form-data";

export const upsertBuyerProfileSchema = z
  .object({
    headline: z.string().trim().max(200).optional(),
    bio: z.string().trim().max(2000).optional(),
    sectors: z.array(z.string()).max(20),
    jurisdictions: z.array(z.string()).max(20),
    budgetMin: z.coerce.number().int("Must be a whole number").nonnegative("Can't be negative").optional(),
    budgetMax: z.coerce.number().int("Must be a whole number").nonnegative("Can't be negative").optional(),
    dealTypes: z.array(z.string()).max(10),
  })
  .refine((data) => data.budgetMin === undefined || data.budgetMax === undefined || data.budgetMin <= data.budgetMax, {
    error: "Min budget can't exceed max budget",
    path: ["budgetMax"],
  });

export type UpsertBuyerProfileInput = z.infer<typeof upsertBuyerProfileSchema>;

/**
 * Turns a submitted <form> into the shape upsertBuyerProfileSchema expects.
 * Exported so both the client form (buyer-profile-form.tsx, for instant
 * feedback) and the Server Action (actions.ts, authoritative) validate the
 * exact same way — see lib/validations/asset.ts for the same pattern.
 */
export function buyerProfileFormDataToInput(formData: FormData): Record<string, unknown> {
  return {
    headline: blankToUndefined(formData.get("headline")),
    bio: blankToUndefined(formData.get("bio")),
    sectors: formData.getAll("sectors").map(String),
    jurisdictions: formData.getAll("jurisdictions").map(String),
    budgetMin: blankToUndefined(formData.get("budgetMin")),
    budgetMax: blankToUndefined(formData.get("budgetMax")),
    dealTypes: formData.getAll("dealTypes").map(String),
  };
}
