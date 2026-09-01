import { z } from "zod";
import { CURRENCIES } from "@/lib/taxonomy";
import { blankToUndefined } from "@/lib/validations/form-data";

export const createAssetSchema = z.object({
  // The bare-string param customizes the base "required" message — z's own
  // .min()/.max() refinements below only run once a value of the right type
  // is actually present, so a missing field needs its own message too.
  title: z.string("Title is required").trim().min(3, "Title must be at least 3 characters").max(200),
  description: z
    .string("Description is required")
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(5000),
  sector: z.string("Select a sector").trim().min(1, "Select a sector"),
  jurisdiction: z.string("Select a jurisdiction").trim().min(1, "Select a jurisdiction"),
  licenseType: z.string("License type is required").trim().min(1, "License type is required").max(200),
  price: z.coerce.number("Price is required").int("Price must be a whole number").positive("Price must be greater than 0"),
  currency: z.enum(CURRENCIES),
  employeeCount: z.coerce.number().int("Must be a whole number").nonnegative("Can't be negative").optional(),
  yearIssued: z.coerce
    .number()
    .int()
    .min(1900, "Enter a realistic year")
    .max(new Date().getFullYear(), "Can't be in the future")
    .optional(),
  includedItems: z.array(z.string().trim().min(1)).max(20, "20 items max"),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;

/**
 * Turns a submitted <form> into the shape createAssetSchema expects.
 * Exported so both the client form (asset-form.tsx, for instant feedback)
 * and the Server Action (actions.ts, authoritative) validate the exact same
 * way — see CLAUDE.md "Server Actions vs Route Handlers".
 */
export function assetFormDataToInput(formData: FormData): Record<string, unknown> {
  return {
    title: blankToUndefined(formData.get("title")),
    description: blankToUndefined(formData.get("description")),
    sector: blankToUndefined(formData.get("sector")),
    jurisdiction: blankToUndefined(formData.get("jurisdiction")),
    licenseType: blankToUndefined(formData.get("licenseType")),
    price: blankToUndefined(formData.get("price")),
    currency: blankToUndefined(formData.get("currency")),
    employeeCount: blankToUndefined(formData.get("employeeCount")),
    yearIssued: blankToUndefined(formData.get("yearIssued")),
    includedItems: formData
      .getAll("includedItems")
      .map(String)
      .map((s) => s.trim())
      .filter((s) => s !== ""),
  };
}
